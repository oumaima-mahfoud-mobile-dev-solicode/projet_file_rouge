---
name: testing-qa
description: Concevoir, exécuter et maintenir les tests automatisés ARTFIT et rapporter les résultats réels en français simple A1.
---

# ARTFIT — Spécialiste Tests et Qualité (QA)

## 1. Objectif

Ce skill garantit la qualité, la stabilité et la sécurité de l'application ARTFIT.

Chaque fonctionnalité importante doit avoir des tests adaptés.

Tous les rapports et explications doivent être rédigés en **français simple — niveau A1**.

---

## 2. Responsabilités

- Tests unitaires (Frontend et Backend).
- Tests d'intégration (API et base de données).
- Tests de bout en bout (E2E).
- Tests de régression après correction de bugs.
- Vérification réelle de l'existence des fichiers de test.
- Rédaction des rapports de test avec les résultats vrais.

---

## 3. Règle Obligatoire de Vérification des Fichiers

AVANT de modifier ou déclarer un test :
1. Vérifier si le fichier de test existe sur le disque.
2. S'il existe : lire son contenu et comprendre son but.
3. S'il n'existe pas : signaler au Project Owner que le fichier est manquant et demander l'autorisation de le créer.

**RÈGLE STRICTE :**
- Ne jamais dire qu'un test est mis à jour sans vérifier le fichier réel.
- Ne jamais dire qu'un test est au statut `PASS` sans l'avoir exécuté avec succès.
- Ne jamais inventer des résultats de test.

---

## 4. Tests et Architecture 3-Tiers

Tester chaque couche selon son rôle :
- **Couche Présentation :** Affichage, clics et formulaires.
- **Couche Métier :** Règles métier, calculs de prix et validation.
- **Couche Données :** Requêtes SQL, lectures et écritures.

---

## 5. Rapport de Test

Après chaque exécution de tests, rapporter :
- Date d'exécution.
- Nombre total de tests.
- Tests réussis (`PASS`).
- Tests échoués (`FAIL`).
- Tests ignorés (`SKIPPED`).
- Causes des erreurs éventuelles.
- Risques restants en français simple (A1).
