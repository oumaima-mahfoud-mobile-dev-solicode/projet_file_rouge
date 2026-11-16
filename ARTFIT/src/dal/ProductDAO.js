/**
 * ARTFIT — Data Access Layer (DAL)
 * Fichier : ProductDAO.js
 * Description : Accès direct aux données des produits (CRUD, filtres, recherche, pagination).
 * Règle 3-Tiers : Couche 3 (DAL). Ne contient que du SQL pur et retourne des objets bruts.
 */

const crypto = require('node:crypto');

class ProductDAO {
  /**
   * @param {import('node:sqlite').DatabaseSync} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Crée un nouveau produit en base de données.
   * @param {Object} data
   * @returns {Object} Le produit inséré.
   */
  create(data) {
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();
    const slug = data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : crypto.randomUUID());
    const description = data.description || 'Vêtement technique de haute qualité signé ARTFIT.';

    const stmt = this.db.prepare(`
      INSERT INTO products (
        id, name, slug, description, short_description,
        brand_name, base_price, currency, status, is_featured,
        created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, 'ARTFIT', ?, 'MAD', ?, ?, ?, ?, NULL)
    `);

    stmt.run(
      id,
      data.name,
      slug,
      description,
      data.short_description || null,
      Number(data.base_price),
      data.status || 'DRAFT',
      data.is_featured ? 1 : 0,
      now,
      now
    );

    return this.findById(id);
  }

  /**
   * Recherche un produit par son identifiant unique UUID.
   * @param {string} id
   * @returns {Object|null}
   */
  findById(id) {
    const stmt = this.db.prepare(`
      SELECT p.*,
             c.id as primary_category_id,
             c.name as primary_category_name,
             m.url as primary_image_url
      FROM products p
      LEFT JOIN product_categories pc ON pc.product_id = p.id AND pc.is_primary = 1
      LEFT JOIN categories c ON c.id = pc.category_id
      LEFT JOIN product_media m ON m.product_id = p.id AND m.is_primary = 1
      WHERE p.id = ? AND p.deleted_at IS NULL
    `);
    const row = stmt.get(id);
    return row || null;
  }

  /**
   * Recherche un produit par son slug URL.
   * @param {string} slug
   * @returns {Object|null}
   */
  findBySlug(slug) {
    const stmt = this.db.prepare(`
      SELECT p.*,
             c.id as primary_category_id,
             c.name as primary_category_name,
             m.url as primary_image_url
      FROM products p
      LEFT JOIN product_categories pc ON pc.product_id = p.id AND pc.is_primary = 1
      LEFT JOIN categories c ON c.id = pc.category_id
      LEFT JOIN product_media m ON m.product_id = p.id AND m.is_primary = 1
      WHERE p.slug = ? AND p.deleted_at IS NULL
    `);
    const row = stmt.get(slug);
    return row || null;
  }

  /**
   * Récupère une liste paginée de produits avec filtres et recherche.
   * @param {Object} options
   * @returns {{ items: Array, total: number, page: number, limit: number, totalPages: number }}
   */
  findMany(options = {}) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 10));
    const offset = (page - 1) * limit;

    const whereClauses = ['p.deleted_at IS NULL'];
    const params = [];

    // Filtre de statut (DRAFT, PUBLISHED, ARCHIVED)
    if (options.status) {
      whereClauses.push('p.status = ?');
      params.push(options.status);
    }

    // Filtre catégorie
    if (options.categoryId) {
      whereClauses.push('EXISTS (SELECT 1 FROM product_categories pc WHERE pc.product_id = p.id AND pc.category_id = ?)');
      params.push(options.categoryId);
    }

    // Recherche textuelle (Titre ou Description)
    if (options.search && options.search.trim() !== '') {
      const term = `%${options.search.trim()}%`;
      whereClauses.push('(p.name LIKE ? OR p.description LIKE ? OR p.slug LIKE ?)');
      params.push(term, term, term);
    }

    // Filtre mis en avant
    if (options.isFeatured !== undefined) {
      whereClauses.push('p.is_featured = ?');
      params.push(options.isFeatured ? 1 : 0);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Compter le total
    const countStmt = this.db.prepare(`
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      ${whereSql}
    `);
    const totalRow = countStmt.get(...params);
    const total = totalRow ? totalRow.total : 0;

    // Ordre de tri
    const allowedSort = ['created_at', 'base_price', 'name'];
    const sortBy = allowedSort.includes(options.sortBy) ? options.sortBy : 'created_at';
    const sortOrder = options.sortOrder && options.sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Requête principale
    const dataStmt = this.db.prepare(`
      SELECT p.*,
             c.id as primary_category_id,
             c.name as primary_category_name,
             m.url as primary_image_url,
             (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id AND v.deleted_at IS NULL) as variants_count,
             (SELECT COALESCE(SUM(i.quantity_on_hand), 0) FROM product_variants v JOIN inventory i ON i.variant_id = v.id WHERE v.product_id = p.id) as total_stock_on_hand,
             (SELECT COALESCE(SUM(i.quantity_reserved), 0) FROM product_variants v JOIN inventory i ON i.variant_id = v.id WHERE v.product_id = p.id) as total_stock_reserved
      FROM products p
      LEFT JOIN product_categories pc ON pc.product_id = p.id AND pc.is_primary = 1
      LEFT JOIN categories c ON c.id = pc.category_id
      LEFT JOIN product_media m ON m.product_id = p.id AND m.is_primary = 1
      ${whereSql}
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `);

    const items = dataStmt.all(...params, limit, offset);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  /**
   * Met à jour un produit.
   * @param {string} id
   * @param {Object} updates
   * @returns {Object|null}
   */
  update(id, updates) {
    const fields = [];
    const params = [];

    if (updates.name !== undefined) { fields.push('name = ?'); params.push(updates.name); }
    if (updates.slug !== undefined) { fields.push('slug = ?'); params.push(updates.slug); }
    if (updates.description !== undefined) { fields.push('description = ?'); params.push(updates.description); }
    if (updates.short_description !== undefined) { fields.push('short_description = ?'); params.push(updates.short_description); }
    if (updates.base_price !== undefined) { fields.push('base_price = ?'); params.push(Number(updates.base_price)); }
    if (updates.status !== undefined) { fields.push('status = ?'); params.push(updates.status); }
    if (updates.is_featured !== undefined) { fields.push('is_featured = ?'); params.push(updates.is_featured ? 1 : 0); }

    if (fields.length === 0) return this.findById(id);

    fields.push("updated_at = datetime('now')");
    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE products
      SET ${fields.join(', ')}
      WHERE id = ? AND deleted_at IS NULL
    `);
    stmt.run(...params);

    return this.findById(id);
  }

  /**
   * Suppression douce (soft delete) en marquant deleted_at.
   * @param {string} id
   * @returns {boolean}
   */
  softDelete(id) {
    const stmt = this.db.prepare(`
      UPDATE products
      SET deleted_at = datetime('now'),
          status = 'ARCHIVED',
          updated_at = datetime('now')
      WHERE id = ? AND deleted_at IS NULL
    `);
    stmt.run(id);
    return true;
  }

  /**
   * Suppression définitive (pour tests ou brouillons non vendus).
   * @param {string} id
   * @returns {boolean}
   */
  hardDelete(id) {
    const stmt = this.db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(id);
    return true;
  }

  /**
   * Lie un produit à une catégorie.
   * @param {string} productId
   * @param {string} categoryId
   * @param {boolean} isPrimary
   */
  assignCategory(productId, categoryId, isPrimary = false) {
    if (isPrimary) {
      this.db.prepare('UPDATE product_categories SET is_primary = 0 WHERE product_id = ?').run(productId);
    }
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO product_categories (product_id, category_id, is_primary)
      VALUES (?, ?, ?)
    `);
    stmt.run(productId, categoryId, isPrimary ? 1 : 0);
  }

  /**
   * Retourne les statistiques globales pour l'Admin Dashboard.
   * @returns {{ totalProducts: number, publishedCount: number, draftCount: number, lowStockCount: number, totalStockOnHand: number, totalStockValueMAD: number }}
   */
  getDashboardStats() {
    const totalRow = this.db.prepare(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN status = 'PUBLISHED' THEN 1 ELSE 0 END) as published_count,
             SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as draft_count
      FROM products
      WHERE deleted_at IS NULL
    `).get();

    const stockRow = this.db.prepare(`
      SELECT COALESCE(SUM(i.quantity_on_hand), 0) as total_stock_on_hand,
             COALESCE(SUM(i.quantity_on_hand * COALESCE(v.price_override, p.base_price)), 0.0) as total_value_mad,
             COUNT(CASE WHEN (i.quantity_on_hand - i.quantity_reserved) <= i.low_stock_threshold THEN 1 END) as low_stock_count
      FROM inventory i
      JOIN product_variants v ON v.id = i.variant_id
      JOIN products p ON p.id = v.product_id
      WHERE p.deleted_at IS NULL AND v.deleted_at IS NULL
    `).get();

    return {
      totalProducts: totalRow ? totalRow.total : 0,
      publishedCount: totalRow ? (totalRow.published_count || 0) : 0,
      draftCount: totalRow ? (totalRow.draft_count || 0) : 0,
      lowStockCount: stockRow ? (stockRow.low_stock_count || 0) : 0,
      totalStockOnHand: stockRow ? (stockRow.total_stock_on_hand || 0) : 0,
      totalStockValueMAD: stockRow ? Number(stockRow.total_value_mad.toFixed(2)) : 0.00
    };
  }
}

module.exports = ProductDAO;
