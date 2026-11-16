/**
 * ARTFIT — Data Access Layer (DAL)
 * Fichier : MediaDAO.js
 * Description : Accès direct aux photos, vidéos et modèles 3D (.glb).
 * Règle 3-Tiers : Couche 3 (DAL).
 */

const crypto = require('node:crypto');

class MediaDAO {
  /**
   * @param {import('node:sqlite').DatabaseSync} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Ajoute une photo ou vidéo pour un produit.
   * @param {Object} data
   * @returns {Object}
   */
  createMedia(data) {
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();

    // Si c'est l'image principale, désactiver les anciennes
    if (data.is_primary) {
      this.db.prepare('UPDATE product_media SET is_primary = 0 WHERE product_id = ?').run(data.product_id);
    }

    const stmt = this.db.prepare(`
      INSERT INTO product_media (
        id, product_id, variant_id, media_type, url, thumbnail_url,
        alt_text, display_order, is_primary, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.product_id,
      data.variant_id || null,
      data.media_type || 'IMAGE',
      data.url,
      data.thumbnail_url || null,
      data.alt_text || 'Photo vêtement ARTFIT',
      data.display_order !== undefined ? Number(data.display_order) : 0,
      data.is_primary ? 1 : 0,
      now
    );

    return this.findMediaById(id);
  }

  findMediaById(id) {
    return this.db.prepare('SELECT * FROM product_media WHERE id = ?').get(id) || null;
  }

  findByProductId(productId) {
    return this.db.prepare(`
      SELECT * FROM product_media
      WHERE product_id = ?
      ORDER BY is_primary DESC, display_order ASC, created_at ASC
    `).all(productId);
  }

  setPrimary(mediaId, productId) {
    this.db.prepare('UPDATE product_media SET is_primary = 0 WHERE product_id = ?').run(productId);
    this.db.prepare('UPDATE product_media SET is_primary = 1 WHERE id = ?').run(mediaId);
    return true;
  }

  deleteMedia(mediaId) {
    this.db.prepare('DELETE FROM product_media WHERE id = ?').run(mediaId);
    return true;
  }

  /**
   * Ajoute ou remplace le modèle 3D d'un vêtement (BR-MED-002, BR-MED-003).
   * @param {Object} data
   * @returns {Object}
   */
  create3DModel(data) {
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO product_3d_models (
        id, product_id, variant_id, model_url, file_format,
        file_size_bytes, fallback_image_url, scale_x, scale_y, scale_z,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
    `);

    stmt.run(
      id,
      data.product_id,
      data.variant_id || null,
      data.model_url,
      data.file_format || 'GLB',
      Number(data.file_size_bytes) || 10000000,
      data.fallback_image_url,
      Number(data.scale_x) || 1.0,
      Number(data.scale_y) || 1.0,
      Number(data.scale_z) || 1.0,
      now,
      now
    );

    return this.find3DModelByProductId(data.product_id);
  }

  find3DModelByProductId(productId) {
    return this.db.prepare('SELECT * FROM product_3d_models WHERE product_id = ? AND status = ?').get(productId, 'ACTIVE') || null;
  }
}

module.exports = MediaDAO;

