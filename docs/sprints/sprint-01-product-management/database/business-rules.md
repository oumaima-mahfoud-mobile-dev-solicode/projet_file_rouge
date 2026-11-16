# ARTFIT — SPRINT 01 : RÈGLES MÉTIER OFFICIELLES
## Module : Gestion des Produits (CRUD)

- **Version du document :** 1.1.0
- **Statut :** Règles validées et confirmées
- **Date de mise à jour :** 2026-11-16
- **Architecture obligatoire :** Architecture 3-Tiers (Présentation, Logique Métier, Accès aux Données)
- **Langue du document :** Français simple — Niveau A1
- **Périmètre :** Marque unique ARTFIT — Sprint 01 : Gestion des Produits

---

## 1. But du Document

Ce document liste toutes les règles métier validées pour le **Sprint 01 — Gestion des Produits** d'ARTFIT.

Ces règles respectent l'Architecture 3-Tiers :
- **Couche Présentation (UI) :** Affiche le catalogue, les variantes et les prix sans décider des règles.
- **Couche Métier (BLL) :** Vérifie toutes les règles, calcule les prix, gère les réductions et bloque les erreurs.
- **Couche Données (DAL) :** Enregistre les informations dans la base de données en toute sécurité.

---

## 2. Tableau Récapitulatif des Règles

| Code Domaine | Domaine Fonctionnel | Nombre de Règles |
|---|---|:---:|
| `BR-PRD` | Gestion des Produits et du Catalogue | 4 |
| `BR-CAT` | Catégories et Hiérarchie | 2 |
| `BR-VAR` | Variantes et Attributs Flexibles | 3 |
| `BR-MED` | Médias et Modèles 3D | 3 |
| `BR-SKU` | Codes SKU (Gestion des Stocks) | 2 |
| `BR-PRC` | Prix de Base, Prix des Variantes et Devise | 4 |
| `BR-INV` | Inventaire et Calcul du Stock | 3 |
| `BR-RES` | Réservation de Stock (60 Minutes) | 4 |
| `BR-DSC` | Réductions, Dates et Cumuls | 12 |
| `BR-CPN` | Codes Promo (Coupons) | 3 |
| `BR-CHK` | Contrôle Final au Paiement (Checkout Gate) | 1 |
| `BR-ADM` | Rôles Administrateur et Historique (Audit) | 2 |
| **TOTAL** | | **43 Règles Confirmées** |

---

## 3. Règles Métier Détaillées

---

### 3.1. Gestion des Produits (`BR-PRD`)

#### BR-PRD-001 : Boutique avec Marque Unique
- **Nom :** Marque Unique ARTFIT.
- **Description :** Tous les articles appartiennent uniquement à la marque ARTFIT. Le site n'a pas d'autres vendeurs.
- **Conditions :** Création, modification et affichage des produits.
- **Comportement attendu :**
  1. Le champ `brand_name` a toujours la valeur `"ARTFIT"`.
  2. Il n'y a pas d'espace multi-vendeurs ni de commission marketplace.
- **Données liées :** `products.brand_name`.
- **Statut de décision :** CONFIRMÉ.

#### BR-PRD-002 : Statuts du Produit et Visibilité
- **Nom :** Statuts et Affichage au Client.
- **Description :** Un produit a trois statuts possibles : `DRAFT`, `PUBLISHED` ou `ARCHIVED`.
- **Conditions :** Consultation du catalogue par le client ou l'administrateur.
- **Comportement attendu :**
  1. `DRAFT` (Brouillon) : Visible uniquement par l'administrateur. Invisible pour les clients.
  2. `PUBLISHED` (Publié) : Visible par tous les clients sur le site et disponible à l'achat.
  3. `ARCHIVED` (Archivé) : Masqué sur le site. Les clients ne peuvent plus l'acheter.
- **Données liées :** `products.status`.
- **Statut de décision :** CONFIRMÉ.

#### BR-PRD-003 : Validation Avant Publication
- **Nom :** Contrôle Obligatoire Avant de Publier.
- **Description :** Un produit ne peut pas passer au statut `PUBLISHED` si des informations manquent.
- **Conditions :** L'administrateur demande la publication d'un produit.
- **Comportement attendu :**
  Le système vérifie obligatoirement :
  1. Le titre et la description existent et ne sont pas vides.
  2. Le produit a au moins une catégorie active.
  3. Le prix de base est supérieur à zéro (`products.base_price > 0.00`).
  4. Le produit a au moins une variante active avec un SKU unique.
  5. Le produit a au moins une image principale (`is_primary = true`).
  Si un élément manque, la publication est refusée avec un message clair.
- **Données liées :** `products`, `product_categories`, `product_variants`, `product_media`.
- **Statut de décision :** CONFIRMÉ.

#### BR-PRD-004 : Suspension en Cas de Désactivation
- **Nom :** Effet de la Désactivation d'un Produit.
- **Description :** Quand un produit devient `DRAFT` ou `ARCHIVED`, ses actions actives s'arrêtent aussitôt.
- **Conditions :** Changement de statut du produit vers `DRAFT` ou `ARCHIVED`.
- **Comportement attendu :**
  1. Le produit disparaît des recherches des clients.
  2. Les réductions sur ce produit sont suspendues immédiatement (voir `BR-DSC-012`).
  3. Si l'article est dans un panier sans réservation active, il devient indisponible.
- **Données liées :** `products.status`, `discounts.is_active`.
- **Statut de décision :** CONFIRMÉ.

---

### 3.2. Catégories et Hiérarchie (`BR-CAT`)

#### BR-CAT-001 : Assignation de Catégorie et Catégorie Principale
- **Nom :** Catégorie Obligatoire et Catégorie Principale.
- **Description :** Un produit doit avoir au moins une catégorie. Une seule catégorie est la catégorie principale.
- **Conditions :** Création et modification d'un produit.
- **Comportement attendu :**
  1. Un produit peut appartenir à plusieurs catégories secondaires.
  2. Exactement une catégorie possède le drapeau `is_primary = true`.
  3. La catégorie principale sert pour le fil d'Ariane (breadcrumbs).
- **Données liées :** `categories.id`, `product_categories.is_primary`.
- **Statut de décision :** CONFIRMÉ.

#### BR-CAT-002 : Désactivation d'une Catégorie Parente
- **Nom :** Impact d'une Catégorie Désactivée.
- **Description :** Quand une catégorie est désactivée, ses sous-catégories sont aussi masquées.
- **Conditions :** Affichage du menu et navigation du site.
- **Comportement attendu :**
  1. Si `categories.is_active = false`, la catégorie et ses sous-catégories disparaissent du menu client.
- **Données liées :** `categories.parent_id`, `categories.is_active`.
- **Statut de décision :** CONFIRMÉ.

---

### 3.3. Variantes et Attributs Flexibles (`BR-VAR`)

#### BR-VAR-001 : Unicité des Combinaisons de Variantes
- **Nom :** Combinaison Unique par Variante.
- **Description :** Deux variantes d'un même vêtement ne peuvent pas avoir exactement les mêmes valeurs d'attributs.
- **Conditions :** Création d'une variante de produit.
- **Comportement attendu :**
  1. Une variante représente un article physique précis (exemple : Taille L + Couleur Noir).
  2. Le système refuse la création d'un doublon identique.
- **Données liées :** `product_variants.id`, `variant_attribute_values`.
- **Statut de décision :** CONFIRMÉ.

#### BR-VAR-002 : Attributs Flexibles et Dynamiques
- **Nom :** Définition Dynamique des Attributs.
- **Description :** Les caractéristiques de mode ne sont pas figées dans des colonnes fixes. Le système permet d'ajouter librement des types d'attributs (Taille, Couleur, Tissu, Coupe).
- **Conditions :** Configuration des options de vêtements par l'administrateur.
- **Comportement attendu :**
  1. L'administrateur crée des types (`attribute_types`) et des valeurs (`attribute_values`).
  2. Les couleurs acceptent un code couleur hexadécimal (exemple : `"#000000"` pour le noir) pour afficher une pastille.
- **Données liées :** `attribute_types`, `attribute_values`, `variant_attribute_values`.
- **Statut de décision :** CONFIRMÉ.

#### BR-VAR-003 : Activation Individuelle de Variante
- **Nom :** Disponibilité par Variante.
- **Description :** Chaque variante a son propre statut `is_active`.
- **Conditions :** Affichage sur la fiche produit et ajout au panier.
- **Comportement attendu :**
  1. Une variante avec `is_active = false` est grisée sur le site et ne peut pas être achetée.
  2. Si toutes les variantes sont inactives, le produit affiche "Non disponible".
- **Données liées :** `product_variants.is_active`.
- **Statut de décision :** CONFIRMÉ.

---

### 3.4. Médias et Modèles 3D (`BR-MED`)

#### BR-MED-001 : Image Principale Obligatoire
- **Nom :** Obligation d'une Image Principale.
- **Description :** Chaque vêtement doit avoir une image principale pour la carte du catalogue.
- **Conditions :** Publication du vêtement.
- **Comportement attendu :**
  1. Une seule image par produit a `is_primary = true`.
  2. Choisir une nouvelle image principale retire l'ancien choix automatiquement.
- **Données liées :** `product_media.is_primary`, `product_media.display_order`.
- **Statut de décision :** CONFIRMÉ.

#### BR-MED-002 : Modèle 3D de Vêtement
- **Nom :** Fichier 3D pour l'Essayage Virtuel.
- **Description :** ARTFIT permet d'associer un fichier 3D (`.glb` ou `.gltf`) à un vêtement ou à une variante de couleur.
- **Conditions :** Chargement d'un fichier 3D par l'administrateur.
- **Comportement attendu :**
  1. Le fichier 3D est enregistré avec son adresse URL, son format et sa taille.
  2. Seuls les formats `.glb` et `.gltf` sont acceptés.
- **Données liées :** `product_3d_models.model_url`, `product_3d_models.file_format`.
- **Statut de décision :** CONFIRMÉ.

#### BR-MED-003 : Image 2D de Secours pour la 3D
- **Nom :** Image de Secours (Fallback).
- **Description :** Si le navigateur du client ne supporte pas la 3D, le site affiche une image 2D normale.
- **Conditions :** Le client ouvre la fiche produit sans support WebGL.
- **Comportement attendu :**
  1. Chaque enregistrement 3D a un champ obligatoire `fallback_image_url`.
  2. L'interface affiche l'image standard sans bloquer la visite du client.
- **Données liées :** `product_3d_models.fallback_image_url`.
- **Statut de décision :** CONFIRMÉ.

---

### 3.5. Codes SKU (`BR-SKU`)

#### BR-SKU-001 : Unicité Globale du Code SKU
- **Nom :** SKU Unique dans Tout le Système.
- **Description :** Chaque code SKU identifie un article physique précis et doit être totalement unique.
- **Conditions :** Création d'un vêtement ou d'une variante.
- **Comportement attendu :**
  1. Le code SKU s'écrit en lettres majuscules avec chiffres et tirets.
  2. Le système refuse tout code SKU déjà existant.
- **Données liées :** `product_variants.sku`.
- **Statut de décision :** CONFIRMÉ.

#### BR-SKU-002 : SKU Obligatoire par Variante Active
- **Nom :** Obligation du Code SKU.
- **Description :** Une variante active doit avoir un code SKU non vide.
- **Conditions :** Enregistrement d'une variante.
- **Comportement attendu :**
  1. Le code SKU peut être tapé à la main ou créé automatiquement selon un modèle (exemple : `AF-CAT-PROD-VAR`).
- **Données liées :** `product_variants.sku`.
- **Statut de décision :** CONFIRMÉ.

---

### 3.6. Prix de Base, Prix des Variantes et Devise (`BR-PRC`)

#### BR-PRC-001 : Prix de Base et Surcharge par Variante
- **Nom :** Règle de Priorité du Prix.
- **Description :** Le produit a un prix de base. La variante peut avoir un prix différent qui remplace le prix de base.
- **Conditions :** Affichage du prix sur le site et calcul du panier.
- **Comportement attendu :**
  1. Si `product_variants.price_override` existe et est supérieur à 0, c'est ce prix qui s'applique.
  2. Sinon, le produit utilise `products.base_price`.
  3. Le prix de base doit être supérieur à zéro (`> 0.00 MAD`).
- **Données liées :** `products.base_price`, `product_variants.price_override`.
- **Statut de décision :** CONFIRMÉ.

#### BR-PRC-002 : Deux Décimales et Arrondi Standard
- **Nom :** Précision de la Monnaie et Arrondi.
- **Description :** Tous les prix et réductions s'écrivent avec exactement deux chiffres après la virgule.
- **Conditions :** Tout calcul de prix ou de facture.
- **Comportement attendu :**
  1. Le système utilise l'arrondi standard au plus proche (`ROUND_HALF_UP`).
- **Données liées :** Champs monétaires (`base_price`, `price_override`, `discount_value`).
- **Statut de décision :** CONFIRMÉ.

#### BR-PRC-003 : Interdiction des Prix Négatifs
- **Nom :** Prix Minimum à Zéro.
- **Description :** Même après plusieurs réductions, le prix d'un article ne peut jamais être inférieur à 0.00 MAD.
- **Conditions :** Calcul final du prix dans le panier.
- **Comportement attendu :**
  1. Si les réductions dépassent le prix, le prix final est bloqué à 0.00 MAD.
- **Données liées :** Prix calculé final.
- **Statut de décision :** CONFIRMÉ.

#### BR-PRC-004 : Devise Unique Obligatoire (MAD)
- **Nom :** Devise Unique Obligatoire (MAD - Dirham Marocain).
- **Description :** ARTFIT utilise exclusivement le Dirham marocain (`MAD`) comme seule et unique devise dans la version actuelle. Tous les prix du catalogue, les prix des variantes, les remises, les coupons, les totaux de commande et les paiements sont exprimés et traités en `MAD`.
- **Conditions :** Tout affichage de prix, calcul de remise, création de coupon, calcul de commande et paiement.
- **Comportement attendu :**
  1. La devise unique de la boutique est strictement fixée à `"MAD"`.
  2. Tous les montants de la boutique (produits, variantes, réductions, coupons, paniers, commandes et paiements) sont obligatoirement en `MAD`.
  3. Aucun système multi-devises n'est actif dans le Sprint 01.
  4. Aucune conversion de devises (vers ou depuis l'EUR ou l'USD) n'est disponible ou prise en charge dans le Sprint 01.
  5. Toute tentative d'enregistrer un prix ou de payer dans une autre devise est refusée par le système.
- **Données liées :** `pricing.currency`, `products.base_price`, `product_variants.price_override`, `discounts.discount_value`.
- **Statut de décision :** CONFIRMÉ.

---

### 3.7. Inventaire et Calcul du Stock (`BR-INV`)

#### BR-INV-001 : Formule du Stock Disponible
- **Nom :** Calcul du Stock Vrai.
- **Description :** Le stock disponible à la vente se calcule avec la formule exacte :
  $$\text{Stock Disponible} = \text{Quantité en Stock} - \text{Quantité Réservée}$$
- **Conditions :** Affichage du produit et ajout au panier.
- **Comportement attendu :**
  1. `Quantité en Stock` (`quantity_on_hand`) : nombre d'articles réels dans le dépôt.
  2. `Quantité Réservée` (`quantity_reserved`) : articles bloqués dans des commandes en cours (60 minutes).
  3. Un client ne peut pas acheter plus que le stock disponible.
- **Données liées :** `inventory.quantity_on_hand`, `inventory.quantity_reserved`.
- **Statut de décision :** CONFIRMÉ.

#### BR-INV-002 : Alerte de Stock Bas
- **Nom :** Alerte Réassortiment.
- **Description :** Chaque article a un niveau d'alerte pour prévenir l'administrateur quand le stock devient faible.
- **Conditions :** Sortie de stock ou nouvelle commande.
- **Comportement attendu :**
  1. Si $\text{Stock Disponible} \le \text{low\_stock\_threshold}$, l'article affiche une alerte "Stock Bas".
- **Données liées :** `inventory.low_stock_threshold`.
- **Statut de décision :** CONFIRMÉ.

#### BR-INV-003 : Blocage en Cas de Rupture de Stock
- **Nom :** Interdiction d'Acheter Hors Stock.
- **Description :** Quand le stock disponible est égal à zéro, le client ne peut pas commander.
- **Conditions :** Clic sur "Ajouter au panier".
- **Comportement attendu :**
  1. Si $\text{Stock Disponible} \le 0$, le bouton affiche "Rupture de stock".
  2. Par défaut, la commande en attente (backorder) est interdite (`allow_backorder = false`).
- **Données liées :** `inventory.allow_backorder`.
- **Statut de décision :** CONFIRMÉ.

---

### 3.8. Réservation de Stock pendant 60 Minutes (`BR-RES`)

#### BR-RES-001 : Blocage Temporaire de 60 Minutes
- **Nom :** Réservation au Moment du Paiement.
- **Description :** Quand le client commence l'étape de paiement, ses articles sont réservés pendant exactement 60 minutes.
- **Conditions :** Passage du panier vers le paiement.
- **Comportement attendu :**
  1. Une ligne est créée dans `stock_reservations` avec le statut `ACTIVE`.
  2. La date de fin est calculée ainsi :
     $$\text{expires\_at} = \text{reserved\_at} + 60\text{ minutes}$$
  3. La quantité réservée (`quantity_reserved`) augmente pour bloquer les articles.
- **Données liées :** `stock_reservations.expires_at`, `inventory.quantity_reserved`.
- **Statut de décision :** CONFIRMÉ.

#### BR-RES-002 : Échec de Paiement et Nouvel Essai
- **Nom :** Conservation du Stock en Cas de Paiement Échoué.
- **Description :** Si la carte bancaire est refusée, le client garde sa réservation tant que les 60 minutes ne sont pas passées.
- **Conditions :** Erreur de paiement avant `expires_at`.
- **Comportement attendu :**
  1. La réservation reste `ACTIVE`.
  2. Le client peut réessayer de payer avec une autre carte sans perdre ses articles.
- **Données liées :** `stock_reservations.status`, `stock_reservations.expires_at`.
- **Statut de décision :** CONFIRMÉ.

#### BR-RES-003 : Libération Automatique Après 60 Minutes
- **Nom :** Annulation Après 60 Minutes.
- **Description :** Si le client ne paie pas dans les 60 minutes, la réservation s'annule et le stock redevient disponible pour les autres clients.
- **Conditions :** L'heure actuelle dépasse `expires_at`.
- **Comportement attendu :**
  1. Le statut passe à `EXPIRED`.
  2. Le champ `inventory.quantity_reserved` diminue automatiquement.
  3. Les articles redeviennent visibles et achetables par tout le monde.
- **Données liées :** `stock_reservations.status`, `inventory.quantity_reserved`.
- **Statut de décision :** CONFIRMÉ.

#### BR-RES-004 : Validation Finale Après Paiement Réussi
- **Nom :** Sortie Définitive du Stock.
- **Description :** Dès que la banque confirme le paiement, la réservation est terminée et le stock réel diminue.
- **Conditions :** Confirmation bancaire reçue.
- **Comportement attendu :**
  1. Le statut passe à `CONFIRMED`.
  2. `quantity_reserved` diminue et `quantity_on_hand` diminue du même nombre.
- **Données liées :** `stock_reservations.status`, `inventory.quantity_on_hand`.
- **Statut de décision :** CONFIRMÉ.

---

### 3.9. Réductions et Promotions (`BR-DSC`)

#### BR-DSC-001 : Types et Cibles de Réduction
- **Nom :** Réduction en Pourcentage ou Montant Fixe.
- **Description :** Une réduction peut être un pourcentage (exemple : 20%) ou un montant fixe (exemple : 50 MAD), sur un produit, une variante, une catégorie ou toute la commande.
- **Conditions :** Création d'une promotion.
- **Comportement attendu :**
  1. `PERCENTAGE` : Applique un pourcentage de remise.
  2. `FIXED_AMOUNT` : Retire un montant fixe en dirhams (MAD).
- **Données liées :** `discounts.discount_type`, `discounts.discount_value`, `discounts.scope`.
- **Statut de décision :** CONFIRMÉ.

#### BR-DSC-002 : Dates de Début et de Fin
- **Nom :** Période de Validité de la Promotion.
- **Description :** Une promotion a une date de début et une date de fin précises.
- **Conditions :** Calcul du panier à l'heure courante.
- **Comportement attendu :**
  1. Avant la date de début, la promotion ne s'applique pas (`SCHEDULED`).
  2. Entre la date de début et la date de fin, la promotion fonctionne (`ACTIVE`).
  3. Après la date de fin, la promotion s'arrête automatiquement (`EXPIRED`).
- **Données liées :** `discounts.starts_at`, `discounts.ends_at`.
- **Statut de décision :** CONFIRMÉ.

#### BR-DSC-003 : Priorité et Remplacement Manuel
- **Nom :** Ordre de Priorité des Promotions.
- **Description :** Si deux réductions non cumulables existent pour le même article, le système choisit la plus précise, sauf si l'administrateur force une réduction manuelle.
- **Conditions :** Plusieurs réductions applicables sans cumul.
- **Comportement attendu :**
  1. Si `is_manual_override = true`, cette réduction s'applique en premier.
  2. Sinon, l'ordre normal est :
     $$\text{Variante} > \text{Produit} > \text{Catégorie} > \text{Commande}$$
- **Données liées :** `discounts.priority`, `discounts.is_manual_override`.
- **Statut de décision :** CONFIRMÉ.

#### BR-DSC-004 : Limites d'Utilisation
- **Nom :** Limite Totale et par Client.
- **Description :** Une réduction peut avoir un nombre maximum d'utilisations au total et par client.
- **Conditions :** Utilisation d'une promotion au paiement.
- **Comportement attendu :**
  1. Si `times_used >= max_usage_total`, la promotion s'arrête.
  2. Si un client a déjà atteint son quota, il ne peut plus l'utiliser.
- **Données liées :** `discounts.max_usage_total`, `discounts.max_usage_per_customer`.
- **Statut de décision :** CONFIRMÉ.

#### BR-DSC-005 : Réservation Temporaire de la Réduction
- **Nom :** Blocage de la Réduction pendant le Paiement.
- **Description :** Pour éviter que deux clients utilisent la dernière réduction en même temps, la réduction est réservée pendant le paiement (60 minutes).
- **Conditions :** Début du paiement avec un coupon limité.
- **Comportement attendu :**
  1. Une ligne est créée dans `discount_usage_reservations`.
  2. Si le paiement réussit, la réduction est définitivement comptée.
  3. Si le paiement échoue et expire, la place est libérée pour un autre client.
- **Données liées :** `discount_usage_reservations.status`.
- **Statut de décision :** CONFIRMÉ.

#### BR-DSC-006 : Montant Minimum d'Achat Avant Réduction
- **Nom :** Condition de Montant Minimum.
- **Description :** Si une réduction demande un montant minimum d'achat (exemple : 500 MAD), ce montant se calcule sur le prix normal AVANT toute réduction.
- **Conditions :** Vérification du panier.
- **Comportement attendu :**
  1. Le système additionne les prix normaux des articles éligibles.
  2. Si ce total est inférieur au minimum requis, la réduction est refusée.
- **Données liées :** `discounts.min_order_amount_pre_discount`.
- **Statut de décision :** CONFIRMÉ.

#### BR-DSC-007 : Quantité Minimum d'Articles
- **Nom :** Condition de Nombre d'Articles.
- **Description :** Une réduction peut demander un nombre minimum d'articles dans le panier.
- **Conditions :** Calcul du panier.
- **Comportement attendu :**
  1. Le système compte soit uniquement les articles de la promotion (`ELIGIBLE_ITEMS_ONLY`), soit tous les articles du panier (`TOTAL_CART_ITEMS`).
- **Données liées :** `discounts.min_quantity`, `discounts.min_quantity_calc_type`.
- **Statut de décision :** CONFIRMÉ.

#### BR-DSC-008 : Application sur les Quantités
- **Nom :** Réduction sur Toutes les Unités ou Limitée.
- **Description :** La réduction peut s'appliquer sur tous les exemplaires achetés, ou être plafonnée à un nombre maximum (exemple : réduction valable sur les 2 premiers articles seulement).
- **Conditions :** Calcul de la ligne de commande avec plusieurs unités.
- **Comportement attendu :**
  1. Si `apply_quantity_mode = 'CAPPED_QUANTITY'`, les articles au-delà de la limite paient le prix normal.
- **Données liées :** `discounts.apply_quantity_mode`, `discounts.max_quantity_capped`.
- **Statut de décision :** CONFIRMÉ.

#### BR-DSC-009 : Application Stricte sur les Articles Éligibles
- **Nom :** Réduction Restreinte à ses Articles.
- **Description :** Une réduction sur un vêtement précis ne diminue jamais le prix des autres articles du panier.
- **Conditions :** Calcul de chaque ligne du panier.
- **Comportement attendu :**
  1. Les articles hors de la promotion ne reçoivent aucune déduction.
- **Données liées :** `discounts.scope`, `discounts.target_id`.
- **Statut de décision :** CONFIRMÉ.

#### BR-DSC-010 : Cumul et Calcul Successif
- **Nom :** Règle de Cumul des Réductions.
- **Description :** Deux réductions se cumulent uniquement si elles ont toutes les deux l'option `is_stackable = true`. Elles s'appliquent l'une après l'autre.
- **Conditions :** Panier avec plusieurs réductions actives.
- **Comportement attendu :**
  1. La première réduction s'applique sur le prix de départ.
  2. La deuxième réduction s'applique sur le prix déjà réduit.
- **Données liées :** `discounts.is_stackable`, `discounts.calculation_sequence`.
- **Statut de décision :** CONFIRMÉ.

#### BR-DSC-011 : Plafond et Montant Minimum de Réduction
- **Nom :** Limites en Dirhams pour les Pourcentages.
- **Description :** Une réduction en pourcentage peut avoir un montant minimum et un plafond maximum en dirhams (exemple : 20% de remise, mais 300 MAD maximum).
- **Conditions :** Calcul d'une réduction en pourcentage.
- **Comportement attendu :**
  1. Si le résultat dépasse `max_discount_amount`, la remise est bloquée à ce plafond.
- **Données liées :** `discounts.min_discount_amount`, `discounts.max_discount_amount`.
- **Statut de décision :** CONFIRMÉ.

#### BR-DSC-012 : Suspension si Produit Inactif
- **Nom :** Arrêt de Réduction sur Article Désactivé.
- **Description :** Si un vêtement est désactivé, archivé ou en rupture, sa réduction est suspendue automatiquement.
- **Conditions :** Consultation du produit ou du panier.
- **Comportement attendu :**
  1. Aucune réduction ne s'applique sur un article inactif.
- **Données liées :** `products.status`, `discounts.is_active`.
- **Statut de décision :** CONFIRMÉ.

---

### 3.10. Codes Promo (Coupons) (`BR-CPN`)

#### BR-CPN-001 : Création Manuelle ou Automatique
- **Nom :** Façon de Créer les Codes Promo.
- **Description :** Un code promo peut être écrit par l'administrateur (exemple : `"BIENVENUE20"`) ou créé automatiquement par le système (exemple : `"AF-8F9K-2M7X"`).
- **Conditions :** Création d'un coupon.
- **Comportement attendu :**
  1. Tout code promo est obligatoirement unique sur toute la boutique.
- **Données liées :** `coupon_codes.code`, `coupon_codes.generation_type`.
- **Statut de décision :** CONFIRMÉ.

#### BR-CPN-002 : Pas de Différence Majuscule / Minuscule
- **Nom :** Saisie Insensible à la Casse.
- **Description :** Le client peut taper son code en minuscules ou en majuscules. Le résultat est identique.
- **Conditions :** Saisie d'un code promo dans le panier.
- **Comportement attendu :**
  1. Le système met tout en majuscules et retire les espaces superflus (`"artfit20"` devient `"ARTFIT20"`).
- **Données liées :** `coupon_codes.code`.
- **Statut de décision :** CONFIRMÉ.

#### BR-CPN-003 : Durée de Vie du Code Promo
- **Nom :** Validité Propre du Coupon.
- **Description :** Un code promo est relié à une règle de réduction parente et possède ses propres dates de validité.
- **Conditions :** Vérification du coupon au paiement.
- **Comportement attendu :**
  1. Si le coupon ou la réduction parente est expiré, le coupon est refusé.
- **Données liées :** `coupon_codes.is_active`, `coupon_codes.expires_at`.
- **Statut de décision :** CONFIRMÉ.

---

### 3.11. Contrôle Final au Paiement (`BR-CHK`)

#### BR-CHK-001 : Vérification Globale Obligatoire Avant Paiement
- **Nom :** Contrôle de Sécurité Final.
- **Description :** Au moment exact où le client clique sur "Payer", le système revérifie tout en une seule fois.
- **Conditions :** Clic sur le bouton de paiement final.
- **Comportement attendu :**
  Le système vérifie en une seule opération :
  1. La réservation du stock est toujours `ACTIVE` (moins de 60 minutes).
  2. Les produits et variantes sont toujours actifs et publiés.
  3. Les prix correspondent aux prix officiels actuels en MAD.
  4. Les réductions sont toujours valides et dans leurs quotas.
  Si une seule condition échoue :
  - Le paiement est immédiatement arrêté.
  - Le panier se met à jour.
  - Un message clair explique la situation au client.
- **Données liées :** `stock_reservations`, `products`, `inventory`, `discounts`.
- **Statut de décision :** CONFIRMÉ.

---

### 3.12. Administration et Historique (`BR-ADM`)

#### BR-ADM-001 : Un Seul Administrateur Prêt pour Plusieurs
- **Nom :** Compte Administrateur Initial.
- **Description :** Le Sprint 01 fonctionne avec un seul compte administrateur, mais la structure permet d'en ajouter d'autres plus tard sans changer la base de données.
- **Conditions :** Connexion à l'espace de gestion.
- **Comportement attendu :**
  1. Toutes les actions de gestion demandent une connexion administrateur sécurisée.
  2. Le champ `role` existe déjà (exemple : `'SUPER_ADMIN'`).
- **Données liées :** `admins.id`, `admins.role`.
- **Statut de décision :** CONFIRMÉ.

#### BR-ADM-002 : Journal des Actions Obligatoire (Audit Log)
- **Nom :** Enregistrement de Toutes les Modifications.
- **Description :** Chaque ajout, modification ou suppression sur les vêtements, le stock ou les prix est enregistré dans un journal d'audit qui ne peut pas être effacé.
- **Conditions :** Action d'un administrateur dans le panneau de gestion.
- **Comportement attendu :**
  1. Une ligne est créée dans `audit_logs` avec l'identifiant de l'administrateur, l'action, l'entité, les anciennes valeurs et les nouvelles valeurs en format JSON.
- **Données liées :** `audit_logs.admin_id`, `audit_logs.action`, `audit_logs.old_values`, `audit_logs.new_values`.
- **Statut de décision :** CONFIRMÉ.

---

## 4. Choix Techniques Retenus par Défaut

1. **Monnaie unique confirmée :** Le Dirham Marocain (`MAD`) est la seule devise autorisée dans toute la boutique. Aucun système multi-devises ni conversion EUR/USD n'est disponible dans le Sprint 01.
2. **Suppression douce (Soft Delete) :** Les articles supprimés gardent une date `deleted_at` pour préserver l'historique des anciennes commandes.
3. **Nettoyage automatique :** Une tâche de fond s'exécute régulièrement pour libérer les réservations de stock dépassées de 60 minutes.
4. **Fichiers images et 3D :** Les images et fichiers 3D sont stockés sur un serveur de fichiers externe, et l'adresse URL est enregistrée en base de données.

---

## 5. Recommandations pour les Prochains Sprints

1. **Recommandation 1 (Verrouillage du stock) :** Utiliser un verrouillage de ligne dans la base de données (`SELECT FOR UPDATE`) pour éviter que deux clients réservent le même article à la même milliseconde.
2. **Recommandation 2 (Message 5 minutes avant la fin) :** Afficher un message au client quand il ne lui reste plus que 5 minutes pour payer sa réservation.
3. **Recommandation 3 (Qualité 3D pour mobile) :** Prévoir des fichiers 3D légers pour les téléphones afin que l'affichage reste fluide.
