---
marp: true
theme: default
size: 16:9
paginate: true
style: |
  section {
    font-family: "Inter", "Segoe UI", sans-serif;
    background: #050811;
    color: #F9FAFB;
    padding: 48px 64px;
  }
  h1 { color: #818CF8; font-size: 2.7em; }
  h2 {
    color: #818CF8;
    font-size: 1.8em;
    border-bottom: 2px solid #374151;
    padding-bottom: 10px;
  }
  h3 { color: #06B6D4; }
  p, li { font-size: 1.15em; line-height: 1.5; }
  strong { color: #FFFFFF; }
  section.lead {
    text-align: center;
    justify-content: center;
  }
  section.image-only {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  section.image-only img {
    max-width: 95%;
    max-height: 78%;
    object-fit: contain;
  }

---

<!-- _class: lead -->

# ARTFIT

### E-commerce & Mode 3D

Rapport de projet

**Présenté par : Oumaima Mahfoud**

**Encadrant : ES-SARRAJ FOUAD**

SoliCode

---

## Plan

1. Introduction
2. Présentation du projet
3. Analyse des besoins
4. Méthodologie
5. Conception
6. Technologies
7. Architecture
8. Réalisation
9. Démonstration
10. Conclusion

---

## Introduction

- Contexte du e-commerce.
- Problématique du shopping en ligne.
- Solution : ARTFIT.

---

## Présentation du projet

**ARTFIT : plateforme e-commerce de mode 3D.**

- Boutique en ligne.
- Personnalisation des vêtements.
- Visualisation 3D.
- Commande en ligne.

---

## Objectifs

- Améliorer l'expérience client.
- Faciliter le choix des vêtements.
- Proposer une visualisation 3D.
- Développer une plateforme moderne.

---

## Cahier des charges

**Administrateur**
- Produits et catégories.
- Variantes et stocks.
- Prix et promotions.

**Client**
- Boutique et recherche.
- Personnalisation 3D.
- Panier et commandes.

---

## Méthodologie

- Scrum.
- 2TUP.
- Design Thinking.

---

<!-- _class: image-only -->

## Scrum

![Scrum](../rapport/SCRUM/scrum.png)

---

<!-- _class: image-only -->

## Processus 2TUP

![2TUP](../rapport/2TUP/images.jpg)

---

<!-- _class: image-only -->

## Design Thinking

![Design Thinking](../rapport/design_thinking/design_thinking.jpg)

---

## Analyse des besoins

**Acteurs :**
- Administrateur.
- Client.

**Fonctionnalités :**
- Gestion des produits.
- Gestion des stocks.
- Achat en ligne.
- Visualisation 3D.

---

## Problématique

**Comment rendre le shopping en ligne plus interactif ?**

- Absence d'essayage.
- Difficulté de visualisation.
- Manque de personnalisation.

---

## Solution proposée

<badge color="info">ARTFIT</badge>

- Catalogue de vêtements.
- Modèles 3D.
- Personnalisation.
- Expérience d'achat moderne.

---

## Conception des données

- Product
- Category
- ProductVariant
- ProductMedia
- Inventory
- Cart
- Order
- User

---

## Relations des données

- Catégorie → Sous-catégories.
- Produit → Variantes.
- Produit → Médias.
- Variante → Stock.
- Commande → Produits.

---

## Diagramme de cas d'utilisation

![Use Case](../rapport/diagrammes/use-case.png)

---

## Technologies

| Domaine | Technologie |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js |
| Database | SQLite / MySQL |
| API | REST |
| 3D | Three.js |
| Design | Figma |
| Versionnement | Git / GitHub |

---

## Architecture 3-Tiers

**Présentation**
- Interfaces et Controllers.

↓

**Logique métier**
- Services et validations.

↓

**Accès aux données**
- DAO et Database.

---

## Design System

- Dark Fashion Tech.
- Violet : `#6366F1`
- Cyan : `#06B6D4`
- Background : `#050811`
- Surface : `#111827`

---

## Maquettes

![Maquettes](../rapport/maquettes/maquettes.png)

---

## Réalisation

**Module Produits**

- Ajouter.
- Consulter.
- Modifier.
- Supprimer.
- Rechercher.

---

## Gestion des produits

- Catégories.
- Variantes.
- Tailles et couleurs.
- Prix en MAD.
- Images et modèles 3D.

---

## Règles métier

- Devise : MAD.
- Marque : ARTFIT.
- Catégories illimitées.
- SKU unique.
- Réservation : 60 minutes.
- Image 2D de secours pour la 3D.

---

## Tests & Qualité

- Tests unitaires.
- Tests d'intégration.
- Validation des données.
- Vérification de l'architecture.

---

## Démonstration

**ARTFIT en pratique**

1. Espace administrateur.
2. Ajouter un produit.
3. Gérer les variantes.
4. Consulter la boutique.
5. Visualiser un produit.

---

## Conclusion

- Projet e-commerce moderne.
- Personnalisation 3D.
- Architecture 3-Tiers.
- Expérience client améliorée.

---

<!-- _class: lead -->

# MERCI !

### Des questions ?

**ARTFIT — Oumaima Mahfoud**

---