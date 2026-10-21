// MODEL DE PEDIDOS: la compra
const { supabase } = require('../config/supabaseClient');
const { faltaImplementar } = require('../utils/errores');

// Un error que es culpa del cliente: el controller lo responde con 400
function errorCliente(mensaje) {
  const e = new Error(mensaje);
  e.status = 400;
  return e;
}

// Registra una compra completa:
// busca productos, controla stock, calcula el total, guarda pedido e items
// y descuenta el stock. items = [ { producto_id, cantidad }, ... ]
async function crearPedido(usuarioId, items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw errorCliente('El carrito está vacío');
  }

  // Juntar en una sola linea cada producto: si el mismo aparece dos veces
  // (por ejemplo, por filtrar el carrito) se suman las unidades.
  const lineas = new Map();
  for (const item of items) {
    const id = Number(item.producto_id);
    const cantidad = Number(item.cantidad);
    if (!Number.isInteger(id) || id <= 0) {
      throw errorCliente('Producto inválido');
    }
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw errorCliente('Cantidad inválida');
    }
    lineas.set(id, (lineas.get(id) || 0) + cantidad);
  }

  const ids = [...lineas.keys()];

  // Obtener productos para validar stock y precio
  const { data: productos, error: prodError } = await supabase
    .from('productos')
    .select('id, nombre, precio, stock')
    .in('id', ids);

  if (prodError) throw prodError;
  if (!productos || productos.length !== ids.length) {
    throw errorCliente('Alguno de los productos no existe');
  }

  // Validar stock y calcular total
  let total = 0;
  for (const [id, cantidad] of lineas) {
    const prod = productos.find(p => p.id === id);
    if (!prod) throw errorCliente('Producto inválido');
    if (cantidad > prod.stock) {
      throw errorCliente(`Stock insuficiente para ${prod.nombre}. Disponible: ${prod.stock}`);
    }
    total += Number(prod.precio) * cantidad;
  }

  // Crear pedido
  const { data: pedido, error: pedError } = await supabase
    .from('pedidos')
    .insert([{ usuario_id: usuarioId, total, estado: 'pendiente' }])
    .select()
    .single();

  if (pedError) throw pedError;

  // Crear items del pedido
  const itemsPedido = [...lineas].map(([id, cantidad]) => {
    const prod = productos.find(p => p.id === id);
    return {
      pedido_id: pedido.id,
      producto_id: prod.id,
      cantidad: cantidad,
      precio_unitario: prod.precio
    };
  });

  const { error: itemsError } = await supabase
    .from('pedido_items')
    .insert(itemsPedido);

  if (itemsError) throw itemsError;

  // Descontar stock
  for (const [id, cantidad] of lineas) {
    const prod = productos.find(p => p.id === id);
    const { error: updError } = await supabase
      .from('productos')
      .update({ stock: prod.stock - cantidad })
      .eq('id', prod.id);

    if (updError) throw updError;
  }

  return pedido;
}

module.exports = { crearPedido };
