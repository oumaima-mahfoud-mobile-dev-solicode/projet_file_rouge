/**
 * ARTFIT — Data Access Layer (DAL)
 * Fichier : DatabaseConnection.js
 * Description : Gestion de la connexion SQLite native et initialisation des tables (MPD).
 * Règle 3-Tiers : Couche 3 (Accès aux Données - DAL). Ne contient aucune logique métier.
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const crypto = require('node:crypto');

class DatabaseConnection {
  /**
   * Crée ou récupère une instance de base de données SQLite.
   * @param {string} dbPath - Chemin du fichier .db ou ':memory:' pour les tests.
   * @returns {DatabaseSync}
   */
  static createConnection(dbPath = null, skipSeed = false) {
    const targetPath = dbPath || path.join(__dirname, '..', '..', 'artfit.db');
    const db = new DatabaseSync(targetPath);

    // Activer les contraintes de clés étrangères
    db.exec('PRAGMA foreign_keys = ON;');

    // Initialiser les tables et les index
    this.initSchema(db);

    // Insérer les données de démonstration initiales si la base est vide et non ignorée
    if (!skipSeed) {
      this.seedInitialData(db);
    }

    return db;
  }

  /**
   * Exécute le schéma physique de la base de données (MPD).
   * @param {DatabaseSync} db
   */
  static initSchema(db) {
    db.exec(`
      -- 1. Table des catégories avec hiérarchie sans limite (parent_id)
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        parent_id TEXT REFERENCES categories(id) ON DELETE RESTRICT,
        display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
        is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
        image_url TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
      CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

      -- 2. Table principale des produits
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        short_description TEXT,
        brand_name TEXT NOT NULL DEFAULT 'ARTFIT' CHECK (brand_name = 'ARTFIT'),
        base_price REAL NOT NULL CHECK (base_price > 0.0),
        currency TEXT NOT NULL DEFAULT 'MAD' CHECK (currency = 'MAD'),
        status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
        is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        deleted_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
      CREATE INDEX IF NOT EXISTS idx_products_status ON products(status, deleted_at);

      -- 3. Table d'association produit - catégories
      CREATE TABLE IF NOT EXISTS product_categories (
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
        PRIMARY KEY (product_id, category_id)
      );

      -- 4. Types d'attributs (Taille, Couleur...)
      CREATE TABLE IF NOT EXISTS attribute_types (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        display_type TEXT NOT NULL DEFAULT 'PILL' CHECK (display_type IN ('PILL', 'COLOR_SWATCH', 'DROPDOWN')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      -- 5. Valeurs d'attributs (S, M, L, Noir #111111...)
      CREATE TABLE IF NOT EXISTS attribute_values (
        id TEXT PRIMARY KEY,
        attribute_type_id TEXT NOT NULL REFERENCES attribute_types(id) ON DELETE CASCADE,
        value TEXT NOT NULL,
        label TEXT NOT NULL,
        color_hex TEXT,
        display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(attribute_type_id, value)
      );

      -- 6. Table des variantes de produits
      CREATE TABLE IF NOT EXISTS product_variants (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        sku TEXT NOT NULL UNIQUE,
        price_override REAL CHECK (price_override IS NULL OR price_override > 0.0),
        compare_at_price REAL CHECK (compare_at_price IS NULL OR compare_at_price >= 0.0),
        cost_price REAL CHECK (cost_price IS NULL OR cost_price >= 0.0),
        weight_kg REAL DEFAULT 0.500 CHECK (weight_kg >= 0.0),
        is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        deleted_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
      CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);

      -- 7. Table d'association variante - valeurs d'attributs
      CREATE TABLE IF NOT EXISTS variant_attribute_values (
        variant_id TEXT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
        attribute_value_id TEXT NOT NULL REFERENCES attribute_values(id) ON DELETE RESTRICT,
        PRIMARY KEY (variant_id, attribute_value_id)
      );

      -- 8. Table des médias photos et vidéos
      CREATE TABLE IF NOT EXISTS product_media (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        variant_id TEXT REFERENCES product_variants(id) ON DELETE SET NULL,
        media_type TEXT NOT NULL DEFAULT 'IMAGE' CHECK (media_type IN ('IMAGE', 'VIDEO')),
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        alt_text TEXT NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
        is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      -- 9. Table des modèles 3D (.glb / .gltf)
      CREATE TABLE IF NOT EXISTS product_3d_models (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        variant_id TEXT REFERENCES product_variants(id) ON DELETE SET NULL,
        model_url TEXT NOT NULL,
        file_format TEXT NOT NULL DEFAULT 'GLB' CHECK (file_format IN ('GLB', 'GLTF')),
        file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 52428800),
        fallback_image_url TEXT NOT NULL,
        scale_x REAL NOT NULL DEFAULT 1.0,
        scale_y REAL NOT NULL DEFAULT 1.0,
        scale_z REAL NOT NULL DEFAULT 1.0,
        status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PROCESSING', 'INACTIVE')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      -- 10. Table de gestion des stocks
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        variant_id TEXT NOT NULL UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
        quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
        quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0 AND quantity_reserved <= quantity_on_hand),
        low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
        allow_backorder INTEGER NOT NULL DEFAULT 0 CHECK (allow_backorder IN (0, 1)),
        last_restocked_at TEXT,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      -- 11. Table des réservations de stock (60 min)
      CREATE TABLE IF NOT EXISTS stock_reservations (
        id TEXT PRIMARY KEY,
        variant_id TEXT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
        session_id TEXT NOT NULL,
        user_id TEXT,
        quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
        reserved_at TEXT NOT NULL DEFAULT (datetime('now')),
        expires_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONFIRMED', 'EXPIRED', 'CANCELLED')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      -- 12. Journal d'audit pour traçabilité
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        admin_id TEXT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        old_values TEXT,
        new_values TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  }

  /**
   * Insère les catégories, attributs et produits de base si la base est vide.
   * @param {DatabaseSync} db
   */
  static seedInitialData(db) {
    const existing = db.prepare('SELECT COUNT(*) as cnt FROM categories').get();
    if (existing.cnt > 0) return;

    // Catégories (Arborescence)
    const catRootId = crypto.randomUUID();
    const catVestesId = crypto.randomUUID();
    const catPantsId = crypto.randomUUID();
    const catTopsId = crypto.randomUUID();

    const insertCat = db.prepare(`
      INSERT INTO categories (id, name, slug, description, parent_id, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    insertCat.run(catRootId, 'Vêtements', 'vetements', 'Collection complète de mode ARTFIT', null, 0);
    insertCat.run(catVestesId, 'Vestes', 'vestes', 'Vestes techniques et blousons urbains', catRootId, 1);
    insertCat.run(catPantsId, 'Pantalons', 'pantalons', 'Pantalons cargo et coupes streetwear', catRootId, 2);
    insertCat.run(catTopsId, 'Hauts', 'hauts', 'T-shirts et hoodies', catRootId, 3);

    // Types et valeurs d'attributs (Tailles & Couleurs)
    const typeSizeId = crypto.randomUUID();
    const typeColorId = crypto.randomUUID();

    db.prepare('INSERT INTO attribute_types (id, name, code, display_type) VALUES (?, ?, ?, ?)').run(
      typeSizeId, 'Taille', 'size', 'PILL'
    );
    db.prepare('INSERT INTO attribute_types (id, name, code, display_type) VALUES (?, ?, ?, ?)').run(
      typeColorId, 'Couleur', 'color', 'COLOR_SWATCH'
    );

    const valS = crypto.randomUUID();
    const valM = crypto.randomUUID();
    const valL = crypto.randomUUID();
    const valXL = crypto.randomUUID();
    const valBlack = crypto.randomUUID();
    const valGrey = crypto.randomUUID();
    const valWhite = crypto.randomUUID();

    const insertVal = db.prepare(`
      INSERT INTO attribute_values (id, attribute_type_id, value, label, color_hex, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertVal.run(valS, typeSizeId, 'S', 'Small (S)', null, 1);
    insertVal.run(valM, typeSizeId, 'M', 'Medium (M)', null, 2);
    insertVal.run(valL, typeSizeId, 'L', 'Large (L)', null, 3);
    insertVal.run(valXL, typeSizeId, 'XL', 'Extra Large (XL)', null, 4);

    insertVal.run(valBlack, typeColorId, 'Noir', 'Noir Mat', '#111111', 1);
    insertVal.run(valGrey, typeColorId, 'Gris', 'Gris Anthracite', '#1F2937', 2);
    insertVal.run(valWhite, typeColorId, 'Blanc', 'Blanc Pur', '#FFFFFF', 3);

    // 1. Produit 1 : Bomber Cyberpunk Noir (PUBLISHED)
    const p1Id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO products (id, name, slug, description, short_description, brand_name, base_price, currency, status, is_featured)
      VALUES (?, ?, ?, ?, ?, 'ARTFIT', ?, 'MAD', 'PUBLISHED', 1)
    `).run(
      p1Id,
      'Bomber Cyberpunk Noir',
      'bomber-cyberpunk-noir',
      'Blouson urbain imperméable en nylon technique résistant avec coupe ergonomique 3D.',
      'Veste imperméable moderne avec vue 3D.',
      1250.00
    );

    db.prepare('INSERT INTO product_categories (product_id, category_id, is_primary) VALUES (?, ?, 1)').run(p1Id, catVestesId);

    // Variantes Produit 1
    const p1v1 = crypto.randomUUID();
    const p1v2 = crypto.randomUUID();

    db.prepare(`
      INSERT INTO product_variants (id, product_id, sku, price_override, is_active)
      VALUES (?, ?, ?, NULL, 1)
    `).run(p1v1, p1Id, 'AF-JKT-CYB-01-M');

    db.prepare(`
      INSERT INTO product_variants (id, product_id, sku, price_override, is_active)
      VALUES (?, ?, ?, NULL, 1)
    `).run(p1v2, p1Id, 'AF-JKT-CYB-01-L');

    // Associer attributs variante
    const linkAttr = db.prepare('INSERT INTO variant_attribute_values (variant_id, attribute_value_id) VALUES (?, ?)');
    linkAttr.run(p1v1, valM);
    linkAttr.run(p1v1, valBlack);
    linkAttr.run(p1v2, valL);
    linkAttr.run(p1v2, valBlack);

    // Stocks Produit 1
    const insertInv = db.prepare('INSERT INTO inventory (id, variant_id, quantity_on_hand, quantity_reserved, low_stock_threshold) VALUES (?, ?, ?, ?, ?)');
    insertInv.run(crypto.randomUUID(), p1v1, 25, 3, 5);
    insertInv.run(crypto.randomUUID(), p1v2, 20, 2, 5);

    // Média et 3D Produit 1
    db.prepare(`
      INSERT INTO product_media (id, product_id, media_type, url, alt_text, is_primary, display_order)
      VALUES (?, ?, 'IMAGE', '/media/bomber-face.webp', 'Bomber Cyberpunk Noir vue de face', 1, 0)
    `).run(crypto.randomUUID(), p1Id);

    db.prepare(`
      INSERT INTO product_3d_models (id, product_id, model_url, file_format, file_size_bytes, fallback_image_url)
      VALUES (?, ?, '/models/bomber-v2.glb', 'GLB', 15335424, '/media/bomber-face.webp')
    `).run(crypto.randomUUID(), p1Id);

    // 2. Produit 2 : Pantalon Cargo Tech (PUBLISHED)
    const p2Id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO products (id, name, slug, description, short_description, brand_name, base_price, currency, status, is_featured)
      VALUES (?, ?, ?, ?, ?, 'ARTFIT', ?, 'MAD', 'PUBLISHED', 1)
    `).run(
      p2Id,
      'Pantalon Cargo Tech',
      'pantalon-cargo-tech',
      'Pantalon cargo streetwear avec poches tactiques zippées et tissu déperlant.',
      'Pantalon tactique streetwear.',
      850.00
    );

    db.prepare('INSERT INTO product_categories (product_id, category_id, is_primary) VALUES (?, ?, 1)').run(p2Id, catPantsId);

    const p2v1 = crypto.randomUUID();
    db.prepare('INSERT INTO product_variants (id, product_id, sku, is_active) VALUES (?, ?, ?, 1)').run(p2v1, p2Id, 'AF-PNT-CRG-02-M');
    linkAttr.run(p2v1, valM);
    linkAttr.run(p2v1, valGrey);
    insertInv.run(crypto.randomUUID(), p2v1, 15, 0, 5);

    db.prepare(`
      INSERT INTO product_media (id, product_id, media_type, url, alt_text, is_primary, display_order)
      VALUES (?, ?, 'IMAGE', '/media/cargo-face.webp', 'Pantalon Cargo Tech', 1, 0)
    `).run(crypto.randomUUID(), p2Id);

    db.prepare(`
      INSERT INTO product_3d_models (id, product_id, model_url, file_format, file_size_bytes, fallback_image_url)
      VALUES (?, ?, '/models/cargo-tech.glb', 'GLB', 12450000, '/media/cargo-face.webp')
    `).run(crypto.randomUUID(), p2Id);

    // 3. Produit 3 : T-Shirt Oversize Blanc (DRAFT - BROUILLON)
    const p3Id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO products (id, name, slug, description, short_description, brand_name, base_price, currency, status, is_featured)
      VALUES (?, ?, ?, ?, ?, 'ARTFIT', ?, 'MAD', 'DRAFT', 0)
    `).run(
      p3Id,
      'T-Shirt Oversize Blanc',
      't-shirt-oversize-blanc',
      'T-shirt coupe large 100% coton lourd bio 240g/m² avec col renforcé.',
      'T-shirt streetwear lourd bio.',
      390.00
    );

    db.prepare('INSERT INTO product_categories (product_id, category_id, is_primary) VALUES (?, ?, 1)').run(p3Id, catTopsId);

    const p3v1 = crypto.randomUUID();
    db.prepare('INSERT INTO product_variants (id, product_id, sku, is_active) VALUES (?, ?, ?, 1)').run(p3v1, p3Id, 'AF-TSH-OVR-03-L');
    linkAttr.run(p3v1, valL);
    linkAttr.run(p3v1, valWhite);
    // Stock bas volontaire pour alerte (2 pièces)
    insertInv.run(crypto.randomUUID(), p3v1, 2, 0, 5);

    db.prepare(`
      INSERT INTO product_media (id, product_id, media_type, url, alt_text, is_primary, display_order)
      VALUES (?, ?, 'IMAGE', '/media/tshirt-white.webp', 'T-Shirt Blanc vue de face', 1, 0)
    `).run(crypto.randomUUID(), p3Id);
  }
}

module.exports = DatabaseConnection;
