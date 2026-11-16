# ARTFIT — Règles du Projet

## 1. Vision du Projet

ARTFIT est une boutique en ligne moderne de vêtements avec expérience 3D.

Le projet permet au client de :
- Découvrir des vêtements.
- Choisir des tenues de mode.
- Choisir un style de vêtement et une personnalité.
- Regarder la tenue en 3D.
- Personnaliser son look.
- Acheter ses articles préférés.

---

## 2. Standard de Langue Obligatoire (Français Simple A1)

Tout le contenu textuel et humain du projet ARTFIT doit être écrit en **français simple — niveau A1**.

Règles :
- Écrire des phrases courtes et directes.
- Utiliser des mots courants et faciles.
- Ne pas utiliser de tournures complexes.
- Expliquer les choix techniques simplement.
- Garder les mots techniques en anglais si nécessaire (`UUID`, `DECIMAL`, `status`, `sku`).
- Ne jamais traduire les identifiants techniques ni les mots-clés de programmation.
- Rédiger les documents, règles et tickets en français simple.

---

## 3. Architecture Obligatoire — Architecture 3-Tiers

L'application ARTFIT est obligatoirement séparée en trois couches indépendantes :

### Couche 1 : Couche Présentation (UI)
- Affiche les pages et les écrans.
- Gère les clics et les actions de l'utilisateur.
- Envoie les demandes à la Couche Métier.
- Affiche les réponses et les messages d'erreur.
- Interdiction de faire des requêtes directes à la base de données.
- Interdiction de contenir la logique métier.

### Couche 2 : Couche Métier (BLL)
- Contient toutes les règles de gestion et de validation.
- Calcule les prix, les réductions et gère les stocks.
- Coordonne les actions entre l'interface et les données.
- Ne gère pas l'affichage direct.
- Ne modifie pas la base de données sans passer par la Couche d'Accès aux Données.

### Couche 3 : Couche d'Accès aux Données (DAL)
- Communique directement avec la base de données.
- Exécute les requêtes de lecture et d'écriture (CRUD).
- Assure la sécurité des données et des transactions.
- Ne contient aucune règle métier ni affichage.

---

## 4. Règles de la Base de Données

- Donner des noms clairs aux tables et aux colonnes.
- Éviter la répétition inutile des données (normalisation).
- Définir des clés primaires et étrangères claires.
- Valider la structure de la base de données avant tout code.
- Ne jamais créer de tables sans accord du Project Owner.

---

## 5. Expérience 3D

- Fournir une vue 3D fluide et rapide.
- Optimiser la taille des fichiers 3D pour les téléphones portables.
- Toujours fournir une image 2D simple de secours (fallback) si la 3D ne fonctionne pas.

---

## 6. Sécurité et Qualité

- Ne jamais enregistrer de mot de passe en texte clair.
- Vérifier et nettoyer toutes les données saisies par l'utilisateur.
- Protéger les routes d'administration.
- Ne jamais écrire de clés secrètes dans le code.
- Demander l'accord de l'utilisateur avant toute décision technique majeure.
