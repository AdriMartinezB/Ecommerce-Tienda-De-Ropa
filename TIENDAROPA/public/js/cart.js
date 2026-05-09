let cart = [];

function loadCart() {
  try {
    const saved = localStorage.getItem('tiendaRopaCart');
    if (saved) cart = JSON.parse(saved);
  } catch { cart = []; }
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('tiendaRopaCart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.cantidad++;
  } else {
    cart.push({ ...product, cantidad: 1 });
  }
  saveCart();
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
}

function changeQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    removeFromCart(productId);
  } else {
    saveCart();
  }
}

function getCartTotal() {
  return cart.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
}

function openCart() {
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.cantidad, 0);
  document.getElementById('cartCount').textContent = count;

  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');

  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#888;padding:2rem 0;">Tu carrito está vacío</p>';
    totalEl.textContent = '$0.00';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.imagen}" alt="${item.nombre}" loading="lazy">
      <div class="cart-item-info">
        <h4>${item.nombre}</h4>
        <p>$${item.precio.toFixed(2)}</p>
      </div>
      <div class="cart-item-qty">
        <button onclick="changeQuantity(${item.id}, -1)">−</button>
        <span>${item.cantidad}</span>
        <button onclick="changeQuantity(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');

  totalEl.textContent = `$${getCartTotal().toFixed(2)}`;
}

function checkout() {
  if (cart.length === 0) return;
  if (!currentUser) {
    alert('Debes iniciar sesión para finalizar la compra.');
    closeCart();
    switchView('login');
    return;
  }
  alert('¡Compra realizada con éxito! Gracias por tu pedido.');
  cart = [];
  saveCart();
  closeCart();
}
