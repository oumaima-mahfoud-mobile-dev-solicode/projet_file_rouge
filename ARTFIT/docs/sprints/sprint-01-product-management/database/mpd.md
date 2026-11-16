# ARTFIT — SPRINT 01 : MODÈLE PHYSIQUE DE DONNÉES (MPD)
## Module : Gestion des Produits (CRUD)

- **Version du document :** 1.0.0
- **Statut :** Spécification Physique Validée
- **Date de conception :** 2026-11-16
- **Architecture obligatoire :** Architecture 3-Tiers (Couche Accès aux Données - DAL)
- **Langue du document :** Français simple — Niveau A1
- **Périmètre :** Marque unique ARTFIT — Sprint 01 : Gestion des Produits
- **Fichier SQL associé :** [mpd.sql](file:///e:/project_file_rouge/ARTFIT/docs/sprints/sprint-01-product-management/database/mpd.sql)

---

## 1. But du Document

Ce document explique le **Modèle Physique de Données (MPD)** pour la base de données d'ARTFIT.

Le MPD définit :
- Les types exacts de colonnes SQL (`UUID`, `VARCHAR`, `DECIMAL(12,2)`, `BOOLEAN`, `TIMESTAMP WITH TIME ZONE`).
- Les contraintes de sécurité et d'intégrité (`PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `CHECK`, `UNIQUE`).
- Les actions de suppression en cascade (`ON DELETE CASCADE`, `RESTRICT`, `SET NULL`).
- Les index d'accélération pour les recherches et les filtres.

---

## 2. Décisions Techniques et Règles Respectées

1. **Devise unique :** Tous les prix et remises sont en Dirhams marocains (`MAD`). La contrainte `CHECK (currency = 'MAD')` bloque toute autre monnaie (`BR-PRC-004`).
2. **Arrondi standard à deux décimales :** Types `DECIMAL(12,2)` avec vérification $> 0.00$ pour le prix de base. Les nombres à virgule flottante (`FLOAT`) sont interdits (`BR-PRC-002`).
3. **Hiérarchie de catégories sans limite :** La colonne `parent_id` dans la table `categories` permet une arborescence infinie de sous-catégories avec la contrainte de sécurité `ON DELETE RESTRICT` pour ne pas perdre d'enfants orphelins.
4. **Marque unique :** `brand_name` a la contrainte `CHECK (brand_name = 'ARTFIT')`.
5. **Réservation de 60 minutes :** La table `stock_reservations` enregistre `reserved_at` et `expires_at` avec la contrainte `CHECK (expires_at > reserved_at)`.
6. **Séparation 3-Tiers :** Ce modèle appartient exclusivement à la Couche d'Accès aux Données (DAL). L'interface utilisateur (UI) ne communique jamais directement avec ces tables.

---

## 3. Détail des 16 Tables Physiques

---

### 1. `admins`
Gère les comptes administrateurs de la boutique.
- **`id`** : `UUID`, Clé Primaire (`PK`), généré automatiquement avec `gen_random_uuid()`.
- **`username`** : `VARCHAR(60)`, `NOT NULL`, `UNIQUE`.
- **`email`** : `VARCHAR(255)`, `NOT NULL`, `UNIQUE`.
- **`password_hash`** : `VARCHAR(255)`, `NOT NULL` (Hachage sécurisé).
- **`role`** : `VARCHAR(30)`, `NOT NULL`, Défaut `'SUPER_ADMIN'`, `CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER'))`.
- **`is_active`** : `BOOLEAN`, `NOT NULL`, Défaut `true`.
- **`last_login_at`** : `TIMESTAMPTZ`, `NULLABLE`.
- **`created_at`** / **`updated_at`** : `TIMESTAMPTZ`, `NOT NULL`, Défaut `CURRENT_TIMESTAMP`.

---

### 2. `categories`
Organise le catalogue dans une arborescence libre.
- **`id`** : `UUID`, Clé Primaire (`PK`).
- **`name`** : `VARCHAR(100)`, `NOT NULL`.
- **`slug`** : `VARCHAR(120)`, `NOT NULL`, `UNIQUE`.
- **`description`** : `TEXT`, `NULLABLE`.
- **`parent_id`** : `UUID`, Clé Étrangère $\rightarrow$ `categories(id) ON DELETE RESTRICT`. Permet les sous-catégories sans limite.
- **`display_order`** : `INTEGER`, `NOT NULL`, Défaut `0`, $\ge 0$.
- **`is_active`** : `BOOLEAN`, `NOT NULL`, Défaut `true`.
- **`image_url`** : `VARCHAR(2048)`, `NULLABLE`.
- **`created_at`** / **`updated_at`** : `TIMESTAMPTZ`, `NOT NULL`.
- *Index :* `idx_categories_parent_id`, `idx_categories_slug`, `idx_categories_is_active`.

---

### 3. `products`
Table principale des vêtements ARTFIT.
- **`id`** : `UUID`, Clé Primaire (`PK`).
- **`name`** : `VARCHAR(255)`, `NOT NULL`.
- **`slug`** : `VARCHAR(255)`, `NOT NULL`, `UNIQUE`.
- **`description`** : `TEXT`, `NOT NULL`.
- **`short_description`** : `VARCHAR(500)`, `NULLABLE`.
- **`brand_name`** : `VARCHAR(100)`, `NOT NULL`, Fixé à `'ARTFIT'`.
- **`base_price`** : `DECIMAL(12,2)`, `NOT NULL`, `CHECK (base_price > 0.00)`.
- **`currency`** : `VARCHAR(3)`, `NOT NULL`, Défaut `'MAD'`, `CHECK (currency = 'MAD')`.
- **`status`** : `VARCHAR(20)`, `NOT NULL`, Défaut `'DRAFT'`, `CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'))`.
- **`is_featured`** : `BOOLEAN`, `NOT NULL`, Défaut `false`.
- **`created_at`** / **`updated_at`** : `TIMESTAMPTZ`, `NOT NULL`.
- **`deleted_at`** : `TIMESTAMPTZ`, `NULLABLE` (Soft delete).
- *Index :* `idx_products_slug`, `idx_products_status_deleted`, `idx_products_created_at`.

---

### 4. `product_categories`
Association plusieurs-à-plusieurs entre produits et catégories.
- **`product_id`** : `UUID`, `NOT NULL`, Clé Étrangère $\rightarrow$ `products(id) ON DELETE CASCADE`.
- **`category_id`** : `UUID`, `NOT NULL`, Clé Étrangère $\rightarrow$ `categories(id) ON DELETE RESTRICT`.
- **`is_primary`** : `BOOLEAN`, `NOT NULL`, Défaut `false`.
- **Clé Primaire Composite :** `(product_id, category_id)`.
- *Index :* `idx_product_categories_cat`, `idx_product_categories_primary`.

---

### 5. `attribute_types`
Types de caractéristiques (Taille, Couleur, Tissu...).
- **`id`** : `UUID`, Clé Primaire (`PK`).
- **`name`** : `VARCHAR(50)`, `NOT NULL`.
- **`code`** : `VARCHAR(50)`, `NOT NULL`, `UNIQUE`.
- **`display_type`** : `VARCHAR(30)`, `NOT NULL`, Défaut `'PILL'`, `CHECK (display_type IN ('PILL', 'COLOR_SWATCH', 'DROPDOWN'))`.
- **`created_at`** : `TIMESTAMPTZ`, `NOT NULL`.

---

### 6. `attribute_values`
Valeurs d'options disponibles (S, M, L, Noir `#000000`...).
- **`id`** : `UUID`, Clé Primaire (`PK`).
- **`attribute_type_id`** : `UUID`, `NOT NULL`, Clé Étrangère $\rightarrow$ `attribute_types(id) ON DELETE CASCADE`.
- **`value`** : `VARCHAR(100)`, `NOT NULL`.
- **`label`** : `VARCHAR(100)`, `NOT NULL`.
- **`color_hex`** : `VARCHAR(7)`, `NULLABLE`, format `#RRGGBB`.
- **`display_order`** : `INTEGER`, `NOT NULL`, Défaut `0`.
- **`created_at`** : `TIMESTAMPTZ`, `NOT NULL`.
- **Contrainte Unique :** `UNIQUE (attribute_type_id, value)`.
- *Index :* `idx_attribute_values_type`.

---

### 7. `product_variants`
Déclinaisons physiques réelles des vêtements en stock.
- **`id`** : `UUID`, Clé Primaire (`PK`).
- **`product_id`** : `UUID`, `NOT NULL`, Clé Étrangère $\rightarrow$ `products(id) ON DELETE CASCADE`.
- **`sku`** : `VARCHAR(64)`, `NOT NULL`, `UNIQUE`.
- **`price_override`** : `DECIMAL(12,2)`, `NULLABLE`, `CHECK (price_override > 0.00)`.
- **`compare_at_price`** : `DECIMAL(12,2)`, `NULLABLE`, `CHECK (compare_at_price >= 0.00)`.
- **`cost_price`** : `DECIMAL(12,2)`, `NULLABLE`, `CHECK (cost_price >= 0.00)`.
- **`weight_kg`** : `DECIMAL(6,3)`, Défaut `0.500`, $\ge 0.000$.
- **`is_active`** : `BOOLEAN`, `NOT NULL`, Défaut `true`.
- **`created_at`** / **`updated_at`** : `TIMESTAMPTZ`, `NOT NULL`.
- **`deleted_at`** : `TIMESTAMPTZ`, `NULLABLE`.
- *Index :* `idx_product_variants_product`, `idx_product_variants_sku`, `idx_product_variants_active`.

---

### 8. `variant_attribute_values`
Association plusieurs-à-plusieurs entre variante et valeurs d'attributs.
- **`variant_id`** : `UUID`, `NOT NULL`, Clé Étrangère $\rightarrow$ `product_variants(id) ON DELETE CASCADE`.
- **`attribute_value_id`** : `UUID`, `NOT NULL`, Clé Étrangère $\rightarrow$ `attribute_values(id) ON DELETE RESTRICT`.
- **Clé Primaire Composite :** `(variant_id, attribute_value_id)`.
- *Index :* `idx_var_attr_val_attr`.

---

### 9. `product_media`
Photos et vidéos associées au vêtement ou à une variante précise.
- **`id`** : `UUID`, Clé Primaire (`PK`).
- **`product_id`** : `UUID`, `NOT NULL`, Clé Étrangère $\rightarrow$ `products(id) ON DELETE CASCADE`.
- **`variant_id`** : `UUID`, `NULLABLE`, Clé Étrangère $\rightarrow$ `product_variants(id) ON DELETE SET NULL`.
- **`media_type`** : `VARCHAR(20)`, `NOT NULL`, Défaut `'IMAGE'`, `CHECK (media_type IN ('IMAGE', 'VIDEO'))`.
- **`url`** : `VARCHAR(2048)`, `NOT NULL`.
- **`thumbnail_url`** : `VARCHAR(2048)`, `NULLABLE`.
- **`alt_text`** : `VARCHAR(255)`, `NOT NULL`.
- **`display_order`** : `INTEGER`, `NOT NULL`, Défaut `0`.
- **`is_primary`** : `BOOLEAN`, `NOT NULL`, Défaut `false`.
- **`created_at`** : `TIMESTAMPTZ`, `NOT NULL`.
- *Index :* `idx_product_media_product`, `idx_product_media_primary`.

---

### 10. `product_3d_models`
Fichiers 3D (`.glb` / `.gltf`) pour l'essayage interactif à 360°.
- **`id`** : `UUID`, Clé Primaire (`PK`).
- **`product_id`** : `UUID`, `NOT NULL`, Clé Étrangère $\rightarrow$ `products(id) ON DELETE CASCADE`.
- **`variant_id`** : `UUID`, `NULLABLE`, Clé Étrangère $\rightarrow$ `product_variants(id) ON DELETE SET NULL`.
- **`model_url`** : `VARCHAR(2048)`, `NOT NULL`.
- **`file_format`** : `VARCHAR(10)`, `NOT NULL`, Défaut `'GLB'`, `CHECK (file_format IN ('GLB', 'GLTF'))`.
- **`file_size_bytes`** : `BIGINT`, `NOT NULL`, `CHECK (file_size_bytes > 0 AND file_size_bytes <= 52428800)`.
- **`fallback_image_url`** : `VARCHAR(2048)`, `NOT NULL` (Image 2D de secours obligatoire).
- **`scale_x`, `scale_y`, `scale_z`** : `DECIMAL(6,3)`, `NOT NULL`, Défaut `1.000`.
- **`texture_maps`** : `JSONB`, `NULLABLE`.
- **`status`** : `VARCHAR(20)`, `NOT NULL`, Défaut `'ACTIVE'`.
- **`created_at`** / **`updated_at`** : `TIMESTAMPTZ`, `NOT NULL`.
- *Index :* `idx_product_3d_product`.

---

### 11. `inventory`
Gestion physique des stocks au dépôt et seuils d'alerte.
- **`id`** : `UUID`, Clé Primaire (`PK`).
- **`variant_id`** : `UUID`, `NOT NULL`, `UNIQUE`, Clé Étrangère $\rightarrow$ `product_variants(id) ON DELETE CASCADE`.
- **`quantity_on_hand`** : `INTEGER`, `NOT NULL`, Défaut `0`, `CHECK (quantity_on_hand >= 0)`.
- **`quantity_reserved`** : `INTEGER`, `NOT NULL`, Défaut `0`, `CHECK (quantity_reserved >= 0 AND quantity_reserved <= quantity_on_hand)`.
- **`low_stock_threshold`** : `INTEGER`, `NOT NULL`, Défaut `5`, $\ge 0$.
- **`allow_backorder`** : `BOOLEAN`, `NOT NULL`, Défaut `false`.
- **`last_restocked_at`** : `TIMESTAMPTZ`, `NULLABLE`.
- **`updated_at`** : `TIMESTAMPTZ`, `NOT NULL`.
- *Formule virtuelle :* Stock disponible $= quantity\_on\_hand - quantity\_reserved$.
- *Index :* `idx_inventory_variant`.

---

### 12. `stock_reservations`
Réservations temporaires de 60 minutes au moment du paiement.
- **`id`** : `UUID`, Clé Primaire (`PK`).
- **`variant_id`** : `UUID`, `NOT NULL`, Clé Étrangère $\rightarrow$ `product_variants(id) ON DELETE CASCADE`.
- **`session_id`** : `VARCHAR(128)`, `NOT NULL`.
- **`user_id`** : `UUID`, `NULLABLE`.
- **`quantity`** : `INTEGER`, `NOT NULL`, Défaut `1`, `CHECK (quantity > 0)`.
- **`reserved_at`** : `TIMESTAMPTZ`, `NOT NULL`, Défaut `CURRENT_TIMESTAMP`.
- **`expires_at`** : `TIMESTAMPTZ`, `NOT NULL`, `CHECK (expires_at > reserved_at)`.
- **`status`** : `VARCHAR(20)`, `NOT NULL`, Défaut `'ACTIVE'`, `CHECK (status IN ('ACTIVE', 'CONFIRMED', 'EXPIRED', 'CANCELLED'))`.
- **`updated_at`** : `TIMESTAMPTZ`, `NOT NULL`.
- *Index :* `idx_stock_res_active`, `idx_stock_res_session`.

---

### 13. `discounts`
Règles de réductions et promotions commerciales en `MAD`.
- **`id`** : `UUID`, Clé Primaire (`PK`).
- **`name`** : `VARCHAR(150)`, `NOT NULL`.
- **`description`** : `VARCHAR(500)`, `NULLABLE`.
- **`discount_type`** : `VARCHAR(20)`, `NOT NULL`, Défaut `'PERCENTAGE'`, `CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT'))`.
- **`discount_value`** : `DECIMAL(12,2)`, `NOT NULL`, `CHECK (discount_value > 0.00)`.
- **`currency`** : `VARCHAR(3)`, `NOT NULL`, Fixé à `'MAD'`.
- **`scope`** : `VARCHAR(20)`, `NOT NULL`, Défaut `'PRODUCT'`.
- **`target_id`** : `UUID`, `NULLABLE`.
- **`starts_at`** / **`ends_at`** : `TIMESTAMPTZ`, `NOT NULL`, `CHECK (ends_at > starts_at)`.
- **`is_active`** : `BOOLEAN`, `NOT NULL`, Défaut `true`.
- **`priority`** : `INTEGER`, `NOT NULL`, Défaut `100`.
- **`is_manual_override`** : `BOOLEAN`, `NOT NULL`, Défaut `false`.
- **`is_stackable`** : `BOOLEAN`, `NOT NULL`, Défaut `false`.
- **`calculation_sequence`** : `INTEGER`, `NOT NULL`, Défaut `1`.
- **`min_order_amount_pre_discount`** : `DECIMAL(12,2)`, `NULLABLE`.
- **`min_quantity`** : `INTEGER`, `NULLABLE`.
- **`min_quantity_calc_type`** : `VARCHAR(30)`, `NOT NULL`, Défaut `'ELIGIBLE_ITEMS_ONLY'`.
- **`apply_quantity_mode`** : `VARCHAR(20)`, `NOT NULL`, Défaut `'ALL_UNITS'`.
- **`max_quantity_capped`** : `INTEGER`, `NULLABLE`.
- **`min_discount_amount`** / **`max_discount_amount`** : `DECIMAL(12,2)`, `NULLABLE`.
- **`max_usage_total`** : `INTEGER`, `NULLABLE`.
- **`max_usage_per_customer`** : `INTEGER`, `NULLABLE`, Défaut `1`.
- **`times_used`** : `INTEGER`, `NOT NULL`, Défaut `0`.
- **`created_at`** / **`updated_at`** : `TIMESTAMPTZ`, `NOT NULL`.
- *Index :* `idx_discounts_active_dates`, `idx_discounts_scope`.

---

### 14. `coupon_codes`
Codes de promotion saisis par les clients.
- **`id`** : `UUID`, Clé Primaire (`PK`).
- **`discount_id`** : `UUID`, `NOT NULL`, Clé Étrangère $\rightarrow$ `discounts(id) ON DELETE CASCADE`.
- **`code`** : `VARCHAR(50)`, `NOT NULL`, `UNIQUE`.
- **`generation_type`** : `VARCHAR(20)`, `NOT NULL`, Défaut `'MANUAL'`.
- **`max_uses`** : `INTEGER`, `NULLABLE`.
- **`times_used`** : `INTEGER`, `NOT NULL`, Défaut `0`.
- **`starts_at`** / **`expires_at`** : `TIMESTAMPTZ`, `NOT NULL`, `CHECK (expires_at > starts_at)`.
- **`is_active`** : `BOOLEAN`, `NOT NULL`, Défaut `true`.
- **`created_at`** / **`updated_at`** : `TIMESTAMPTZ`, `NOT NULL`.
- *Index :* `idx_coupon_codes_code`, `idx_coupon_codes_active`.

---

### 15. `discount_usage_reservations`
Réservation temporaire d'une réduction pendant le paiement (60 minutes).
- **`id`** : `UUID`, Clé Primaire (`PK`).
- **`discount_id`** : `UUID`, `NOT NULL`, Clé Étrangère $\rightarrow$ `discounts(id) ON DELETE CASCADE`.
- **`coupon_id`** : `UUID`, `NULLABLE`, Clé Étrangère $\rightarrow$ `coupon_codes(id) ON DELETE SET NULL`.
- **`session_id`** : `VARCHAR(128)`, `NOT NULL`.
- **`user_id`** : `UUID`, `NULLABLE`.
- **`reserved_at`** / **`expires_at`** : `TIMESTAMPTZ`, `NOT NULL`, `CHECK (expires_at > reserved_at)`.
- **`status`** : `VARCHAR(20)`, `NOT NULL`, Défaut `'ACTIVE'`.
- **`updated_at`** : `TIMESTAMPTZ`, `NOT NULL`.
- *Index :* `idx_disc_res_session`, `idx_disc_res_active`.

---

### 16. `audit_logs`
Journal de sécurité inaltérable de toutes les opérations d'administration.
- **`id`** : `UUID`, Clé Primaire (`PK`).
- **`admin_id`** : `UUID`, `NOT NULL`, Clé Étrangère $\rightarrow$ `admins(id) ON DELETE RESTRICT`.
- **`action`** : `VARCHAR(40)`, `NOT NULL`.
- **`entity_type`** : `VARCHAR(50)`, `NOT NULL`.
- **`entity_id`** : `VARCHAR(64)`, `NOT NULL`.
- **`old_values`** : `JSONB`, `NULLABLE`.
- **`new_values`** : `JSONB`, `NULLABLE`.
- **`ip_address`** : `VARCHAR(45)`, `NULLABLE`.
- **`user_agent`** : `VARCHAR(500)`, `NULLABLE`.
- **`created_at`** : `TIMESTAMPTZ`, `NOT NULL`, Défaut `CURRENT_TIMESTAMP`.
- *Index :* `idx_audit_logs_entity`, `idx_audit_logs_admin`, `idx_audit_logs_created`.

---

## 4. Vérification des Relations et des Contraintes

| Vérification | Statut | Résultat |
|---|:---:|---|
| Clés primaires définies sur toutes les tables | **VALIDÉ** | Toutes les 16 tables ont une clé primaire `UUID` ou clé composite `(id1, id2)`. |
| Clés étrangères avec règles `ON DELETE` claires | **VALIDÉ** | `CASCADE` pour liens parents-enfants directs, `RESTRICT` pour intégrité des catégories et historique, `SET NULL` pour options. |
| Devise unique `MAD` | **VALIDÉ** | Contraintes `CHECK` strictes sur `products.currency = 'MAD'` et `discounts.currency = 'MAD'`. |
| Hiérarchie de catégories sans limite | **VALIDÉ** | Auto-référence `categories.parent_id REFERENCES categories(id) ON DELETE RESTRICT`. |
| Vérification des dates cohérentes | **VALIDÉ** | `CHECK (expires_at > reserved_at)` et `CHECK (ends_at > starts_at)`. |
| Protection contre les stocks négatifs | **VALIDÉ** | `CHECK (quantity_on_hand >= 0)` et `CHECK (quantity_reserved <= quantity_on_hand)`. |
| Séparation des 3 couches respectée | **VALIDÉ** | Aucune requête SQL directe dans l'interface visuelle. |

