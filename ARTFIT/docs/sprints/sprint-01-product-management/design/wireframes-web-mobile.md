# ARTFIT — SPRINT 01 : MAQUETTES OFFICIELLES (ADMIN & BOUTIQUE PUBLIQUE)
## Module : Gestion des Produits (CRUD)

- **Version du document :** 2.0.0
- **Statut :** Adapté selon la demande du Project Owner
- **Date de mise à jour :** 2026-11-16
- **Architecture obligatoire :** Architecture 3-Tiers (Couche Présentation - UI)
- **Langue du document :** Français simple — Niveau A1
- **Devise unique :** `MAD` (Dirham Marocain)
- **Marque unique :** `ARTFIT`

---

## 1. But du Document

Ce document présente la structure simplifiée et claire demandée par le Project Owner :

1. **La Page Admin (Gestion Complète) :**
   - Une seule page pour TOUT gérer directement.
   - Lister tous les vêtements.
   - Ajouter un nouveau vêtement (`+ Ajouter un Produit`).
   - Modifier un vêtement existant (prix, stock, catégories, variantes).
   - Supprimer un vêtement.
   - Contrôler le stock et les alertes.

2. **La Page Publique (Boutique Client) :**
   - La vitrine vue par les clients qui visitent le site ARTFIT.
   - Affiche uniquement les vêtements mis en ligne (`PUBLISHED`).
   - Prix officiels en Dirhams marocains (`MAD`).
   - Photos et badge d'expérience 3D interactive (`.glb`).
   - Pastilles de couleurs réelles et choix des tailles.
   - Fiche détaillée client avec visionneuse 3D et bouton "Ajouter au Panier".

---

## 2. Page 1 : Espace Admin (Gestion Complète)

### 2.1. Version Web Ordinateur (Desktop)
```text
+-------------------------------------------------------------------------------------------------------------------+
| ARTFIT ADMIN                                          (Stock Bas: 1)  (Devise: MAD)       [ 👤 Super Admin v ]   |
+-------------------------------------------------------------------------------------------------------------------+
| GESTION DES PRODUITS ET DU STOCK                                            [ + Ajouter un Nouveau Produit ]      |
|                                                                                                                   |
| [ TOTAL ARTICLES: 3 ]      [ EN VENTE: 2 PUBLIÉS ]      [ STOCK BAS: 1 ALERTE ]      [ DEVISE: 100% MAD ]         |
|                                                                                                                   |
| FILTRES ET RECHERCHE :                                                                                            |
| [ 🔍 Rechercher par titre, SKU, catégorie...                 ]   [ Catégorie: Toutes v ]   ( 3 articles affichés )|
|                                                                                                                   |
| +---------------------------------------------------------------------------------------------------------------+ |
| | Vêtement & Photo  | Catégorie        | Variantes      | Prix (MAD)    | Stock Dépôt | Statut       | Actions  | |
| |-------------------+------------------+----------------+---------------+-------------+--------------+----------| |
| | [🧥] Bomber Cyber | Vestes > Blousons| S, M, L, XL    | 1 250,00 MAD  | 45 pcs      | [ PUBLIÉ ]   | [✏️ Modif]| |
| |      AF-JKT-CYB-01|                  | (• Noir)       |               | (40 dispo)  | (Visible)    | [🗑️ Suppr| |
| |-------------------+------------------+----------------+---------------+-------------+--------------+----------| |
| | [👖] Cargo Tech   | Pantalons        | M, L           |   850,00 MAD  | 15 pcs      | [ PUBLIÉ ]   | [✏️ Modif]| |
| |      AF-PNT-CRG-02|                  | (• Gris)       |               | (15 dispo)  | (Visible)    | [🗑️ Suppr| |
| |-------------------+------------------+----------------+---------------+-------------+--------------+----------| |
| | [👕] T-Shirt Blanc| Hauts > T-Shirts | S, M, L        |   390,00 MAD  | 2 pcs [!]   | [BROUILLON]  | [✏️ Modif]| |
| |      AF-TSH-OVR-03|                  | (o Blanc)      |               | (Stock Bas) | (Masqué)     | [🗑️ Suppr| |
| +---------------------------------------------------------------------------------------------------------------+ |
| 💡 Note : Les produits au statut "BROUILLON" sont invisibles pour les clients sur la boutique publique.           |
+-------------------------------------------------------------------------------------------------------------------+
```

### 2.2. Version Téléphone (Mobile)
```text
+-----------------------------------+
| [=] ARTFIT ADMIN        [+ Créer] |
+-----------------------------------+
| GESTION DES PRODUITS              |
| [ Total : 3  |  En ligne : 2 ]    |
|                                   |
| [🔍 Rechercher un vêtement...   ] |
| [Filtre Catégorie: Toutes       v]|
|                                   |
| +-------------------------------+ |
| | [🧥] Bomber Cyberpunk Noir    | |
| | Catégorie : Vestes > Blousons | |
| | Prix : 1 250,00 MAD           | |
| | Stock : 40 dispo (5 réservés) | |
| | Statut : [ PUBLIÉ ]           | |
| | [✏️ Modifier]    [🗑️ Supprimer] | |
| +-------------------------------+ |
| | [👖] Pantalon Cargo Tech      | |
| | Catégorie : Pantalons         | |
| | Prix : 850,00 MAD             | |
| | Stock : 15 disponibles        | |
| | Statut : [ PUBLIÉ ]           | |
| | [✏️ Modifier]    [🗑️ Supprimer] | |
| +-------------------------------+ |
| | [👕] T-Shirt Oversize Blanc   | |
| | Catégorie : Hauts             | |
| | Prix : 390,00 MAD             | |
| | Stock : 2 restants [ALERTE]   | |
| | Statut : [ BROUILLON (Masqué)]| |
| | [✏️ Modifier]    [🗑️ Supprimer] | |
| +-------------------------------+ |
|                                   |
| [+ AJOUTER UN NOUVEAU PRODUIT]    |
+-----------------------------------+
```

### 2.3. Modal Direct : Formulaire Ajouter / Modifier un Vêtement
```text
+-------------------------------------------------------------------+
| [X] FORMULAIRE : AJOUTER OU MODIFIER UN VÊTEMENT                 |
+-------------------------------------------------------------------+
| Nom du vêtement *                   Code SKU Unique *             |
| [ Bomber Cuir Tech Noir           ] [ AF-JKT-04                 ] |
|                                                                   |
| Prix officiel en MAD *              Catégorie *                   |
| [ 1450.00                   ] MAD   [ Vestes > Cuir             v]|
|                                                                   |
| Quantité en stock                   Statut de publication         |
| [ 25                              ] [ PUBLIÉ (En ligne client) v] |
|                                                                   |
| Tailles disponibles :                                             |
| [x] S   [x] M   [x] L   [ ] XL                                    |
|                                                                   |
| Photos et Modèle 3D (.glb) :                                      |
| +---------------------------------------------------------------+ |
| | 📁 Glisser-déposer le fichier 3D (.glb) et la photo ici       | |
| +---------------------------------------------------------------+ |
|                                                                   |
| [ Annuler ]                         [ Enregistrer dans le Site ]  |
+-------------------------------------------------------------------+
```

---

## 3. Page 2 : Boutique Publique (Vitrine Vue Client)

### 3.1. Version Web Ordinateur (Desktop)
```text
+-------------------------------------------------------------------------------------------------------------------+
| ARTFIT              Tous les vêtements   Vestes   Pantalons   Hauts               [ 🛒 Panier (0 MAD) ]           |
+-------------------------------------------------------------------------------------------------------------------+
|                                                                                                                   |
|      COLLECTION ARTFIT 3D — STREETWEAR MODERNE                                                                    |
|      Découvrez nos vêtements avec visualisation et essayage 3D en direct.                                         |
|      [ ✨ Expérience 3D Interactive ]    [ 🇲🇦 Prix en Dirhams Marocains (MAD) ]                                    |
|                                                                                                                   |
+-------------------------------------------------------------------------------------------------------------------+
| NOS VÊTEMENTS EN LIGNE (2 MODÈLES DISPONIBLES) :                                                                  |
|                                                                                                                   |
| +------------------------------------+  +------------------------------------+                                    |
| | [ 3D 360° ]                        |  | [ 3D 360° ]                        |                                    |
| |                                    |  |                                    |                                    |
| |                🧥                  |  |                👖                  |                                    |
| |                                    |  |                                    |                                    |
| | Vestes > Blousons                  |  | Pantalons > Cargo                  |                                    |
| | Bomber Cyberpunk Noir              |  | Pantalon Cargo Tech                |                                    |
| | Couleur : (• Noir) | Tailles: S..XL|  | Couleur : (• Gris) | Tailles: M, L |                                    |
| |------------------------------------|  |------------------------------------|                                    |
| | 1 250,00 MAD        [ Voir en 3D >]|  | 850,00 MAD          [ Voir en 3D >]|                                    |
| +------------------------------------+  +------------------------------------+                                    |
|                                                                                                                   |
| ℹ️ Le T-Shirt Blanc en brouillon est masqué ici car il n'est pas encore publié par l'administrateur.             |
+-------------------------------------------------------------------------------------------------------------------+
```

### 3.2. Version Téléphone (Mobile)
```text
+-----------------------------------+
| ARTFIT                  [🛒 (0)]  |
+-----------------------------------+
| [ Tous ] [ Vestes ] [ Pantalons ] |
|                                   |
| NOUVELLE COLLECTION 3D            |
| Vêtements haute précision en MAD  |
|                                   |
| +-------------------------------+ |
| | [ Badge : 3D Interactif ]     | |
| |              🧥               | |
| |                               | |
| | Vestes > Blousons             | |
| | Bomber Cyberpunk Noir         | |
| | Tailles : S, M, L, XL         | |
| | Prix : 1 250,00 MAD           | |
| | [ DÉCOUVRIR EN 3D ET ACHETER] | |
| +-------------------------------+ |
|                                   |
| +-------------------------------+ |
| | [ Badge : 3D Interactif ]     | |
| |              👖               | |
| |                               | |
| | Pantalons > Cargo             | |
| | Pantalon Cargo Tech           | |
| | Tailles : M, L                | |
| | Prix : 850,00 MAD             | |
| | [ DÉCOUVRIR EN 3D ET ACHETER] | |
| +-------------------------------+ |
+-------------------+---------------+
```

### 3.3. Fiche Produit Client avec Visionneuse 3D
```text
+-------------------------------------------------------------------+
| [X] BOMBER CYBERPUNK NOIR — EXPÉRIENCE 3D                         |
+-------------------------------------------------------------------+
| +---------------------------------------------------------------+ |
| |                   [ 3D VIEWER INTERACTIF ]                    | |
| |                                                               | |
| |             Mode 360° : Rotation avec le doigt/souris         | |
| |             Fichier GLB haute précision                       | |
| |                                                               | |
| | [✨ Vue 3D Complète]                     [📸 Photo 2D Secours]| |
| +---------------------------------------------------------------+ |
|                                                                   |
| Bomber Cyberpunk Noir                             1 250,00 MAD    |
| Marque : ARTFIT (Tissu imperméable respirant)                     |
|                                                                   |
| Choisir votre taille :                                            |
| [ S ]   [ (M) Sélectionnée ]   [ L ]   [ XL ]                     |
|                                                                   |
| ✓ En stock disponible immédiatement (Livraison partout au Maroc)  |
|                                                                   |
| [ 🛍️ AJOUTER AU PANIER — 1 250,00 MAD                          ]  |
+-------------------------------------------------------------------+
```

---

## 4. Avantages de Cette Nouvelle Organisation

1. **Très simple et direct :**
   - L'administrateur a une seule page pour tout faire : voir la liste, créer un produit, modifier un produit, le supprimer et ajuster le stock.
   - Les clients ont leur boutique en ligne dédiée avec les produits publiés et l'expérience 3D.
2. **Conforme à 100% avec les règles du projet :**
   - Marque unique `ARTFIT`.
   - Devise unique `MAD`.
   - Statuts respectés (`DRAFT` masqué, `PUBLISHED` en ligne).
   - Démonstrateur interactif prêt dans [mockups-interactive.html](file:///e:/project_file_rouge/ARTFIT/docs/sprints/sprint-01-product-management/design/mockups-interactive.html).
