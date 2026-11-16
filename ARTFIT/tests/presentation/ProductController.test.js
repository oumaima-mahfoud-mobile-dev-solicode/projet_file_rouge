/**
 * ARTFIT — Tests Unitaires Presentation Layer (API Controllers)
 * Fichier : tests/presentation/ProductController.test.js
 * Règle : Vérifie que le contrôleur reçoit les requêtes et formate les réponses JSON.
 */

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const DatabaseConnection = require('../../src/dal/DatabaseConnection');
const ProductDAO = require('../../src/dal/ProductDAO');
const CategoryDAO = require('../../src/dal/CategoryDAO');
const VariantDAO = require('../../src/dal/VariantDAO');
const InventoryDAO = require('../../src/dal/InventoryDAO');
const MediaDAO = require('../../src/dal/MediaDAO');
const ProductService = require('../../src/bll/ProductService');
const InventoryService = require('../../src/bll/InventoryService');
const ProductController = require('../../src/presentation/controllers/ProductController');

// Helper pour simuler Response HTTP Node.js
function createMockResponse() {
  return {
    statusCode: null,
    headers: {},
    body: null,
    writeHead(status, headers) {
      this.statusCode = status;
      this.headers = headers;
    },
    end(content) {
      this.body = content ? JSON.parse(content) : null;
    }
  };
}

describe('ProductController — Presentation Layer', () => {
  let db;
  let controller;
  let productService;

  beforeEach(() => {
    db = DatabaseConnection.createConnection(':memory:', true);
    const productDAO = new ProductDAO(db);
    const categoryDAO = new CategoryDAO(db);
    const variantDAO = new VariantDAO(db);
    const inventoryDAO = new InventoryDAO(db);
    const mediaDAO = new MediaDAO(db);

    productService = new ProductService({ productDAO, categoryDAO, variantDAO, inventoryDAO, mediaDAO });
    const inventoryService = new InventoryService(inventoryDAO);

    controller = new ProductController(productService, inventoryService);
  });

  test('GET /api/products : Retourne 200 et la liste paginée', async () => {
    // Insérer un produit
    productService.createProduct({
      name: 'Sweat À Capuche Tech',
      base_price: 450.00
    });

    const res = createMockResponse();
    await controller.getProducts({}, res, { page: '1', limit: '10' });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.items.length, 1);
    assert.equal(res.body.data.items[0].name, 'Sweat À Capuche Tech');
  });

  test('POST /api/products : Création d\'un vêtement avec statut 201', async () => {
    const res = createMockResponse();
    await controller.createProduct({}, res, {
      name: 'Pantalon Cargo Noir',
      base_price: 550.00,
      stock_quantity: 20
    });

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Pantalon Cargo Noir');
    assert.equal(res.body.data.base_price, 550.00);
  });

  test('POST /api/products : Erreur 400 si le nom est trop court', async () => {
    const res = createMockResponse();
    await controller.createProduct({}, res, {
      name: 'X',
      base_price: 100.00
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.code, 'BR-PRD-001');
  });

  test('DELETE /api/products/:id : Suppression douce avec statut 200', async () => {
    const created = productService.createProduct({
      name: 'Produit Éphémère',
      base_price: 220.00
    });

    const res = createMockResponse();
    await controller.deleteProduct({}, res, created.id);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
  });
});

