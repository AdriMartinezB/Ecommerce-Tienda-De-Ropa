function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${viewId}`);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const msgBoxes = document.querySelectorAll('.message');
  msgBoxes.forEach(m => { m.className = 'message'; m.textContent = ''; });
}

async function loadProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '<p style="text-align:center;color:#888;">Cargando productos...</p>';
  try {
    const res = await fetch(`${API}/api/products`);
    const products = await res.json();
    if (!Array.isArray(products) || products.length === 0) {
      grid.innerHTML = '<p style="text-align:center;color:#888;">No hay productos disponibles.</p>';
      return;
    }
    grid.innerHTML = products.map(p => `
      <div class="product-card">
        <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
        <div class="info">
          <span class="category">${p.categoria || ''}</span>
          <h3>${p.nombre}</h3>
          <p class="price">$${p.precio.toFixed(2)}</p>
          <button onclick="addToCart({id:${p.id},nombre:'${p.nombre.replace(/'/g, "\\'")}',precio:${p.precio},imagen:'${p.imagen}'})">Agregar al carrito</button>
        </div>
      </div>
    `).join('');
  } catch {
    grid.innerHTML = '<p style="text-align:center;color:#e94560;">Error al cargar productos. Verifica que el servidor esté corriendo.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  loadProducts();

  document.querySelectorAll('nav a[data-view]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      switchView(a.dataset.view);
    });
  });

  document.getElementById('registerForm').addEventListener('submit', handleRegister);
  document.getElementById('loginForm').addEventListener('submit', handleLogin);

  document.getElementById('cartToggleBtn').addEventListener('click', openCart);
  document.getElementById('cartCloseBtn').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeCart();
  });
  document.getElementById('checkoutBtn').addEventListener('click', checkout);

  document.querySelectorAll('.auth-switch a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      switchView(a.dataset.view);
    });
  });
});
