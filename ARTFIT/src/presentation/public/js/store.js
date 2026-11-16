/**
 * ARTFIT — Storefront JavaScript Client (Boutique Publique)
 * Couche Présentation : Affichage exclusif des produits publiés (status = PUBLISHED)
 * Devise stricte : MAD (Dirham Marocain)
 * Langue : Français Simple A1
 */

// Détection automatique de l'URL de l'API (gère localhost:3000, Live Server 5500 et file://)
const API_BASE = (typeof window !== 'undefined' && window.location.origin && window.location.origin.includes(':3000'))
  ? ''
  : 'http://localhost:3000';

// État local de la boutique
const storeState = {
  products: [],
  categories: [],
  selectedCategory: '',
  search: '',
  selectedProduct: null,
  selectedSize: 'M',
  selectedColor: 'Noir Mat',
  cart: [],
  sessionId: 'sess-' + Math.random().toString(36).substring(2, 9),
  reservationExpiry: null,
  timerInterval: null
};

// Éléments du DOM
const storeDom = {
  grid: document.getElementById('publicProductGrid'),
  categoryPills: document.getElementById('categoryPills'),
  searchInput: document.getElementById('storeSearchInput'),
  openCartBtn: document.getElementById('openCartBtn'),
  closeCartBtn: document.getElementById('closeCartBtn'),
  cartDrawer: document.getElementById('cartDrawer'),
  cartCountBadge: document.getElementById('cartCountBadge'),
  cartItemsList: document.getElementById('cartItemsList'),
  cartSubtotal: document.getElementById('cartSubtotal'),
  reservationCountdownBox: document.getElementById('reservationCountdownBox'),
  countdownTimer: document.getElementById('countdownTimer'),
  // Modal Détail
  detailModal: document.getElementById('productDetailModal'),
  modalDetailTitle: document.getElementById('modalDetailTitle'),
  modalDetailName: document.getElementById('modalDetailName'),
  modalDetailCat: document.getElementById('modalDetailCat'),
  modalDetailPrice: document.getElementById('modalDetailPrice'),
  modalDetailDesc: document.getElementById('modalDetailDesc'),
  modalDetailStock: document.getElementById('modalDetailStock'),
  addToCartBtn: document.getElementById('addToCartBtn'),
  sizeSelector: document.getElementById('sizeSelector'),
  colorSelector: document.getElementById('colorSelector'),
  cube3D: document.getElementById('cube3D')
};

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', async () => {
  setupStoreEvents();
  await loadStoreCategories();
  await loadPublishedProducts();
});

window.loadPublishedProducts = loadPublishedProducts;

// Événements
function setupStoreEvents() {
  // Recherche en direct
  let timeout;
  storeDom.searchInput.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      storeState.search = e.target.value.trim();
      loadPublishedProducts();
    }, 300);
  });

  // Panier
  storeDom.openCartBtn.addEventListener('click', () => {
    storeDom.cartDrawer.classList.add('open');
  });

  storeDom.closeCartBtn.addEventListener('click', () => {
    storeDom.cartDrawer.classList.remove('open');
  });

  // Fermer modal de détail
  document.querySelectorAll('.close-store-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      storeDom.detailModal.style.display = 'none';
    });
  });

  // Sélection Taille
  storeDom.sizeSelector.addEventListener('click', (e) => {
    if (e.target.classList.contains('option-btn')) {
      storeDom.sizeSelector.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      e.target.classList.add('selected');
      storeState.selectedSize = e.target.textContent;
    }
  });

  // Sélection Couleur
  storeDom.colorSelector.addEventListener('click', (e) => {
    if (e.target.classList.contains('option-btn')) {
      storeDom.colorSelector.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      e.target.classList.add('selected');
      storeState.selectedColor = e.target.textContent;

      // Effet visuel sur le cube 3D
      if (storeState.selectedColor === 'Noir Mat') {
        storeDom.cube3D.style.borderColor = 'var(--accent-cyan)';
      } else if (storeState.selectedColor === 'Gris Cyber') {
        storeDom.cube3D.style.borderColor = '#9CA3AF';
      } else {
        storeDom.cube3D.style.borderColor = 'var(--primary)';
      }
    }
  });

  // Bouton Ajouter au Panier (Réservation)
  storeDom.addToCartBtn.addEventListener('click', handleAddToCart);
}

// 1. Charger les catégories pour la boutique
async function loadStoreCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/categories`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      storeState.categories = json.data;

      // Bouton "Tous"
      storeDom.categoryPills.innerHTML = `
        <button class="cat-pill active" data-id="">Tous les vêtements</button>
      `;

      storeState.categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'cat-pill';
        btn.dataset.id = cat.id;
        btn.textContent = cat.name;
        btn.addEventListener('click', () => {
          storeDom.categoryPills.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          storeState.selectedCategory = cat.id;
          loadPublishedProducts();
        });
        storeDom.categoryPills.appendChild(btn);
      });

      // Écouteur pour le bouton "Tous"
      storeDom.categoryPills.firstElementChild.addEventListener('click', (e) => {
        storeDom.categoryPills.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        storeState.selectedCategory = '';
        loadPublishedProducts();
      });
    }
  } catch (err) {
    console.error('Erreur chargement catégories boutique:', err);
  }
}

// 2. Charger UNIQUEMENT les produits PUBLIÉS
async function loadPublishedProducts() {
  storeDom.grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
      Chargement des vêtements en ligne...
    </div>
  `;

  // Règle stricte : status=PUBLISHED obligatoire pour les clients publics
  const params = new URLSearchParams({
    status: 'PUBLISHED',
    limit: 50
  });

  if (storeState.search) params.append('search', storeState.search);
  if (storeState.selectedCategory) params.append('categoryId', storeState.selectedCategory);

  try {
    const res = await fetch(`${API_BASE}/api/products?${params.toString()}`);
    const json = await res.json();

    if (!json.success || !json.data || json.data.items.length === 0) {
      storeDom.grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <h3 style="color: #fff; margin-bottom: 8px;">Aucun vêtement disponible actuellement</h3>
          <p style="color: var(--text-secondary);">Veuillez vérifier vos critères de recherche ou visiter l'espace administrateur pour publier des produits.</p>
        </div>
      `;
      return;
    }

    storeState.products = json.data.items;

    // Rendu des cartes de vêtements
    storeDom.grid.innerHTML = storeState.products.map(p => {
      const has3D = p.model_3d_url || p.has_3d;
      const thumb = p.primary_image_url
        ? `<img src="${p.primary_image_url}" alt="${escapeHtml(p.name)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerText='👕';">`
        : '👕';

      const priceMAD = Number(p.base_price).toFixed(2);
      const stockAvailable = Math.max(0, (p.total_stock_on_hand || 0) - (p.total_stock_reserved || 0));

      return `
        <article class="product-card" onclick="openProductDetail('${p.id}')">
          <div class="card-img">
            ${thumb}
            ${has3D ? '<span class="card-badge badge badge-3d">✦ Modèle 3D Actif</span>' : ''}
          </div>
          <div class="card-body">
            <span class="card-cat">${escapeHtml(p.primary_category_name || 'Collection ARTFIT')}</span>
            <h3 class="card-title">${escapeHtml(p.name)}</h3>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto;">
              <div class="card-price">
                ${priceMAD} <span>MAD</span>
              </div>
              <span style="font-size: 0.78rem; font-weight: 600; color: ${stockAvailable > 5 ? 'var(--success)' : 'var(--warning)'};">
                ${stockAvailable > 0 ? `${stockAvailable} en stock` : 'Épuisé'}
              </span>
            </div>
            <button class="btn btn-secondary" style="width: 100%; margin-top: 14px; font-size: 0.8rem;">
              Voir en 3D / Réserver
            </button>
          </div>
        </article>
      `;
    }).join('');

  } catch (err) {
    console.error('Erreur API Boutique :', err);
    storeDom.grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: rgba(239,68,68,0.08); border: 1px dashed var(--danger); border-radius: 8px;">
        <h4 style="color: var(--danger); margin-bottom: 6px;">Connexion au serveur ARTFIT</h4>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 12px;">
          Le serveur Node.js est accessible sur <strong>http://localhost:3000</strong>.
        </p>
        <button class="btn btn-cyan" onclick="loadPublishedProducts()">
          🔄 Recharger le catalogue
        </button>
      </div>
    `;
  }
}

// 3. Ouvrir la fiche détaillée et simulation 3D
window.openProductDetail = async function(id) {
  try {
    const res = await fetch(`${API_BASE}/api/products/${id}`);
    const json = await res.json();
    if (!json.success || !json.data) return;

    const p = json.data;
    storeState.selectedProduct = p;

    storeDom.modalDetailTitle.textContent = 'ARTFIT 3D FASHION VIEWER';
    storeDom.modalDetailName.textContent = p.name;
    storeDom.modalDetailCat.textContent = p.primary_category_name || 'COLLECTION ARTFIT';
    storeDom.modalDetailPrice.textContent = Number(p.base_price).toFixed(2);
    storeDom.modalDetailDesc.textContent = p.description || 'Vêtement de haute confection ARTFIT conçu avec des textiles respirants et durables.';

    const primaryVariant = p.variants && p.variants[0];
    const available = primaryVariant ? Math.max(0, primaryVariant.quantity_on_hand - (primaryVariant.quantity_reserved || 0)) : 10;

    storeDom.modalDetailStock.textContent = available > 0
      ? `✔ ${available} pièces disponibles en stock physique`
      : '✖ Actuellement en rupture de stock';
    storeDom.modalDetailStock.style.color = available > 0 ? 'var(--success)' : 'var(--danger)';

    storeDom.addToCartBtn.disabled = available <= 0;

    storeDom.detailModal.style.display = 'flex';
  } catch (err) {
    console.error('Erreur ouverture détail:', err);
  }
};

// 4. Ajouter au Panier avec Réservation de 60 minutes (BR-RES-001)
async function handleAddToCart() {
  if (!storeState.selectedProduct) return;

  const product = storeState.selectedProduct;
  const variant = product.variants && product.variants[0];
  const variantId = variant ? variant.id : null;

  if (!variantId) {
    alert('Impossible de réserver : variante introuvable.');
    return;
  }

  try {
    // Appel API pour réserver le stock physiquement
    const res = await fetch(`${API_BASE}/api/inventory/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variant_id: variantId,
        quantity: 1,
        session_id: storeState.sessionId
      })
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      alert(json.message || 'Impossible de réserver cette pièce (stock indisponible).');
      return;
    }

    // Ajouter à l'état local du panier
    storeState.cart.push({
      productId: product.id,
      name: product.name,
      price: Number(product.base_price),
      size: storeState.selectedSize,
      color: storeState.selectedColor,
      reservationId: json.data.id
    });

    // Mettre à jour l'expiration (60 minutes à partir de maintenant)
    storeState.reservationExpiry = new Date(Date.now() + 60 * 60 * 1000);
    startReservationTimer();

    // Mettre à jour l'UI
    updateCartUI();
    storeDom.detailModal.style.display = 'none';
    storeDom.cartDrawer.classList.add('open');

    // Rafraîchir l'affichage du stock
    await loadPublishedProducts();

  } catch (err) {
    alert('Erreur réseau lors de la réservation du vêtement.');
  }
}

// 5. Mettre à jour le panier
function updateCartUI() {
  storeDom.cartCountBadge.textContent = storeState.cart.length;

  if (storeState.cart.length === 0) {
    storeDom.cartItemsList.innerHTML = `
      <p style="color: var(--text-secondary); text-align: center; margin-top: 40px;">Votre panier est vide.</p>
    `;
    storeDom.cartSubtotal.textContent = '0.00 MAD';
    storeDom.reservationCountdownBox.style.display = 'none';
    return;
  }

  storeDom.reservationCountdownBox.style.display = 'flex';

  let total = 0;
  storeDom.cartItemsList.innerHTML = storeState.cart.map((item, idx) => {
    total += item.price;
    return `
      <div class="cart-item">
        <div>
          <strong style="color: #fff; font-size: 0.95rem;">${escapeHtml(item.name)}</strong>
          <div style="font-size: 0.75rem; color: var(--accent-cyan); margin-top: 3px;">
            Taille : ${escapeHtml(item.size)} | Couleur : ${escapeHtml(item.color)}
          </div>
          <div style="font-size: 0.72rem; color: var(--warning); margin-top: 2px;">
            ✦ Stock réservé 60 min
          </div>
        </div>
        <div style="text-align: right;">
          <strong style="color: #fff; font-family: 'Space Grotesk';">
            ${item.price.toFixed(2)} MAD
          </strong>
          <div>
            <button onclick="removeCartItem(${idx})" style="background: none; border: none; color: var(--danger); font-size: 0.75rem; cursor: pointer; margin-top: 4px;">
              Retirer
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  storeDom.cartSubtotal.textContent = `${total.toFixed(2)} MAD`;
}

// 6. Retirer un article du panier
window.removeCartItem = function(index) {
  storeState.cart.splice(index, 1);
  if (storeState.cart.length === 0) {
    clearInterval(storeState.timerInterval);
    storeState.reservationExpiry = null;
  }
  updateCartUI();
};

// 7. Timer de compte à rebours 60 minutes
function startReservationTimer() {
  if (storeState.timerInterval) clearInterval(storeState.timerInterval);

  storeState.timerInterval = setInterval(() => {
    if (!storeState.reservationExpiry) {
      clearInterval(storeState.timerInterval);
      return;
    }

    const diff = storeState.reservationExpiry.getTime() - Date.now();
    if (diff <= 0) {
      clearInterval(storeState.timerInterval);
      storeDom.countdownTimer.textContent = '00:00 - Expiré';
      alert('Votre réservation de 60 minutes a expiré. Le stock a été libéré.');
      storeState.cart = [];
      updateCartUI();
      loadPublishedProducts();
      return;
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    storeDom.countdownTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, 1000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

