const API = '';

let currentUser = null;

function showMessage(el, text, type) {
  el.textContent = text;
  el.className = `message ${type}`;
}

async function handleRegister(e) {
  e.preventDefault();
  const nombre = document.getElementById('regNombre').value.trim();
  const correo = document.getElementById('regCorreo').value.trim();
  const password = document.getElementById('regPassword').value;
  const msg = document.getElementById('registerMessage');

  if (!nombre || !correo || !password) {
    showMessage(msg, 'Todos los campos son obligatorios', 'error');
    return;
  }
  if (password.length < 6) {
    showMessage(msg, 'La contraseña debe tener al menos 6 caracteres', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, password })
    });
    const data = await res.json();
    if (res.ok) {
      showMessage(msg, 'Registro exitoso. Ahora puedes iniciar sesión.', 'success');
      document.getElementById('registerForm').reset();
      setTimeout(() => switchView('login'), 1200);
    } else {
      showMessage(msg, data.error, 'error');
    }
  } catch {
    showMessage(msg, 'Error de conexión con el servidor', 'error');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const correo = document.getElementById('loginCorreo').value.trim();
  const password = document.getElementById('loginPassword').value;
  const msg = document.getElementById('loginMessage');

  if (!correo || !password) {
    showMessage(msg, 'Todos los campos son obligatorios', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password })
    });
    const data = await res.json();
    if (res.ok) {
      currentUser = data.user;
      showMessage(msg, `Bienvenido, ${data.user.nombre}`, 'success');
      document.getElementById('loginForm').reset();
      updateAuthNav();
      setTimeout(() => switchView('catalog'), 1000);
    } else {
      showMessage(msg, data.error, 'error');
    }
  } catch {
    showMessage(msg, 'Error de conexión con el servidor', 'error');
  }
}

function logout() {
  currentUser = null;
  updateAuthNav();
  switchView('catalog');
}

function updateAuthNav() {
  const nav = document.querySelector('nav');
  if (currentUser) {
    nav.innerHTML = `
      <span style="color:#e94560;font-weight:600;">${currentUser.nombre}</span>
      <a href="#" id="logoutLink">Cerrar Sesión</a>
    `;
    document.getElementById('logoutLink').addEventListener('click', e => {
      e.preventDefault();
      logout();
    });
  } else {
    nav.innerHTML = `
      <a href="#" data-view="catalog">Catálogo</a>
      <a href="#" data-view="login">Iniciar Sesión</a>
      <a href="#" data-view="register">Registrarse</a>
    `;
  }
  document.querySelectorAll('nav a[data-view]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      switchView(a.dataset.view);
    });
  });
}
