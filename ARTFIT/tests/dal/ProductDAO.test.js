/**
 * ARTFIT — Tests Unitaires Data Access Layer (DAL)
 * Fichier : tests/dal/ProductDAO.test.js
 * Règle : Teste les opérations CRUD directes en base de données.
 */

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const DatabaseConnection = require('../../src/dal/DatabaseConnection');
const ProductDAO = require('../../src/dal/ProductDAO');
const CategoryDAO = require('../../src/dal/CategoryDAO');

describe('ProductDAO — Data Access Layer', () => {
  let db;
  let productDAO;
  let categoryDAO;

  beforeEach(() => {
    // Utiliser une base SQLite en mémoire pour chaque test isolé
    db = DatabaseConnection.createConnection(':memory:', true);
    productDAO = new ProductDAO(db);
    categoryDAO = new CategoryDAO(db);
  });

  test('CREATE : Devrait insérer un nouveau produit avec succès', () => {
    const product = productDAO.create({
      name: 'Veste Techwear Imperméable',
      slug: 'veste-techwear-impermeable',
      description: 'Veste technique haute résistance',
      base_price: 890.00,
      currency: 'MAD',
      brand_name: 'ARTFIT',
      status: 'DRAFT'
    });

    assert.ok(product.id, 'Le produit doit posséder un identifiant UUID');
    assert.equal(product.name, 'Veste Techwear Imperméable');
    assert.equal(product.base_price, 890.00);
    assert.equal(product.currency, 'MAD');
    assert.equal(product.brand_name, 'ARTFIT');
    assert.equal(product.status, 'DRAFT');
    assert.equal(product.deleted_at, null);
  });

  test('READ : Devrait retrouver un produit par son ID et son Slug', () => {
    const created = productDAO.create({
      name: 'Cargo Pants Cyberpunk',
      slug: 'cargo-pants-cyberpunk',
      base_price: 520.00
    });

    const byId = productDAO.findById(created.id);
    assert.ok(byId);
    assert.equal(byId.name, 'Cargo Pants Cyberpunk');

    const bySlug = productDAO.findBySlug('cargo-pants-cyberpunk');
    assert.ok(bySlug);
    assert.equal(bySlug.id, created.id);
  });

  test('UPDATE : Devrait modifier les informations du produit', () => {
    const created = productDAO.create({
      name: 'T-Shirt Basique',
      slug: 't-shirt-basique',
      base_price: 200.00
    });

    const updated = productDAO.update(created.id, {
      name: 'T-Shirt Techwear Oversize',
      base_price: 250.00,
      status: 'PUBLISHED'
    });

    assert.equal(updated.name, 'T-Shirt Techwear Oversize');
    assert.equal(updated.base_price, 250.00);
    assert.equal(updated.status, 'PUBLISHED');
  });

  test('DELETE (Soft Delete) : Devrait marquer deleted_at sans effacer la ligne', () => {
    const created = productDAO.create({
      name: 'Article à Supprimer',
      slug: 'article-a-supprimer',
      base_price: 100.00
    });

    const deleted = productDAO.softDelete(created.id);
    assert.equal(deleted, true);

    // Ne doit plus apparaître via findById classique
    const notFound = productDAO.findById(created.id);
    assert.equal(notFound, null, 'Le produit soft-deleted ne doit plus être visible');

    // Vérification directe en base que la ligne existe avec un timestamp deleted_at
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(created.id);
    assert.ok(row, 'La ligne physique doit toujours exister');
    assert.ok(row.deleted_at, 'Le champ deleted_at doit contenir la date d\'archivage');
  });

  test('PAGINATION & RECHERCHE : Devrait filtrer et paginer les résultats', () => {
    // Insérer 5 produits de test
    for (let i = 1; i <= 5; i++) {
      productDAO.create({
        name: `Vêtement Test ${i}`,
        slug: `vetement-test-${i}`,
        base_price: 100.00 * i,
        status: i % 2 === 0 ? 'PUBLISHED' : 'DRAFT'
      });
    }

    // Test de la pagination : limit 2, page 1
    const page1 = productDAO.findMany({ page: 1, limit: 2 });
    assert.equal(page1.items.length, 2);
    assert.equal(page1.total, 5);
    assert.equal(page1.totalPages, 3);

    // Test du filtre statut
    const publishedOnly = productDAO.findMany({ status: 'PUBLISHED' });
    assert.equal(publishedOnly.total, 2);
    publishedOnly.items.forEach(p => assert.equal(p.status, 'PUBLISHED'));

    // Test de recherche textuelle
    const searchResult = productDAO.findMany({ search: 'Test 3' });
    assert.equal(searchResult.total, 1);
    assert.equal(searchResult.items[0].name, 'Vêtement Test 3');
  });

  test('RELATIONS : Devrait associer une catégorie à un produit', () => {
    const cat = categoryDAO.create({
      name: 'Pantalons Techniques',
      slug: 'pantalons-techniques'
    });

    const prod = productDAO.create({
      name: 'Pantalon Modulaire',
      slug: 'pantalon-modulaire',
      base_price: 600.00
    });

    productDAO.assignCategory(prod.id, cat.id, true);

    const detailed = productDAO.findById(prod.id);
    assert.equal(detailed.primary_category_id, cat.id);
    assert.equal(detailed.primary_category_name, 'Pantalons Techniques');
  });
});
