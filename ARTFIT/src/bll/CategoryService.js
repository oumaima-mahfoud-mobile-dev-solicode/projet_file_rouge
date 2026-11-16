/**
 * ARTFIT — Business Logic Layer (BLL)
 * Fichier : CategoryService.js
 * Description : Logique métier de la hiérarchie des catégories sans limite fixe (parent_id).
 * Règle 3-Tiers : Couche 2 (Logique Métier - BLL).
 */

const BusinessRuleException = require('./validators/BusinessRuleException');

class CategoryService {
  /**
   * @param {import('../dal/CategoryDAO')} categoryDAO
   */
  constructor(categoryDAO) {
    this.categoryDAO = categoryDAO;
  }

  /**
   * Crée une nouvelle catégorie.
   * @param {Object} dto
   * @returns {Object}
   */
  createCategory(dto) {
    if (!dto.name || dto.name.trim().length < 2) {
      throw new BusinessRuleException('BR-CAT-001', 'Le nom de la catégorie doit comporter au moins 2 caractères.', 400);
    }

    const slug = dto.slug || this.slugify(dto.name);
    const existing = this.categoryDAO.findBySlug(slug);
    if (existing) {
      dto.slug = `${slug}-${Date.now().toString().slice(-4)}`;
    } else {
      dto.slug = slug;
    }

    if (dto.parent_id) {
      const parent = this.categoryDAO.findById(dto.parent_id);
      if (!parent) {
        throw new BusinessRuleException('BR-CAT-001', 'La catégorie parente sélectionnée n\'existe pas.', 404);
      }
    }

    return this.categoryDAO.create(dto);
  }

  /**
   * Liste toutes les catégories à plat.
   * @param {Object} options
   * @returns {Array}
   */
  getCategories(options = {}) {
    return this.categoryDAO.findAll(options);
  }

  /**
   * Récupère l'arbre complet des catégories (hiérarchie infinie).
   * @param {Object} options
   * @returns {Array}
   */
  getCategoryTree(options = {}) {
    return this.categoryDAO.findTree(options);
  }

  /**
   * Met à jour une catégorie.
   * @param {string} id
   * @param {Object} updates
   * @returns {Object}
   */
  updateCategory(id, updates) {
    const existing = this.categoryDAO.findById(id);
    if (!existing) {
      throw new BusinessRuleException('BR-CAT-404', 'Catégorie introuvable.', 404);
    }

    if (updates.parent_id && updates.parent_id === id) {
      throw new BusinessRuleException('BR-CAT-001', 'Une catégorie ne peut pas être sa propre catégorie parente.', 400);
    }

    return this.categoryDAO.update(id, updates);
  }

  /**
   * Supprime une catégorie après vérification des enfants et des produits.
   * @param {string} id
   * @returns {boolean}
   */
  deleteCategory(id) {
    const existing = this.categoryDAO.findById(id);
    if (!existing) {
      throw new BusinessRuleException('BR-CAT-404', 'Catégorie introuvable.', 404);
    }

    // Vérifier les sous-catégories
    const childrenCount = this.categoryDAO.countChildren(id);
    if (childrenCount > 0) {
      throw new BusinessRuleException(
        'BR-CAT-002',
        `Suppression impossible : cette catégorie contient ${childrenCount} sous-catégorie(s). Supprimez-les d'abord.`,
        400
      );
    }

    if (existing.products_count > 0) {
      throw new BusinessRuleException(
        'BR-CAT-001',
        `Suppression impossible : cette catégorie est liée à ${existing.products_count} vêtement(s).`,
        400
      );
    }

    return this.categoryDAO.delete(id);
  }

  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}

module.exports = CategoryService;

