# ARTFIT — SPRINT 01 : GESTION DES PRODUITS (CRUD)
## Dossier Global du Sprint 01 — Réalisation Complète

- **Version :** 2.0.0
- **Statut :** **TERMINÉ AVEC SUCCÈS (100%)**
- **Date d'achèvement :** 2026-11-16
- **Architecture :** Architecture 3-Tiers obligatoire (Couche Présentation, Couche Métier, Couche Accès Données)
- **Langue officielle :** Français simple — Niveau A1
- **Devise officielle :** `MAD` (Dirham Marocain uniquement)
- **Marque exclusive :** `ARTFIT`

---

## 1. Objectif Atteint du Sprint 01

Le premier module opérationnel de la plateforme ARTFIT a été conçu, développé et testé :
1. **Gestion Complète du Catalogue (CRUD)** :
   - Création de vêtements avec nom, slug automatique, prix en MAD, descriptions et stock.
   - Lecture paginée avec recherche textuelle et filtrage par statut et catégorie.
   - Consultation détaillée avec variantes de tailles/couleurs et visionneuse 3D interactive.
   - Modification en direct avec pré-remplissage des champs.
   - Suppression douce (*Soft Delete* avec horodatage `deleted_at`).
2. **Hiérarchie de Catégories Sans Limite** :
   - Relation récursive parent-enfant (`parent_id`) permettant une arborescence illimitée.
3. **Gestion des Stocks et Réservation 60 Minutes** :
   - Stock physique disponible : $available = on\_hand - reserved$.
   - Réservation temporaire de 60 minutes au panier (`BR-RES-001`, `BR-RES-003`).
4. **Double Interface Utilisateur (UI)** :
   - **Page Administration Tout-en-Un** (`/admin.html`) pour la gestion opérationnelle.
   - **Boutique Publique** (`/index.html`) affichant exclusivement les produits en ligne (`PUBLISHED`).

---

## 2. Organisation des Livrables

```text
sprint-01-product-management/
├── README.md                              <- Synthèse et guide d'exécution du Sprint 01
├── presentation.md                        <- Présentation Marp 16:9 pour évaluation professeur
├── database/                              <- ÉTAPE 1 : Conception de la Base de Données
│   ├── README.md                          <- Index et synthèse des modèles
│   ├── business-rules.md                  <- 43 Règles Métier officielles confirmées
│   ├── data-dictionary.md                 <- Dictionnaire de données (163 spécifications)
│   ├── open-questions.md                  <- Suivi des décisions et arbitrage
│   ├── mcd.md                             <- Modèle Conceptuel de Données (MCD)
│   ├── mld.md                             <- Modèle Logique de Données (MLD)
│   ├── mpd.md                             <- Modèle Physique de Données (MPD - Spécifications)
│   └── mpd.sql                            <- Schéma SQL ANSI/PostgreSQL/SQLite exécutable
└── design/                                <- ÉTAPE 2 : UI/UX & Design System
    ├── README.md                          <- Index du Design System
    ├── design-system.md                   <- Tokens CSS, palette Dark Techwear, typographie
    ├── wireframes-web-mobile.md           <- Maquettes filaires Web et Mobile
    └── mockups-interactive.html          <- Démonstrateur interactif Web & Mobile
```

---

## 3. Matrice de Réalisation des 7 Étapes

| Étape | Description | Résultat & Preuve | Statut |
|---|---|---|:---:|
| **Étape 1 — Database Design** | MCD, MLD, MPD, 43 règles métier, devise unique MAD, hiérarchie infinie. | `database/mpd.sql`, `business-rules.md` | **VALIDÉ** |
| **Étape 2 — UI/UX Design** | Design System Fashion Tech, maquettes filaires Web et Mobile. | `design/design-system.md`, `mockups-interactive.html` | **VALIDÉ** |
| **Étape 3 — Coding 3-Tiers** | Séparation stricte DAL (DAOs) / BLL (Services) / Présentation (Controllers). | `src/dal/`, `src/bll/`, `src/presentation/` | **VALIDÉ** |
| **Étape 4 — Products CRUD** | CRUD complet : Créer, Lire, Détail, Modifier, Supprimer, Filtrer, Paginer. | `src/presentation/public/admin.html`, `index.html` | **VALIDÉ** |
| **Étape 5 — Testing** | 26 tests automatisés (CRUD, règles métier, 60 min réservation, architecture). | 26 passés / 0 échec (`node --test tests/**/*.test.js`) | **VALIDÉ** |
| **Étape 6 — Documentation** | Documentation technique complète et dictionnaire de données. | Dossier `docs/sprints/sprint-01-product-management/` | **VALIDÉ** |
| **Étape 7 — Présentation** | Diaporama professionnel Marp au format 16:9 adapté aux professeurs. | `docs/sprints/sprint-01-product-management/presentation.md` | **VALIDÉ** |

---

## 4. Instructions de Lancement et de Démonstration

### 1. Démarrer le Serveur Web et API
```bash
cd ARTFIT
node src/app.js
```

### 2. Accéder aux Interfaces dans le Navigateur
- **Boutique Publique (Clients)** : [http://localhost:3000/](http://localhost:3000/)
- **Espace Administration (Gestion)** : [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
- **API REST (JSON)** : [http://localhost:3000/api/products](http://localhost:3000/api/products)

### 3. Exécuter la Suite de Tests Automatisés
```bash
cd ARTFIT
npm test
# ou directement avec le runner natif :
node --test tests/**/*.test.js
```
