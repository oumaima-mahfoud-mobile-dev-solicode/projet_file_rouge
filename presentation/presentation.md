---
marp: true
theme: default
size: 16:9
paginate: true
style: |
  section {
    box-sizing: border-box;
    font-family: "Aptos", "Segoe UI", sans-serif;
    background: #f8fafc;
    color: #172033;
    padding: 40px 64px;
    font-size: 23px;
    line-height: 1.35;
  }
  h1, h2 {
    color: #243b6b;
    line-height: 1.15;
  }
  h1 {
    font-size: 2.5em;
    margin: 0 0 0.4em;
  }
  h2 {
    font-size: 1.7em;
    margin: 0 0 0.55em;
  }
  p {
    margin: 0 0 0.65em;
  }
  ul {
    font-size: 1.05em;
    line-height: 1.4;
    margin: 0.2em 0 0.65em;
  }
  li {
    margin: 0.12em 0;
  }
  img {
    max-width: 100%;
    max-height: 62vh;
    object-fit: contain;
  }
  section.title-slide {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 80px;
  }
  .institution-logos {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 64px;
    margin-bottom: 20px;
  }
  .institution-logos img {
    width: auto;
    height: 82px;
    max-width: 220px;
  }
  .institution-logos img:last-child {
    height: auto;
    max-height: 58px;
  }
  section.image-only {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 24px;
  }
  section.image-only img {
    max-width: 96%;
    max-height: 62vh;
    object-fit: contain;
  }
---

<!-- _class: title-slide -->

<div class="institution-logos">
  <img src="images/logo-ofppt.png" alt="Logo OFPPT">
  <img src="images/logo-solicode.png" alt="Logo SoliCode">
</div>

# ARTFIT

## Plateforme de shopping et de personnalisation de vêtements en 3D

**Projet de fin de formation — SoliCode**

Présenté par : **Oumaima Mahfoud**

Encadré par : **ES-SARRAJ FOUAD**

Année : 2026–2027

---

## Plan de la présentation

1. Introduction et contexte du projet
2. Méthodologies et planification
3. Branche fonctionnelle
4. Compréhension du besoin : empathie, problématique et idéation
5. Conception : diagrammes de cas d'utilisation et de classes
6. Stack technologique et structure technique
7. Conclusion

---

## Introduction

Le commerce électronique évolue rapidement.

Aujourd'hui, les clients peuvent acheter des vêtements sur Internet, mais ils ne peuvent pas toujours visualiser facilement le résultat avant l'achat.

ARTFIT propose une nouvelle expérience de shopping qui combine la mode, la personnalisation et la technologie 3D.

---

## Contexte du projet

Le shopping en ligne présente plusieurs difficultés :

- Difficulté de choisir une tenue adaptée.
- Absence d'essayage physique.
- Manque de visualisation des vêtements portés.
- Difficulté de personnaliser son style.

**ARTFIT** est une plateforme qui permet de découvrir, composer et personnaliser des tenues avec une expérience de visualisation 3D.

---

# les methodologies 

---

<!-- _class: image-only -->

## Scrum

![Méthode Scrum](../rapport/SCRUM/scrum.png)

---

<!-- _class: image-only -->

## Processus 2TUP

![Processus 2TUP](../rapport/2TUP/images.jpg)

---

<!-- _class: image-only -->

## Design Thinking

![Design Thinking](../rapport/design_thinking/design_thinking.jpg)

---

## Planification

Le projet est organisé en plusieurs sprints:


**Sprint 01 — Gestion des produits**
- CRUD Product.
- Affichage des produits dans la plateforme.
- Diagramme de cas d'utilisation.

---

**Sprint 02 — Gestion des catégories**
- CRUD Category.
- Organisation des fichiers.
- Séparation des responsabilités.

---

**Sprint 03 — Architecture**
- Utilisation du pattern DAO.
- Architecture en 3 couches.
- Séparation de la logique métier et des données.
  
---

## Branche fonctionnelle

---


**Acteurs principaux :**

- **Visiteur** : consulter les produits et créer un compte.
- **Client** : gérer son compte, personnaliser ses tenues et commander.
- **Administrateur** : gérer les produits, les catégories, les stocks, les utilisateurs et les commandes.
- **Service de paiement** : traiter les paiements.
---

**Principaux modules :**

- Authentification et autorisations.
- Gestion du catalogue.
- Gestion des produits et variantes.
- Personnalisation 3D.
- Panier et commandes.
- Gestion des réductions et réservations de stock.

---

## Carte d'empathie

**Utilisateur cible : le client qui achète des vêtements en ligne.**

- **Dit :** Je veux trouver une tenue qui correspond à mon style.
- **Pense :** Est-ce que cette tenue va me convenir ?
- **Fait :** Il consulte plusieurs produits et compare les vêtements.
- **Ressent :** Il hésite avant de passer une commande.

**Besoin :** choisir et visualiser une tenue avant de l'acheter.

---

## Définition du problème

**Problématique :**

Comment améliorer l'expérience du shopping en ligne et aider les clients à choisir leurs vêtements avant de passer une commande ?

**Solution :**

Créer ARTFIT, une plateforme qui permet de découvrir, personnaliser et visualiser des tenues en 3D.

---

## Idéation

Les idées proposées pour répondre au problème :

- Créer un catalogue de vêtements.
- Ajouter des filtres de recherche.
- Proposer plusieurs tailles et couleurs.
- Permettre la personnalisation des tenues.
- Intégrer une visualisation 3D interactive.
- Proposer un panier et un système de commande.
- Créer une interface moderne et responsive.

**Idée principale : transformer le shopping en une expérience interactive en 3D.**

---

<!-- _class: image-only -->

## Diagramme de cas d'utilisation

![Diagramme de cas d'utilisation](images/mermaid-diagram-cas.png)



---

## Stack technologique

- **Backend** · PHP 8.2 · Laravel 12
- **Autorisations** · Spatie Laravel Permission
- **Mobile** · NativePHP
- **Frontend** · Blade · Tailwind CSS · Alpine.js · Preline · Vite
- **Base de données** · MySQL
- **3D** · Three.js
- **Diagrammes** · Mermaid · PlantUML
- **Versioning** · Git · GitHub



---



<!-- _class: image-only -->

## Diagramme de classes

![Diagramme de classes](<images/Diagramme de classes.png>)


---

## Conclusion

- Une plateforme e-commerce spécialisée dans la mode.
- Une gestion complète des produits et des variantes.
- Une personnalisation et une visualisation des tenues en 3D.
- Une architecture organisée en trois couches.
- Une expérience de shopping moderne et interactive.



---

# Merci pour votre attention !

