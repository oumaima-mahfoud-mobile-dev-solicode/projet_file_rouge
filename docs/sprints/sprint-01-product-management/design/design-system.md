# ARTFIT — SPRINT 01 : DESIGN SYSTEM OFFICIEL
## Identité Visuelle et Composants d'Interface

- **Version du document :** 1.0.0
- **Statut :** Proposé pour Validation par le Project Owner
- **Date de conception :** 2026-11-16
- **Architecture obligatoire :** Architecture 3-Tiers (Couche Présentation - UI)
- **Langue du document :** Français simple — Niveau A1
- **Thème visuel :** Mode Moderne & Vêtements 3D (Style Dark Tech Fashion)

---

## 1. But du Document

Ce document présente le **Design System officiel** d'ARTFIT.

Le Design System assure la cohérence visuelle sur tous les écrans :
- Ordinateur de bureau (Web Desktop).
- Téléphone portable (Mobile).
- Tablette (Responsive).

---

## 2. Palette de Couleurs

ARTFIT utilise une palette sombre élégante ("Dark Mode Fashion") avec des accents lumineux pour mettre en valeur les vêtements et l'expérience 3D.

### 2.1. Couleurs Principales

| Nom du Jeton | Code HEX | Rôle dans l'Interface | Contraste / Accessibilité |
|---|---|---|---|
| `color-primary` | `#6366F1` | Boutons principaux, liens actifs, sélecteurs d'onglets. | Ratio > 4.5:1 sur fond sombre (Conforme WCAG AA). |
| `color-primary-hover`| `#4F46E5` | État survolé des boutons principaux. | Teinte plus intense. |
| `color-accent-cyan` | `#06B6D4` | Expérience 3D, boutons d'essayage virtuel, badges interactifs. | Accent technologique lumineux. |
| `color-bg-main` | `#0B0F19` | Fond d'écran général de toute l'application. | Noir profond apaisant pour les yeux. |
| `color-bg-surface` | `#111827` | Fond des cartes, des tableaux et de la barre latérale. | Gris très foncé pour faire ressortir les blocs. |
| `color-bg-hover` | `#1F2937` | Survol des lignes de tableau et des options de menu. | Gris foncé de contraste intermédiaire. |
| `color-border` | `#374151` | Lignes de séparation, bordures des champs et des cartes. | Délimitation nette et discrète. |

### 2.2. Couleurs de Texte

| Nom du Jeton | Code HEX | Rôle dans l'Interface |
|---|---|---|
| `color-text-primary` | `#F9FAFB` | Titres, prix des vêtements et textes importants. Blanc pur et chaud. |
| `color-text-secondary`| `#9CA3AF` | Descriptions, libellés de formulaires, textes secondaires. Gris clair. |
| `color-text-muted` | `#6B7280` | Textes indicatifs, dates, mentions d'aide. Gris moyen. |

### 2.3. Couleurs d'État (Feedback & Statuts)

| État | Code HEX | Usage |
|---|---|---|
| **Succès** | `#10B981` | Badge `PUBLISHED`, produit en stock, validation réussie. |
| **Alerte** | `#F59E0B` | Badge `Stock Bas`, réservation en cours (60 min). |
| **Danger / Erreur** | `#EF4444` | Badge `ARCHIVED`, rupture de stock, bouton supprimer. |
| **Neutre / Brouillon**| `#6B7280` | Badge `DRAFT`, éléments désactivés. |

---

## 3. Typographie

### 3.1. Polices de Caractères
- **Police Titres et Marque (`font-heading`) :** `'Space Grotesk'`, sans-serif. Moderne et technique.
- **Police Corps de Texte (`font-body`) :** `'Inter'`, -apple-system, sans-serif. Très lisible sur petit écran.

### 3.2. Échelle des Tailles de Texte

| Niveau | Taille en Pixels | Taille en Rem | Graisse (Weight) | Usage |
|---|:---:|:---:|:---:|---|
| **H1** | 32px | 2.0rem | 700 (Gras) | Titre principal de chaque page. |
| **H2** | 24px | 1.5rem | 700 (Gras) | Titre de section ou de modal. |
| **H3** | 20px | 1.25rem | 600 (Semi-gras) | Titre de carte ou d'onglet. |
| **Body Base** | 16px | 1.0rem | 400 (Normal) | Paragraphes et textes normaux. |
| **Body Small** | 14px | 0.875rem | 400 (Normal) | Tableaux et formulaires. |
| **Caption** | 12px | 0.75rem | 500 (Moyen) | Badges de statut et indices. |

---

## 4. Composants UI Réutilisables

---

### 4.1. Boutons (`Buttons`)

- **Bouton Principal (`btn-primary`) :**
  - Fond : `#6366F1`
  - Texte : `#FFFFFF`
  - Arrondi : `8px`
  - Usage : "Créer un produit", "Enregistrer", "Publier".
- **Bouton Secondaire (`btn-secondary`) :**
  - Fond : Transparent
  - Bordure : `1px solid #374151`
  - Texte : `#F9FAFB`
  - Hover : Fond `#1F2937`
  - Usage : "Annuler", "Retour", "Filtrer".
- **Bouton Danger (`btn-danger`) :**
  - Fond : `#EF4444`
  - Texte : `#FFFFFF`
  - Usage : "Supprimer", "Archiver".
- **Bouton Icône (`btn-icon`) :**
  - Taille : `36px × 36px`
  - Fond : Transparent, hover `#1F2937`
  - Usage : Modifier (Crayon), Voir (Œil), Supprimer (Poubelle).

---

### 4.2. Formulaires (`Form Controls`)

- **Champs de Texte et Numériques (`input[type="text"]`, `input[type="number"]`) :**
  - Fond : `#111827`
  - Bordure : `1px solid #374151`
  - Texte : `#F9FAFB`
  - Focus : Bordure `#6366F1` avec lueur d'accent.
  - Hauteur : `42px` (Web), `46px` (Mobile pour toucher facile au doigt).
- **Zone de Texte (`textarea`) :**
  - Même style que l'input, hauteur minimale de `100px`.
- **Menu Déroulant (`select`) :**
  - Fond `#111827`, chevron à droite, options claires sur fond sombre.
- **Sélecteur de Pastille de Couleur (`color-swatch-picker`) :**
  - Boutons ronds de `32px` de diamètre avec la vraie couleur physique.
  - Bordure blanche fine quand la couleur est sélectionnée.
- **Zone de Téléversement (`dropzone`) :**
  - Bordure en tirets `#374151`.
  - Glisser-déposer de fichiers images (`.webp`, `.jpg`, `.png`) ou 3D (`.glb`).
  - Affichage instantané de la miniature avec badge "Image principale".

---

### 4.3. Tableaux de Données (`Data Tables`)

- **En-tête (`thead`) :**
  - Fond `#1F2937`, texte majuscule `#9CA3AF`, police 12px semi-gras.
  - Colonnes triables avec flèches de tri (Nom, Prix, Stock, Date).
- **Lignes (`tbody tr`) :**
  - Séparées par une fine bordure `1px solid #1F2937`.
  - Survol de ligne : Fond `#1E293B`.
- **Colonnes clés :**
  - Miniature produit (48px × 48px).
  - Titre du vêtement et SKU.
  - Catégorie principale.
  - Prix en `MAD` (toujours affiché avec "MAD", ex: `1 250,00 MAD`).
  - Stock disponible (avec code couleur : vert si > 5, ambre si $\le 5$, rouge si 0).
  - Statut (`DRAFT`, `PUBLISHED`, `ARCHIVED`).
  - Actions rapides (Modifier, Détails, Menu d'actions).
- **Pagination en bas :**
  - Affichage : "Affichage de 1 à 10 sur 48 produits".
  - Boutons : Précédent, 1, 2, 3, Suivant.

---

### 4.4. Cartes (`Cards`)

- **Carte Produit (Vue Grille) :**
  - Image de couverture avec badge statut en haut à droite.
  - Badge 3D interactif si un modèle `.glb` est présent.
  - Titre en gras et catégorie principale.
  - Prix en `MAD`.
  - Indicateur de stock.
- **Carte Statistique Dashboard (KPI) :**
  - Chiffre grand format (ex : "142").
  - Libellé explicatif (ex : "Produits Actifs").
  - Icône illustrative dans un cercle coloré.

---

### 4.5. Fenêtres Modales (`Modals`)

- **Fond d'arrière-plan (`backdrop`) :** Noir translucide `rgba(0, 0, 0, 0.75)` avec effet de flou.
- **Boîte modale :**
  - Fond `#111827`, bordure `1px solid #374151`, arrondi `12px`.
  - En-tête avec titre en gras et croix de fermeture.
  - Zone de contenu défilable.
  - Pied avec bouton d'annulation (gauche) et bouton d'action principal (droite).
- **Modales types :**
  1. Confirmation de suppression ou d'archivage.
  2. Prévisualisation 3D interactive plein écran.
  3. Ajout rapide d'attribut ou de catégorie.

---

## 5. Responsive Design (Adaptation Mobile & Bureau)

| Format | Largeur Écran | Comportement de l'Interface |
|---|---|---|
| **Ordinateur (Desktop)** | $\ge 1200\text{px}$ | Barre latérale gauche fixe (260px). Tableau complet multi-colonnes. Grille produit à 4 colonnes. Formulaire en 2 colonnes avec aperçu latéral en direct. |
| **Tablette (Tablet)** | $768\text{px} - 1199\text{px}$ | Barre latérale rétractable (icône menu). Tableau avec défilement horizontal fluide. Grille produit à 2 colonnes. |
| **Téléphone (Mobile)** | $< 768\text{px}$ | Menu tiroir plein écran. Tableaux transformés en liste de cartes verticales faciles à lire. Boutons d'action pleine largeur avec hauteur 46px. Formulaire à une seule colonne verticale. |

---

## 6. Conformité aux Décisions Confirmées

- **Devise Unique :** Tous les composants de prix affichent obligatoirement le libellé `"MAD"` (ex: `850,00 MAD`).
- **Marque Unique :** L'en-tête de l'interface affiche fièrement le logo `"ARTFIT"`.
- **Hiérarchie Libre :** Les sélecteurs de catégories affichent l'arborescence complète (ex: `Vêtements > Homme > Vestes`).

