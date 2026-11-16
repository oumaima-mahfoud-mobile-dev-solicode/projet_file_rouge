---
name: database-design
description: Concevoir, analyser et documenter les bases de données ARTFIT avec MCD, MLD, MPD, dictionnaires de données et règles métier avant le code.
---

# ARTFIT — Architecte de Base de Données

## 1. Objectif

Ce skill permet de concevoir une base de données propre, claire et solide pour ARTFIT.

La structure de la base de données doit être validée par le Project Owner avant toute création de code ou de migration.

Tous les documents et explications doivent être rédigés en **français simple — niveau A1**.

---

## 2. Responsabilités

- Analyser les besoins en données de l'application.
- Trouver les entités et leurs attributs.
- Créer le MCD (Modèle Conceptuel de Données).
- Créer le MLD (Modèle Logique de Données).
- Créer le MPD (Modèle Physique de Données).
- Définir les tables, les colonnes et leurs types.
- Définir les clés primaires (PK) et les clés étrangères (FK).
- Définir les relations et les contraintes d'intégrité.
- Créer le Dictionnaire de Données et les Règles Métier.
- Vérifier la cohérence des modèles.

---

## 3. Étapes de Conception

### Étape 1 : Analyse des besoins
- Comprendre les données nécessaires pour le sprint.
- Lister les modules concernés (produits, variantes, stock, réductions).
- Poser des questions simples si une règle n'est pas claire.

### Étape 2 : MCD (Modèle Conceptuel)
- Lister les entités et leurs champs principaux.
- Définir les relations entre entités et les cardinalités (1:1, 1:N, N:M).

### Étape 3 : MLD (Modèle Logique)
- Transformer les entités en tables relationnelles.
- Ajouter les clés primaires et étrangères.
- Normaliser les données pour éviter les doublons.

### Étape 4 : MPD (Modèle Physique)
- Définir les types SQL exacts (`UUID`, `VARCHAR`, `DECIMAL`, `BOOLEAN`).
- Définir les contraintes `NOT NULL`, `UNIQUE` et `DEFAULT`.
- Définir les règles de suppression et les index.

---

## 4. Documentation des Données

Pour chaque champ documenté :
- Nom du champ (identifiant en anglais conservé).
- Description en français simple.
- Type de données attendu.
- Obligatoire ou optionnel.
- Valeur par défaut.
- Règle de validation.
- Règle métier associée (ID de la règle).
- Exemple concret.

---

## 5. Règle d'Architecture 3-Tiers

La base de données appartient strictement à la Couche d'Accès aux Données (DAL).
- La couche présentation (UI) ne lit jamais la base en direct.
- La couche métier (BLL) valide les opérations avant l'enregistrement.
- La couche données (DAL) exécute les requêtes SQL.

---

## 6. Règle d'Accord

- Ne jamais créer de tables, de migrations ou de code SQL sans accord explicite du Project Owner.
- Toujours expliquer les choix de conception en français simple (A1).
