# ARTFIT — SPRINT 01 : DOSSIER DESIGN UI/UX ET DESIGN SYSTEM
## Spécifications Visuelles et Maquettes Interactives

- **Version :** 1.0.0
- **Statut :** Proposé pour Validation par le Project Owner
- **Date :** 2026-11-16
- **Architecture :** 3-Tiers — Couche Présentation (UI)
- **Langue :** Français simple — Niveau A1
- **Devise Unique :** `MAD` (Dirham Marocain)
- **Marque Unique :** `ARTFIT`

---

## 1. Sommaire des Livrables de Design

| Document | Description | Format | Lien |
|---|---|:---:|---|
| **Design System (`design-system.md`)** | Palette de couleurs, typographie, boutons, formulaires, tables, cartes, modals, responsive. | Markdown | [design-system.md](file:///e:/project_file_rouge/ARTFIT/docs/sprints/sprint-01-product-management/design/design-system.md) |
| **Maquettes Détaillées (`wireframes-web-mobile.md`)** | Maquettes complètes des 9 écrans en version Web Ordinateur (Desktop) et Téléphone (Mobile). | Markdown | [wireframes-web-mobile.md](file:///e:/project_file_rouge/ARTFIT/docs/sprints/sprint-01-product-management/design/wireframes-web-mobile.md) |
| **Démonstrateur Interactif (`mockups-interactive.html`)** | Showcase HTML interactif permettant de basculer entre les 9 écrans et de tester la vue Ordinateur / Mobile. | HTML / CSS / JS | [mockups-interactive.html](file:///e:/project_file_rouge/ARTFIT/docs/sprints/sprint-01-product-management/design/mockups-interactive.html) |

---

## 2. Rappel des 9 Écrans Conçus

1. **Admin Dashboard :** Vue d'ensemble, métriques globales, alertes stock bas, valeur d'inventaire en MAD.
2. **Liste des Produits :** Recherche en direct, filtres de catégorie et de statut, pagination, actions rapides.
3. **Création d'un Produit :** Formulaire de saisie structuré avec validation des champs obligatoires.
4. **Modification d'un Produit :** Onglets de navigation pour éditer les informations, les variantes et les médias.
5. **Détails d'un Produit :** Fiche complète avec visualiseur 3D interactif (.glb) et image 2D de secours.
6. **Gestion des Catégories :** Arborescence hiérarchique libre sans limite de niveau (`parent_id`).
7. **Gestion des Variantes :** Génération de combinaisons dynamiques (Taille, Pastille de couleur), SKU et surcharges de prix.
8. **Gestion des Images :** Téléversement drag-and-drop, choix de l'image principale (`is_primary`), association 3D.
9. **Gestion des Prix et du Stock :** Tableau rapide d'ajustement du stock, réservations de 60 minutes et seuils d'alerte.

