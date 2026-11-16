/**
 * ARTFIT — Data Access Layer (DAL)
 * Fichier : InventoryDAO.js
 * Description : Accès direct aux stocks physiques et réservations temporaires (60 min).
 * Règle 3-Tiers : Couche 3 (DAL).
 */

const crypto = require('node:crypto');

class InventoryDAO {
  /**
   * @param {import('node:sqlite').DatabaseSync} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Crée la ligne d'inventaire initiale pour une variante.
   * @param {Object} data
   * @returns {Object}
   */
  create(data) {
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO inventory (
        id, variant_id, quantity_on_hand, quantity_reserved,
        low_stock_threshold, allow_backorder, last_restocked_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.variant_id,
      Math.max(0, Number(data.quantity_on_hand) || 0),
      Math.max(0, Number(data.quantity_reserved) || 0),
      Number(data.low_stock_threshold) !== undefined ? Number(data.low_stock_threshold) : 5,
      data.allow_backorder ? 1 : 0,
      data.last_restocked_at || null,
      now
    );

    return this.findByVariantId(data.variant_id);
  }

  /**
   * Récupère la ligne d'inventaire par variantId.
   * @param {string} variantId
   * @returns {Object|null}
   */
  findByVariantId(variantId) {
    const stmt = this.db.prepare(`
      SELECT i.*,
             (i.quantity_on_hand - i.quantity_reserved) as quantity_available
      FROM inventory i
      WHERE i.variant_id = ?
    `);
    const row = stmt.get(variantId);
    return row || null;
  }

  /**
   * Ajuste le stock physique en magasin.
   * @param {string} variantId
   * @param {Object} updates
   * @returns {Object|null}
   */
  updateStock(variantId, updates) {
    const fields = [];
    const params = [];

    if (updates.quantity_on_hand !== undefined) {
      fields.push('quantity_on_hand = ?');
      params.push(Math.max(0, Number(updates.quantity_on_hand)));
    }
    if (updates.quantity_reserved !== undefined) {
      fields.push('quantity_reserved = ?');
      params.push(Math.max(0, Number(updates.quantity_reserved)));
    }
    if (updates.low_stock_threshold !== undefined) {
      fields.push('low_stock_threshold = ?');
      params.push(Math.max(0, Number(updates.low_stock_threshold)));
    }

    if (fields.length === 0) return this.findByVariantId(variantId);

    fields.push("updated_at = datetime('now')");
    params.push(variantId);

    this.db.prepare(`UPDATE inventory SET ${fields.join(', ')} WHERE variant_id = ?`).run(...params);
    return this.findByVariantId(variantId);
  }

  /**
   * Crée une réservation temporaire de stock de 60 minutes au moment du paiement (BR-RES-001).
   * @param {string} variantId
   * @param {number} quantity
   * @param {string} sessionId
   * @param {number} durationMinutes (Défaut 60)
   * @returns {Object}
   */
  reserveStock(variantId, quantity, sessionId, durationMinutes = 60) {
    const id = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();
    const nowIso = now.toISOString();

    // 1. Enregistrer la réservation
    this.db.prepare(`
      INSERT INTO stock_reservations (id, variant_id, session_id, quantity, reserved_at, expires_at, status, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
    `).run(id, variantId, sessionId, quantity, nowIso, expiresAt, nowIso);

    // 2. Augmenter la quantité réservée sur l'inventaire
    this.db.prepare(`
      UPDATE inventory
      SET quantity_reserved = quantity_reserved + ?,
          updated_at = datetime('now')
      WHERE variant_id = ?
    `).run(quantity, variantId);

    return {
      id,
      variant_id: variantId,
      session_id: sessionId,
      quantity,
      reserved_at: nowIso,
      expires_at: expiresAt,
      status: 'ACTIVE'
    };
  }

  /**
   * Annule manuellement une réservation active et remet le stock disponible.
   * @param {string} reservationId
   * @returns {Object|null}
   */
  cancelReservation(reservationId) {
    const res = this.db.prepare('SELECT * FROM stock_reservations WHERE id = ?').get(reservationId);
    if (!res || res.status !== 'ACTIVE') return null;

    this.db.prepare("UPDATE stock_reservations SET status = 'CANCELLED', updated_at = datetime('now') WHERE id = ?").run(reservationId);
    this.db.prepare(`
      UPDATE inventory
      SET quantity_reserved = MAX(0, quantity_reserved - ?),
          updated_at = datetime('now')
      WHERE variant_id = ?
    `).run(res.quantity, res.variant_id);

    return { ...res, status: 'CANCELLED' };
  }

  /**
   * Libère automatiquement les réservations expirées de plus de 60 minutes (BR-RES-003).
   * @returns {number} Nombre de réservations libérées.
   */
  releaseExpiredReservations() {
    const expired = this.db.prepare(`
      SELECT id, variant_id, quantity
      FROM stock_reservations
      WHERE status = 'ACTIVE' AND expires_at <= datetime('now')
    `).all();

    for (const res of expired) {
      // 1. Marquer EXPIRED
      this.db.prepare("UPDATE stock_reservations SET status = 'EXPIRED', updated_at = datetime('now') WHERE id = ?").run(res.id);

      // 2. Réduire la quantité réservée
      this.db.prepare(`
        UPDATE inventory
        SET quantity_reserved = MAX(0, quantity_reserved - ?),
            updated_at = datetime('now')
        WHERE variant_id = ?
      `).run(res.quantity, res.variant_id);
    }

    return expired.length;
  }

  /**
   * Récupère tous les articles avec un stock inférieur ou égal au seuil d'alerte (BR-INV-002).
   * @returns {Array}
   */
  findLowStockItems() {
    const stmt = this.db.prepare(`
      SELECT p.id as product_id, p.name as product_name,
             v.id as variant_id, v.sku,
             i.quantity_on_hand, i.quantity_reserved,
             (i.quantity_on_hand - i.quantity_reserved) as quantity_available,
             i.low_stock_threshold
      FROM inventory i
      JOIN product_variants v ON v.id = i.variant_id
      JOIN products p ON p.id = v.product_id
      WHERE (i.quantity_on_hand - i.quantity_reserved) <= i.low_stock_threshold
        AND p.deleted_at IS NULL AND v.deleted_at IS NULL
      ORDER BY (i.quantity_on_hand - i.quantity_reserved) ASC
    `);
    return stmt.all();
  }
}

module.exports = InventoryDAO;

