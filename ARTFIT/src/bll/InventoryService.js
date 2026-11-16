/**
 * ARTFIT — Business Logic Layer (BLL)
 * Fichier : InventoryService.js
 * Description : Logique métier des stocks et réservations de 60 minutes.
 * Règle 3-Tiers : Couche 2 (Logique Métier - BLL).
 */

const BusinessRuleException = require('./validators/BusinessRuleException');

class InventoryService {
  /**
   * @param {import('../dal/InventoryDAO')} inventoryDAO
   */
  constructor(inventoryDAO) {
    this.inventoryDAO = inventoryDAO;
  }

  /**
   * Récupère les données d'inventaire d'une variante avec calcul du disponible.
   * @param {string} variantId
   * @returns {Object}
   */
  getStock(variantId) {
    const inv = this.inventoryDAO.findByVariantId(variantId);
    if (!inv) {
      throw new BusinessRuleException('BR-INV-404', 'Ligne de stock introuvable pour cette variante.', 404);
    }
    return {
      ...inv,
      available_quantity: Math.max(0, inv.quantity_on_hand - inv.quantity_reserved)
    };
  }

  /**
   * Annule une réservation active et restitue le stock disponible.
   * @param {string} reservationId
   * @returns {Object}
   */
  cancelReservation(reservationId) {
    const cancelled = this.inventoryDAO.cancelReservation(reservationId);
    if (!cancelled) {
      throw new BusinessRuleException('BR-RES-404', 'Réservation introuvable ou déjà annulée/expirée.', 404);
    }
    return cancelled;
  }

  /**
   * Ajuste la quantité physique en stock au dépôt.
   * @param {string} variantId
   * @param {number} quantityOnHand
   * @param {number} [lowStockThreshold]
   * @returns {Object}
   */
  adjustStock(variantId, quantityOnHand, lowStockThreshold) {
    const qty = Number(quantityOnHand);
    if (isNaN(qty) || qty < 0) {
      throw new BusinessRuleException('BR-INV-001', 'La quantité en stock doit être un entier supérieur ou égal à zéro.', 400);
    }

    const updates = { quantity_on_hand: qty };
    if (lowStockThreshold !== undefined) {
      updates.low_stock_threshold = Math.max(0, Number(lowStockThreshold));
    }

    const updated = this.inventoryDAO.updateStock(variantId, updates);
    if (!updated) {
      throw new BusinessRuleException('BR-INV-404', 'Ligne de stock introuvable pour cette variante.', 404);
    }
    return updated;
  }

  /**
   * Réserve du stock pendant 60 minutes au moment du paiement (BR-RES-001, BR-INV-003).
   * @param {string} variantId
   * @param {number} quantity
   * @param {string} sessionId
   * @returns {Object}
   */
  reserveStock(variantId, quantity, sessionId) {
    // 1. Libérer d'abord les anciennes réservations expirées pour avoir le stock exact
    this.inventoryDAO.releaseExpiredReservations();

    // 2. Vérifier le stock disponible
    const inventory = this.inventoryDAO.findByVariantId(variantId);
    if (!inventory) {
      throw new BusinessRuleException('BR-INV-404', 'Variante introuvable pour la réservation.', 404);
    }

    const available = inventory.quantity_on_hand - inventory.quantity_reserved;
    const requested = Number(quantity);

    if (requested <= 0) {
      throw new BusinessRuleException('BR-RES-001', 'La quantité à réserver doit être supérieure à zéro.', 400);
    }

    if (requested > available) {
      throw new BusinessRuleException(
        'BR-INV-003',
        `Stock insuffisant : vous demandez ${requested} pièce(s), mais seulement ${available} pièce(s) sont disponibles.`,
        400
      );
    }

    // 3. Réserver pendant exactement 60 minutes
    return this.inventoryDAO.reserveStock(variantId, requested, sessionId, 60);
  }

  /**
   * Tâche automatique : libère les réservations dépassées de 60 minutes (BR-RES-003).
   * @returns {number}
   */
  cleanExpiredReservations() {
    return this.inventoryDAO.releaseExpiredReservations();
  }

  /**
   * Récupère la liste des alertes de stock bas pour l'administrateur (BR-INV-002).
   * @returns {Array}
   */
  getLowStockAlerts() {
    return this.inventoryDAO.findLowStockItems();
  }
}

module.exports = InventoryService;

