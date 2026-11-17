---
marp: true
theme: default
size: 16:9
paginate: true
title: ARTFIT — Rapport de projet
style: |
  section {
    font-family: "Inter", "Segoe UI", sans-serif;
    background: #050811;
    color: #F9FAFB;
    padding: 48px 64px;
  }
  h1, h2 {
    color: #FFFFFF;
    font-family: "Space Grotesk", "Segoe UI", sans-serif;
  }
  h1 {
    font-size: 2.4em;
  }
  h2 {
    font-size: 1.8em;
    color: #818CF8;
    border-bottom: 2px solid #374151;
    padding-bottom: 12px;
    margin-bottom: 22px;
  }
  h3 {
    color: #06B6D4;
  }
  p, li {
    font-size: 1.12em;
    line-height: 1.55;
    color: #D1D5DB;
  }
  strong {
    color: #FFFFFF;
  }
  code {
    color: #67E8F9;
    background: #111827;
  }
  table {
    width: 100%;
    font-size: 0.85em;
    border-collapse: collapse;
  }
  th {
    background: #1E293B;
    color: #06B6D4;
    padding: 10px;
  }
  td {
    background: #0F172A;
    border: 1px solid #374151;
    padding: 10px;
  }
  section.image-only {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  section.image-only img {
    max-width: 96%;
    max-height: 78%;
    object-fit: contain;
  }
  section.lead {
    text-align: center;
    justify-content: center;
  }
  section.lead h1 {
    font-size: 3.5em;
    color: #818CF8;
  }
  section.lead h3 {
    color: #06B6D4;
  }

---

<!-- _class: lead -->

# ARTFIT

### Plateforme e-commerce de mode avec visualisation 3D

**Rapport de projet**

Présenté par : Oumaima Mahfoud

Formation : SoliCode — Développement Web

Encadrant : ES-SARRAJ FOUAD

---

## Remerciements

Je remercie :

- Mon encadrant pour son accompagnement.
- L'équipe pédagogique de SoliCode.
- Les personnes qui m'ont aidée pendant ce projet.
- Toutes les personnes qui ont participé à ce travail.

---

## Introduction

Aujourd'hui, le commerce en ligne prend une place importante.

Mais acheter des vêtements sur Internet présente des difficultés :

- Le client ne peut pas essayer le vêtement.
- Il est difficile de visualiser un ensemble.
- Le choix des tailles et des couleurs peut être compliqué.

**ARTFIT** propose une nouvelle expérience d'achat avec la technologie 3D.

---

## Contexte du projet

ARTFIT est une plateforme e-commerce spécialisée dans la mode.

Elle permet aux clients de :

- Découvrir des vêtements.
- Choisir des tailles et des couleurs.
- Composer des tenues.
- Visualiser les vêtements en 3D.
- Personnaliser leur expérience.
- Commander en ligne.

**Objectif :** rendre le shopping plus interactif et plus moderne.

---

## Objectif de formation (SoliCode)

Ce projet permet de pratiquer plusieurs compétences :

- Analyse des besoins.
- Conception d'une application web.
- Gestion d'une base de données.
- Développement Frontend et Backend.
- Architecture logicielle.
- Création d'interfaces utilisateur.
- Tests et validation.
- Gestion de projet.

---

## Cahier des charges

**1. Espace administrateur**

- Gestion des produits.
- Gestion des catégories.
- Gestion des variantes.
- Gestion des prix.
- Gestion du stock.
- Publication des produits.

**2. Boutique client**

- Consultation des produits.
- Recherche et filtres.
- Visualisation 3D.
- Choix des variantes.
- Panier et réservation.
- Commande.

**3. Objectif principal**

Créer une expérience d'achat simple, interactive et moderne.

---

<!-- _class: image-only -->

## Méthode Scrum

![Méthode Scrum](../images/scrum.png)

---

<!-- _class: image-only -->

## Processus 2TUP

![Processus 2TUP](../images/arx.jpg)

---

<!-- _class: image-only -->

## Design Thinking

![Design Thinking](../images/design_thinking.jpg)

---

## Planification

Le projet est organisé en plusieurs étapes :

| Étape | Travail |
|---|---|
| 01 | Analyse des besoins |
| 02 | Règles métier |
| 03 | Conception des données |
| 04 | Design UI/UX |
| 05 | Architecture technique |
| 06 | Développement |
| 07 | Tests et validation |
| 08 | Documentation |

---

## Branche fonctionnelle

ARTFIT contient deux espaces principaux.

**Espace administrateur**

- Administrer les produits.
- Organiser les catégories.
- Gérer les stocks.
- Gérer les prix et les promotions.

**Espace client**

- Explorer la boutique.
- Consulter les produits.
- Personnaliser les vêtements.
- Visualiser les modèles en 3D.
- Ajouter au panier.
- Passer une commande.

---

## Carte d'empathie

**Utilisateur : Client**

| Pense et ressent | Voit |
|---|---|
| Veut acheter facilement | Des boutiques en ligne |
| Veut choisir la bonne taille | Des photos de vêtements |
| Veut voir le résultat | Des produits similaires |

| Dit et fait | Difficultés |
|---|---|
| Cherche des vêtements | Impossible d'essayer |
| Compare les produits | Doute sur la taille |
| Consulte les prix | Difficulté à composer une tenue |

**Besoin :** une expérience d'achat plus claire et plus interactive.

---

## Définition du problème

**Problématique :**

Comment améliorer l'expérience d'achat de vêtements en ligne ?

Les problèmes principaux :

- Absence d'essayage physique.
- Difficulté à visualiser les vêtements.
- Manque de personnalisation.
- Difficulté à choisir des ensembles.

**Solution proposée : ARTFIT avec la visualisation 3D.**

---

## Idéation

Les fonctionnalités proposées :

- Boutique de vêtements.
- Catalogue de produits.
- Catégories hiérarchiques.
- Variantes : taille et couleur.
- Modèles 3D.
- Personnalisation des tenues.
- Gestion du stock.
- Panier et commandes.

**Innovation :** combiner le commerce en ligne et la visualisation 3D.

---

## Diagramme de cas d'utilisation

**Acteurs principaux :**

- Administrateur.
- Client.

**Administrateur :**
- Gérer les produits.
- Gérer les catégories.
- Gérer les variantes.
- Gérer le stock.
- Gérer les promotions.

**Client :**
- Consulter la boutique.
- Rechercher un produit.
- Visualiser un vêtement en 3D.
- Choisir une variante.
- Ajouter au panier.
- Commander.

![Diagramme de cas d'utilisation](../images/use-case.png)

---

## Stack technologique

Les technologies prévues pour le développement :

- **Frontend** · HTML5 · CSS3 · JavaScript
- **Backend** · Node.js
- **Base de données** · SQLite / MySQL
- **API** · REST
- **Visualisation 3D** · WebGL / Three.js
- **Versionnement** · Git / GitHub
- **Conception** · Figma
- **Diagrammes** · Mermaid / PlantUML

---

## Architecture

**Architecture 3-Tiers**

L'application est organisée en trois couches indépendantes.

**1. Présentation (Presentation Layer)**

- Interfaces utilisateur.
- Contrôleurs.
- Réception des requêtes HTTP.

↓

**2. Logique métier (Business Logic Layer)**

- Services.
- Validations.
- Règles métier.
- Gestion des opérations.

↓

**3. Accès aux données (Data Access Layer)**

- DAO.
- Requêtes SQL.
- Communication avec la base de données.

**Principe :** chaque couche possède une responsabilité précise.

---

## Prototype e-commerce

Le premier module fonctionnel concerne la gestion des produits.

Fonctionnalités principales :

- Ajouter un produit.
- Consulter les produits.
- Afficher les détails.
- Modifier un produit.
- Supprimer un produit.
- Gérer les catégories.
- Gérer les variantes.

**Objectif :** construire une base solide pour la boutique ARTFIT.

---

## Relations des données

Les principales relations métier :

- **Catégorie** → peut avoir plusieurs sous-catégories.
- **Produit** → appartient à une ou plusieurs catégories.
- **Produit** → possède plusieurs variantes.
- **Variante** → possède un SKU.
- **Variante** → possède un stock.
- **Produit** → possède plusieurs médias.
- **Panier** → contient plusieurs lignes.
- **Commande** → contient plusieurs produits.

La hiérarchie des catégories est sans limite grâce à une relation récursive avec `parent_id`.

---

## Structure technique

Organisation en trois couches :

**Presentation**

- Controllers
- Routes API
- Interfaces Web

**Business Logic**

- Services
- Validators
- Business Rules

**Data Access**

- DAO
- Repositories
- Database

**Règle importante :** chaque fichier doit avoir une seule responsabilité (SRP).

---

## Diagramme de classes

Les principales classes métier :

- Product
- Category
- ProductVariant
- ProductMedia
- Inventory
- Cart
- CartItem
- Order
- OrderItem
- User

Les relations permettent de gérer les produits, les variantes, les stocks et les commandes.

![Diagramme de classes](../rapport/diagrammes/class-diagram.png)

---

## Maquettes

Conception des interfaces avec Figma.

Les maquettes présentent :

- Page d'accueil.
- Boutique.
- Catalogue des produits.
- Détail d'un produit.
- Visualisation 3D.
- Panier.
- Dashboard administrateur.

![Maquettes ARTFIT](../rapport/maquettes/maquettes.png)

---

## Interfaces

**Espace administrateur**

- Dashboard.
- Gestion des produits.
- Gestion des catégories.
- Gestion des stocks.
- Gestion des promotions.

**Boutique client**

- Accueil.
- Catalogue.
- Fiche produit.
- Personnalisation 3D.
- Panier.

![Interfaces ARTFIT](../rapport/interfaces/interfaces.png)

---

## Règles métier principales

| Règle | Décision |
|---|---|
| Marque | ARTFIT uniquement |
| Devise | MAD uniquement |
| Catégories | Hiérarchie illimitée |
| Variantes | Taille, couleur et attributs flexibles |
| SKU | Identifiant unique |
| Stock | Gestion par variante |
| Réservation | 60 minutes |
| Médias | 3D avec image de secours 2D |
| Publication | Validation obligatoire |

---

## Conclusion

ARTFIT est un projet qui combine :

- E-commerce.
- Mode et personnalisation.
- Visualisation 3D.
- Gestion des produits.
- Gestion des stocks.
- Architecture 3-Tiers.

**Objectif final :** proposer une nouvelle expérience de shopping en ligne.

---

<!-- _class: lead -->

# MERCI POUR VOTRE ATTENTION

### Projet ARTFIT

**Présenté par Oumaima Mahfoud**

Place aux questions et à la démonstration !

---

