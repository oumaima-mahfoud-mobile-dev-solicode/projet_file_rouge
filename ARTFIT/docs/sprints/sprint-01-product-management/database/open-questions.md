# ARTFIT — SPRINT 01 : QUESTIONS OUVERTES POUR LE PROJECT OWNER
## Module : Gestion des Produits (CRUD)

- **Version du document :** 1.2.0
- **Statut :** En cours de validation par le Project Owner
- **Date de mise à jour :** 2026-11-16
- **Architecture obligatoire :** Architecture 3-Tiers (Présentation, Logique Métier, Accès aux Données)
- **Langue du document :** Français simple — Niveau A1
- **Périmètre :** Marque unique ARTFIT — Sprint 01 : Gestion des Produits

---

## 1. But du Document

Ce document liste les questions techniques et fonctionnelles du projet ARTFIT.

Selon les règles fondamentales d'ARTFIT (`AGENTS.md`) :
> *"Ne jamais décider à la place du Project Owner."*
> *"Ne jamais inventer de règles métier manquantes."*

Pour chaque question :
- Les questions résolues sont dans la section **Décisions Confirmées**.
- Les questions non résolues restent dans la section **Questions en Attente**.

---

## 2. Décisions Confirmées par le Project Owner

Cette section enregistre les décisions officielles validées pour ARTFIT.

### OQ-001 : Devise Unique de la Boutique — MAD (Dirham Marocain)

- **Identifiant :** `OQ-001`
- **Sujet :** Monnaie de la boutique ARTFIT.
- **Statut :** **CONFIRMÉE par le Project Owner** (2026-11-16).
- **Décision officielle :**
  1. **Devise unique :** `MAD` (Dirham marocain).
  2. **Nom :** Dirham marocain.
  3. **Périmètre Sprint 01 :** ARTFIT utilise seulement le `MAD`.
  4. **Application générale :** Tous les prix, remises, coupons, commandes et paiements utilisent obligatoirement le `MAD`.
  5. **Pas de conversion :** Aucune conversion en EUR ou USD dans le Sprint 01.
  6. **Pas de multi-devises :** Aucun système multi-devises dans le Sprint 01.
- **Règle métier créée :** `BR-PRC-004`.
- **Impact sur les données :** Le champ `currency` a la valeur par défaut `'MAD'` et accepte uniquement `'MAD'`.

---

### OQ-002 : Profondeur des Catégories — Hiérarchie Sans Limite Fixe

- **Identifiant :** `OQ-002`
- **Sujet :** Nombre de niveaux sous les catégories (hiérarchie).
- **Statut :** **CONFIRMÉE par la consigne de Sprint** (2026-11-16).
- **Décision officielle :**
  1. **Hiérarchie sans limite fixe :** Le système permet une arborescence de catégories libre et sans limite rigide.
  2. **Structure relationnelle :** Chaque sous-catégorie pointe vers sa catégorie parente avec `parent_id` (auto-référence sur la table `categories`).
  3. **Catégorie racine :** Une catégorie principale a `parent_id = NULL`.
  4. **Sous-catégories infinies :** Une catégorie peut avoir des enfants à l'infini (exemple : Vêtements → Homme → Hauts → Vestes → Cuir).
  5. **Désactivation en cascade :** Quand une catégorie parente est désactivée (`is_active = false`), toutes ses sous-catégories sont automatiquement masquées du menu client (`BR-CAT-002`).
- **Règle métier associée :** `BR-CAT-001`, `BR-CAT-002`.
- **Impact sur les données :** La table `categories` utilise `parent_id UUID NULL REFERENCES categories(id) ON DELETE RESTRICT`.

---

## 3. Tableau Récapitulatif des Questions en Attente

Il reste **8 questions ouvertes** en attente de validation par le Project Owner :

| Identifiant | Sujet | Priorité | Choix Actuel par Défaut | Étape de Décision |
|---|---|:---:|---|---|
| `OQ-003` | Suppression Douce (Soft Delete) | **HAUTE** | Suppression douce (`deleted_at`) | Spécification des Requêtes (DAL) |
| `OQ-004` | Moteur d'Expiration des 60 Minutes | **HAUTE** | Mixte (Contrôle au vol + tâche toutes les 2 min) | Architecture Métier (BLL) |
| `OQ-005` | Suivi des Clients Invités (Sans Compte) | **HAUTE** | Jeton de session + Email à l'étape paiement | Sécurité et Métier (BLL) |
| `OQ-006` | Limites de Poids pour les Fichiers 3D | **MOYENNE** | Maximum 25 Mo par fichier `.glb` | Pipeline 3D |
| `OQ-007` | Modèle de Création des SKU et Coupons | **BASSE** | Modèle automatique : `AF-{CAT}-{ID}-{VAR}` | Outils Métier (BLL) |
| `OQ-008` | Prix TTC ou Prix Hors Taxe (TVA) | **MOYENNE** | Prix affiché Toutes Taxes Comprises (TTC) | Moteur de Calcul des Prix |
| `OQ-009` | Précommandes en Cas de Rupture de Stock | **BASSE** | Blocage strict si stock = 0 (`false`) | Moteur d'Inventaire |
| `OQ-010` | Ordre de Calcul des Réductions Cumulées | **MOYENNE** | Pourcentage calculé avant le montant fixe | Moteur de Promotions |

---

## 4. Détail des Questions Ouvertes en Attente

---

### OQ-003 : Suppression Douce (Soft Delete) vs Suppression Définitive

- **Sujet :** Suppression des vêtements et des variantes.
- **Ce qui manque :**
  Quand un administrateur supprime un vêtement, doit-on garder la ligne en base avec une date `deleted_at`, ou effacer la ligne pour toujours ?
- **Pourquoi c'est important :**
  La suppression douce permet de garder l'historique des anciennes commandes. Mais elle demande de gérer les codes SKU uniques pour ne pas bloquer une future réutilisation.
- **Options possibles :**
  - **Option A (Recommandée) :** Suppression douce (`deleted_at`). Le code SKU n'est unique que pour les articles non supprimés. Effacement définitif permis uniquement pour les brouillons jamais vendus.
  - **Option B :** Pas de suppression pour les articles publiés : on utilise uniquement le statut `ARCHIVED`.
  - **Option C :** Suppression définitive immédiate avec copie des textes sur les lignes de commande.

---

### OQ-004 : Moteur d'Expiration des 60 Minutes

- **Sujet :** Libération automatique du stock réservé.
- **Ce qui manque :**
  Comment le système doit-il libérer les articles quand les 60 minutes de réservation sont finies ?
- **Pourquoi c'est important :**
  Si le système attend qu'un autre client clique pour vérifier l'heure, un vêtement peut paraître en rupture alors que la réservation est finie.
- **Options possibles :**
  - **Option A (Recommandée) :** Solution mixte : une petite tâche automatique tourne toutes les 2 minutes pour libérer le stock, et le site revérifie aussi l'heure à chaque ajout au panier.
  - **Option B :** Vérification uniquement au moment où un client ajoute l'article au panier (sans tâche de fond).
  - **Option C :** Tâche de fond exécutée toutes les 30 secondes.

---

### OQ-005 : Suivi des Clients Invités (Sans Compte)

- **Sujet :** Réservation de stock pour les clients non connectés.
- **Ce qui manque :**
  Comment identifier un client invité pour lui réserver son stock pendant 60 minutes et limiter l'usage d'un coupon à 1 fois par personne ?
- **Pourquoi c'est important :**
  Un utilisateur malveillant pourrait ouvrir 20 fenêtres privées pour bloquer tout le stock sans payer.
- **Options possibles :**
  - **Option A (Recommandée) :** Demander l'email du client dès le début de l'étape de paiement avant de bloquer le stock. L'email sert à vérifier la limite du coupon.
  - **Option B :** Utiliser un jeton de session dans le navigateur, mais limiter les coupons à usage unique aux clients avec un compte connecté.
  - **Option C :** Rendre la création de compte obligatoire pour passer commande.

---

### OQ-006 : Limites de Poids pour les Fichiers 3D

- **Sujet :** Poids et performance des modèles 3D.
- **Ce qui manque :**
  Quelle est la taille maximale autorisée pour un fichier 3D de vêtement ?
- **Pourquoi c'est important :**
  Un fichier 3D trop lourd (plus de 30 Mo) fait planter le navigateur sur un téléphone portable et ralentit la boutique.
- **Options possibles :**
  - **Option A (Recommandée) :** Limite maximale à 20 ou 25 Mo par fichier `.glb`. Les graphistes 3D doivent fournir des modèles légers et optimisés pour mobile.
  - **Option B :** Mettre deux fichiers par vêtement : un fichier très léger pour smartphone et un fichier très détaillé pour ordinateur.
  - **Option C :** Compresser automatiquement les fichiers 3D sur le serveur lors de l'envoi.

---

### OQ-007 : Modèle de Création des SKU et Coupons

- **Sujet :** Format des codes créés automatiquement.
- **Ce qui manque :**
  Quel modèle de texte préférez-vous pour les codes SKU et les codes promo automatiques ?
- **Pourquoi c'est important :**
  Les codes SKU doivent être faciles à lire sur les étiquettes en dépôt. Les codes promo doivent éviter les lettres et chiffres qui se ressemblent (comme le chiffre 0 et la lettre O).
- **Options possibles :**
  - **Option A (Recommandée) :** 
    - *SKU :* Format clair avec la catégorie et la taille (exemple : `AF-VES-101-L-NOIR`).
    - *Coupon :* Code court de 8 lettres et chiffres faciles à lire (exemple : `AF-8F9K-2M7X`).
  - **Option B :** Numéros aléatoires simples.
  - **Option C :** Modèle entièrement personnalisable par l'administrateur dans les réglages.

---

### OQ-008 : Prix TTC ou Prix Hors Taxe (TVA)

- **Sujet :** Affichage de la taxe sur le site.
- **Ce qui manque :**
  Les prix affichés en vitrine contiennent-ils déjà la TVA (TTC), ou la taxe s'ajoute-t-elle au panier ?
- **Pourquoi c'est important :**
  Au Maroc et en Europe, la loi oblige à afficher le prix Toutes Taxes Comprises (TTC) pour les particuliers.
- **Options possibles :**
  - **Option A (Recommandée) :** Les prix saisis et affichés sont Toutes Taxes Comprises (TTC). La facture extrait la part de TVA (20%) pour la comptabilité.
  - **Option B :** Les prix sont saisis Hors Taxe (HT) et la taxe de 20% s'ajoute au moment du paiement.

---

### OQ-009 : Précommandes en Cas de Rupture de Stock

- **Sujet :** Vente quand le stock est à zéro.
- **Ce qui manque :**
  Est-ce qu'ARTFIT souhaite autoriser les précommandes pour les vêtements très demandés qui n'ont plus de stock ?
- **Pourquoi c'est important :**
  La règle validée `BR-INV-003` bloque l'achat dès que le stock arrive à zéro.
- **Options possibles :**
  - **Option A (Recommandée) :** Interdire strictement la vente hors stock pour le Sprint 01 (`allow_backorder = false`). La précommande sera étudiée dans un sprint futur.
  - **Option B :** Ajouter dès maintenant un champ `allow_backorder` par variante pour activer la précommande si besoin.

---

### OQ-010 : Ordre de Calcul des Réductions Cumulées

- **Sujet :** Ordre mathématique des remises combinées.
- **Ce qui manque :**
  Quand un article a une remise en pourcentage (-20%) ET un bon de réduction en dirhams (-100 MAD), quelle remise calcule-t-on en premier ?
- **Pourquoi c'est important :**
  L'ordre change le prix final payé par le client :
  - *Pourcentage d'abord :* $1000 \times 0.8 = 800 - 100 = \mathbf{700\text{ MAD}}$.
  - *Montant fixe d'abord :* $(1000 - 100) \times 0.8 = 900 \times 0.8 = \mathbf{720\text{ MAD}}$.
- **Options possibles :**
  - **Option A (Recommandée) :** Standard du commerce en ligne : calculer toujours les pourcentages en premier, puis déduire les montants fixes en dirhams.
  - **Option B :** Suivre strictement le numéro de séquence choisi par l'administrateur dans `calculation_sequence`.
  - **Option C :** Calculer les deux et donner le prix le plus avantageux pour le client.

---

## 5. Prochaine Étape

L'Architecte de Base de Données prend en compte les 2 décisions confirmées :
1. `OQ-001` : Devise unique `MAD`.
2. `OQ-002` : Hiérarchie de catégories sans limite fixe (`parent_id`).

Les 8 questions restantes restent en attente (`OQ-003` à `OQ-010`) et n'empêchent pas la modélisation complète du MCD, MLD et MPD.
