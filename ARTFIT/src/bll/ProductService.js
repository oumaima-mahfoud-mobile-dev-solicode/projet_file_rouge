/**
 * ARTFIT — Business Logic Layer (BLL)
 * Fichier : ProductService.js
 * Description : Gestion de la logique métier des produits (règles métier, validation, coordination).
 * Règle 3-Tiers : Couche 2 (Logique Métier - BLL). N'accède jamais directement au SQL, utilise les DAOs.
 */

const ProductValidator = require('./validators/ProductValidator');
const BusinessRuleException = require('./validators/BusinessRuleException');
const crypto = require('node:crypto');

class ProductService {
  /**
   * @param {Object} daos
   * @param {import('../dal/ProductDAO')} daos.productDAO
   * @param {import('../dal/CategoryDAO')} daos.categoryDAO
   * @param {import('../dal/VariantDAO')} daos.variantDAO
   * @param {import('../dal/InventoryDAO')} daos.inventoryDAO
   * @param {import('../dal/MediaDAO')} daos.mediaDAO
   */
  constructor({ productDAO, categoryDAO, variantDAO, inventoryDAO, mediaDAO }) {
    this.productDAO = productDAO;
    this.categoryDAO = categoryDAO;
    this.variantDAO = variantDAO;
    this.inventoryDAO = inventoryDAO;
    this.mediaDAO = mediaDAO;
  }

  /**
   * Crée un nouveau vêtement avec ses catégories, variantes, stock et médias.
   * @param {Object} dto
   * @returns {Object} Le produit complet créé.
   */
  createProduct(dto) {
    // 1. Valider les données d'entrée
    ProductValidator.validateProductData(dto, false);

    // 2. Générer le slug propre
    const slug = dto.slug || this.slugify(dto.name);
    const existingSlug = this.productDAO.findBySlug(slug);
    if (existingSlug) {
      dto.slug = `${slug}-${Date.now().toString().slice(-4)}`;
    } else {
      dto.slug = slug;
    }

    // 3. Forcer les règles officielles (Marque ARTFIT et Devise MAD)
    dto.brand_name = 'ARTFIT';
    dto.currency = 'MAD';
    dto.base_price = Number(Number(dto.base_price).toFixed(2));

    // Si l'utilisateur demande de publier directement, vérifier les conditions obligatoires
    const targetStatus = dto.status || 'DRAFT';
    dto.status = 'DRAFT'; // Créé d'abord en DRAFT pour ajouter variantes et médias

    // 4. Insérer le produit de base via la DAL
    const product = this.productDAO.create(dto);

    // 5. Associer la catégorie principale si fournie
    if (dto.category_id) {
      const cat = this.categoryDAO.findById(dto.category_id);
      if (cat) {
        this.productDAO.assignCategory(product.id, cat.id, true);
      }
    }

    // 6. Gérer les variantes et stocks
    if (Array.isArray(dto.variants) && dto.variants.length > 0) {
      for (const v of dto.variants) {
        const variant = this.variantDAO.create({
          product_id: product.id,
          sku: v.sku || `AF-${this.slugify(product.name).toUpperCase().slice(0, 8)}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`,
          price_override: v.price_override ? Number(v.price_override) : null,
          is_active: v.is_active !== false
        });

        // Inventaire de la variante
        this.inventoryDAO.create({
          variant_id: variant.id,
          quantity_on_hand: v.quantity_on_hand !== undefined ? Number(v.quantity_on_hand) : 10,
          low_stock_threshold: v.low_stock_threshold !== undefined ? Number(v.low_stock_threshold) : 5
        });

        // Lier les attributs (Tailles, Couleurs)
        if (Array.isArray(v.attribute_value_ids)) {
          for (const attrValId of v.attribute_value_ids) {
            this.variantDAO.attachAttributeValue(variant.id, attrValId);
          }
        }
      }
    } else {
      // Créer une variante standard automatique si non spécifiée
      const defaultVariant = this.variantDAO.create({
        product_id: product.id,
        sku: dto.sku || `AF-${this.slugify(product.name).toUpperCase().slice(0, 8)}-STD`,
        price_override: null,
        is_active: true
      });

      this.inventoryDAO.create({
        variant_id: defaultVariant.id,
        quantity_on_hand: dto.stock_quantity !== undefined ? Number(dto.stock_quantity) : 15,
        low_stock_threshold: 5
      });
    }

    // 7. Gérer les médias images
    if (dto.image_url) {
      this.mediaDAO.createMedia({
        product_id: product.id,
        url: dto.image_url,
        alt_text: product.name,
        is_primary: true
      });
    }

    // 8. Gérer le modèle 3D
    if (dto.model_3d_url) {
      this.mediaDAO.create3DModel({
        product_id: product.id,
        model_url: dto.model_3d_url,
        fallback_image_url: dto.image_url || '/media/default-fallback.webp'
      });
    }

    // 9. Si le statut cible était PUBLISHED, exécuter la publication contrôlée
    if (targetStatus === 'PUBLISHED') {
      return this.publishProduct(product.id);
    }

    return this.getProductDetails(product.id);
  }

  /**
   * Récupère la liste paginée et filtrée des produits.
   * @param {Object} queryParams
   * @returns {Object}
   */
  getProducts(queryParams = {}) {
    return this.productDAO.findMany(queryParams);
  }

  /**
   * Récupère les détails complets d'un produit.
   * @param {string} id
   * @returns {Object}
   */
  getProductDetails(id) {
    const product = this.productDAO.findById(id);
    if (!product) {
      throw new BusinessRuleException('BR-PRD-404', `Vêtement introuvable avec l'identifiant '${id}'.`, 404);
    }

    const variants = this.variantDAO.findByProductId(id);
    const media = this.mediaDAO.findByProductId(id);
    const model3D = this.mediaDAO.find3DModelByProductId(id);

    return {
      ...product,
      variants,
      media,
      model_3d: model3D
    };
  }

  /**
   * Met à jour un vêtement.
   * @param {string} id
   * @param {Object} dto
   * @returns {Object}
   */
  updateProduct(id, dto) {
    const existing = this.productDAO.findById(id);
    if (!existing) {
      throw new BusinessRuleException('BR-PRD-404', `Vêtement introuvable avec l'identifiant '${id}'.`, 404);
    }

    ProductValidator.validateProductData(dto, true);

    if (dto.name && dto.name !== existing.name && !dto.slug) {
      dto.slug = this.slugify(dto.name);
    }

    // Si on demande la publication, vérifier la règle BR-PRD-003
    if (dto.status === 'PUBLISHED') {
      const variants = this.variantDAO.findByProductId(id);
      const media = this.mediaDAO.findByProductId(id);
      const categories = existing.primary_category_id ? [{ id: existing.primary_category_id }] : [];
      ProductValidator.validateForPublication(
        { ...existing, ...dto },
        categories,
        variants,
        media
      );
    }

    this.productDAO.update(id, dto);

    // Mettre à jour la catégorie si demandée
    if (dto.category_id) {
      this.productDAO.assignCategory(id, dto.category_id, true);
    }

    return this.getProductDetails(id);
  }

  /**
   * Publie un vêtement avec vérification complète (BR-PRD-003).
   * @param {string} id
   * @returns {Object}
   */
  publishProduct(id) {
    const details = this.getProductDetails(id);
    const categories = details.primary_category_id ? [{ id: details.primary_category_id }] : [];

    ProductValidator.validateForPublication(details, categories, details.variants, details.media);

    this.productDAO.update(id, { status: 'PUBLISHED' });
    return this.getProductDetails(id);
  }

  /**
   * Archive un vêtement (BR-PRD-004).
   * @param {string} id
   * @returns {Object}
   */
  archiveProduct(id) {
    const existing = this.productDAO.findById(id);
    if (!existing) {
      throw new BusinessRuleException('BR-PRD-404', `Vêtement introuvable avec l'identifiant '${id}'.`, 404);
    }

    this.productDAO.update(id, { status: 'ARCHIVED' });
    return this.getProductDetails(id);
  }

  /**
   * Supprime un vêtement (soft delete avec deleted_at).
   * @param {string} id
   * @returns {boolean}
   */
  deleteProduct(id) {
    const existing = this.productDAO.findById(id);
    if (!existing) {
      throw new BusinessRuleException('BR-PRD-404', `Vêtement introuvable avec l'identifiant '${id}'.`, 404);
    }
    return this.productDAO.softDelete(id);
  }

  /**
   * Statistiques globales pour l'administrateur.
   * @returns {Object}
   */
  getDashboardStats() {
    return this.productDAO.getDashboardStats();
  }

  /**
   * Génère un slug URL à partir d'un texte.
   * @param {string} text
   * @returns {string}
   */
  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Retire les accents
      .replace(/[^a-z0-9 -]/g, '') // Retire les caractères spéciaux
      .replace(/\s+/g, '-') // Remplace les espaces par des tirets
      .replace(/-+/g, '-'); // Évite les tirets consécutifs
  }
}

module.exports = ProductService;

