# ARTFIT — SPRINT 01 : DICTIONNAIRE DE DONNÉES
## Module : Gestion des Produits (CRUD)

- **Version du document :** 1.1.0
- **Statut :** Spécification technique validée
- **Date de mise à jour :** 2026-11-16
- **Architecture obligatoire :** Architecture 3-Tiers (Présentation, Logique Métier, Accès aux Données)
- **Langue du document :** Français simple — Niveau A1
- **Périmètre :** Marque unique ARTFIT — Sprint 01 : Gestion des Produits

---

## 1. Présentation et Conventions

Ce dictionnaire de données décrit tous les champs nécessaires pour le **Sprint 01 — Gestion des Produits** d'ARTFIT.

### Règles standards
- **Identifiants :** Les identifiants utilisent le type `UUID` (ou `BIGINT`) pour garantir l'unicité globale.
- **Prix et Devise Unique :** Tous les montants utilisent exclusivement la devise unique Dirham Marocain (`MAD`) au format `DECIMAL(12,2)` avec un arrondi standard à 2 chiffres après la virgule (`ROUND_HALF_UP`). Aucun système multi-devises ni conversion EUR/USD n'est actif dans le Sprint 01. Les nombres flottants sont strictement interdits.
- **Dates et Heures :** Les dates utilisent `TIMESTAMP WITH TIME ZONE` au format universel UTC.
- **Textes :** Tous les textes utilisent le format `UTF-8` pour supporter les accents et caractères spéciaux.
- **Respect des 3 Couches :**
  - *Présentation (UI) :* Saisie, affichage et mise en forme des données en MAD.
  - *Logique Métier (BLL) :* Validation des règles, calculs de prix en MAD et contrôles de sécurité.
  - *Accès aux Données (DAL) :* Clés primaires, clés étrangères, index uniques et intégrité.

---

## 2. Résumé des 15 Groupes

| Groupe # | Nom du Groupe | Entité Principale | Nombre de Champs |
|:---:|---|---|:---:|
| 1 | Informations Produit | `products` | 11 |
| 2 | Catégories | `categories`, `product_categories` | 13 |
| 3 | Variantes de Produits | `product_variants` | 11 |
| 4 | Attributs Flexibles | `attribute_types`, `attribute_values`, `variant_attribute_values` | 12 |
| 5 | Médias du Produit | `product_media` | 10 |
| 6 | Modèles 3D | `product_3d_models` | 14 |
| 7 | SKU (Gestion des Stocks) | `product_variants.sku` / Règles SKU | 5 |
| 8 | Tarification et Prix | Champs de prix (Produit et Variante) | 7 |
| 9 | Inventaire et Stock | `inventory` | 9 |
| 10 | Réservations de Stock | `stock_reservations` | 9 |
| 11 | Réductions et Promotions | `discounts` | 24 |
| 12 | Codes Promo (Coupons) | `coupon_codes` | 11 |
| 13 | Réservations de Réductions | `discount_usage_reservations` | 8 |
| 14 | Administrateurs | `admins` | 9 |
| 15 | Historique d'Audit | `audit_logs` | 10 |
| **TOTAL** | | | **163 Spécifications Documentées** |

---

## 3. Spécifications Détaillées des Champs

---

### Groupe 1 : Informations Produit (`products`)

Fiche principale d'un vêtement ou d'un article de mode ARTFIT.

| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `id` | Identifiant unique du vêtement. | `UUID` / `BIGINT` | Obligatoire | UUID automatique | Non nul, unique, clé primaire. | `BR-PRD-001` | `"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"` |
| `name` | Nom commercial du vêtement. | `VARCHAR(255)` | Obligatoire | *Aucun* | 3 à 255 caractères, non vide. | `BR-PRD-003` | `"Blouson Bomber Cyberpunk Noir"` |
| `slug` | Identifiant texte pour le lien URL du vêtement. | `VARCHAR(255)` | Obligatoire | Slug automatique du nom | Lettres minuscules, chiffres et tirets `^[a-z0-9-]+$`, unique. | `BR-PRD-001` | `"blouson-bomber-cyberpunk-noir"` |
| `description` | Description complète du vêtement et des matières. | `TEXT` | Obligatoire | *Aucun* | Minimum 10 caractères, texte propre. | `BR-PRD-003` | `"Blouson en nylon technique imperméable avec détails réfléchissants..."` |
| `short_description` | Résumé court pour la carte du catalogue. | `VARCHAR(500)` | Optionnel | `NULL` | Maximum 500 caractères. | `BR-PRD-001` | `"Veste urbaine moderne avec essayage 3D."` |
| `brand_name` | Nom de la marque unique. | `VARCHAR(100)` | Obligatoire | `'ARTFIT'` | Doit toujours être égal à `'ARTFIT'`. | `BR-PRD-001` | `"ARTFIT"` |
| `base_price` | Prix de base officiel du vêtement en dirhams (MAD). | `DECIMAL(12,2)` | Obligatoire | *Aucun* | Strictement supérieur à 0.00 MAD, exactement 2 décimales. | `BR-PRC-001`, `BR-PRC-004`, `BR-PRD-003` | `1250.00` |
| `status` | Statut de publication du vêtement. | `VARCHAR(20)` | Obligatoire | `'DRAFT'` | Valeurs autorisées : `'DRAFT'`, `'PUBLISHED'`, `'ARCHIVED'`. | `BR-PRD-002`, `BR-PRD-003`, `BR-PRD-004` | `"PUBLISHED"` |
| `is_featured` | Indique si le vêtement est mis en avant sur l'accueil. | `BOOLEAN` | Obligatoire | `false` | Vrai ou faux. | `BR-PRD-001` | `true` |
| `created_at` | Date et heure de création de la fiche. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide, ne change jamais. | `BR-ADM-002` | `"2026-11-16T10:00:00Z"` |
| `updated_at` | Date et heure de la dernière modification. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide. | `BR-ADM-002` | `"2026-11-16T10:15:00Z"` |
| `deleted_at` | Date de suppression douce (soft delete). | `TIMESTAMP WITH TIME ZONE` | Optionnel | `NULL` | `NULL` si actif ; date UTC si supprimé. | `BR-PRD-002` | `NULL` |

---

### Groupe 2 : Catégories (`categories`, `product_categories`)

Classement et organisation des vêtements dans le catalogue.

#### Entité : `categories`
| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `id` | Identifiant unique de la catégorie. | `UUID` / `BIGINT` | Obligatoire | UUID automatique | Non nul, unique, clé primaire. | `BR-CAT-001` | `"a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"` |
| `name` | Nom lisible de la catégorie. | `VARCHAR(100)` | Obligatoire | *Aucun* | 2 à 100 caractères, unique dans le même parent. | `BR-CAT-001` | `"Vestes et Manteaux"` |
| `slug` | Identifiant texte pour le lien URL de la catégorie. | `VARCHAR(120)` | Obligatoire | Slug automatique | Lettres minuscules et tirets, unique. | `BR-CAT-001` | `"vestes-et-manteaux"` |
| `description` | Description pour expliquer le contenu de la catégorie. | `TEXT` | Optionnel | `NULL` | Maximum 2000 caractères. | `BR-CAT-001` | `"Collection de vestes urbaines et manteaux techniques."` |
| `parent_id` | Identifiant de la catégorie parente (si sous-catégorie). | `UUID` / `BIGINT` | Optionnel | `NULL` | Référence `categories.id` ou `NULL` si catégorie racine. | `BR-CAT-002` | `NULL` |
| `display_order` | Numéro d'ordre pour le menu de navigation. | `INTEGER` | Obligatoire | `0` | Supérieur ou égal à 0. | `BR-CAT-001` | `1` |
| `is_active` | Indique si la catégorie est active et visible. | `BOOLEAN` | Obligatoire | `true` | Vrai ou faux. | `BR-CAT-002` | `true` |
| `image_url` | Adresse URL de l'image d'en-tête de la catégorie. | `VARCHAR(2048)` | Optionnel | `NULL` | Adresse HTTPS valide. | `BR-CAT-001` | `"https://cdn.artfit.fashion/categories/vestes.webp"` |
| `created_at` | Date et heure de création. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide. | `BR-ADM-002` | `"2026-11-16T09:00:00Z"` |
| `updated_at` | Date et heure de mise à jour. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide. | `BR-ADM-002` | `"2026-11-16T09:30:00Z"` |

#### Entité : `product_categories` (Lien Produit-Catégorie)
| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `product_id` | Identifiant du vêtement lié. | `UUID` / `BIGINT` | Obligatoire | *Aucun* | Doit exister dans `products.id`. Clé composite part 1. | `BR-CAT-001`, `BR-PRD-003` | `"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"` |
| `category_id` | Identifiant de la catégorie liée. | `UUID` / `BIGINT` | Obligatoire | *Aucun* | Doit exister dans `categories.id`. Clé composite part 2. | `BR-CAT-001`, `BR-PRD-003` | `"a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"` |
| `is_primary` | Indique si c'est la catégorie principale du vêtement. | `BOOLEAN` | Obligatoire | `false` | Exactement un seul `is_primary = true` par vêtement. | `BR-CAT-001` | `true` |

---

### Groupe 3 : Variantes de Produits (`product_variants`)

Déclinaison physique d'un vêtement selon ses options (Taille, Couleur).

| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `id` | Identifiant unique de la variante. | `UUID` / `BIGINT` | Obligatoire | UUID automatique | Non nul, unique, clé primaire. | `BR-VAR-001` | `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` |
| `product_id` | Identifiant du vêtement parent. | `UUID` / `BIGINT` | Obligatoire | *Aucun* | Doit exister dans `products.id`. | `BR-VAR-001`, `BR-PRD-003` | `"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"` |
| `sku` | Code unique d'inventaire de la variante. | `VARCHAR(64)` | Obligatoire | *Aucun* | Non vide, lettres majuscules et chiffres, unique. | `BR-SKU-001`, `BR-SKU-002` | `"AF-JKT-CYB-BLK-L"` |
| `price_override` | Prix propre à la variante en MAD (remplace le prix de base). | `DECIMAL(12,2)` | Optionnel | `NULL` | Si renseigné, doit être supérieur à 0.00 MAD. | `BR-PRC-001`, `BR-PRC-004` | `1350.00` |
| `compare_at_price` | Ancien prix barré en MAD affiché pour montrer la remise. | `DECIMAL(12,2)` | Optionnel | `NULL` | Doit être supérieur ou égal au prix de vente. | `BR-PRC-001`, `BR-PRC-004` | `1600.00` |
| `cost_price` | Coût d'achat de fabrication en MAD pour la gestion interne. | `DECIMAL(12,2)` | Optionnel | `NULL` | Visible uniquement par l'administrateur, $\ge 0.00$ MAD. | `BR-PRC-001`, `BR-PRC-004`, `BR-ADM-001` | `480.00` |
| `weight_kg` | Poids du vêtement en kilogrammes pour la livraison. | `DECIMAL(6,3)` | Optionnel | `0.500` | Supérieur ou égal à 0.000 kg. | `BR-VAR-001` | `0.850` |
| `is_active` | Indique si cette variante est en vente. | `BOOLEAN` | Obligatoire | `true` | Vrai ou faux. | `BR-VAR-003` | `true` |
| `created_at` | Date et heure de création. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide. | `BR-ADM-002` | `"2026-11-16T10:05:00Z"` |
| `updated_at` | Date et heure de modification. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide. | `BR-ADM-002` | `"2026-11-16T10:10:00Z"` |
| `deleted_at` | Date de suppression douce. | `TIMESTAMP WITH TIME ZONE` | Optionnel | `NULL` | `NULL` si actif. | `BR-VAR-001` | `NULL` |

---

### Groupe 4 : Attributs Flexibles (`attribute_types`, `attribute_values`, `variant_attribute_values`)

Architecture dynamique pour ajouter librement des options (Taille, Couleur, Coupe).

#### Entité : `attribute_types`
| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `id` | Identifiant du type d'option. | `UUID` / `BIGINT` | Obligatoire | UUID automatique | Non nul, unique, clé primaire. | `BR-VAR-002` | `"c0a8012e-7b11-4099-b1d5-2e66480b2a01"` |
| `name` | Nom du type (exemple : Taille, Couleur). | `VARCHAR(50)` | Obligatoire | *Aucun* | 2 à 50 caractères. | `BR-VAR-002` | `"Taille"` |
| `code` | Code technique en minuscules. | `VARCHAR(50)` | Obligatoire | *Aucun* | Unique, lettres minuscules `^[a-z0-9_]+$`. | `BR-VAR-002` | `"size"` |
| `display_type` | Façon d'afficher le sélecteur sur le site. | `VARCHAR(30)` | Obligatoire | `'PILL'` | Valeurs autorisées : `'PILL'`, `'COLOR_SWATCH'`, `'DROPDOWN'`. | `BR-VAR-002` | `"PILL"` |

#### Entité : `attribute_values`
| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `id` | Identifiant de la valeur d'option. | `UUID` / `BIGINT` | Obligatoire | UUID automatique | Non nul, unique, clé primaire. | `BR-VAR-002` | `"c0a8012e-7b11-4099-b1d5-2e66480b2a02"` |
| `attribute_type_id` | Identifiant du type parent. | `UUID` / `BIGINT` | Obligatoire | *Aucun* | Doit exister dans `attribute_types.id`. | `BR-VAR-002` | `"c0a8012e-7b11-4099-b1d5-2e66480b2a01"` |
| `value` | Valeur brute interne. | `VARCHAR(100)` | Obligatoire | *Aucun* | 1 à 100 caractères. | `BR-VAR-002` | `"L"` |
| `label` | Texte lisible affiché au client. | `VARCHAR(100)` | Obligatoire | *Aucun* | 1 à 100 caractères. | `BR-VAR-002` | `"Large (L)"` |
| `color_hex` | Code couleur pour la pastille de couleur. | `VARCHAR(7)` | Optionnel | `NULL` | Format couleur `#RRGGBB` (exemple : `"#1A1A1A"`). | `BR-VAR-002` | `"#1A1A1A"` |
| `display_order` | Ordre d'affichage dans le sélecteur. | `INTEGER` | Obligatoire | `0` | Supérieur ou égal à 0. | `BR-VAR-002` | `3` |

#### Entité : `variant_attribute_values` (Lien Variante-Attribut)
| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `variant_id` | Identifiant de la variante. | `UUID` / `BIGINT` | Obligatoire | *Aucun* | Doit exister dans `product_variants.id`. Clé composite part 1. | `BR-VAR-001` | `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` |
| `attribute_value_id` | Identifiant de la valeur d'option choisie. | `UUID` / `BIGINT` | Obligatoire | *Aucun* | Doit exister dans `attribute_values.id`. Clé composite part 2. | `BR-VAR-001` | `"c0a8012e-7b11-4099-b1d5-2e66480b2a02"` |

---

### Groupe 5 : Médias du Produit (`product_media`)

Photos 2D, images de lookbook et vidéos des vêtements.

| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `id` | Identifiant unique de l'image ou vidéo. | `UUID` / `BIGINT` | Obligatoire | UUID automatique | Non nul, unique, clé primaire. | `BR-MED-001` | `"d3b07384-d113-46fb-9b24-7e3e7f4a5c88"` |
| `product_id` | Identifiant du vêtement lié. | `UUID` / `BIGINT` | Obligatoire | *Aucun* | Doit exister dans `products.id`. | `BR-MED-001`, `BR-PRD-003` | `"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"` |
| `variant_id` | Variante précise liée (si photo d'une couleur précise). | `UUID` / `BIGINT` | Optionnel | `NULL` | Référence `product_variants.id` si non nul. | `BR-MED-001` | `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` |
| `media_type` | Type de fichier média. | `VARCHAR(20)` | Obligatoire | `'IMAGE'` | Valeurs autorisées : `'IMAGE'`, `'VIDEO'`. | `BR-MED-001` | `"IMAGE"` |
| `url` | Adresse URL complète du fichier image. | `VARCHAR(2048)` | Obligatoire | *Aucun* | Adresse HTTPS sécurisée. | `BR-MED-001` | `"https://cdn.artfit.fashion/products/bomber-face.webp"` |
| `thumbnail_url` | Adresse URL de la miniature optimisée. | `VARCHAR(2048)` | Optionnel | `NULL` | Adresse HTTPS sécurisée. | `BR-MED-001` | `"https://cdn.artfit.fashion/products/bomber-face-mini.webp"` |
| `alt_text` | Texte pour l'accessibilité et les moteurs de recherche. | `VARCHAR(255)` | Obligatoire | *Aucun* | 3 à 255 caractères, non vide. | `BR-MED-001` | `"Blouson Bomber Cyberpunk Noir vue de face"` |
| `display_order` | Ordre d'affichage dans la galerie photo. | `INTEGER` | Obligatoire | `0` | Supérieur ou égal à 0. | `BR-MED-001` | `0` |
| `is_primary` | Indique si c'est l'image principale de couverture. | `BOOLEAN` | Obligatoire | `false` | Exactement une seule image principale par vêtement. | `BR-MED-001`, `BR-PRD-003` | `true` |
| `created_at` | Date et heure de mise en ligne. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide. | `BR-ADM-002` | `"2026-11-16T10:06:00Z"` |

---

### Groupe 6 : Modèles 3D (`product_3d_models`)

Fichiers 3D interactifs et paramètres pour l'essayage virtuel.

| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `id` | Identifiant unique du modèle 3D. | `UUID` / `BIGINT` | Obligatoire | UUID automatique | Non nul, unique, clé primaire. | `BR-MED-002` | `"e4d3c2b1-a098-4765-b432-1f0e9d8c7b6a"` |
| `product_id` | Identifiant du vêtement lié. | `UUID` / `BIGINT` | Obligatoire | *Aucun* | Doit exister dans `products.id`. | `BR-MED-002` | `"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"` |
| `variant_id` | Variante précise liée (si modèle d'une couleur précise). | `UUID` / `BIGINT` | Optionnel | `NULL` | Référence `product_variants.id` si non nul. | `BR-MED-002` | `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` |
| `model_url` | Adresse URL de téléchargement du fichier 3D. | `VARCHAR(2048)` | Obligatoire | *Aucun* | Adresse HTTPS se terminant par `.glb` ou `.gltf`. | `BR-MED-002` | `"https://cdn.artfit.fashion/3d/bomber-v2.glb"` |
| `file_format` | Format du fichier 3D. | `VARCHAR(10)` | Obligatoire | `'GLB'` | Valeurs autorisées : `'GLB'`, `'GLTF'`. | `BR-MED-002` | `"GLB"` |
| `file_size_bytes` | Taille du fichier en octets (bytes). | `BIGINT` | Obligatoire | *Aucun* | Supérieur à 0, maximum 52428800 octets (50 Mo). | `BR-MED-002` | `14680064` |
| `fallback_image_url` | Image 2D affichée si la 3D ne charge pas. | `VARCHAR(2048)` | Obligatoire | *Aucun* | Adresse HTTPS valide. | `BR-MED-003` | `"https://cdn.artfit.fashion/3d/fallbacks/bomber-3d.webp"` |
| `scale_x` | Échelle de taille du vêtement sur l'axe X. | `DECIMAL(6,3)` | Obligatoire | `1.000` | Supérieur à 0.000. | `BR-MED-002` | `1.000` |
| `scale_y` | Échelle de taille du vêtement sur l'axe Y. | `DECIMAL(6,3)` | Obligatoire | `1.000` | Supérieur à 0.000. | `BR-MED-002` | `1.000` |
| `scale_z` | Échelle de taille du vêtement sur l'axe Z. | `DECIMAL(6,3)` | Obligatoire | `1.000` | Supérieur à 0.000. | `BR-MED-002` | `1.000` |
| `texture_maps` | Liens des textures de matières au format JSON. | `JSON` / `JSONB` | Optionnel | `NULL` | Objet JSON valide contenant les adresses de textures. | `BR-MED-002` | `{"rugosite": "https://..."}` |
| `status` | Statut de disponibilité du modèle 3D. | `VARCHAR(20)` | Obligatoire | `'ACTIVE'` | Valeurs autorisées : `'ACTIVE'`, `'PROCESSING'`, `'INACTIVE'`. | `BR-MED-002` | `"ACTIVE"` |
| `created_at` | Date et heure de mise en ligne. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide. | `BR-ADM-002` | `"2026-11-16T10:07:00Z"` |
| `updated_at` | Date et heure de modification. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide. | `BR-ADM-002` | `"2026-11-16T10:07:00Z"` |

---

### Groupe 7 : SKU (Gestion des Stocks)

Champs d'identification physique des articles en magasin et dépôt.

| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `sku` | Code unique d'inventaire de la variante. | `VARCHAR(64)` | Obligatoire | *Aucun* | 3 à 64 caractères, majuscules, chiffres et tirets, unique. | `BR-SKU-001`, `BR-SKU-002` | `"AF-JKT-CYB-BLK-L"` |
| `barcode` | Code-barres scannable (EAN-13 ou UPC). | `VARCHAR(128)` | Optionnel | `NULL` | Chiffres uniquement si renseigné. | `BR-SKU-001` | `"6111234567890"` |
| `sku_generation_type` | Façon dont le SKU a été créé. | `VARCHAR(20)` | Obligatoire | `'MANUAL'` | Valeurs autorisées : `'MANUAL'`, `'AUTOMATIC'`. | `BR-SKU-002`, `BR-CPN-001` | `"AUTOMATIC"` |
| `sku_pattern` | Modèle utilisé pour créer le SKU automatiquement. | `VARCHAR(100)` | Optionnel | `NULL` | Texte de modèle (exemple : `AF-{CAT}-{ID}-{VAR}`). | `BR-SKU-002` | `"AF-{CAT}-{ID}-{SIZE}-{COLOR}"` |
| `is_sku_active` | Indique si le code SKU peut être scanné au dépôt. | `BOOLEAN` | Obligatoire | `true` | Vrai ou faux. | `BR-SKU-001`, `BR-VAR-003` | `true` |

---

### Groupe 8 : Tarification et Prix

Champs financiers et monétaires de la boutique ARTFIT.

| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `base_price` | Prix de base officiel du vêtement en dirhams (MAD). | `DECIMAL(12,2)` | Obligatoire | *Aucun* | Supérieur à 0.00 MAD, exactement 2 décimales. | `BR-PRC-001`, `BR-PRC-004`, `BR-PRD-003` | `1250.00` |
| `price_override` | Prix spécifique en MAD remplaçant le prix de base. | `DECIMAL(12,2)` | Optionnel | `NULL` | Supérieur à 0.00 MAD si renseigné. | `BR-PRC-001`, `BR-PRC-004` | `1350.00` |
| `compare_at_price` | Prix barré en MAD pour afficher une promotion visuelle. | `DECIMAL(12,2)` | Optionnel | `NULL` | Supérieur ou égal au prix de vente si renseigné. | `BR-PRC-001`, `BR-PRC-004` | `1600.00` |
| `cost_price` | Coût de fabrication en MAD pour calculer la marge interne. | `DECIMAL(12,2)` | Optionnel | `NULL` | Visible uniquement par l'administrateur, $\ge 0.00$ MAD. | `BR-PRC-001`, `BR-PRC-004`, `BR-ADM-001` | `480.00` |
| `currency` | Code de la devise unique de la boutique (Dirham marocain). | `VARCHAR(3)` | Obligatoire | `'MAD'` | Strictement égal à `'MAD'`. Seule devise acceptée. Rejeter toute autre valeur. Pas de multi-devises. | `BR-PRC-004` | `"MAD"` |
| `effective_price` | Prix de vente calculé en MAD avant réduction de panier. | `DECIMAL(12,2)` | Calculé au vol | *Aucun* | Vaut `price_override` s'il existe, sinon `base_price`. Toujours en MAD. | `BR-PRC-001`, `BR-PRC-004` | `1350.00` |
| `final_price` | Prix unitaire final en MAD après toutes les réductions. | `DECIMAL(12,2)` | Calculé au vol | *Aucun* | Arrondi à 2 décimales, jamais inférieur à 0.00 MAD. | `BR-PRC-002`, `BR-PRC-003`, `BR-PRC-004` | `1080.00` |

---

### Groupe 9 : Inventaire et Stock (`inventory`)

Suivi des quantités réelles dans le dépôt et gestion des alertes.

| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `id` | Identifiant de la ligne d'inventaire. | `UUID` / `BIGINT` | Obligatoire | UUID automatique | Non nul, unique, clé primaire. | `BR-INV-001` | `"b5c6d7e8-f9a0-4b1c-8d2e-3f4a5b6c7d8e"` |
| `variant_id` | Identifiant de la variante concernée. | `UUID` / `BIGINT` | Obligatoire | *Aucun* | Doit exister dans `product_variants.id`. Une seule ligne par variante. | `BR-INV-001`, `BR-VAR-001` | `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` |
| `quantity_on_hand` | Nombre réel d'articles présents dans le dépôt. | `INTEGER` | Obligatoire | `0` | Entier supérieur ou égal à 0. | `BR-INV-001`, `BR-RES-004` | `45` |
| `quantity_reserved` | Nombre d'articles bloqués dans des paiements en cours. | `INTEGER` | Obligatoire | `0` | Entier $\ge 0$. Ne peut pas dépasser `quantity_on_hand`. | `BR-INV-001`, `BR-RES-001` | `5` |
| `quantity_available` | Stock disponible à la vente ($on\_hand - reserved$). | `INTEGER` | Calculé virtuel | *Aucun* | Quantité en stock moins quantité réservée. Jamais négatif. | `BR-INV-001`, `BR-INV-003` | `40` |
| `low_stock_threshold` | Seuil qui déclenche l'alerte de réassortiment. | `INTEGER` | Obligatoire | `5` | Entier supérieur ou égal à 0. | `BR-INV-002` | `5` |
| `allow_backorder` | Autorise l'achat même si le stock est égal à 0. | `BOOLEAN` | Obligatoire | `false` | Vrai ou faux (faux par défaut sur ARTFIT). | `BR-INV-003` | `false` |
| `last_restocked_at` | Date et heure de la dernière livraison reçue. | `TIMESTAMP WITH TIME ZONE` | Optionnel | `NULL` | Date UTC valide. | `BR-INV-001`, `BR-ADM-002` | `"2026-11-15T14:00:00Z"` |
| `updated_at` | Date de la dernière modification de stock. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide. | `BR-INV-001` | `"2026-11-16T10:12:00Z"` |

---

### Groupe 10 : Réservations de Stock (`stock_reservations`)

Blocage temporaire des articles pendant 60 minutes au moment du paiement.

| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `id` | Identifiant unique de la réservation. | `UUID` / `BIGINT` | Obligatoire | UUID automatique | Non nul, unique, clé primaire. | `BR-RES-001` | `"c7d8e9f0-a1b2-4c3d-8e4f-5a6b7c8d9e0f"` |
| `variant_id` | Identifiant de la variante réservée. | `UUID` / `BIGINT` | Obligatoire | *Aucun* | Doit exister dans `product_variants.id`. | `BR-RES-001` | `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` |
| `session_id` | Jeton unique de session de panier ou commande. | `VARCHAR(128)` | Obligatoire | *Aucun* | 16 à 128 caractères, non vide. | `BR-RES-001` | `"sess_chk_8f9k2l0a3b4c5d6e"` |
| `user_id` | Identifiant du client connecté (si connecté). | `UUID` / `BIGINT` | Optionnel | `NULL` | Référence le client ou `NULL` pour un invité. | `BR-RES-001` | `NULL` |
| `quantity` | Nombre d'articles réservés pour ce panier. | `INTEGER` | Obligatoire | `1` | Entier strictement supérieur à 0. | `BR-RES-001` | `2` |
| `reserved_at` | Date et heure exacte du début de la réservation. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide. | `BR-RES-001` | `"2026-11-16T10:00:00Z"` |
| `expires_at` | Date exacte d'expiration ($\text{reserved\_at} + 60\text{ min}$). | `TIMESTAMP WITH TIME ZONE` | Obligatoire | *Calculé* | Vaut exactement la date de début + 60 minutes. | `BR-RES-001`, `BR-RES-003` | `"2026-11-16T11:00:00Z"` |
| `status` | Statut de la réservation. | `VARCHAR(20)` | Obligatoire | `'ACTIVE'` | Valeurs autorisées : `'ACTIVE'`, `'CONFIRMED'`, `'EXPIRED'`, `'CANCELLED'`. | `BR-RES-001`, `BR-RES-002`, `BR-RES-003`, `BR-RES-004` | `"ACTIVE"` |
| `updated_at` | Date du dernier changement d'état. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide. | `BR-RES-001` | `"2026-11-16T10:00:00Z"` |

---

### Groupe 11 : Réductions et Promotions (`discounts`)

Règles de remises commerciales, pourcentages, montants fixes en MAD et cumuls.

| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `id` | Identifiant unique de la réduction. | `UUID` / `BIGINT` | Obligatoire | UUID automatique | Non nul, unique, clé primaire. | `BR-DSC-001` | `"d1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a"` |
| `name` | Nom de la promotion pour l'administrateur. | `VARCHAR(150)` | Obligatoire | *Aucun* | 3 à 150 caractères. | `BR-DSC-001` | `"Remise Hiver 20% sur les Vestes"` |
| `description` | Description explicative de l'offre. | `VARCHAR(500)` | Optionnel | `NULL` | Maximum 500 caractères. | `BR-DSC-001` | `"20% de remise immédiate sur tous les bombers."` |
| `discount_type` | Façon de calculer la remise. | `VARCHAR(20)` | Obligatoire | `'PERCENTAGE'` | Valeurs autorisées : `'PERCENTAGE'`, `'FIXED_AMOUNT'`. | `BR-DSC-001` | `"PERCENTAGE"` |
| `discount_value` | Valeur du rabais (en % ou en montant fixe MAD). | `DECIMAL(12,2)` | Obligatoire | *Aucun* | Si % : entre 0.01 et 100.00. Si fixe : supérieur à 0.00 MAD. | `BR-DSC-001`, `BR-PRC-004` | `20.00` |
| `scope` | Cible de la réduction. | `VARCHAR(20)` | Obligatoire | `'PRODUCT'` | Valeurs : `'PRODUCT'`, `'VARIANT'`, `'CATEGORY'`, `'ORDER'`. | `BR-DSC-001`, `BR-DSC-009` | `"PRODUCT"` |
| `target_id` | Identifiant de l'élément ciblé (produit, variante ou catégorie). | `UUID` / `BIGINT` | Optionnel | `NULL` | Obligatoire si scope = PRODUCT, VARIANT ou CATEGORY. | `BR-DSC-001`, `BR-DSC-009` | `"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"` |
| `starts_at` | Date et heure de début de la promotion. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | *Aucun* | Date UTC valide. | `BR-DSC-002` | `"2026-11-16T00:00:00Z"` |
| `ends_at` | Date et heure de fin de la promotion. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | *Aucun* | Date UTC valide, supérieure à la date de début. | `BR-DSC-002` | `"2026-11-30T23:59:59Z"` |
| `is_active` | Interrupteur général de la réduction. | `BOOLEAN` | Obligatoire | `true` | Vrai ou faux. | `BR-DSC-002`, `BR-DSC-012` | `true` |
| `priority` | Ordre de priorité si plusieurs réductions existent. | `INTEGER` | Obligatoire | `100` | Entier $\ge 0$. Plus le chiffre est petit, plus il est prioritaire. | `BR-DSC-003` | `10` |
| `is_manual_override` | Force cette réduction en priorité absolue. | `BOOLEAN` | Obligatoire | `false` | Vrai ou faux. | `BR-DSC-003` | `false` |
| `is_stackable` | Autorise le cumul avec d'autres réductions cumulables. | `BOOLEAN` | Obligatoire | `false` | Vrai ou faux. | `BR-DSC-010` | `true` |
| `calculation_sequence` | Ordre d'exécution lors du cumul des remises. | `INTEGER` | Obligatoire | `1` | Entier $\ge 1$, ordre croissant d'application. | `BR-DSC-010` | `1` |
| `min_order_amount_pre_discount` | Montant minimum d'achat en MAD calculé avant réduction. | `DECIMAL(12,2)` | Optionnel | `NULL` | Supérieur ou égal à 0.00 MAD si renseigné. | `BR-DSC-006`, `BR-PRC-004` | `500.00` |
| `min_quantity` | Nombre minimum d'articles requis dans le panier. | `INTEGER` | Optionnel | `NULL` | Entier supérieur ou égal à 1 si renseigné. | `BR-DSC-007` | `2` |
| `min_quantity_calc_type` | Façon de compter les articles pour le minimum. | `VARCHAR(30)` | Obligatoire | `'ELIGIBLE_ITEMS_ONLY'` | Valeurs : `'ELIGIBLE_ITEMS_ONLY'`, `'TOTAL_CART_ITEMS'`. | `BR-DSC-007` | `"ELIGIBLE_ITEMS_ONLY"` |
| `apply_quantity_mode` | Mode d'application sur les exemplaires achetés. | `VARCHAR(20)` | Obligatoire | `'ALL_UNITS'` | Valeurs : `'ALL_UNITS'`, `'CAPPED_QUANTITY'`. | `BR-DSC-008` | `"CAPPED_QUANTITY"` |
| `max_quantity_capped` | Nombre maximum d'exemplaires qui reçoivent la remise. | `INTEGER` | Optionnel | `NULL` | Obligatoire si mode = CAPPED_QUANTITY, $\ge 1$. | `BR-DSC-008` | `2` |
| `min_discount_amount` | Montant minimum garanti en MAD pour un pourcentage. | `DECIMAL(12,2)` | Optionnel | `NULL` | Supérieur ou égal à 0.00 MAD si renseigné. | `BR-DSC-011`, `BR-PRC-004` | `50.00` |
| `max_discount_amount` | Plafond maximum en MAD pour un pourcentage. | `DECIMAL(12,2)` | Optionnel | `NULL` | Supérieur au minimum si renseigné. | `BR-DSC-011`, `BR-PRC-004` | `300.00` |
| `max_usage_total` | Nombre total d'utilisations autorisées sur le site. | `INTEGER` | Optionnel | `NULL` | Entier $\ge 1$ ; `NULL` signifie illimité. | `BR-DSC-004` | `500` |
| `max_usage_per_customer` | Nombre d'utilisations autorisées par client. | `INTEGER` | Optionnel | `1` | Entier supérieur ou égal à 1. | `BR-DSC-004` | `1` |
| `times_used` | Nombre total de fois où la réduction a été payée. | `INTEGER` | Obligatoire | `0` | Entier $\ge 0$, augmente à chaque paiement réussi. | `BR-DSC-004`, `BR-RES-004` | `84` |

---

### Groupe 12 : Codes Promo (`coupon_codes`)

Bons de réduction avec code texte saisis par les clients.

| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `id` | Identifiant unique du code promo. | `UUID` / `BIGINT` | Obligatoire | UUID automatique | Non nul, unique, clé primaire. | `BR-CPN-001` | `"a2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d"` |
| `discount_id` | Identifiant de la règle de réduction associée. | `UUID` / `BIGINT` | Obligatoire | *Aucun* | Doit exister dans `discounts.id`. | `BR-CPN-003` | `"d1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a"` |
| `code` | Code texte tapé par le client (enregistré en majuscules). | `VARCHAR(50)` | Obligatoire | *Aucun* | 3 à 50 caractères majuscules sans espaces, unique. | `BR-CPN-001`, `BR-CPN-002` | `"ARTFIT-VIP20"` |
| `generation_type` | Façon dont le code promo a été créé. | `VARCHAR(20)` | Obligatoire | `'MANUAL'` | Valeurs autorisées : `'MANUAL'`, `'AUTOMATIC'`. | `BR-CPN-001` | `"MANUAL"` |
| `max_uses` | Limite d'utilisation propre à ce code texte. | `INTEGER` | Optionnel | `NULL` | Entier $\ge 1$ si renseigné. | `BR-CPN-003`, `BR-DSC-004` | `100` |
| `times_used` | Nombre d'utilisations payées avec ce code. | `INTEGER` | Obligatoire | `0` | Entier $\ge 0$. | `BR-CPN-003` | `12` |
| `starts_at` | Date et heure de début de validité du code. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | *Aucun* | Date UTC valide. | `BR-CPN-003` | `"2026-11-16T00:00:00Z"` |
| `expires_at` | Date et heure de fin de validité du code. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | *Aucun* | Date UTC valide, supérieure à la date de début. | `BR-CPN-003` | `"2026-11-30T23:59:59Z"` |
| `is_active` | Interrupteur pour activer ou couper le code promo. | `BOOLEAN` | Obligatoire | `true` | Vrai ou faux. | `BR-CPN-003` | `true` |
| `created_at` | Date et heure de création du code. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide. | `BR-ADM-002` | `"2026-11-16T10:00:00Z"` |
| `updated_at` | Date et heure de modification. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide. | `BR-ADM-002` | `"2026-11-16T10:00:00Z"` |

---

### Groupe 13 : Réservations de Réductions (`discount_usage_reservations`)

Blocage temporaire d'une place de réduction pendant le paiement (60 minutes).

| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `id` | Identifiant de la réservation de réduction. | `UUID` / `BIGINT` | Obligatoire | UUID automatique | Non nul, unique, clé primaire. | `BR-DSC-005` | `"f1e2d3c4-b5a6-4987-8765-4321fedcba09"` |
| `discount_id` | Identifiant de la réduction réservée. | `UUID` / `BIGINT` | Obligatoire | *Aucun* | Doit exister dans `discounts.id`. | `BR-DSC-005` | `"d1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a"` |
| `coupon_id` | Identifiant du code promo utilisé (si coupon). | `UUID` / `BIGINT` | Optionnel | `NULL` | Référence `coupon_codes.id` si non nul. | `BR-DSC-005` | `"a2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d"` |
| `session_id` | Jeton de session de la commande en cours. | `VARCHAR(128)` | Obligatoire | *Aucun* | 16 à 128 caractères. | `BR-DSC-005` | `"sess_chk_8f9k2l0a3b4c5d6e"` |
| `user_id` | Identifiant du client connecté (si connecté). | `UUID` / `BIGINT` | Optionnel | `NULL` | Référence le client si authentifié. | `BR-DSC-004`, `BR-DSC-005` | `NULL` |
| `reserved_at` | Date et heure du début de la réservation. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide. | `BR-DSC-005` | `"2026-11-16T10:00:00Z"` |
| `expires_at` | Date d'expiration ($\text{reserved\_at} + 60\text{ min}$). | `TIMESTAMP WITH TIME ZONE` | Obligatoire | *Calculé* | Synchronisé avec la réservation de stock (60 minutes). | `BR-DSC-005`, `BR-RES-001` | `"2026-11-16T11:00:00Z"` |
| `status` | Statut de la réservation de réduction. | `VARCHAR(20)` | Obligatoire | `'ACTIVE'` | Valeurs : `'ACTIVE'`, `'CONSUMED'`, `'EXPIRED'`, `'CANCELLED'`. | `BR-DSC-005`, `BR-RES-004` | `"ACTIVE"` |

---

### Groupe 14 : Administrateurs (`admins`)

Comptes des personnes autorisées à gérer la boutique ARTFIT.

| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `id` | Identifiant unique de l'administrateur. | `UUID` / `BIGINT` | Obligatoire | UUID automatique | Non nul, unique, clé primaire. | `BR-ADM-001` | `"1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6e"` |
| `username` | Nom de connexion de l'administrateur. | `VARCHAR(60)` | Obligatoire | *Aucun* | 3 à 60 caractères, unique. | `BR-ADM-001` | `"artfit_superadmin"` |
| `email` | Adresse email de l'administrateur. | `VARCHAR(255)` | Obligatoire | *Aucun* | Format email valide, unique. | `BR-ADM-001` | `"admin@artfit.fashion"` |
| `password_hash` | Empreinte chiffrée du mot de passe. | `VARCHAR(255)` | Obligatoire | *Aucun* | Hachage sécurisé (Argon2id ou bcrypt), jamais en clair. | `BR-ADM-001` | `"$argon2id$v=19$m=65536,t=3,p=4$..."` |
| `role` | Rôle et niveau d'accès. | `VARCHAR(30)` | Obligatoire | `'SUPER_ADMIN'` | Valeurs : `'SUPER_ADMIN'`, `'ADMIN'`, `'CATALOG_MANAGER'`. | `BR-ADM-001` | `"SUPER_ADMIN"` |
| `is_active` | Indique si le compte est actif. | `BOOLEAN` | Obligatoire | `true` | Vrai ou faux. | `BR-ADM-001` | `true` |
| `last_login_at` | Date et heure de la dernière connexion réussie. | `TIMESTAMP WITH TIME ZONE` | Optionnel | `NULL` | Date UTC valide. | `BR-ADM-001` | `"2026-11-16T09:45:00Z"` |
| `created_at` | Date de création du compte. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide. | `BR-ADM-002` | `"2026-11-10T08:00:00Z"` |
| `updated_at` | Date de modification du compte. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide. | `BR-ADM-002` | `"2026-11-16T09:45:00Z"` |

---

### Groupe 15 : Historique d'Audit (`audit_logs`)

Journal de sécurité qui enregistre chaque modification dans le panneau de gestion.

| Nom du Champ | Description | Type de Données | Obligatoire / Optionnel | Valeur par Défaut | Règles de Validation | Règle Métier Associée | Exemple |
|---|---|---|---|---|---|---|---|
| `id` | Identifiant unique de la ligne de journal. | `UUID` / `BIGINT` | Obligatoire | UUID automatique | Non nul, unique, clé primaire, jamais modifiable. | `BR-ADM-002` | `"9f8e7d6c-5b4a-3210-fedc-ba9876543210"` |
| `admin_id` | Identifiant de l'administrateur responsable. | `UUID` / `BIGINT` | Obligatoire | *Aucun* | Doit exister dans `admins.id`. | `BR-ADM-002` | `"1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6e"` |
| `action` | Action effectuée par l'administrateur. | `VARCHAR(40)` | Obligatoire | *Aucun* | Verbe en majuscules (ex : `'PRODUCT_CREATE'`, `'PRODUCT_PUBLISH'`). | `BR-ADM-002` | `"PRODUCT_PUBLISH"` |
| `entity_type` | Type d'élément modifié. | `VARCHAR(50)` | Obligatoire | *Aucun* | Nom de l'entité (ex : `'PRODUCT'`, `'PRODUCT_VARIANT'`, `'DISCOUNT'`). | `BR-ADM-002` | `"PRODUCT"` |
| `entity_id` | Identifiant de l'élément modifié. | `VARCHAR(64)` | Obligatoire | *Aucun* | Non vide. | `BR-ADM-002` | `"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"` |
| `old_values` | Données avant la modification (format JSON). | `JSON` / `JSONB` | Optionnel | `NULL` | JSON valide, `NULL` lors d'une création. | `BR-ADM-002` | `{"status": "DRAFT"}` |
| `new_values` | Données après la modification (format JSON). | `JSON` / `JSONB` | Optionnel | `NULL` | JSON valide, `NULL` lors d'une suppression. | `BR-ADM-002` | `{"status": "PUBLISHED"}` |
| `ip_address` | Adresse IP de l'administrateur. | `VARCHAR(45)` | Optionnel | `NULL` | Adresse IPv4 ou IPv6 valide. | `BR-ADM-002` | `"196.200.150.34"` |
| `user_agent` | Logiciel et navigateur utilisé pour l'action. | `VARCHAR(500)` | Optionnel | `NULL` | Maximum 500 caractères. | `BR-ADM-002` | `"Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."` |
| `created_at` | Date et heure exacte de l'action. | `TIMESTAMP WITH TIME ZONE` | Obligatoire | `CURRENT_TIMESTAMP` | Date UTC valide, ne change jamais. | `BR-ADM-002` | `"2026-11-16T10:15:32Z"` |
