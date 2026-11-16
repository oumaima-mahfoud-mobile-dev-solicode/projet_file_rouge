/**
 * ARTFIT — Tests Unitaires Data Access Layer (DAL)
 * Fichier : tests/dal/CategoryDAO.test.js
 * Règle : Hiérarchie de catégories sans limite de profondeur (parent_id).
 */

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const DatabaseConnection = require('../../src/dal/DatabaseConnection');
const CategoryDAO = require('../../src/dal/CategoryDAO');

describe('CategoryDAO — Hiérarchie et Arbre', () => {
  let db;
  let categoryDAO;

  beforeEach(() => {
    db = DatabaseConnection.createConnection(':memory:', true);
    categoryDAO = new CategoryDAO(db);
  });

  test('HIÉRARCHIE ILLIMITÉE : Devrait créer 4 niveaux de catégories imbriquées', () => {
    // Niveau 1 : Vêtements
    const lvl1 = categoryDAO.create({
      name: 'Vêtements',
      slug: 'vetements'
    });

    // Niveau 2 : Homme
    const lvl2 = categoryDAO.create({
      name: 'Homme',
      slug: 'homme',
      parent_id: lvl1.id
    });

    // Niveau 3 : Hauts
    const lvl3 = categoryDAO.create({
      name: 'Hauts',
      slug: 'hauts',
      parent_id: lvl2.id
    });

    // Niveau 4 : Hoodies Techwear
    const lvl4 = categoryDAO.create({
      name: 'Hoodies Techwear',
      slug: 'hoodies-techwear',
      parent_id: lvl3.id
    });

    assert.ok(lvl4.id);
    assert.equal(lvl4.parent_id, lvl3.id);

    // Vérifier la construction de l'arbre
    const tree = categoryDAO.findTree();
    assert.equal(tree.length, 1, 'Il doit y avoir 1 seule catégorie racine (Niveau 1)');
    assert.equal(tree[0].name, 'Vêtements');
    assert.equal(tree[0].children.length, 1);
    assert.equal(tree[0].children[0].name, 'Homme');
    assert.equal(tree[0].children[0].children[0].name, 'Hauts');
    assert.equal(tree[0].children[0].children[0].children[0].name, 'Hoodies Techwear');
  });

  test('Vérification de cycle : Devrait détecter les descendants d\'une catégorie', () => {
    const parent = categoryDAO.create({ name: 'Racine', slug: 'racine' });
    const child = categoryDAO.create({ name: 'Enfant', slug: 'enfant', parent_id: parent.id });

    const isDesc = categoryDAO.isDescendantOf(parent.id, child.id);
    assert.equal(isDesc, true, 'L\'enfant doit être reconnu comme descendant du parent');

    const notDesc = categoryDAO.isDescendantOf(child.id, parent.id);
    assert.equal(notDesc, false, 'Le parent n\'est pas descendant de son enfant');
  });
});
