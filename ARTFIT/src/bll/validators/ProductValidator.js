/**
 * ARTFIT — Business Logic Layer (BLL)
 * Fichier : ProductValidator.js
 * Description : Vérification et validation des données selon les règles métier officielles.
 * Règle 3-Tiers : Couche 2 (Logique Métier - BLL).
 */

const BusinessRuleException = require('./BusinessRuleException');

class ProductValidator {
  /**
   * Valide les données de base pour la création ou modification d'un produit.
   * @param {Object} data
   */
  static validateProductData(data, isUpdate = false) {
    if (!isUpdate || data.name !== undefined) {
      if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 3) {
        throw new BusinessRuleException(
          'BR-PRD-001',
          'Le nom du vêtement est obligatoire et doit contenir au moins 3 caractères.',
          400
        );
      }
    }

    if (!isUpdate || data.base_price !== undefined) {
      const price = Number(data.base_price);
      if (isNaN(price) || price <= 0) {
        throw new BusinessRuleException(
          'BR-PRC-001',
          'Le prix de base officiel doit être un nombre strictement supérieur à 0.00 MAD.',
          400
        );
      }
    }

    if (data.currency !== undefined && data.currency !== 'MAD') {
      throw new BusinessRuleException(
        'BR-PRC-004',
        'La devise unique autorisée est strictement le Dirham Marocain (MAD).',
        400
      );
    }

    if (data.status !== undefined) {
      const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
      if (!validStatuses.includes(data.status)) {
        throw new BusinessRuleException(
          'BR-PRD-002',
          "Le statut du produit doit être 'DRAFT', 'PUBLISHED' ou 'ARCHIVED'.",
          400
        );
      }
    }
  }

  /**
   * Vérifie qu'un produit a le droit d'être publié (BR-PRD-003).
   * Doit avoir : titre, description, au moins une catégorie, prix > 0, au moins une variante avec SKU, au moins une image.
   * @param {Object} product
   * @param {Array} categories
   * @param {Array} variants
   * @param {Array} media
   */
  static validateForPublication(product, categories = [], variants = [], media = []) {
    if (!product.name || product.name.trim().length < 3) {
      throw new BusinessRuleException('BR-PRD-003', 'Publication refusée : le titre du produit est manquant.', 400);
    }
    if (!product.description || product.description.trim().length < 5) {
      throw new BusinessRuleException('BR-PRD-003', 'Publication refusée : la description du produit est manquante.', 400);
    }
    if (!product.base_price || Number(product.base_price) <= 0) {
      throw new BusinessRuleException('BR-PRD-003', 'Publication refusée : le prix de base doit être supérieur à 0 MAD.', 400);
    }
    if (!categories || categories.length === 0) {
      throw new BusinessRuleException('BR-PRD-003', 'Publication refusée : le produit doit avoir au moins une catégorie active.', 400);
    }
    if (!variants || variants.length === 0 || !variants.some(v => v.is_active && v.sku)) {
      throw new BusinessRuleException('BR-PRD-003', 'Publication refusée : le produit doit avoir au moins une variante active avec un SKU unique.', 400);
    }
    if (!media || media.length === 0 || !media.some(m => m.is_primary)) {
      throw new BusinessRuleException('BR-PRD-003', "Publication refusée : le produit doit avoir au moins une photo principale (is_primary).", 400);
    }
  }
}

module.exports = ProductValidator;
