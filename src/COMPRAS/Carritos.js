import React, { useEffect, useState } from 'react';
import './Carritos.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ESTADOS_PEDIDO = [
  'PENDIENTE',
  'PENDIENTE PAGO',
  'PAGO RECIBIDO',
  'EMPACADO',
  'ENVIADO',
  'ENTREGADO',
  'COMPLETADO',
  'CANCELADO'
];

export default function Carritos({ userEmail }) {
  const [carritos, setCarritos] = useState([]);
  const [clientes, setClientes] = useState({});
  const [estadoFiltro, setEstadoFiltro] = useState('Todas');
  const [expandido, setExpandido] = useState(null);

  // Obtener carritos desde la API MySQL
  useEffect(() => {
    const fetchCarritos = async () => {
      try {
        const res = await fetch('http://localhost:3001/carritos');
        if (!res.ok) throw new Error('Error al obtener carritos');
        const data = await res.json();
        setCarritos(data);
      } catch (err) {
        toast.error('Error al obtener carritos');
      }
    };
    fetchCarritos();
    const interval = setInterval(fetchCarritos, 2000);
    return () => clearInterval(interval);
  }, []);

  // Obtener datos de clientes por email (solo si hay carritos nuevos)
  useEffect(() => {
    async function fetchClientes() {
      const nuevos = {};
      for (const carrito of carritos) {
        if (!carrito.cliente_email || clientes[carrito.cliente_email]) continue;
        try {
          const res = await fetch(`http://localhost:3001/clientes/email/${encodeURIComponent(carrito.cliente_email)}`);
          if (res.ok) {
            const data = await res.json();
            nuevos[carrito.cliente_email] = data;
          }
        } catch {}
      }
      if (Object.keys(nuevos).length > 0) setClientes(prev => ({ ...prev, ...nuevos }));
    }
    if (carritos.length > 0) fetchClientes();
    // eslint-disable-next-line
  }, [carritos]);

  // Cambiar estado del carrito (MySQL)
  const handleEstadoChange = async (carritoId, nuevoEstado) => {
    try {
      await fetch(`http://localhost:3001/carritos/${carritoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nuevoEstado })
      });
      setCarritos(prev =>
        prev.map(c =>
          c.id === carritoId ? { ...c, status: nuevoEstado } : c
        )
      );
      toast.success('Estado del carrito actualizado');
    } catch (err) {
      toast.error('Error al actualizar el estado del carrito');
    }
  };

  // Utilidad para copiar texto y abrir WhatsApp Web
  const handleHablarConCliente = (carrito, cliente) => {
    const productos = Array.isArray(carrito.items)
      ? carrito.items.map(
          (item) =>
            `• ${item.name || 'Producto'} x${item.cantidad || 1} – $${item.price?.toLocaleString?.() ?? item.price ?? 0}`
        ).join('\n')
      : 'Sin productos';
    const fechaPedido = carrito.created_at ? new Date(carrito.created_at).toLocaleDateString('es-CO') : '';
    // Cambiar aquí: nombre completo
    const nombreCompleto = [cliente.name, cliente.lastName].filter(Boolean).join(' ');
    const texto = `
Hola ${nombreCompleto} 👋🏻
Te escribimos de Pelktech para confirmarte que recibimos tu pedido 🛒 (#${carrito.id}) realizado el ${fechaPedido}.

📦 Producto(s) solicitado(s):
${productos}
💰 Total: $${carrito.total?.toLocaleString?.() ?? carrito.total ?? 'N/A'}
📌 Estado: ${carrito.status || carrito.estado || 'Desconocido'}

¡Gracias por confiar en Pelktech!
    `.trim();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto);
    }
    if (cliente.telefono) {
      const numero = cliente.telefono.replace(/\D/g, '');
      window.open(`https://wa.me/${numero}`, '_blank');
    } else {
      alert('El cliente no tiene número de teléfono registrado.');
    }
  };

  // Filtros de estado
  const estadosUnicos = Array.from(
    new Set(carritos.map(c => (c.status || c.estado || '').toUpperCase()).filter(Boolean))
  );
  const categorias = ['Todas', ...estadosUnicos];

  return (
    <section className="carritos-section">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <h2>Carritos Pendientes</h2>
      <div className="carritos-filter-buttons">
        {categorias.map((cat) => (
          <button
            key={cat}
            className={`filter-btn${estadoFiltro === cat ? ' active' : ''}`}
            onClick={() => setEstadoFiltro(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      {carritos
        .filter(carrito => {
          if (estadoFiltro === 'Todas') return true;
          const estado = (carrito.status || carrito.estado || '').toUpperCase();
          return estado === estadoFiltro.toUpperCase();
        }).length === 0 ? (
        <div className="no-carritos">No hay carritos para mostrar.</div>
      ) : (
        <ul className="carrito-list">
          {carritos
            .filter(carrito => {
              if (estadoFiltro === 'Todas') return true;
              const estado = (carrito.status || carrito.estado || '').toUpperCase();
              return estado === estadoFiltro.toUpperCase();
            })
            .map(carrito => {
              const cliente = clientes[carrito.cliente_email] || {};
              const isExpandido = expandido === carrito.id;
              // Clase de color según estado
              const estadoClase = (() => {
                switch ((carrito.status || carrito.estado)) {
                  case 'PENDIENTE':
                  case 'PENDIENTE PAGO':
                    return 'status-pendiente';
                  case 'COMPLETADO':
                  case 'ENTREGADO':
                  case 'PAGO RECIBIDO':
                  case 'EMPACADO':
                  case 'ENVIADO':
                    return 'status-completado';
                  case 'CANCELADO':
                    return 'status-cancelado';
                  default:
                    return '';
                }
              })();
              return (
                <li
                  key={carrito.id}
                  className={`carrito-item`}
                  onClick={e => {
                    // No expandir si el click fue en el select o botón
                    if (
                      e.target.tagName === 'SELECT' ||
                      e.target.closest('select') ||
                      e.target.tagName === 'BUTTON'
                    ) return;
                    setExpandido(isExpandido ? null : carrito.id);
                  }}
                >
                  <div className={`carrito-header ${estadoClase}`}>
                    <strong>Carrito #{carrito.id}</strong>
                    <span className="carrito-status">{carrito.status || carrito.estado}</span>
                  </div>
                  {isExpandido && (
                    <div className="carrito-body">
                      <div className="carrito-cliente">
                        <strong>Cliente:</strong> {/* Cambiar aquí: nombre completo */}
                        {[cliente.name, cliente.lastName].filter(Boolean).join(' ')}<br />
                        <strong>Email:</strong> {cliente.email || carrito.cliente_email}<br />
                        <strong>Teléfono:</strong> {cliente.telefono || ''}<br />
                        {cliente.direccion && (
                          <>
                            <strong>Dirección:</strong> {cliente.direccion}<br />
                          </>
                        )}
                        <button
                          className="carrito-btn-whatsapp"
                          onClick={e => {
                            e.stopPropagation();
                            handleHablarConCliente(carrito, cliente);
                          }}
                        >
                          Hablar con cliente
                        </button>
                      </div>
                      <div className="carrito-productos">
                        <strong>Productos:</strong>
                        <ul>
                          {Array.isArray(carrito.items) && carrito.items.length > 0 ? (
                            carrito.items.map((item, idx) => (
                              <li key={idx}>
                                {item.name || 'Producto'} x{item.cantidad || 1} – ${item.price?.toLocaleString?.() ?? item.price ?? 0}
                              </li>
                            ))
                          ) : (
                            <li>Sin productos</li>
                          )}
                        </ul>
                      </div>
                      <div className="carrito-total-fecha">
                        <strong>Total:</strong> ${carrito.total?.toLocaleString?.() ?? carrito.total ?? 'N/A'}
                        <br />
                        {carrito.created_at && (
                          <span>
                            <strong>Fecha:</strong> {new Date(carrito.created_at).toLocaleString('es-CO')}
                          </span>
                        )}
                      </div>
                      <div className="carrito-estado-select">
                        <label>
                          <strong>Cambiar estado:&nbsp;</strong>
                          <select
                            value={carrito.status || carrito.estado || ''}
                            onChange={e => handleEstadoChange(carrito.id, e.target.value)}
                            onClick={e => e.stopPropagation()}
                          >
                            <option value="">Selecciona estado</option>
                            {ESTADOS_PEDIDO.map(estado => (
                              <option key={estado} value={estado}>
                                {estado}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      )}
    </section>
  );
}
