const http = require('http');

const BASE = 'http://localhost:3000';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { 'Content-Type': 'application/json' }
    };
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

async function run() {
  const tests = [];
  let passed = 0;
  let failed = 0;

  function it(name, fn) {
    tests.push({ name, fn });
  }

  // ─── Pruebas ───────────────────────────────────────────

  it('GET /api/health — servidor activo', async () => {
    const r = await request('GET', '/api/health');
    assert(r.status === 200, `Expected 200 got ${r.status}`);
    assert(r.data.status === 'ok');
  });

  it('GET /api/users/1 — retorna usuario con id 1', async () => {
    const r = await request('GET', '/api/users/1');
    assert(r.status === 200, `Expected 200 got ${r.status}`);
    assert(r.data.id === 1, 'Expected id 1');
    assert(r.data.nombre === 'Ana García', `Expected "Ana García" got "${r.data.nombre}"`);
    assert(r.data.correo === 'ana@email.com');
    assert(r.data.password === undefined, 'Password should not be exposed');
  });

  it('GET /api/users/999 — usuario no encontrado', async () => {
    const r = await request('GET', '/api/users/999');
    assert(r.status === 404, `Expected 404 got ${r.status}`);
    assert(r.data.error === 'Usuario no encontrado');
  });

  it('POST /api/register — registro exitoso', async () => {
    const r = await request('POST', '/api/register', {
      nombre: 'Test User',
      correo: `test${Date.now()}@test.com`,
      password: 'test123'
    });
    assert(r.status === 201, `Expected 201 got ${r.status}`);
    assert(r.data.message === 'Usuario registrado exitosamente');
    assert(r.data.user.nombre === 'Test User');
    assert(r.data.user.password === undefined, 'Password should not be exposed');
  });

  it('POST /api/register — campos obligatorios', async () => {
    const r = await request('POST', '/api/register', { nombre: 'Incompleto' });
    assert(r.status === 400, `Expected 400 got ${r.status}`);
    assert(r.data.error === 'Todos los campos son obligatorios');
  });

  it('POST /api/register — correo duplicado', async () => {
    const r = await request('POST', '/api/register', {
      nombre: 'Dup',
      correo: 'ana@email.com',
      password: '123456'
    });
    assert(r.status === 409, `Expected 409 got ${r.status}`);
    assert(r.data.error === 'El correo ya está registrado');
  });

  it('POST /api/login — credenciales correctas', async () => {
    const r = await request('POST', '/api/login', {
      correo: 'ana@email.com',
      password: '123456'
    });
    assert(r.status === 200, `Expected 200 got ${r.status}`);
    assert(r.data.message === 'Inicio de sesión exitoso');
    assert(r.data.user.nombre === 'Ana García');
    assert(r.data.user.password === undefined, 'Password should not be exposed');
  });

  it('POST /api/login — credenciales incorrectas', async () => {
    const r = await request('POST', '/api/login', {
      correo: 'ana@email.com',
      password: 'wrongpass'
    });
    assert(r.status === 401, `Expected 401 got ${r.status}`);
    assert(r.data.error === 'Credenciales incorrectas');
  });

  it('POST /api/login — campos vacíos', async () => {
    const r = await request('POST', '/api/login', { correo: '', password: '' });
    assert(r.status === 400, `Expected 400 got ${r.status}`);
  });

  it('GET /api/products — lista de productos', async () => {
    const r = await request('GET', '/api/products');
    assert(r.status === 200, `Expected 200 got ${r.status}`);
    assert(Array.isArray(r.data), 'Expected array');
    assert(r.data.length >= 1, 'Expected at least 1 product');
    assert(r.data[0].nombre, 'Product should have nombre');
    assert(r.data[0].precio, 'Product should have precio');
    assert(r.data[0].imagen, 'Product should have imagen');
  });

  it('POST /api/cart/validate — validar items del carrito', async () => {
    const r = await request('POST', '/api/cart/validate', {
      items: [
        { id: 1, cantidad: 2 },
        { id: 3, cantidad: 1 }
      ]
    });
    assert(r.status === 200, `Expected 200 got ${r.status}`);
    assert(Array.isArray(r.data.items), 'Expected items array');
    assert(r.data.items.length === 2, 'Expected 2 items');
    assert(parseFloat(r.data.total) > 0, `Expected total > 0, got ${r.data.total}`);
    const camiseta = r.data.items.find(i => i.id === 1);
    assert(camiseta, 'Expected product id 1 in validation');
    assert(camiseta.subtotal, 'Expected subtotal field');
  });

  it('POST /api/cart/validate — producto inexistente', async () => {
    const r = await request('POST', '/api/cart/validate', {
      items: [{ id: 999, cantidad: 1 }]
    });
    assert(r.status === 200, `Expected 200 got ${r.status}`);
    assert(r.data.items[0].error === 'Producto no encontrado');
  });

  // ─── Runner ────────────────────────────────────────────

  console.log('\n🧪  Pruebas Funcionales — TiendaRopa API\n');

  for (const t of tests) {
    try {
      await t.fn();
      console.log(`  ✓  ${t.name}`);
      passed++;
    } catch (err) {
      console.log(`  ✗  ${t.name}`);
      console.log(`     ${err.message}`);
      failed++;
    }
  }

  const total = passed + failed;
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Total: ${total}  |  ✓ ${passed}  |  ✗ ${failed}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('\n  ✗ Error al ejecutar pruebas:', err.message);
  console.log('\n  Asegúrate de que el servidor esté corriendo (npm start)\n');
  process.exit(1);
});
