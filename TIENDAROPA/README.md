# TiendaRopa — E-commerce

Aplicación web tipo e-commerce con catálogo de productos, carrito de compras, registro e inicio de sesión.

## Requisitos

- Node.js 18+

## Instalación

```bash
cd TIENDAROPA
npm install
```

## Ejecutar el servidor

```bash
npm start
```

El servidor se inicia en **http://localhost:3000**

> **Importante:** No abras el archivo `index.html` directamente en el navegador (doble clic).  
> Debes acceder a través de `http://localhost:3000` para que la API funcione.

## Usuarios de prueba

| Correo           | Contraseña |
|------------------|------------|
| ana@email.com    | 123456     |
| carlos@email.com | abcdef     |

## Ejecutar pruebas

```bash
npm test
```

## Endpoints de la API

| Método | Ruta                | Descripción                     |
|--------|---------------------|---------------------------------|
| GET    | /api/health         | Verificar servidor              |
| GET    | /api/users          | Lista de usuarios (sin pass)    |
| GET    | /api/users/1        | Usuario con id=1 (sin pass)     |
| POST   | /api/register       | Registrar nuevo usuario         |
| POST   | /api/login          | Iniciar sesión                  |
| GET    | /api/products       | Lista de productos              |
| POST   | /api/cart/validate  | Validar items del carrito       |
