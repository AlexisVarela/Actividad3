const API_BASE = 'http://localhost:3000';

const productoSelect = document.getElementById('productoSelect');
const cantidadInput = document.getElementById('cantidadInput');
const ventaForm = document.getElementById('ventaForm');
const totalResultado = document.getElementById('totalResultado');
const errorMensaje = document.getElementById('errorMensaje');
const tablaInventario = document.querySelector('#tablaInventario tbody');
const btnInventario = document.getElementById('btnInventario');
const tabla = document.getElementById('tablaInventario');

// Agregar producto
const formAgregar = document.getElementById('formAgregarProducto');
const nuevoNombre = document.getElementById('nuevoNombre');
const nuevoPrecio = document.getElementById('nuevoPrecio');
const nuevoInventario = document.getElementById('nuevoInventario');
const mensajeAgregar = document.getElementById('mensajeAgregar');

// Inicial
cargarProductos();

function cargarProductos() {
  fetch(`${API_BASE}/productos`)
    .then(res => res.json())
    .then(data => {
      if (!data.success) throw new Error('Error en la respuesta de productos');
      productoSelect.innerHTML = '<option value="">Selecciona un producto</option>';
      data.data.forEach(producto => {
        const option = document.createElement('option');
        option.value = producto.id;
        option.textContent = `${producto.nombre} ($${producto.precio})`;
        productoSelect.appendChild(option);
      });
    })
    .catch(() => {
      productoSelect.innerHTML = '<option>Error al cargar productos</option>';
      mostrarError('No se pudo conectar con la API');
    });
}

ventaForm.addEventListener('submit', function (e) {
  e.preventDefault();
  limpiarMensajes();

  const productoId = parseInt(productoSelect.value);
  const cantidad = parseInt(cantidadInput.value);

  if (isNaN(productoId) || isNaN(cantidad) || cantidad <= 0) {
    mostrarError('Selecciona un producto válido y una cantidad positiva.');
    return;
  }

  fetch(`${API_BASE}/productos/${productoId}`)
    .then(res => res.json())
    .then(data => {
      const precio = data.data.precio;
      const total = precio * cantidad;
      totalResultado.textContent = `Total a pagar: $${total.toFixed(2)} USD`;

      return fetch(`${API_BASE}/productos/vender/${productoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad })
      });
    })
    .then(res => res.json())
    .then(ventaResult => {
      if (!ventaResult.success) {
        mostrarError(ventaResult.message);
        return;
      }

      totalResultado.textContent += `\nInventario restante: ${ventaResult.data.inventarioRestante}`;
      if (!tabla.classList.contains('hidden')) cargarInventario();
    })
    .catch(() => {
      mostrarError('No se pudo completar la operación.');
    });
});

btnInventario.addEventListener('click', () => {
  tabla.classList.toggle('hidden');
  btnInventario.textContent = tabla.classList.contains('hidden') ? 'Ver Inventario' : 'Ocultar Inventario';
  if (!tabla.classList.contains('hidden')) {
    cargarInventario();
  }
});

function cargarInventario() {
  fetch(`${API_BASE}/productos`)
    .then(res => res.json())
    .then(data => {
      tablaInventario.innerHTML = '';
      data.data.forEach(prod => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${prod.id}</td>
          <td>${prod.nombre}</td>
          <td>$${prod.precio}</td>
          <td>${prod.inventario}</td>
          <td><span class="icono-editar" data-id="${prod.id}" style="cursor:pointer;">🖉</span></td>
          <td><span class="icono-eliminar" data-id="${prod.id}" style="cursor:pointer">🗑️</span></td>
        `;
        tablaInventario.appendChild(row);
      });

      document.getElementById('btnCancelar').addEventListener('click', () => {
        document.getElementById('modalActualizar').style.display = 'none';
      });
      
      
      // Asociar eventos de clic a los íconos
      document.querySelectorAll('.icono-editar').forEach(icono => {
        icono.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          const producto = data.data.find(p => p.id == id);

          // Mostrar modal y llenar campos
          document.getElementById('modalNombre').value = producto.nombre;
          document.getElementById('modalPrecio').value = producto.precio;
          document.getElementById('modalInventario').value = producto.inventario;
          document.getElementById('modalActualizar').style.display = 'block';

          // Guardar cambios
          document.getElementById('btnGuardar').onclick = () => {
            const nuevoNombre = document.getElementById('modalNombre').value;
            const nuevoPrecio = document.getElementById('modalPrecio').value;
            const nuevoInventario = document.getElementById('modalInventario').value;

            fetch(`${API_BASE}/productos/${id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                nombre: nuevoNombre,
                precio: nuevoPrecio,
                inventario: nuevoInventario
              })
            })
            .then(res => res.json())
            .then(result => {
              alert('Producto actualizado con éxito');
              document.getElementById('modalActualizar').style.display = 'none';
              cargarInventario(); // refrescar
            });
          };
        });
      });

      // Asociar eventos de clic a los íconos de eliminar
      document.querySelectorAll('.icono-eliminar').forEach(icono => {
        icono.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          if (confirm('¿Estás seguro de eliminar este producto?')) {
            fetch(`${API_BASE}/productos/${id}`, {
              method: 'DELETE'
            })
            .then(res => res.json())
            .then(result => {
              alert(result.message);
              cargarInventario(); // refrescar
            });
          }
        });
      });

    });
}

formAgregar.addEventListener('submit', function (e) {
  e.preventDefault();
  mensajeAgregar.textContent = '';
  limpiarMensajes();

  const nuevoProducto = {
    nombre: nuevoNombre.value.trim(),
    precio: parseFloat(nuevoPrecio.value),
    inventario: parseInt(nuevoInventario.value)
  };

  if (
    !nuevoProducto.nombre ||
    isNaN(nuevoProducto.precio) ||
    isNaN(nuevoProducto.inventario) ||
    nuevoProducto.precio <= 0 ||
    nuevoProducto.inventario < 0
  ) {
    mensajeAgregar.textContent = 'Por favor, completa todos los campos correctamente.';
    return;
  }

  fetch(`${API_BASE}/productoNuevo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoProducto)
  })
    .then(res => res.json())
    .then(result => {
      if (!result.success) {
        mensajeAgregar.textContent = `Error: ${result.message}`;
        return;
      }

      mensajeAgregar.textContent = 'Producto agregado correctamente.';
      formAgregar.reset();
      cargarProductos();
      if (!tabla.classList.contains('hidden')) cargarInventario();
    })
    .catch(() => {
      mensajeAgregar.textContent = 'Error al agregar producto.';
    });
});

function mostrarError(msg) {
  errorMensaje.textContent = msg;
}

function limpiarMensajes() {
  totalResultado.textContent = '';
  errorMensaje.textContent = '';
  mensajeAgregar.textContent = '';
}

