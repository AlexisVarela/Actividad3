const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware para JSON y archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simulación base de datos
let productos = [
    { id: 1, nombre: 'Laptop', precio: 1200, inventario: 10 },
    { id: 2, nombre: 'Tablet', precio: 600, inventario: 15 },
    { id: 3, nombre: 'Mouse', precio: 20, inventario: 50 },
    { id: 4, nombre: 'Monitor', precio: 400, inventario: 8 }
];

// Endpoints API
app.get('/productos', (req, res) => {
    res.json({ success: true, count: productos.length, data: productos });
});

app.get('/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID debe ser un número' });
    }
    const producto = productos.find(p => p.id === id);
    if (!producto) {
        return res.status(404).json({ success: false, message: `Producto con ID ${id} no encontrado` });
    }
    res.json({ success: true, data: producto });
});

app.post('/productoNuevo', (req, res) => {
    const { nombre, precio, inventario } = req.body;
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ success: false, message: 'Nombre es requerido y debe ser una cadena no vacía' });
    }
    if (isNaN(precio) || Number(precio) <= 0) {
        return res.status(400).json({ success: false, message: 'Precio debe ser un número positivo' });
    }
    if (isNaN(inventario) || Number(inventario) < 0) {
        return res.status(400).json({ success: false, message: 'Inventario debe ser un número igual o mayor a cero' });
    }

    const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
    const nuevoProducto = {
        id: nuevoId,
        nombre: nombre.trim(),
        precio: Number(precio),
        inventario: Number(inventario)
    };
    productos.push(nuevoProducto);
    res.status(201).json({ success: true, message: 'Producto creado exitosamente', data: nuevoProducto });
});

app.patch('/productos/vender/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { cantidad } = req.body;
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID debe ser un número' });
    }
    if (!cantidad || isNaN(cantidad) || Number(cantidad) <= 0) {
        return res.status(400).json({ success: false, message: 'Cantidad debe ser un número positivo' });
    }

    const producto = productos.find(p => p.id === id);
    if (!producto) {
        return res.status(404).json({ success: false, message: `Producto con ID ${id} no encontrado` });
    }

    if (producto.inventario < cantidad) {
        return res.status(400).json({ success: false, message: 'Inventario insuficiente para realizar la venta' });
    }

    producto.inventario -= cantidad;
    res.json({
        success: true,
        message: `Venta realizada. Se descontaron ${cantidad} unidades.`,
        data: {
            id: producto.id,
            nombre: producto.nombre,
            inventarioRestante: producto.inventario
        }
    });
});

// ruta para editar productos 
app.patch('/productos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, precio, inventario } = req.body;

  const producto = productos.find(p => p.id === id);
  if (!producto) {
    return res.status(404).json({ success: false, message: 'Producto no encontrado' });
  }

  if (nombre && typeof nombre === 'string' && !isNaN(precio) && precio > 0 && !isNaN(inventario) && inventario >= 0) {
    producto.nombre = nombre.trim();
    producto.precio = Number(precio);
    producto.inventario = Number(inventario);
  } else
    {
        return res.status(400).json({ success: false, message: 'Datos inválidos para actualizar el producto' });
    }

  return res.json({
    success: true,
    message: 'Producto actualizado',
    data: producto
  });
});

// ruta para eliminar productos
app.delete('/productos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = productos.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Producto no encontrado' });
  }

  productos.splice(index, 1);
  return res.json({ success: true, message: 'Producto eliminado exitosamente' });
});



// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
