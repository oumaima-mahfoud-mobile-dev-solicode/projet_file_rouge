/**
 * ARTFIT — Tests Unitaires Business Logic Layer (BLL)
 * Fichier : tests/bll/InventoryService.test.js
 * Règle : Teste l'inventaire physique et la réservation panier de 60 minutes.
 */

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const DatabaseConnection = require('../../src/dal/DatabaseConnection');
const ProductDAO = require('../../src/dal/ProductDAO');
const VariantDAO = require('../../src/dal/VariantDAO');
const InventoryDAO = require('../../src/dal/InventoryDAO');
const InventoryService = require('../../src/bll/InventoryService');
const BusinessRuleException = require('../../src/bll/validators/BusinessRuleException');

describe('InventoryService — Gestion des Stocks et Réservations 60 Min', () => {
  let db;
  let inventoryService;
  let variant;

  beforeEach(() => {
    db = DatabaseConnection.createConnection(':memory:', true);
    const productDAO = new ProductDAO(db);
    const variantDAO = new VariantDAO(db);
    const inventoryDAO = new InventoryDAO(db);

    inventoryService = new InventoryService(inventoryDAO);

    // Créer un produit et une variante pour les tests
    const product = productDAO.create({
      name: 'Cyber Hoodie V1',
      slug: 'cyber-hoodie-v1',
      base_price: 490.00
    });

    variant = variantDAO.create({
      product_id: product.id,
      sku: 'AF-CYBER-M-BLK',
      price_override: null,
      is_active: true
    });

    // Stock initial : 10 unités physiques en stock
    inventoryDAO.create({
      variant_id: variant.id,
      quantity_on_hand: 10,
      low_stock_threshold: 3
    });
  });

  test('BR-INV-001 : Calcul du stock disponible (available = on_hand - reserved)', () => {
    const stock = inventoryService.getStock(variant.id);
    assert.equal(stock.quantity_on_hand, 10);
    assert.equal(stock.quantity_reserved, 0);
    assert.equal(stock.available_quantity, 10);
  });

  test('BR-RES-001 & BR-RES-003 : Réservation temporaire de 60 minutes', () => {
    // Réserver 3 unités pour une session client
    const reservation = inventoryService.reserveStock(variant.id, 3, 'session-client-123');

    assert.ok(reservation.id);
    assert.equal(reservation.quantity, 3);
    assert.equal(reservation.status, 'ACTIVE');

    // Vérifier l'impact immédiat sur le stock disponible
    const stockAfter = inventoryService.getStock(variant.id);
    assert.equal(stockAfter.quantity_on_hand, 10);
    assert.equal(stockAfter.quantity_reserved, 3);
    assert.equal(stockAfter.available_quantity, 7, 'Le stock disponible doit être de 10 - 3 = 7');
  });

  test('BR-RES-002 : Impossible de réserver une quantité supérieure au stock disponible', () => {
    assert.throws(
      () => {
        // Tenter de réserver 15 unités alors qu'il n'y en a que 10
        inventoryService.reserveStock(variant.id, 15, 'session-client-456');
      },
      (err) => {
        assert.ok(err instanceof BusinessRuleException);
        assert.equal(err.code, 'BR-INV-003');
        return true;
      }
    );
  });

  test('Libération manuelle d\'une réservation', () => {
    const res = inventoryService.reserveStock(variant.id, 4, 'session-client-789');
    assert.equal(inventoryService.getStock(variant.id).available_quantity, 6);

    // Annuler la réservation
    const cancelled = inventoryService.cancelReservation(res.id);
    assert.equal(cancelled.status, 'CANCELLED');

    // Le stock disponible doit être restauré à 10
    assert.equal(inventoryService.getStock(variant.id).available_quantity, 10);
  });
});
