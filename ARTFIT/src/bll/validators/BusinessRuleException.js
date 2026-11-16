/**
 * ARTFIT — Business Logic Layer (BLL)
 * Fichier : BusinessRuleException.js
 * Description : Erreurs personnalisées pour les règles métier ARTFIT.
 * Règle 3-Tiers : Couche 2 (Logique Métier - BLL).
 */

class BusinessRuleException extends Error {
  /**
   * @param {string} code - Identifiant de la règle (ex : 'BR-PRD-003', 'BR-PRC-004')
   * @param {string} message - Message explicatif en français simple (A1)
   * @param {number} statusCode - Code d'état HTTP correspondant (ex : 400, 404, 409)
   */
  constructor(code, message, statusCode = 400) {
    super(message);
    this.name = 'BusinessRuleException';
    this.code = code;
    this.statusCode = statusCode;
  }
}

module.exports = BusinessRuleException;

