/**
 * ARTFIT — Data Access Layer (DAL)
 * Fichier : VariantDAO.js
 * Description : Accès direct aux données des variantes physiques et de leurs attributs dynamiques.
 * Règle 3-Tiers : Couche 3 (DAL). Ne contient que du SQL pur.
 */

const crypto = require('node:crypto');

class VariantDAO {
  /**
   * @param {import('node:sqlite').DatabaseSync} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Crée une variante pour un produit.
   * @param {Object} data
   * @returns {Object}
   */
  create(data) {
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO product_variants (
        id, product_id, sku, price_override, compare_at_price,
        cost_price, weight_kg, is_active, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
    `);

    stmt.run(
      id,
      data.product_id,
      data.sku,
      data.price_override !== undefined && data.price_override !== null ? Number(data.price_override) : null,
      data.compare_at_price !== undefined && data.compare_at_price !== null ? Number(data.compare_at_price) : null,
      data.cost_price !== undefined && data.cost_price !== null ? Number(data.cost_price) : null,
      data.weight_kg !== undefined ? Number(data.weight_kg) : 0.500,
      data.is_active === false ? 0 : 1,
      now,
      now
    );

    return this.findById(id);
  }

  /**
   * Trouve une variante par son ID.
   * @param {string} id
   * @returns {Object|null}
   */
  findById(id) {
    const stmt = this.db.prepare(`
      SELECT v.*,
             i.quantity_on_hand,
             i.quantity_reserved,
             (i.quantity_on_hand - i.quantity_reserved) as quantity_available,
             i.low_stock_threshold
      FROM product_variants v
      LEFT JOIN inventory i ON i.variant_id = v.id
      WHERE v.id = ? AND v.deleted_at IS NULL
    `);
    const row = stmt.get(id);
    if (!row) return null;

    // Récupérer les attributs attachés (Tailles, Couleurs)
    row.attributes = this.getVariantAttributes(id);
    return row;
  }

  /**
   * Trouve une variante par son SKU unique.
   * @param {string} sku
   * @returns {Object|null}
   */
  findBySku(sku) {
    const stmt = this.db.prepare(`
      SELECT v.*,
             i.quantity_on_hand,
             i.quantity_reserved,
             (i.quantity_on_hand - i.quantity_reserved) as quantity_available
      FROM product_variants v
      LEFT JOIN inventory i ON i.variant_id = v.id
      WHERE v.sku = ? AND v.deleted_at IS NULL
    `);
    const row = stmt.get(sku);
    if (!row) return null;
    row.attributes = this.getVariantAttributes(row.id);
    return row;
  }

  /**
   * Liste toutes les variantes d'un produit avec leurs stocks et attributs.
   * @param {string} productId
   * @returns {Array}
   */
  findByProductId(productId) {
    const stmt = this.db.prepare(`
      SELECT v.*,
             COALESCE(i.quantity_on_hand, 0) as quantity_on_hand,
             COALESCE(i.quantity_reserved, 0) as quantity_reserved,
             (COALESCE(i.quantity_on_hand, 0) - COALESCE(i.quantity_reserved, 0)) as quantity_available,
             COALESCE(i.low_stock_threshold, 5) as low_stock_threshold
      FROM product_variants v
      LEFT JOIN inventory i ON i.variant_id = v.id
      WHERE v.product_id = ? AND v.deleted_at IS NULL
      ORDER BY v.created_at ASC
    `);

    const rows = stmt.all(productId);
    return rows.map(r => ({
      ...r,
      attributes: this.getVariantAttributes(r.id)
    }));
  }

  /**
   * Associe une valeur d'attribut (ex : Noir ou L) à une variante.
   * @param {string} variantId
   * @param {string} attributeValueId
   */
  attachAttributeValue(variantId, attributeValueId) {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO variant_attribute_values (variant_id, attribute_value_id)
      VALUES (?, ?)
    `);
    stmt.run(variantId, attributeValueId);
  }

  /**
   * Récupère les attributs d'une variante.
   * @param {string} variantId
   * @returns {Array}
   */
  getVariantAttributes(variantId) {
    const stmt = this.db.prepare(`
      SELECT av.id, av.value, av.label, av.color_hex,
             at.id as type_id, at.name as type_name, at.code as type_code, at.display_type
      FROM variant_attribute_values vav
      JOIN attribute_values av ON av.id = vav.attribute_value_id
      JOIN attribute_types at ON at.id = av.attribute_type_id
      WHERE vav.variant_id = ?
      ORDER BY at.name ASC
    `);
    return stmt.all(variantId);
  }

  /**
   * Met à jour une variante.
   * @param {string} id
   * @param {Object} updates
   * @returns {Object|null}
   */
  update(id, updates) {
    const fields = [];
    const params = [];

    if (updates.sku !== undefined) { fields.push('sku = ?'); params.push(updates.sku); }
    if (updates.price_override !== undefined) { fields.push('price_override = ?'); params.push(updates.price_override !== null ? Number(updates.price_override) : null); }
    if (updates.compare_at_price !== undefined) { fields.push('compare_at_price = ?'); params.push(updates.compare_at_price !== null ? Number(updates.compare_at_price) : null); }
    if (updates.cost_price !== undefined) { fields.push('cost_price = ?'); params.push(updates.cost_price !== null ? Number(updates.cost_price) : null); }
    if (updates.weight_kg !== undefined) { fields.push('weight_kg = ?'); params.push(Number(updates.weight_kg)); }
    if (updates.is_active !== undefined) { fields.push('is_active = ?'); params.push(updates.is_active ? 1 : 0); }

    if (fields.length === 0) return this.findById(id);

    fields.push("updated_at = datetime('now')");
    params.push(id);

    this.db.prepare(`UPDATE product_variants SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.findById(id);
  }

  /**
   * Suppression douce d'une variante.
   * @param {string} id
   * @returns {boolean}
   */
  delete(id) {
    this.db.prepare("UPDATE product_variants SET deleted_at = datetime('now'), is_active = 0 WHERE id = ?").run(id);
    return true;
  }
}

module.exports = VariantDAO;

