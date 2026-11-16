/**
 * ARTFIT — Presentation Layer (UI / API Controller)
 * Fichier : CategoryController.js
 * Description : Contrôleur pour la gestion de la hiérarchie des catégories.
 * Règle 3-Tiers : Couche 1 (Présentation).
 */

class CategoryController {
  /**
   * @param {import('../../bll/CategoryService')} categoryService
   */
  constructor(categoryService) {
    this.categoryService = categoryService;
  }

  async getCategories(req, res, query) {
    try {
      const activeOnly = query.activeOnly === 'true';
      const categories = this.categoryService.getCategories({ activeOnly });
      this.sendJson(res, 200, { success: true, data: categories });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  async getCategoryTree(req, res, query) {
    try {
      const activeOnly = query.activeOnly === 'true';
      const tree = this.categoryService.getCategoryTree({ activeOnly });
      this.sendJson(res, 200, { success: true, data: tree });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  async createCategory(req, res, body) {
    try {
      const category = this.categoryService.createCategory(body);
      this.sendJson(res, 201, { success: true, data: category, message: 'Catégorie créée avec succès.' });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  async updateCategory(req, res, id, body) {
    try {
      const category = this.categoryService.updateCategory(id, body);
      this.sendJson(res, 200, { success: true, data: category, message: 'Catégorie mise à jour avec succès.' });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  async deleteCategory(req, res, id) {
    try {
      this.categoryService.deleteCategory(id);
      this.sendJson(res, 200, { success: true, message: 'Catégorie supprimée avec succès.' });
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

module.exports = CategoryController;

