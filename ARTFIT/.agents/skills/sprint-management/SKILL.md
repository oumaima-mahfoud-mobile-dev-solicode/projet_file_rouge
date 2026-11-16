---
name: sprint-management
description: Planifier, organiser et suivre les sprints Agile du projet ARTFIT avec objectifs, tâches, priorités et critères d'acceptation en français simple A1.
---

# ARTFIT — Gestionnaire de Sprint

## 1. Objectif

Ce skill permet d'organiser le développement d'ARTFIT en sprints courts, clairs et structurés.

Chaque sprint a un but précis, des tâches définies et des critères de réussite vérifiables.

Tout le contenu textuel et humain doit utiliser un **français simple — niveau A1**.

---

## 2. Structure d'un Sprint

Chaque sprint comprend :

1. Numéro et nom du sprint.
2. But principal du sprint.
3. Objectifs détaillés.
4. User Stories.
5. Liste des tâches techniques.
6. Priorités (`HIGH`, `MEDIUM`, `LOW`).
7. Dépendances entre tâches.
8. Critères d'acceptation.
9. Livrables attendus.
10. Stratégie de tests.

---

## 3. Organisation des Fichiers

Chaque dossier de sprint contient :

```
sprints/
├── sprint-01/
│   ├── README.md
│   ├── tasks.md
│   └── presentation.md
```

---

## 4. Gestion des Tâches

Chaque tâche doit avoir :
- Un identifiant (Task ID).
- Un titre clair.
- Une description simple en français (A1).
- Une priorité : `HIGH`, `MEDIUM`, ou `LOW`.
- Un statut : `TODO`, `IN PROGRESS`, `REVIEW`, `TESTING`, `DONE`, `BLOCKED`.
- Des critères d'acceptation clairs.

---

## 5. Règle de Fin de Sprint

Un sprint est terminé uniquement quand :
- Toutes les tâches obligatoires sont au statut `DONE`.
- Les critères d'acceptation sont vérifiés.
- Les tests nécessaires ont été exécutés avec succès.
- La documentation est à jour en français simple.
- La présentation de sprint est prête.
- Le Project Owner valide le résultat final.
