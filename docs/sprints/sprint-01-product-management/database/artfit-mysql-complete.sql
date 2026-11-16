-- =============================================================================
-- ARTFIT — SCRIPT OFFICIEL MYSQL 8.0 / 8.4
-- Base de données : artfit_db
-- Description : Schéma complet des 16 tables (MPD) + Données de démonstration
-- Devise stricte : MAD (Dirham Marocain)
-- Marque unique : ARTFIT
-- =============================================================================

DROP DATABASE IF EXISTS artfit_db;
CREATE DATABASE artfit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE artfit_db;

-- -----------------------------------------------------------------------------
-- 1. TABLE DES CATÉGORIES (Hiérarchie sans limite via parent_id)
-- -----------------------------------------------------------------------------
CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  parent_id VARCHAR(36) DEFAULT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  image_url VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- -----------------------------------------------------------------------------
-- 2. TABLE PRINCIPALE DES PRODUITS (Vêtements ARTFIT)
-- -----------------------------------------------------------------------------
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description VARCHAR(500) DEFAULT NULL,
  brand_name VARCHAR(100) NOT NULL DEFAULT 'ARTFIT',
  base_price DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'MAD',
  status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  CONSTRAINT chk_product_brand CHECK (brand_name = 'ARTFIT'),
  CONSTRAINT chk_product_price CHECK (base_price > 0.00),
  CONSTRAINT chk_product_currency CHECK (currency = 'MAD')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status, deleted_at);

-- -----------------------------------------------------------------------------
-- 3. TABLE D'ASSOCIATION PRODUIT - CATÉGORIES
-- -----------------------------------------------------------------------------
CREATE TABLE product_categories (
  product_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, category_id),
  CONSTRAINT fk_pc_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_pc_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. TABLE DES TYPES D'ATTRIBUTS (Taille, Couleur, Textile)
-- -----------------------------------------------------------------------------
CREATE TABLE attribute_types (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  display_type ENUM('COLOR_SWATCH', 'PILL', 'DROPDOWN') NOT NULL DEFAULT 'PILL',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. TABLE DES VALEURS D'ATTRIBUTS (S, M, L, Noir, Cyan...)
-- -----------------------------------------------------------------------------
CREATE TABLE attribute_values (
  id VARCHAR(36) PRIMARY KEY,
  attribute_type_id VARCHAR(36) NOT NULL,
  value VARCHAR(100) NOT NULL,
  label VARCHAR(100) NOT NULL,
  color_hex VARCHAR(7) DEFAULT NULL,
  display_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_av_type FOREIGN KEY (attribute_type_id) REFERENCES attribute_types(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. TABLE DES VARIANTES PHYSIQUES DU PRODUIT
-- -----------------------------------------------------------------------------
CREATE TABLE product_variants (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  price_override DECIMAL(12,2) DEFAULT NULL,
  compare_at_price DECIMAL(12,2) DEFAULT NULL,
  cost_price DECIMAL(12,2) DEFAULT NULL,
  weight_kg DECIMAL(6,3) NOT NULL DEFAULT 0.500,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  CONSTRAINT fk_pv_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);

-- -----------------------------------------------------------------------------
-- 7. TABLE D'ASSOCIATION VARIANTE - VALEURS D'ATTRIBUTS
-- -----------------------------------------------------------------------------
CREATE TABLE variant_attribute_values (
  variant_id VARCHAR(36) NOT NULL,
  attribute_value_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (variant_id, attribute_value_id),
  CONSTRAINT fk_vav_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  CONSTRAINT fk_vav_value FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. TABLE DES MÉDIAS DU PRODUIT (Photos 2D)
-- -----------------------------------------------------------------------------
CREATE TABLE product_media (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  variant_id VARCHAR(36) DEFAULT NULL,
  media_type ENUM('IMAGE', 'VIDEO') NOT NULL DEFAULT 'IMAGE',
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  alt_text VARCHAR(255) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pm_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_pm_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. TABLE DES MODÈLES 3D (.GLB / .GLTF avec Fallback 2D)
-- -----------------------------------------------------------------------------
CREATE TABLE product_3d_models (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  variant_id VARCHAR(36) DEFAULT NULL,
  model_url VARCHAR(500) NOT NULL,
  file_format ENUM('GLB', 'GLTF') NOT NULL DEFAULT 'GLB',
  file_size_bytes BIGINT NOT NULL,
  fallback_image_url VARCHAR(500) NOT NULL,
  scale_x DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  scale_y DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  scale_z DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  status ENUM('ACTIVE', 'PROCESSING', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_p3d_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_p3d_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. TABLE D'INVENTAIRE (Stock physique au dépôt)
-- -----------------------------------------------------------------------------
CREATE TABLE inventory (
  id VARCHAR(36) PRIMARY KEY,
  variant_id VARCHAR(36) NOT NULL UNIQUE,
  quantity_on_hand INT NOT NULL DEFAULT 0,
  quantity_reserved INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  allow_backorder TINYINT(1) NOT NULL DEFAULT 0,
  last_restocked_at DATETIME DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inv_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  CONSTRAINT chk_inv_qty CHECK (quantity_on_hand >= 0),
  CONSTRAINT chk_inv_reserved CHECK (quantity_reserved >= 0 AND quantity_reserved <= quantity_on_hand)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. TABLE DES RÉSERVATIONS DE STOCK (Garantie 60 Minutes)
-- -----------------------------------------------------------------------------
CREATE TABLE stock_reservations (
  id VARCHAR(36) PRIMARY KEY,
  variant_id VARCHAR(36) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(36) DEFAULT NULL,
  quantity INT NOT NULL DEFAULT 1,
  reserved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  status ENUM('ACTIVE', 'CONFIRMED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_res_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  CONSTRAINT chk_res_qty CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_res_status ON stock_reservations(status, expires_at);

-- -----------------------------------------------------------------------------
-- 12. TABLE DES ADMINISTRATEURS
-- -----------------------------------------------------------------------------
CREATE TABLE admins (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('SUPER_ADMIN', 'CATALOG_MANAGER', 'STOCK_MANAGER') NOT NULL DEFAULT 'CATALOG_MANAGER',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 13. TABLE DU JOURNAL D'AUDIT (Traçabilité des modifications)
-- -----------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  admin_id VARCHAR(36) DEFAULT NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  old_values JSON DEFAULT NULL,
  new_values JSON DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- INSERTION DES DONNÉES DE DÉMONSTRATION COMPLÈTES (SEED DATA)
-- =============================================================================

-- 1. Catégories (Arborescence sans limite)
INSERT INTO categories (id, name, slug, description, parent_id, display_order, is_active) VALUES
('cat-root-01', 'Vêtements', 'vetements', 'Collection complète ARTFIT de mode urbaine technique', NULL, 1, 1),
('cat-sub-01', 'Vestes & Blousons', 'vestes-blousons', 'Manteaux, bombers et vestes imperméables techwear', 'cat-root-01', 1, 1),
('cat-sub-02', 'Pantalons Cargo', 'pantalons-cargo', 'Pantalons multipoches et coupes streetwear', 'cat-root-01', 2, 1),
('cat-sub-03', 'Hauts & Hoodies', 'hauts-hoodies', 'Sweats à capuche cyberpunk et t-shirts techniques', 'cat-root-01', 3, 1),
('cat-sub-04', 'Accessoires Tech', 'accessoires-tech', 'Sacs tactiques, casquettes et masques modernes', 'cat-root-01', 4, 1);

-- 2. Types et Valeurs d'Attributs (Tailles & Couleurs)
INSERT INTO attribute_types (id, name, code, display_type) VALUES
('type-size', 'Taille', 'size', 'PILL'),
('type-color', 'Couleur', 'color', 'COLOR_SWATCH');

INSERT INTO attribute_values (id, attribute_type_id, value, label, color_hex, display_order) VALUES
('val-size-s', 'type-size', 'S', 'Small (S)', NULL, 1),
('val-size-m', 'type-size', 'M', 'Medium (M)', NULL, 2),
('val-size-l', 'type-size', 'L', 'Large (L)', NULL, 3),
('val-size-xl', 'type-size', 'XL', 'Extra Large (XL)', NULL, 4),
('val-col-black', 'type-color', 'Noir Mat', 'Noir Mat Cyber', '#0B0F19', 1),
('val-col-cyan', 'type-color', 'Cyan Tech', 'Bleu Cyan Électrique', '#06B6D4', 2),
('val-col-grey', 'type-color', 'Gris Titane', 'Gris Titane Urbain', '#475569', 3);

-- 3. Produits (Catalogue de Mode Techwear ARTFIT)
INSERT INTO products (id, name, slug, description, short_description, brand_name, base_price, currency, status, is_featured) VALUES
(
  'prod-001',
  'Bomber Cyberpunk Noir',
  'bomber-cyberpunk-noir',
  'Veste technique imperméable avec détails réfléchissants et tissu nylon haute ténacité. Idéale pour les déplacements urbains par temps pluvieux.',
  'Veste technique haute résistance avec coutures étanches.',
  'ARTFIT',
  1250.00,
  'MAD',
  'PUBLISHED',
  1
),
(
  'prod-002',
  'Pantalon Cargo Techwear Modulaire',
  'pantalon-cargo-techwear-modulaire',
  'Pantalon ergonomique avec six poches zippées tactiques, sangles de serrage ajustables et matière respirante stretch.',
  'Coupe ergonomique moderne avec poches fonctionnelles.',
  'ARTFIT',
  850.00,
  'MAD',
  'PUBLISHED',
  1
),
(
  'prod-003',
  'Cyber Hoodie Oversize Néon',
  'cyber-hoodie-oversize-neon',
  'Sweat à capuche épais en coton bio brossé 420g avec empiècements cyan haute visibilité et poche kangourou sécurisée.',
  'Sweat lourd très confortable pour la saison fraîche.',
  'ARTFIT',
  620.00,
  'MAD',
  'PUBLISHED',
  0
),
(
  'prod-004',
  'T-Shirt Techwear Minimaliste',
  't-shirt-techwear-minimaliste',
  'T-shirt en jersey respirant antibactérien avec logo ARTFIT thermosoudé sur la poitrine et coupe décontractée.',
  'Coton peigné et élasthanne pour un confort maximal.',
  'ARTFIT',
  390.00,
  'MAD',
  'DRAFT',
  0
),
(
  'prod-005',
  'Sac Tactique Modulaire Chest-Rig',
  'sac-tactique-modulaire-chest-rig',
  'Harnais de poitrine avec poche centrale rembourrée pour tablette 10 pouces, attaches système MOLLE et sangles réglables.',
  'Accessoire indispensable pour le streetwear utilitaire.',
  'ARTFIT',
  450.00,
  'MAD',
  'PUBLISHED',
  0
);

-- 4. Liaison Produits - Catégories
INSERT INTO product_categories (product_id, category_id, is_primary) VALUES
('prod-001', 'cat-sub-01', 1),
('prod-002', 'cat-sub-02', 1),
('prod-003', 'cat-sub-03', 1),
('prod-004', 'cat-sub-03', 1),
('prod-005', 'cat-sub-04', 1);

-- 5. Variantes Physiques (Tailles et Références SKU)
INSERT INTO product_variants (id, product_id, sku, price_override, is_active) VALUES
('var-001-m', 'prod-001', 'AF-BOMB-BLK-M', NULL, 1),
('var-001-l', 'prod-001', 'AF-BOMB-BLK-L', NULL, 1),
('var-002-m', 'prod-002', 'AF-CARG-GRY-M', NULL, 1),
('var-003-l', 'prod-003', 'AF-HOOD-CYN-L', NULL, 1),
('var-004-m', 'prod-004', 'AF-TSH-WHT-M', NULL, 1),
('var-005-u', 'prod-005', 'AF-CHST-BLK-OS', NULL, 1);

-- 6. Liaison Variantes - Attributs
INSERT INTO variant_attribute_values (variant_id, attribute_value_id) VALUES
('var-001-m', 'val-size-m'),
('var-001-m', 'val-col-black'),
('var-001-l', 'val-size-l'),
('var-001-l', 'val-col-black'),
('var-002-m', 'val-size-m'),
('var-002-m', 'val-col-grey'),
('var-003-l', 'val-size-l'),
('var-003-l', 'val-col-cyan'),
('var-004-m', 'val-size-m'),
('var-005-u', 'val-col-black');

-- 7. Médias Photos et Modèles 3D
INSERT INTO product_media (id, product_id, variant_id, media_type, url, alt_text, is_primary) VALUES
('med-001', 'prod-001', 'var-001-m', 'IMAGE', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&q=80', 'Bomber Cyberpunk Noir ARTFIT', 1),
('med-002', 'prod-002', 'var-002-m', 'IMAGE', 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=700&q=80', 'Pantalon Cargo Techwear Gris', 1),
('med-003', 'prod-003', 'var-003-l', 'IMAGE', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&q=80', 'Cyber Hoodie Oversize Néon', 1),
('med-004', 'prod-004', 'var-004-m', 'IMAGE', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&q=80', 'T-Shirt Techwear Minimaliste', 1),
('med-005', 'prod-005', 'var-005-u', 'IMAGE', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=700&q=80', 'Sac Tactique Chest-Rig', 1);

INSERT INTO product_3d_models (id, product_id, model_url, file_format, file_size_bytes, fallback_image_url, status) VALUES
('m3d-001', 'prod-001', '/models/bomber-cyberpunk.glb', 'GLB', 14250000, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&q=80', 'ACTIVE'),
('m3d-002', 'prod-002', '/models/cargo-pants.glb', 'GLB', 11800000, 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=700&q=80', 'ACTIVE'),
('m3d-003', 'prod-003', '/models/cyber-hoodie.glb', 'GLB', 16500000, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&q=80', 'ACTIVE');

-- 8. Lignes d'Inventaire (Stock physique au dépôt)
INSERT INTO inventory (id, variant_id, quantity_on_hand, quantity_reserved, low_stock_threshold) VALUES
('inv-001-m', 'var-001-m', 25, 2, 5),
('inv-001-l', 'var-001-l', 15, 0, 4),
('inv-002-m', 'var-002-m', 30, 3, 5),
('inv-003-l', 'var-003-l', 18, 1, 5),
('inv-004-m', 'var-004-m', 50, 0, 10),
('inv-005-u', 'var-005-u', 12, 0, 3);

-- 9. Réservations Temporaires Actives (60 Minutes)
INSERT INTO stock_reservations (id, variant_id, session_id, quantity, reserved_at, expires_at, status) VALUES
('res-demo-01', 'var-001-m', 'session-client-demo-1', 2, NOW(), DATE_ADD(NOW(), INTERVAL 60 MINUTE), 'ACTIVE'),
('res-demo-02', 'var-002-m', 'session-client-demo-2', 3, NOW(), DATE_ADD(NOW(), INTERVAL 45 MINUTE), 'ACTIVE'),
('res-demo-03', 'var-003-l', 'session-client-demo-3', 1, NOW(), DATE_ADD(NOW(), INTERVAL 55 MINUTE), 'ACTIVE');

-- 10. Compte Administrateur Initial
INSERT INTO admins (id, email, full_name, password_hash, role) VALUES
('admin-001', 'admin@artfit.ma', 'Responsable Catalogue ARTFIT', '$2y$12$e8Z.7QxZ3xH8bVlB8T4pCe8L/w0g8rO9I3G1c9e8Z.7QxZ3xH8bVl', 'SUPER_ADMIN');

-- 11. Journal d'Audit Initial
INSERT INTO audit_logs (id, admin_id, action, entity_type, entity_id, new_values) VALUES
('log-001', 'admin-001', 'CREATE', 'PRODUCT', 'prod-001', '{"name": "Bomber Cyberpunk Noir", "base_price": 1250.00, "status": "PUBLISHED"}'),
('log-002', 'admin-001', 'CREATE', 'PRODUCT', 'prod-002', '{"name": "Pantalon Cargo Techwear Modulaire", "base_price": 850.00, "status": "PUBLISHED"}');

-- Vérification de l'insertion
SELECT 'INSTALLATION RÉUSSIE DANS MYSQL !' AS message;
SELECT COUNT(*) AS total_categories FROM categories;
SELECT COUNT(*) AS total_produits FROM products;
SELECT COUNT(*) AS total_variantes FROM product_variants;
SELECT COUNT(*) AS total_stocks FROM inventory;
