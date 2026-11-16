/**
 * ARTFIT — Data Access Layer (DAL)
 * Fichier : CategoryDAO.js
 * Description : Accès direct aux données des catégories (Hiérarchie sans limite fixe avec parent_id).
 * Règle 3-Tiers : Couche 3 (DAL). Ne contient aucune logique métier.
 */

const crypto = require('node:crypto');

class CategoryDAO {
  /**
   * @param {import('node:sqlite').DatabaseSync} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Crée une nouvelle catégorie.
   * @param {Object} data
   * @returns {Object}
   */
  create(data) {
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO categories (
        id, name, slug, description, parent_id, display_order, is_active, image_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.name,
      data.slug,
      data.description || null,
      data.parent_id || null,
      data.display_order !== undefined ? Number(data.display_order) : 0,
      data.is_active === false ? 0 : 1,
      data.image_url || null,
      now,
      now
    );

    return this.findById(id);
  }

  /**
   * Trouve une catégorie par son ID.
   * @param {string} id
   * @returns {Object|null}
   */
  findById(id) {
    const stmt = this.db.prepare(`
      SELECT c.*,
             p.name as parent_name,
             (SELECT COUNT(*) FROM product_categories pc WHERE pc.category_id = c.id) as products_count
      FROM categories c
      LEFT JOIN categories p ON p.id = c.parent_id
      WHERE c.id = ?
    `);
    const row = stmt.get(id);
    return row || null;
  }

  /**
   * Trouve une catégorie par son slug.
   * @param {string} slug
   * @returns {Object|null}
   */
  findBySlug(slug) {
    const stmt = this.db.prepare('SELECT * FROM categories WHERE slug = ?');
    const row = stmt.get(slug);
    return row || null;
  }

  /**
   * Liste toutes les catégories à plat.
   * @param {{ activeOnly?: boolean }} options
   * @returns {Array}
   */
  findAll(options = {}) {
    let sql = `
      SELECT c.*,
             p.name as parent_name,
             (SELECT COUNT(*) FROM product_categories pc WHERE pc.category_id = c.id) as products_count
      FROM categories c
      LEFT JOIN categories p ON p.id = c.parent_id
    `;
    const params = [];
    if (options.activeOnly) {
      sql += ' WHERE c.is_active = 1 ';
    }
    sql += ' ORDER BY c.display_order ASC, c.name ASC ';
    return this.db.prepare(sql).all(...params);
  }

  /**
   * Construit l'arbre complet des catégories (hiérarchie infinie).
   * @param {{ activeOnly?: boolean }} options
   * @returns {Array}
   */
  findTree(options = {}) {
    const flatList = this.findAll(options);
    const map = new Map();
    const roots = [];

    flatList.forEach(item => {
      map.set(item.id, { ...item, children: [] });
    });

    flatList.forEach(item => {
      const node = map.get(item.id);
      if (item.parent_id && map.has(item.parent_id)) {
        map.get(item.parent_id).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * Met à jour une catégorie.
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
    if (updates.parent_id !== undefined) { fields.push('parent_id = ?'); params.push(updates.parent_id || null); }
    if (updates.display_order !== undefined) { fields.push('display_order = ?'); params.push(Number(updates.display_order)); }
    if (updates.is_active !== undefined) { fields.push('is_active = ?'); params.push(updates.is_active ? 1 : 0); }
    if (updates.image_url !== undefined) { fields.push('image_url = ?'); params.push(updates.image_url); }

    if (fields.length === 0) return this.findById(id);

    fields.push("updated_at = datetime('now')");
    params.push(id);

    const stmt = this.db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return this.findById(id);
  }

  /**
   * Supprime une catégorie si elle n'a pas d'enfants ni de produits liés.
   * @param {string} id
   * @returns {boolean}
   */
  delete(id) {
    const stmt = this.db.prepare('DELETE FROM categories WHERE id = ?');
    stmt.run(id);
    return true;
  }

  /**
   * Compte le nombre de sous-catégories directes.
   * @param {string} parentId
   * @returns {number}
   */
  countChildren(parentId) {
    const row = this.db.prepare('SELECT COUNT(*) as cnt FROM categories WHERE parent_id = ?').get(parentId);
    return row ? row.cnt : 0;
  }

  /**
   * Vérifie si candidateChildId est un descendant direct ou indirect de parentId.
   * @param {string} parentId
   * @param {string} candidateChildId
   * @returns {boolean}
   */
  isDescendantOf(parentId, candidateChildId) {
    let current = this.findById(candidateChildId);
    while (current && current.parent_id) {
      if (current.parent_id === parentId) return true;
      current = this.findById(current.parent_id);
    }
    return false;
  }
}

module.exports = CategoryDAO;
