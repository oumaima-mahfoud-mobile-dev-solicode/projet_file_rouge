/**
 * ARTFIT — Architecture 3-Tiers Application Server
 * Fichier : app.js
 * Description : Point d'entrée de l'application ARTFIT.
 * Initialise :
 *   1. Data Access Layer (DAL) : Connexion SQLite et DAOs.
 *   2. Business Logic Layer (BLL) : Services et Règles Métier.
 *   3. Presentation Layer (UI) : Contrôleurs REST et Serveur Web.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');

// 1. Couche DAL
const DatabaseConnection = require('./dal/DatabaseConnection');
const ProductDAO = require('./dal/ProductDAO');
const CategoryDAO = require('./dal/CategoryDAO');
const VariantDAO = require('./dal/VariantDAO');
const InventoryDAO = require('./dal/InventoryDAO');
const MediaDAO = require('./dal/MediaDAO');

// 2. Couche BLL
const ProductService = require('./bll/ProductService');
const CategoryService = require('./bll/CategoryService');
const InventoryService = require('./bll/InventoryService');

// 3. Couche Présentation
const ProductController = require('./presentation/controllers/ProductController');
const CategoryController = require('./presentation/controllers/CategoryController');

function createApplication(dbPath = null) {
  // DAL
  const db = DatabaseConnection.createConnection(dbPath);
  const productDAO = new ProductDAO(db);
  const categoryDAO = new CategoryDAO(db);
  const variantDAO = new VariantDAO(db);
  const inventoryDAO = new InventoryDAO(db);
  const mediaDAO = new MediaDAO(db);

  // BLL
  const productService = new ProductService({ productDAO, categoryDAO, variantDAO, inventoryDAO, mediaDAO });
  const categoryService = new CategoryService(categoryDAO);
  const inventoryService = new InventoryService(inventoryDAO);

  // Présentation
  const productController = new ProductController(productService, inventoryService);
  const categoryController = new CategoryController(categoryService);

  const publicDir = path.join(__dirname, 'presentation', 'public');

  // Serveur HTTP
  const server = http.createServer(async (req, res) => {
    // Activer CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
    const method = req.method;

    // Helper pour lire le corps JSON
    const readBody = () => new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try { resolve(data ? JSON.parse(data) : {}); }
        catch { resolve({}); }
      });
    });

    // =========================================================================
    // ROUTAGE API REST (Architecture 3-Tiers : Couche Présentation)
    // =========================================================================

    // 1. STATS DASHBOARD
    if (pathname === '/api/stats' && method === 'GET') {
      return productController.getStats(req, res);
    }

    // 2. PRODUITS
    if (pathname === '/api/products' && method === 'GET') {
      return productController.getProducts(req, res, query);
    }
    if (pathname === '/api/products' && method === 'POST') {
      const body = await readBody();
      return productController.createProduct(req, res, body);
    }

    // Routes /api/products/:id/...
    const productDetailMatch = pathname.match(/^\/api\/products\/([a-zA-Z0-9-]+)$/);
    if (productDetailMatch) {
      const id = productDetailMatch[1];
      if (method === 'GET') return productController.getProductById(req, res, id);
      if (method === 'PUT') {
        const body = await readBody();
        return productController.updateProduct(req, res, id, body);
      }
      if (method === 'DELETE') return productController.deleteProduct(req, res, id);
    }

    const publishMatch = pathname.match(/^\/api\/products\/([a-zA-Z0-9-]+)\/publish$/);
    if (publishMatch && method === 'POST') {
      return productController.publishProduct(req, res, publishMatch[1]);
    }

    // 3. CATÉGORIES
    if (pathname === '/api/categories' && method === 'GET') {
      return categoryController.getCategories(req, res, query);
    }
    if (pathname === '/api/categories/tree' && method === 'GET') {
      return categoryController.getCategoryTree(req, res, query);
    }
    if (pathname === '/api/categories' && method === 'POST') {
      const body = await readBody();
      return categoryController.createCategory(req, res, body);
    }
    const catDetailMatch = pathname.match(/^\/api\/categories\/([a-zA-Z0-9-]+)$/);
    if (catDetailMatch) {
      const id = catDetailMatch[1];
      if (method === 'PUT') {
        const body = await readBody();
        return categoryController.updateCategory(req, res, id, body);
      }
      if (method === 'DELETE') return categoryController.deleteCategory(req, res, id);
    }

    // 4. INVENTAIRE & RÉSERVATIONS
    if (pathname === '/api/inventory/adjust' && method === 'POST') {
      const body = await readBody();
      return productController.adjustStock(req, res, body);
    }
    if (pathname === '/api/inventory/reserve' && method === 'POST') {
      const body = await readBody();
      return productController.reserveStock(req, res, body);
    }

    // =========================================================================
    // SERVEUR DE FICHIERS STATIQUES (UI WEB & MOBILE)
    // =========================================================================
    let filePath = path.join(publicDir, pathname === '/' ? 'index.html' : pathname);

    // Sécurité : éviter Directory Traversal
    if (!filePath.startsWith(publicDir)) {
      res.writeHead(403);
      res.end('Accès refusé.');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Page non trouvée.');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.webp': 'image/webp',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.glb': 'model/gltf-binary'
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    });
  });

  return {
    server,
    db,
    services: { productService, categoryService, inventoryService }
  };
}

// Lancement automatique si exécuté directement (node src/app.js)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const { server } = createApplication();

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`ARTFIT 3-TIERS PLATFORM RUNNING`);
    console.log(`Accès Boutique Publique : http://localhost:${PORT}/`);
    console.log(`Accès Espace Admin      : http://localhost:${PORT}/admin.html`);
    console.log(`API REST Endpoints      : http://localhost:${PORT}/api/products`);
    console.log(`Devise officielle       : MAD (Dirham Marocain)`);
    console.log(`=======================================================`);
  });
}

module.exports = { createApplication };

