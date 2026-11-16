/**
 * ARTFIT — Tests Unitaires Business Logic Layer (BLL)
 * Fichier : tests/bll/ProductService.test.js
 * Règle : Teste les règles métier strictes (BR-PRD, BR-PRC, etc.).
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
const BusinessRuleException = require('../../src/bll/validators/BusinessRuleException');

describe('ProductService — Business Logic Layer', () => {
  let db;
  let productService;
  let categoryDAO;

  beforeEach(() => {
    db = DatabaseConnection.createConnection(':memory:', true);
    const productDAO = new ProductDAO(db);
    categoryDAO = new CategoryDAO(db);
    const variantDAO = new VariantDAO(db);
    const inventoryDAO = new InventoryDAO(db);
    const mediaDAO = new MediaDAO(db);

    productService = new ProductService({
      productDAO,
      categoryDAO,
      variantDAO,
      inventoryDAO,
      mediaDAO
    });
  });

  test('BR-PRD-001 : Rejet si le nom a moins de 3 caractères', () => {
    assert.throws(
      () => {
        productService.createProduct({
          name: 'AB',
          base_price: 150.00
        });
      },
      (err) => {
        assert.ok(err instanceof BusinessRuleException);
        assert.equal(err.code, 'BR-PRD-001');
        return true;
      }
    );
  });

  test('BR-PRC-001 & BR-PRC-004 : Rejet si le prix est nul ou négatif', () => {
    assert.throws(
      () => {
        productService.createProduct({
          name: 'Vêtement Gratuit',
          base_price: 0
        });
      },
      (err) => {
        assert.ok(err instanceof BusinessRuleException);
        assert.equal(err.code, 'BR-PRC-001');
        return true;
      }
    );
  });

  test('BR-PRD-002 : Marque ARTFIT et Devise MAD obligatoires', () => {
    const product = productService.createProduct({
      name: 'Veste Cyber',
      base_price: 499.00
    });

    assert.equal(product.brand_name, 'ARTFIT');
    assert.equal(product.currency, 'MAD');
    assert.equal(product.base_price, 499.00);
  });

  test('BR-PRD-003 : Échec de publication si aucune image primaire', () => {
    const cat = categoryDAO.create({ name: 'Hauts', slug: 'hauts' });

    // Créer un produit sans image
    const draft = productService.createProduct({
      name: 'Veste Sans Image',
      category_id: cat.id,
      base_price: 350.00
    });

    // Tenter de publier directement
    assert.throws(
      () => {
        productService.publishProduct(draft.id);
      },
      (err) => {
        assert.ok(err instanceof BusinessRuleException);
        assert.equal(err.code, 'BR-PRD-003');
        return true;
      }
    );
  });

  test('BR-PRD-003 : Publication réussie quand toutes les règles sont validées', () => {
    const cat = categoryDAO.create({ name: 'Vestes', slug: 'vestes' });

    // Créer un produit complet avec catégorie, image et stock
    const product = productService.createProduct({
      name: 'Veste Techwear Complète',
      category_id: cat.id,
      base_price: 750.00,
      image_url: 'https://artfit.ma/images/veste-complete.webp',
      stock_quantity: 25,
      status: 'PUBLISHED'
    });

    assert.equal(product.status, 'PUBLISHED');
    assert.ok(product.media.length > 0);
    assert.ok(product.variants.length > 0);
  });

  test('BR-PRD-004 : Archivage d\'un vêtement', () => {
    const created = productService.createProduct({
      name: 'Pantalon en fin de série',
      base_price: 300.00
    });

    const archived = productService.archiveProduct(created.id);
    assert.equal(archived.status, 'ARCHIVED');
  });
});
