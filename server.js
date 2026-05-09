const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/users', (req, res) => {
  const db = readDB();
  const safe = db.users.map(({ password, ...u }) => u);
  res.json(safe);
});

app.get('/api/users/1', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === 1);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { password, ...safe } = user;
  res.json(safe);
});

app.get('/api/users/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const user = db.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { password, ...safe } = user;
  res.json(safe);
});

app.post('/api/register', (req, res) => {
  const { nombre, correo, password } = req.body;
  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  const db = readDB();
  const exists = db.users.find(u => u.correo === correo);
  if (exists) {
    return res.status(409).json({ error: 'El correo ya está registrado' });
  }
  const newId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
  const newUser = { id: newId, nombre, correo, password };
  db.users.push(newUser);
  writeDB(db);
  const { password: _, ...safe } = newUser;
  res.status(201).json({ message: 'Usuario registrado exitosamente', user: safe });
});

app.post('/api/login', (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }
  const db = readDB();
  const user = db.users.find(u => u.correo === correo && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }
  const { password: _, ...safe } = user;
  res.json({ message: 'Inicio de sesión exitoso', user: safe });
});

app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products);
});

app.get('/api/products/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const product = db.products.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

app.post('/api/cart/validate', (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Se requiere un arreglo de items' });
  }
  const db = readDB();
  const validated = items.map(item => {
    const product = db.products.find(p => p.id === item.id);
    if (!product) return { id: item.id, error: 'Producto no encontrado' };
    return {
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      cantidad: item.cantidad || 1,
      subtotal: (product.precio * (item.cantidad || 1)).toFixed(2)
    };
  });
  const total = validated
    .filter(v => !v.error)
    .reduce((sum, v) => sum + parseFloat(v.subtotal), 0)
    .toFixed(2);
  res.json({ items: validated, total });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
