/**
 * ARTFIT — Presentation Layer (UI / API Controller)
 * Fichier : ProductController.js
 * Description : Réception des requêtes HTTP, extraction des paramètres et envoi des réponses JSON.
 * Règle 3-Tiers : Couche 1 (Présentation). Ne contient AUCUNE logique métier et AUCUN SQL.
 */

class ProductController {
  /**
   * @param {import('../../bll/ProductService')} productService
   * @param {import('../../bll/InventoryService')} inventoryService
   */
  constructor(productService, inventoryService) {
    this.productService = productService;
    this.inventoryService = inventoryService;
  }

  /**
   * GET /api/products - Liste paginée avec filtres et recherche.
   */
  async getProducts(req, res, query) {
    try {
      const result = this.productService.getProducts({
        page: query.page,
        limit: query.limit,
        search: query.search,
        status: query.status,
        categoryId: query.categoryId,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder
      });
      this.sendJson(res, 200, { success: true, data: result });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  /**
   * GET /api/products/:id - Fiche détaillée d'un vêtement.
   */
  async getProductById(req, res, id) {
    try {
      const product = this.productService.getProductDetails(id);
      this.sendJson(res, 200, { success: true, data: product });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  /**
   * POST /api/products - Création d'un vêtement.
   */
  async createProduct(req, res, body) {
    try {
      const product = this.productService.createProduct(body);
      this.sendJson(res, 201, { success: true, data: product, message: 'Vêtement créé avec succès.' });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  /**
   * PUT /api/products/:id - Modification d'un vêtement.
   */
  async updateProduct(req, res, id, body) {
    try {
      const product = this.productService.updateProduct(id, body);
      this.sendJson(res, 200, { success: true, data: product, message: 'Vêtement mis à jour avec succès.' });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  /**
   * DELETE /api/products/:id - Suppression douce d'un vêtement.
   */
  async deleteProduct(req, res, id) {
    try {
      this.productService.deleteProduct(id);
      this.sendJson(res, 200, { success: true, message: 'Vêtement archivé et supprimé avec succès.' });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  /**
   * POST /api/products/:id/publish - Publication contrôlée.
   */
  async publishProduct(req, res, id) {
    try {
      const product = this.productService.publishProduct(id);
      this.sendJson(res, 200, { success: true, data: product, message: 'Vêtement publié en ligne avec succès.' });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  /**
   * GET /api/stats - Chiffres clés du catalogue.
   */
  async getStats(req, res) {
    try {
      const stats = this.productService.getDashboardStats();
      this.sendJson(res, 200, { success: true, data: stats });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  /**
   * POST /api/inventory/adjust - Ajustement manuel de stock.
   */
  async adjustStock(req, res, body) {
    try {
      const updated = this.inventoryService.adjustStock(body.variant_id, body.quantity_on_hand, body.low_stock_threshold);
      this.sendJson(res, 200, { success: true, data: updated, message: 'Stock mis à jour avec succès.' });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  /**
   * POST /api/inventory/reserve - Réservation temporaire de 60 minutes.
   */
  async reserveStock(req, res, body) {
    try {
      const reservation = this.inventoryService.reserveStock(body.variant_id, body.quantity, body.session_id);
      this.sendJson(res, 200, { success: true, data: reservation, message: 'Articles réservés pour 60 minutes.' });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(payload));
  }

  handleError(res, err) {
    const status = err.statusCode || 500;
    const response = {
      success: false,
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Une erreur interne est survenue.'
    };
    this.sendJson(res, status, response);
  }
}

module.exports = ProductController;

