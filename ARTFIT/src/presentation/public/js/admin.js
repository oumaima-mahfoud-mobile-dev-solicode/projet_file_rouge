/**
 * ARTFIT — Admin CRUD JavaScript Client
 * Couche Présentation : Requêtes HTTP Fetch vers les APIs REST ARTFIT
 * Langue : Français Simple A1
 */

// Détection automatique de l'URL de l'API (gère localhost:3000, Live Server 5500 et file://)
const API_BASE = (typeof window !== 'undefined' && window.location.origin && window.location.origin.includes(':3000'))
  ? ''
  : 'http://localhost:3000';

// État local de la page
const state = {
  page: 1,
  limit: 10,
  totalPages: 1,
  search: '',
  status: '',
  categoryId: '',
  categories: [],
  editingId: null
};

// Éléments du DOM
const dom = {
  tableBody: document.getElementById('productsTableBody'),
  searchInput: document.getElementById('searchInput'),
  statusFilter: document.getElementById('statusFilter'),
  categoryFilter: document.getElementById('categoryFilter'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),
  paginationInfo: document.getElementById('paginationInfo'),
  kpiTotal: document.getElementById('kpi-total'),
  kpiPublished: document.getElementById('kpi-published'),
  kpiDraft: document.getElementById('kpi-draft'),
  kpiLowStock: document.getElementById('kpi-low-stock'),
  // Modals
  createModal: document.getElementById('createModal'),
  modalTitle: document.getElementById('modalTitle'),
  productForm: document.getElementById('productForm'),
  formName: document.getElementById('formName'),
  formCategory: document.getElementById('formCategory'),
  formPrice: document.getElementById('formPrice'),
  formDescription: document.getElementById('formDescription'),
  formStock: document.getElementById('formStock'),
  formStatus: document.getElementById('formStatus'),
  formImage: document.getElementById('formImage'),
  form3D: document.getElementById('form3D'),
  btnOpenCreateModal: document.getElementById('btnOpenCreateModal'),
  stockModal: document.getElementById('stockModal'),
  stockForm: document.getElementById('stockForm'),
  stockVariantId: document.getElementById('stockVariantId'),
  stockProductName: document.getElementById('stockProductName'),
  stockQuantity: document.getElementById('stockQuantity'),
  stockThreshold: document.getElementById('stockThreshold'),
  alertToast: document.getElementById('alertToast'),
  toastMessage: document.getElementById('toastMessage')
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadCategories();
  await loadDashboardStats();
  await loadProducts();
});

// Écouteurs d'événements
function setupEventListeners() {
  // Recherche en direct avec debounce
  let searchTimeout;
  dom.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.search = e.target.value.trim();
      state.page = 1;
      loadProducts();
    }, 300);
  });

  // Filtre statut
  dom.statusFilter.addEventListener('change', (e) => {
    state.status = e.target.value;
    state.page = 1;
    loadProducts();
  });

  // Filtre catégorie
  dom.categoryFilter.addEventListener('change', (e) => {
    state.categoryId = e.target.value;
    state.page = 1;
    loadProducts();
  });

  // Pagination
  dom.prevPageBtn.addEventListener('click', () => {
    if (state.page > 1) {
      state.page--;
      loadProducts();
    }
  });

  dom.nextPageBtn.addEventListener('click', () => {
    if (state.page < state.totalPages) {
      state.page++;
      loadProducts();
    }
  });

  // Ouverture du modal création
  dom.btnOpenCreateModal.addEventListener('click', () => {
    resetProductForm();
    dom.modalTitle.textContent = 'Ajouter un nouveau vêtement';
    openModal(dom.createModal);
  });

  // Fermeture des modals
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(dom.createModal);
      closeModal(dom.stockModal);
    });
  });

  // Soumission du formulaire vêtement (Création ou Modification)
  dom.productForm.addEventListener('submit', handleSaveProduct);

  // Soumission du formulaire de stock
  dom.stockForm.addEventListener('submit', handleSaveStock);
}

// 1. Charger les catégories
async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/categories`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      state.categories = json.data;

      // Remplir le filtre
      dom.categoryFilter.innerHTML = '<option value="">Toutes catégories</option>';
      dom.formCategory.innerHTML = '<option value="">Sélectionner une catégorie</option>';

      state.categories.forEach(cat => {
        const optFilter = document.createElement('option');
        optFilter.value = cat.id;
        optFilter.textContent = cat.name;
        dom.categoryFilter.appendChild(optFilter);

        const optForm = document.createElement('option');
        optForm.value = cat.id;
        optForm.textContent = cat.name;
        dom.formCategory.appendChild(optForm);
      });
    }
  } catch (err) {
    showToast('Erreur de chargement des catégories', 'danger');
  }
}

// 2. Charger les KPIs
async function loadDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}/api/stats`);
    const json = await res.json();
    if (json.success && json.data) {
      dom.kpiTotal.textContent = json.data.total_products || 0;
      dom.kpiPublished.textContent = json.data.published_products || 0;
      dom.kpiDraft.textContent = json.data.draft_products || 0;
      dom.kpiLowStock.textContent = json.data.low_stock_alerts || 0;
    }
  } catch (err) {
    console.error('Erreur stats:', err);
  }
}

// 3. Charger la liste des produits
async function loadProducts() {
  dom.tableBody.innerHTML = `
    <tr>
      <td colspan="7" class="empty-state">Chargement en cours...</td>
    </tr>
  `;

  const params = new URLSearchParams({
    page: state.page,
    limit: state.limit
  });
  if (state.search) params.append('search', state.search);
  if (state.status) params.append('status', state.status);
  if (state.categoryId) params.append('categoryId', state.categoryId);

  try {
    const res = await fetch(`${API_BASE}/api/products?${params.toString()}`);
    const json = await res.json();

    if (!json.success || !json.data || json.data.items.length === 0) {
      dom.tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">Aucun vêtement trouvé pour cette recherche.</td>
        </tr>
      `;
      dom.paginationInfo.textContent = '0 vêtement';
      dom.prevPageBtn.disabled = true;
      dom.nextPageBtn.disabled = true;
      return;
    }

    const { items, total, totalPages } = json.data;
    state.totalPages = totalPages;

    // Rendu du tableau
    dom.tableBody.innerHTML = items.map(p => {
      const statusBadge = getStatusBadge(p.status);
      const stockOnHand = p.total_stock_on_hand || 0;
      const stockReserved = p.total_stock_reserved || 0;
      const available = Math.max(0, stockOnHand - stockReserved);

      const has3D = p.model_3d_url || p.has_3d;
      const thumb = p.primary_image_url
        ? `<img src="${p.primary_image_url}" alt="${escapeHtml(p.name)}" onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerText='👕';">`
        : '👕';

      return `
        <tr>
          <td>
            <div class="thumb-cell">
              ${thumb}
              ${has3D ? '<span class="thumb-3d-badge">3D</span>' : ''}
            </div>
          </td>
          <td>
            <strong style="color: #fff; font-size: 0.95rem;">${escapeHtml(p.name)}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
              REF: ${escapeHtml(p.slug || p.id.slice(0, 8))}
            </div>
          </td>
          <td>
            <span style="font-weight: 500; color: var(--text-secondary);">
              ${escapeHtml(p.primary_category_name || 'Non classé')}
            </span>
          </td>
          <td>
            <strong style="font-family: 'Space Grotesk'; font-size: 1.05rem; color: #fff;">
              ${Number(p.base_price).toFixed(2)}
            </strong>
            <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700;">MAD</span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              <strong style="color: ${available <= 5 ? 'var(--danger)' : 'var(--success)'};">
                ${available} pcs
              </strong>
              ${stockReserved > 0 ? `<span style="font-size: 0.75rem; color: var(--warning);">(${stockReserved} rés.)</span>` : ''}
            </div>
          </td>
          <td>
            ${statusBadge}
          </td>
          <td style="text-align: right;">
            <div class="actions-cell" style="justify-content: flex-end;">
              ${p.status === 'DRAFT' ? `
                <button class="btn btn-cyan" style="padding: 4px 10px; font-size: 0.75rem;" onclick="handlePublishProduct('${p.id}')">
                  Publier
                </button>
              ` : ''}
              <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="openEditModal('${p.id}')">
                Modifier
              </button>
              <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="openStockModal('${p.id}', '${escapeHtml(p.name)}')">
                Stock
              </button>
              <button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.75rem;" onclick="handleDeleteProduct('${p.id}', '${escapeHtml(p.name)}')">
                Supprimer
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Mise à jour de la pagination
    dom.paginationInfo.textContent = `Page ${state.page} sur ${totalPages} (${total} vêtement${total > 1 ? 's' : ''})`;
    dom.prevPageBtn.disabled = state.page <= 1;
    dom.nextPageBtn.disabled = state.page >= totalPages;

  } catch (err) {
    console.error('Erreur admin products:', err);
    dom.tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state" style="color: var(--danger);">
          <div style="font-weight: 600; margin-bottom: 6px;">Impossible de contacter le serveur ARTFIT.</div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 10px;">Le serveur doit être allumé sur http://localhost:3000</p>
          <button class="btn btn-secondary" onclick="loadProducts()">🔄 Réessayer</button>
        </td>
      </tr>
    `;
    showToast('Erreur serveur lors de la récupération des vêtements', 'danger');
  }
}

// 4. Gestion Enregistrer (Créer ou Modifier)
async function handleSaveProduct(e) {
  e.preventDefault();

  const name = dom.formName.value.trim();
  const categoryId = dom.formCategory.value;
  const price = parseFloat(dom.formPrice.value);
  const description = dom.formDescription.value.trim();
  const stock = parseInt(dom.formStock.value, 10);
  const status = dom.formStatus.value;
  const image = dom.formImage.value.trim();
  const model3D = dom.form3D.value.trim();

  if (!name || name.length < 3) {
    showToast('Le nom doit contenir au moins 3 caractères.', 'danger');
    return;
  }
  if (isNaN(price) || price <= 0) {
    showToast('Le prix en MAD doit être supérieur à 0.', 'danger');
    return;
  }

  const payload = {
    name,
    category_id: categoryId || null,
    base_price: price,
    description: description || null,
    status,
    stock_quantity: isNaN(stock) ? 10 : stock,
    image_url: image || null,
    model_3d_url: model3D || null
  };

  try {
    let url = `${API_BASE}/api/products`;
    let method = 'POST';

    if (state.editingId) {
      url = `${API_BASE}/api/products/${state.editingId}`;
      method = 'PUT';
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      showToast(json.message || 'Impossible d\'enregistrer le vêtement.', 'danger');
      return;
    }

    closeModal(dom.createModal);
    showToast(state.editingId ? 'Vêtement modifié avec succès !' : 'Nouveau vêtement créé avec succès !', 'success');
    resetProductForm();
    await loadDashboardStats();
    await loadProducts();

  } catch (err) {
    showToast('Erreur réseau lors de l\'enregistrement.', 'danger');
  }
}

// 5. Ouvrir le modal d'édition pré-rempli
window.openEditModal = async function(id) {
  try {
    const res = await fetch(`${API_BASE}/api/products/${id}`);
    const json = await res.json();

    if (!json.success || !json.data) {
      showToast('Impossible de charger ce vêtement.', 'danger');
      return;
    }

    const p = json.data;
    state.editingId = p.id;
    dom.modalTitle.textContent = `Modifier : ${p.name}`;

    dom.formName.value = p.name;
    dom.formCategory.value = p.primary_category_id || '';
    dom.formPrice.value = p.base_price;
    dom.formDescription.value = p.description || '';
    dom.formStatus.value = p.status;

    // Récupérer le stock
    const primaryVariant = p.variants && p.variants[0];
    dom.formStock.value = primaryVariant ? primaryVariant.quantity_on_hand : 15;

    // Image & 3D
    dom.formImage.value = (p.media && p.media.length > 0) ? p.media[0].url : (p.primary_image_url || '');
    dom.form3D.value = p.model_3d ? p.model_3d.model_url : '';

    openModal(dom.createModal);
  } catch (err) {
    showToast('Erreur de chargement du vêtement', 'danger');
  }
};

// 6. Publier directement un produit
window.handlePublishProduct = async function(id) {
  if (!confirm('Voulez-vous publier ce vêtement dans la boutique en ligne ?')) return;

  try {
    const res = await fetch(`${API_BASE}/api/products/${id}/publish`, { method: 'POST' });
    const json = await res.json();

    if (!res.ok || !json.success) {
      showToast(json.message || 'Validation échouée : Vérifiez le prix, la catégorie et les médias.', 'danger');
      return;
    }

    showToast('Vêtement publié dans la boutique avec succès !', 'success');
    await loadDashboardStats();
    await loadProducts();
  } catch (err) {
    showToast('Erreur réseau lors de la publication', 'danger');
  }
};

// 7. Supprimer / Archiver un produit
window.handleDeleteProduct = async function(id, name) {
  if (!confirm(`Confirmez-vous la suppression du vêtement "${name}" ?`)) return;

  try {
    const res = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
    const json = await res.json();

    if (!res.ok || !json.success) {
      showToast(json.message || 'Impossible de supprimer.', 'danger');
      return;
    }

    showToast('Vêtement supprimé et archivé avec succès.', 'success');
    await loadDashboardStats();
    await loadProducts();
  } catch (err) {
    showToast('Erreur réseau lors de la suppression.', 'danger');
  }
};

// 8. Gestion de stock rapide
window.openStockModal = async function(productId, productName) {
  try {
    const res = await fetch(`${API_BASE}/api/products/${productId}`);
    const json = await res.json();
    if (!json.success || !json.data) return;

    const p = json.data;
    const variant = p.variants && p.variants[0];
    if (!variant) {
      showToast('Aucune variante trouvée pour ce vêtement.', 'danger');
      return;
    }

    dom.stockProductName.textContent = `${productName} (SKU: ${variant.sku})`;
    dom.stockVariantId.value = variant.id;
    dom.stockQuantity.value = variant.quantity_on_hand || 0;
    dom.stockThreshold.value = variant.low_stock_threshold || 5;

    openModal(dom.stockModal);
  } catch (err) {
    showToast('Erreur lors de la lecture du stock', 'danger');
  }
};

async function handleSaveStock(e) {
  e.preventDefault();
  const variantId = dom.stockVariantId.value;
  const quantity = parseInt(dom.stockQuantity.value, 10);
  const threshold = parseInt(dom.stockThreshold.value, 10);

  try {
    const res = await fetch(`${API_BASE}/api/inventory/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variant_id: variantId,
        quantity_on_hand: quantity,
        low_stock_threshold: threshold
      })
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      showToast(json.message || 'Erreur mise à jour stock', 'danger');
      return;
    }

    closeModal(dom.stockModal);
    showToast('Stock mis à jour avec succès !', 'success');
    await loadDashboardStats();
    await loadProducts();
  } catch (err) {
    showToast('Erreur réseau stock', 'danger');
  }
}

// Helpers Utilitaires
function getStatusBadge(status) {
  switch (status) {
    case 'PUBLISHED':
      return '<span class="badge badge-success">En ligne</span>';
    case 'DRAFT':
      return '<span class="badge badge-draft">Brouillon</span>';
    case 'ARCHIVED':
      return '<span class="badge badge-warning">Archivé</span>';
    default:
      return `<span class="badge badge-draft">${escapeHtml(status)}</span>`;
  }
}

function openModal(modalEl) {
  modalEl.style.display = 'flex';
}

function closeModal(modalEl) {
  modalEl.style.display = 'none';
}

function resetProductForm() {
  state.editingId = null;
  dom.productForm.reset();
  dom.modalTitle.textContent = 'Ajouter un nouveau vêtement';
}

function showToast(message, type = 'success') {
  dom.toastMessage.textContent = message;
  dom.alertToast.className = `alert-toast ${type}`;
  dom.alertToast.style.display = 'flex';

  setTimeout(() => {
    dom.alertToast.style.display = 'none';
  }, 3500);
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

