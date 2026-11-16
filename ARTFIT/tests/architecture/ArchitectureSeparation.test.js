/**
 * ARTFIT — Tests de Conformité d'Architecture 3-Tiers
 * Fichier : tests/architecture/ArchitectureSeparation.test.js
 * Règle : Vérifie que le découpage strict des 3 couches est respecté.
 * Couche 1 : Présentation (Controllers, UI)
 * Couche 2 : Logique Métier (Services, Validators)
 * Couche 3 : Accès aux Données (DAOs, SQL)
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

describe('Architecture 3-Tiers — Vérification de l\'Indépendance des Couches', () => {
  const rootSrc = path.join(__dirname, '..', '..', 'src');
  const dalDir = path.join(rootSrc, 'dal');
  const bllDir = path.join(rootSrc, 'bll');
  const presentationDir = path.join(rootSrc, 'presentation');

  test('RÈGLE 1 : La couche Présentation ne doit contenir AUCUN code SQL direct', () => {
    const controllerFiles = fs.readdirSync(path.join(presentationDir, 'controllers'))
      .filter(f => f.endsWith('.js'));

    const sqlKeywords = ['SELECT ', 'INSERT INTO ', 'UPDATE ', 'DELETE FROM ', 'JOIN '];

    controllerFiles.forEach(file => {
      const content = fs.readFileSync(path.join(presentationDir, 'controllers', file), 'utf8');
      sqlKeywords.forEach(keyword => {
        const hasSql = content.toUpperCase().includes(keyword);
        assert.equal(
          hasSql,
          false,
          `Le contrôleur '${file}' ne doit pas contenir de SQL ('${keyword}'). Responsabilité de la DAL.`
        );
      });
    });
  });

  test('RÈGLE 2 : La couche DAL ne doit contenir AUCUNE logique HTTP (req, res, status)', () => {
    const daoFiles = fs.readdirSync(dalDir).filter(f => f.endsWith('.js'));

    daoFiles.forEach(file => {
      const content = fs.readFileSync(path.join(dalDir, file), 'utf8');
      assert.equal(
        content.includes('req.method') || content.includes('res.writeHead') || content.includes('res.end'),
        false,
        `Le DAO '${file}' ne doit pas manipuler les objets HTTP. Responsabilité de la couche Présentation.`
      );
    });
  });

  test('RÈGLE 3 : La couche BLL ne doit pas manipuler directement HTTP', () => {
    const serviceFiles = fs.readdirSync(bllDir).filter(f => f.endsWith('.js'));

    serviceFiles.forEach(file => {
      const content = fs.readFileSync(path.join(bllDir, file), 'utf8');
      assert.equal(
        content.includes('http.createServer') || content.includes('res.writeHead'),
        false,
        `Le service '${file}' ne doit pas démarrer de serveur ou manipuler la réponse HTTP.`
      );
    });
  });

  test('RÈGLE 4 : Tous les prix doivent obligatoirement respecter la devise unique MAD', () => {
    const ProductValidator = require('../../src/bll/validators/ProductValidator');

    // Prix négatif refusé
    assert.throws(() => {
      ProductValidator.validateProductData({ name: 'Veste', base_price: -50 });
    });

    // Devise différente de MAD refusée
    assert.throws(() => {
      ProductValidator.validateProductData({ name: 'Veste', base_price: 150, currency: 'USD' });
    });
  });
});

