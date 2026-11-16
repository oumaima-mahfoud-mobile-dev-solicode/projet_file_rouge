-- =============================================================================
-- ARTFIT — SPRINT 01 : MODÈLE PHYSIQUE DE DONNÉES (MPD SQL DDL)
-- Module : Gestion des Produits (CRUD)
-- Version : 1.0.0
-- Date : 2026-11-16
-- Devise Unique : MAD (Dirham Marocain)
-- Marque Unique : ARTFIT
-- Hiérarchie Catégories : Sans limite fixe (parent_id auto-référentiel)
-- =============================================================================

-- Extension requise pour génération UUID native (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. TABLE : admins (Comptes Administrateurs)
-- =============================================================================
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'SUPER_ADMIN' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 2. TABLE : categories (Catégories avec hiérarchie sans limite)
-- =============================================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    image_url VARCHAR(2048),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- =============================================================================
-- 3. TABLE : products (Catalogue Produits ARTFIT)
-- =============================================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    brand_name VARCHAR(100) NOT NULL DEFAULT 'ARTFIT' CHECK (brand_name = 'ARTFIT'),
    base_price DECIMAL(12,2) NOT NULL CHECK (base_price > 0.00),
    currency VARCHAR(3) NOT NULL DEFAULT 'MAD' CHECK (currency = 'MAD'),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status_deleted ON products(status, deleted_at);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- =============================================================================
-- 4. TABLE : product_categories (Association Produits - Catégories)
-- =============================================================================
CREATE TABLE product_categories (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (product_id, category_id)
);

CREATE INDEX idx_product_categories_cat ON product_categories(category_id);
CREATE INDEX idx_product_categories_primary ON product_categories(product_id, is_primary);

-- =============================================================================
-- 5. TABLE : attribute_types (Types d'attributs dynamiques : Taille, Couleur...)
-- =============================================================================
CREATE TABLE attribute_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    display_type VARCHAR(30) NOT NULL DEFAULT 'PILL' CHECK (display_type IN ('PILL', 'COLOR_SWATCH', 'DROPDOWN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 6. TABLE : attribute_values (Valeurs d'attributs : S, M, L, Noir, Rouge...)
-- =============================================================================
CREATE TABLE attribute_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_type_id UUID NOT NULL REFERENCES attribute_types(id) ON DELETE CASCADE,
    value VARCHAR(100) NOT NULL,
    label VARCHAR(100) NOT NULL,
    color_hex VARCHAR(7) CHECK (color_hex IS NULL OR color_hex ~* '^#[0-9A-Fa-f]{6}$'),
    display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_attribute_type_value UNIQUE (attribute_type_id, value)
);

CREATE INDEX idx_attribute_values_type ON attribute_values(attribute_type_id);

-- =============================================================================
-- 7. TABLE : product_variants (Variantes d'articles avec SKU unique)
-- =============================================================================
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(64) NOT NULL UNIQUE,
    price_override DECIMAL(12,2) CHECK (price_override IS NULL OR price_override > 0.00),
    compare_at_price DECIMAL(12,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0.00),
    cost_price DECIMAL(12,2) CHECK (cost_price IS NULL OR cost_price >= 0.00),
    weight_kg DECIMAL(6,3) DEFAULT 0.500 CHECK (weight_kg >= 0.000),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_active ON product_variants(is_active);

-- =============================================================================
-- 8. TABLE : variant_attribute_values (Liaison Variante - Valeurs d'attributs)
-- =============================================================================
CREATE TABLE variant_attribute_values (
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    attribute_value_id UUID NOT NULL REFERENCES attribute_values(id) ON DELETE RESTRICT,
    PRIMARY KEY (variant_id, attribute_value_id)
);

CREATE INDEX idx_var_attr_val_attr ON variant_attribute_values(attribute_value_id);

-- =============================================================================
-- 9. TABLE : product_media (Galerie Photos 2D et Vidéos)
-- =============================================================================
CREATE TABLE product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    media_type VARCHAR(20) NOT NULL DEFAULT 'IMAGE' CHECK (media_type IN ('IMAGE', 'VIDEO')),
    url VARCHAR(2048) NOT NULL,
    thumbnail_url VARCHAR(2048),
    alt_text VARCHAR(255) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_media_product ON product_media(product_id, display_order);
CREATE INDEX idx_product_media_primary ON product_media(product_id, is_primary);

-- =============================================================================
-- 10. TABLE : product_3d_models (Modèles 3D interactifs et Fallback 2D)
-- =============================================================================
CREATE TABLE product_3d_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    model_url VARCHAR(2048) NOT NULL,
    file_format VARCHAR(10) NOT NULL DEFAULT 'GLB' CHECK (file_format IN ('GLB', 'GLTF')),
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 52428800),
    fallback_image_url VARCHAR(2048) NOT NULL,
    scale_x DECIMAL(6,3) NOT NULL DEFAULT 1.000 CHECK (scale_x > 0),
    scale_y DECIMAL(6,3) NOT NULL DEFAULT 1.000 CHECK (scale_y > 0),
    scale_z DECIMAL(6,3) NOT NULL DEFAULT 1.000 CHECK (scale_z > 0),
    texture_maps JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PROCESSING', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_3d_product ON product_3d_models(product_id);

-- =============================================================================
-- 11. TABLE : inventory (Stock physique et alerte de stock bas)
-- =============================================================================
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0 AND quantity_reserved <= quantity_on_hand),
    low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
    allow_backorder BOOLEAN NOT NULL DEFAULT false,
    last_restocked_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_variant ON inventory(variant_id);

-- =============================================================================
-- 12. TABLE : stock_reservations (Réservations temporaires de stock 60 min)
-- =============================================================================
CREATE TABLE stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    session_id VARCHAR(128) NOT NULL,
    user_id UUID,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    reserved_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONFIRMED', 'EXPIRED', 'CANCELLED')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_stock_res_dates CHECK (expires_at > reserved_at)
);

CREATE INDEX idx_stock_res_active ON stock_reservations(variant_id, status, expires_at);
CREATE INDEX idx_stock_res_session ON stock_reservations(session_id);

-- =============================================================================
-- 13. TABLE : discounts (Promotions et Réductions en MAD)
-- =============================================================================
CREATE TABLE discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    discount_type VARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE' CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    discount_value DECIMAL(12,2) NOT NULL CHECK (discount_value > 0.00),
    currency VARCHAR(3) NOT NULL DEFAULT 'MAD' CHECK (currency = 'MAD'),
    scope VARCHAR(20) NOT NULL DEFAULT 'PRODUCT' CHECK (scope IN ('PRODUCT', 'VARIANT', 'CATEGORY', 'ORDER')),
    target_id UUID,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 100 CHECK (priority >= 0),
    is_manual_override BOOLEAN NOT NULL DEFAULT false,
    is_stackable BOOLEAN NOT NULL DEFAULT false,
    calculation_sequence INTEGER NOT NULL DEFAULT 1 CHECK (calculation_sequence >= 1),
    min_order_amount_pre_discount DECIMAL(12,2) CHECK (min_order_amount_pre_discount IS NULL OR min_order_amount_pre_discount >= 0.00),
    min_quantity INTEGER CHECK (min_quantity IS NULL OR min_quantity >= 1),
    min_quantity_calc_type VARCHAR(30) NOT NULL DEFAULT 'ELIGIBLE_ITEMS_ONLY' CHECK (min_quantity_calc_type IN ('ELIGIBLE_ITEMS_ONLY', 'TOTAL_CART_ITEMS')),
    apply_quantity_mode VARCHAR(20) NOT NULL DEFAULT 'ALL_UNITS' CHECK (apply_quantity_mode IN ('ALL_UNITS', 'CAPPED_QUANTITY')),
    max_quantity_capped INTEGER CHECK (max_quantity_capped IS NULL OR max_quantity_capped >= 1),
    min_discount_amount DECIMAL(12,2) CHECK (min_discount_amount IS NULL OR min_discount_amount >= 0.00),
    max_discount_amount DECIMAL(12,2) CHECK (max_discount_amount IS NULL OR max_discount_amount >= 0.00),
    max_usage_total INTEGER CHECK (max_usage_total IS NULL OR max_usage_total >= 1),
    max_usage_per_customer INTEGER DEFAULT 1 CHECK (max_usage_per_customer IS NULL OR max_usage_per_customer >= 1),
    times_used INTEGER NOT NULL DEFAULT 0 CHECK (times_used >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_discounts_dates CHECK (ends_at > starts_at)
);

CREATE INDEX idx_discounts_active_dates ON discounts(is_active, starts_at, ends_at);
CREATE INDEX idx_discounts_scope ON discounts(scope, target_id);

-- =============================================================================
-- 14. TABLE : coupon_codes (Bons de Réduction Saisissables)
-- =============================================================================
CREATE TABLE coupon_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL UNIQUE,
    generation_type VARCHAR(20) NOT NULL DEFAULT 'MANUAL' CHECK (generation_type IN ('MANUAL', 'AUTOMATIC')),
    max_uses INTEGER CHECK (max_uses IS NULL OR max_uses >= 1),
    times_used INTEGER NOT NULL DEFAULT 0 CHECK (times_used >= 0),
    starts_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_coupons_dates CHECK (expires_at > starts_at)
);

CREATE INDEX idx_coupon_codes_code ON coupon_codes(code);
CREATE INDEX idx_coupon_codes_active ON coupon_codes(is_active, starts_at, expires_at);

-- =============================================================================
-- 15. TABLE : discount_usage_reservations (Réservations de place promotionnelle 60 min)
-- =============================================================================
CREATE TABLE discount_usage_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
    coupon_id UUID REFERENCES coupon_codes(id) ON DELETE SET NULL,
    session_id VARCHAR(128) NOT NULL,
    user_id UUID,
    reserved_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONSUMED', 'EXPIRED', 'CANCELLED')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_disc_res_dates CHECK (expires_at > reserved_at)
);

CREATE INDEX idx_disc_res_session ON discount_usage_reservations(session_id);
CREATE INDEX idx_disc_res_active ON discount_usage_reservations(discount_id, status, expires_at);

-- =============================================================================
-- 16. TABLE : audit_logs (Journal d'Audit Immuable)
-- =============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
    action VARCHAR(40) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_admin ON audit_logs(admin_id, created_at DESC);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

