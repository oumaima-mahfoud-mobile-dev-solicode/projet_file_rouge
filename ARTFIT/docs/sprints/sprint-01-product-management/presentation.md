---
marp: true
theme: gaia
_class: lead
paginate: true
backgroundColor: #0B0F19
color: #F9FAFB
style: |
  section {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: #0B0F19;
    color: #F9FAFB;
    padding: 40px 60px;
  }
  h1, h2, h3 {
    font-family: 'Space Grotesk', sans-serif;
    color: #FFFFFF;
  }
  h1 { font-size: 2.2rem; }
  h2 { font-size: 1.6rem; color: #6366F1; border-bottom: 2px solid #374151; padding-bottom: 8px; }
  h3 { font-size: 1.2rem; color: #06B6D4; }
  table { font-size: 0.8rem; width: 100%; border-collapse: collapse; }
  th { background: #1E293B; color: #06B6D4; padding: 8px; text-align: left; }
  td { padding: 8px; border-bottom: 1px solid #374151; }
  pre, code { background: #111827; color: #06B6D4; font-size: 0.78rem; border-radius: 6px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
  .badge-success { background: #064E3B; color: #10B981; }
  .badge-cyan { background: #0E7490; color: #A5F3FC; }
---

<!-- _class: lead -->
# ARTFIT — SPRINT 01
### PRODUCT MANAGEMENT : DE LA DONNÉE AU CRUD FONCTIONNEL

**Présentation de Soutenance Académique**

- **Projet :** ARTFIT — Mode Techwear & Expérience 3D
- **Rôle :** Senior Full-Stack Developer
- **Périmètre :** Sprint 01 — Gestion Complète des Produits
- **Date :** 16 Novembre 2026
- **Architecture :** 3-Tiers Découplée (Présentation, Métier, Données)

---

## 1. Objectifs du Sprint 01

Construire le **premier module fonctionnel** de la plateforme ARTFIT :

1. **Modélisation Complète des Données :**
   - Élaboration du MCD, MLD et MPD.
   - Respect des contraintes d'intégrité et clés étrangères.
2. **Design System & Interfaces :**
   - Palette moderne *Dark Techwear*.
   - Conception des maquettes Web et Mobile responsive.
3. **Architecture 3-Tiers Stricte :**
   - Séparation nette entre Présentation, Logique Métier et Accès aux Données.
4. **CRUD Produits Opérationnel :**
   - Ajout, consultation, modification, suppression douce, recherche et pagination.
   - Double interface : **Espace Admin** et **Boutique Publique**.
5. **Assurance Qualité & Tests :**
   - Tests automatisés exécutés avec 100% de succès.

---

## 2. Décisions Métier Confirmées

Toutes les décisions validées ont été scrupuleusement respectées :

- **Marque Unique (`BR-PRD-001`) :**
  Tous les vêtements appartiennent à la marque **ARTFIT**. Pas d'autres vendeurs.
- **Devise Unique Officielle (`BR-PRC-004`) :**
  Tous les montants sont exprimés en **Dirham Marocain (MAD)** avec 2 décimales.
- **Hiérarchie de Catégories Sans Limite (`BR-CAT-002`) :**
  Arborescence infinie gérée avec une clé réflexive `parent_id`.
- **Réservation Panier 60 Minutes (`BR-RES-001`) :**
  Au panier, le stock est garanti pendant 60 minutes avant libération automatique.
- **Support 3D & Secours 2D (`BR-MED-002`) :**
  Modèles 3D (`.glb`) accompagnés obligatoirement d'une image de secours 2D.

---

## 3. Analyse des Données — MCD & MLD

### Modèle Conceptuel (MCD)
- **14 Entités Principales :** Vêtements, Catégories, Variantes, Inventaire, Réservations, Médias, Modèles 3D, Réductions, etc.
- **Relations Clés :**
  - Catégorie (0,n) ── Contient ── (0,1) Catégorie *(Arborescence infinie)*.
  - Vêtement (1,1) ── Possède ── (1,n) Variantes Physiques.
  - Variante (1,1) ── Dispose de ── (1,1) Ligne d'Inventaire.

### Modèle Logique (MLD)
- **16 Tables Normalisées en 3NF :**
  Clés primaires UUID, clés étrangères avec contraintes `ON DELETE RESTRICT` ou `CASCADE`.
- **Index de Performance :**
  Index B-Tree sur `slug`, `parent_id`, `product_id`, `status` et `created_at`.

---

## 4. Modèle Physique de Données (MPD)

Schéma SQL ANSI / SQLite / PostgreSQL implémenté :

```sql
-- Extrait de la table products
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  brand_name TEXT NOT NULL DEFAULT 'ARTFIT' CHECK (brand_name = 'ARTFIT'),
  base_price REAL NOT NULL CHECK (base_price > 0.0),
  currency TEXT NOT NULL DEFAULT 'MAD' CHECK (currency = 'MAD'),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

- **Sécurité des Données :** Suppression douce (*Soft Delete*) via `deleted_at`.
- **Historique et Traçabilité :** Table `audit_logs` pour enregistrer chaque action.

---

## 5. Architecture 3-Tiers Découplée

Séparation stricte des responsabilités (Single Responsibility Principle) :

```text
┌────────────────────────────────────────────────────────┐
│ 1. COUCHE PRÉSENTATION (Presentation Layer)            │
│    • ProductController / CategoryController            │
│    • Public Storefront (index.html) & Admin (admin.html)│
│    • Reçoit les requêtes HTTP et renvoie du JSON       │
└──────────────────────────┬─────────────────────────────┘
                           │ Appelle les services métier
┌──────────────────────────▼─────────────────────────────┐
│ 2. COUCHE LOGIQUE MÉTIER (Business Logic Layer - BLL)  │
│    • ProductService / InventoryService / CategoryService│
│    • Validateurs : Contrôle BR-PRD-003, MAD, Stocks    │
│    • Réservation 60 min, Slugification, Statuts        │
└──────────────────────────┬─────────────────────────────┘
                           │ Appelle les DAOs
┌──────────────────────────▼─────────────────────────────┐
│ 3. COUCHE ACCÈS AUX DONNÉES (Data Access Layer - DAL)  │
│    • ProductDAO / CategoryDAO / VariantDAO / Inventory │
│    • Requêtes SQL pures, Transactions, Index SQLite    │
└────────────────────────────────────────────────────────┘
```

---

## 6. Design System ARTFIT

Univers visuel inspiré de la mode urbaine et cyberpunk :

- **Palette de Couleurs :**
  - `Primary` : Indigo Tech `#6366F1` (Action, création).
  - `Accent` : Cyan Cyber `#06B6D4` (3D, technologie, réservation).
  - `Background` : Noir Profond `#0B0F19` & Surface `#111827`.
  - `Alertes` : Vert Succès `#10B981`, Rouge Alerte `#EF4444`.
- **Typographie :**
  - Titres et Chiffres : *Space Grotesk* (moderne, géométrique).
  - Textes courants : *Inter* (haute lisibilité sur écran).
- **Accessibilité :**
  - Ratios de contraste WCAG AA+ (> 4.5:1).
  - Support complet des mobiles et des écrans tactiles.

---

## 7. Interfaces Utilisateurs : Web & Mobile

Deux interfaces distinctes répondant aux besoins formulés :

### 1. Page Administration Tout-en-Un (`/admin.html`)
- Chiffres clés en direct : Total produits, en ligne, brouillons, stocks faibles.
- Tableau de gestion complet avec miniatures et indicateurs 3D.
- Barre d'action rapide : Recherche en direct, filtres de statut et catégorie.
- Fenêtres modales intégrées : Ajout de vêtement, édition et ajustement de stock.

### 2. Boutique Publique Client (`/index.html`)
- Affichage **exclusif** des articles publiés (`status = PUBLISHED`).
- Prix affichés avec la devise marocaine officielle : **MAD**.
- Visionneuse 3D interactive avec sélection de taille et couleur.
- Panier avec **compte à rebours de 60 minutes** pour la réservation.

---

## 8. Démonstration du CRUD Produits

Toutes les opérations CRUD sont pleinement fonctionnelles :

| Opération | Route API | Interface Utilisateur | Règle Métier Associée |
|---|---|---|---|
| **Create** | `POST /api/products` | Modal "+ Ajouter un Produit" | `BR-PRD-001`, `BR-PRC-001` |
| **Read (List)** | `GET /api/products` | Tableau Admin & Grille Boutique | `BR-PRD-002` (Filtre statut) |
| **Read (Detail)**| `GET /api/products/:id` | Visionneuse 3D & Fiche Vêtement | `BR-MED-002` (3D + Secours) |
| **Update** | `PUT /api/products/:id` | Modal de modification pré-rempli | `BR-PRD-003` (Validation) |
| **Delete** | `DELETE /api/products/:id`| Bouton Suppression (Soft Delete)| `BR-PRD-004` (Archivage) |
| **Publish** | `POST /api/products/:id/publish`| Bouton "Publier en direct" | `BR-PRD-003` (Contrôle strict) |
| **Stock Adjust**| `POST /api/inventory/adjust` | Modal d'ajustement rapide | `BR-INV-001` |
| **Reserve** | `POST /api/inventory/reserve`| Bouton "Ajouter au Panier" | `BR-RES-001` (60 Minutes) |

---

## 9. Validation Avant Publication (`BR-PRD-003`)

Garde-fou strict pour empêcher la mise en ligne d'un produit incomplet :

```text
Tentative de publication (POST /api/products/:id/publish)
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
Titre ou Description manquants ?      Prix de base <= 0.00 MAD ?
       │ (OUI)                                 │ (OUI)
       └──────────────► ERREUR 400 ◄───────────┘
                           ▲
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
Aucune Catégorie active liée ?        Aucune Photo principale ?
       │ (OUI)                                 │ (OUI)
       └──────────────► ERREUR 400 ◄───────────┘
                           │ (NON : Tout est validé)
                           ▼
              Statut mis à 'PUBLISHED'
              Visible sur la Boutique Publique
```

---

## 10. Stratégie de Test et Résultats

Suite complète de 26 tests automatisés exécutés avec Node.js natif :

```text
▶ Architecture 3-Tiers — Vérification de l'Indépendance des Couches
  ✔ RÈGLE 1 : Couche Présentation sans aucun code SQL direct
  ✔ RÈGLE 2 : Couche DAL sans aucune logique HTTP
  ✔ RÈGLE 3 : Couche BLL sans manipulation de serveur HTTP
  ✔ RÈGLE 4 : Respect obligatoire de la devise unique MAD
▶ ProductDAO — Data Access Layer (CRUD, Pagination, Recherche, Soft Delete)
  ✔ 6 tests validés
▶ CategoryDAO — Hiérarchie et Arbre (Arborescence illimitée, cycles)
  ✔ 2 tests validés
▶ ProductService — Business Logic Layer (Validations, BR-PRD-003, Archivage)
  ✔ 6 tests validés
▶ InventoryService — Stocks et Réservations (Calcul disponible, 60 min, seuil)
  ✔ 4 tests validés
▶ ProductController — Presentation Layer (Codes HTTP 200, 201, 400)
  ✔ 4 tests validés

TOTAL : 26 tests passés / 0 échec (Durée : ~250ms)
```

---

## 11. Bilan du Sprint 01

### Livrables Clés Réalisés :
1. ✅ **Base de Données Robuste :** Schéma complet, 16 tables, 43 règles métier confirmées, dictionnaire de 163 champs.
2. ✅ **Design System Fashion Tech :** Typographie, tokens, maquettes Web et Mobile.
3. ✅ **Architecture 3-Tiers Respectée :** Aucune fuite de responsabilité entre couches.
4. ✅ **CRUD Vêtements Opérationnel :** Deux écrans complets (Admin Tout-en-Un & Boutique Publique).
5. ✅ **Zéro Dépendance Superflue :** Réalisé avec les modules natifs Node.js (`node:sqlite`, `node:http`, `node:test`).
6. ✅ **Documentation et Marp :** Tous les rapports et transparents prêts pour l'évaluation.

---

<!-- _class: lead -->
# MERCI POUR VOTRE ATTENTION

### QUESTIONS & DÉMONSTRATION EN DIRECT

- **Démonstration Boutique :** `http://localhost:3000/`
- **Démonstration Admin :** `http://localhost:3000/admin.html`
- **Dossier Documentation :** `ARTFIT/docs/sprints/sprint-01-product-management/`

