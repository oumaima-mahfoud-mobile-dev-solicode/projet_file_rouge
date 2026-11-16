# ARTFIT — SPRINT 01 : BASE DE DONNÉES DU MODULE PRODUITS
## Dossier Officiel de Conception des Données

- **Version :** 1.2.0
- **Statut :** Conception Complète et Validée
- **Date :** 2026-11-16
- **Architecture :** 3-Tiers — Couche d'Accès aux Données (DAL)
- **Langue :** Français simple — Niveau A1

---

## 1. Sommaire des Livrables de Base de Données

Ce dossier contient l'ensemble des spécifications techniques de la base de données :

| Document | Rôle | Lien |
|---|---|---|
| **Règles Métier (`business-rules.md`)** | 43 règles confirmées (prix en MAD, statuts, 3D, stock 60 min). | [business-rules.md](file:///e:/project_file_rouge/ARTFIT/docs/sprints/sprint-01-product-management/database/business-rules.md) |
| **Dictionnaire de Données (`data-dictionary.md`)** | 163 spécifications de champs réparties en 15 groupes. | [data-dictionary.md](file:///e:/project_file_rouge/ARTFIT/docs/sprints/sprint-01-product-management/database/data-dictionary.md) |
| **Questions Ouvertes (`open-questions.md`)** | Suivi des décisions confirmées (MAD, Catégories) et questions en attente. | [open-questions.md](file:///e:/project_file_rouge/ARTFIT/docs/sprints/sprint-01-product-management/database/open-questions.md) |
| **MCD (`mcd.md`)** | Modèle Conceptuel de Données avec diagramme Mermaid et cardinalités. | [mcd.md](file:///e:/project_file_rouge/ARTFIT/docs/sprints/sprint-01-product-management/database/mcd.md) |
| **MLD (`mld.md`)** | Modèle Logique de Données, clés primaires/étrangères et normalisation 3NF. | [mld.md](file:///e:/project_file_rouge/ARTFIT/docs/sprints/sprint-01-product-management/database/mld.md) |
| **MPD Documentation (`mpd.md`)** | Documentation détaillée des 16 tables physiques, types et index. | [mpd.md](file:///e:/project_file_rouge/ARTFIT/docs/sprints/sprint-01-product-management/database/mpd.md) |
| **MPD SQL Script (`mpd.sql`)** | Script DDL complet exécutable avec contraintes, clés et index. | [mpd.sql](file:///e:/project_file_rouge/ARTFIT/docs/sprints/sprint-01-product-management/database/mpd.sql) |

---

## 2. Principes Fondamentaux Confirmés

1. **Devise Unique :** Uniquement `MAD` (Dirham Marocain).
2. **Hiérarchie de Catégories :** Sans limite fixe avec auto-référence (`parent_id`).
3. **Marque Unique :** `ARTFIT`.
4. **Variantes Flexibles :** Gestion dynamique via `attribute_types` et `attribute_values`.
5. **Réservation de Stock :** 60 minutes avec libération automatique.
6. **Support 3D :** Modèles `.glb` avec image 2D de secours obligatoire.

