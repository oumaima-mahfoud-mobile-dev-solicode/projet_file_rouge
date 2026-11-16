---
name: project-analysis
description: Analyser les besoins, la structure du projet, l'architecture 3-tiers et le plan technique avant d'écrire du code.
---

# ARTFIT — Analyse de Projet

## 1. Objectif

Ce skill sert à analyser chaque fonctionnalité d'ARTFIT avant de commencer le code.

Ne jamais commencer à coder avant d'avoir l'accord de l'utilisateur.

Toutes les explications et notes doivent utiliser un **français simple — niveau A1**.

---

## 2. Processus d'Analyse

Pour chaque nouvelle demande :

1. Lire et comprendre la demande du Project Owner.
2. Définir le résultat attendu.
3. Vérifier les fichiers existants dans le projet.
4. Trouver les fichiers et composants à modifier.
5. Vérifier les dépendances techniques.
6. Lister les risques et les limites.
7. Poser des questions simples si une information manque.

---

## 3. Analyse de l'Architecture 3-Tiers

ARTFIT utilise obligatoirement l'Architecture 3-Tiers :

### Couche 1 : Présentation (UI)
- Pages, écrans et formulaires.
- Actions de l'utilisateur.

### Couche 2 : Logique Métier (BLL)
- Services et règles métier.
- Validation des données et calculs.

### Couche 3 : Accès aux Données (DAL)
- Repositories et requêtes SQL.
- Lecture et sauvegarde des données.

Ne jamais mélanger les rôles entre les couches.

---

## 4. Contenu du Plan d'Analyse

Avant de coder, présenter un plan simple :

1. **Besoin :** Ce que l'utilisateur veut.
2. **Fonctionnement :** Comment la fonctionnalité marche.
3. **Architecture :** Le rôle des 3 couches.
4. **Fichiers :** Liste des fichiers à créer ou modifier.
5. **Étapes :** Les étapes dans l'ordre.
6. **Risques :** Les problèmes possibles.

---

## 5. Règle d'Accord

- Présenter l'analyse à l'utilisateur.
- Attendre l'accord écrit de l'utilisateur.
- Faire uniquement ce qui est validé.
- Expliquer les choix techniques avec des mots simples en français (A1).
