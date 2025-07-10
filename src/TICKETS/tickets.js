import React, { useEffect, useState } from 'react';
import './tickets.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ESTADOS_POSIBLES = [
    'SELECCIONA UNA OPCION',
  'DIAGNOSTICO Y COSTO DE REPARACION',
  'ESPERANDO CONFIRMACION DEL CLIENTE',
  'CONFIRMACION DEL CLIENTE',
  'REPARACION',
  'PRUEBAS DE RENDIMIENTO',
  'ENTREGADO'
];

export default function Tickets({ userEmail, onPendingCount }) {
  const [tickets, setTickets] = useState([]);
  const [estados, setEstados] = useState([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [abiertos, setAbiertos] = useState([]);
  // Inputs locales por ticket
  const [inputs, setInputs] = useState({});
  // Nuevo: Estado para cambios de estado pendientes (para selects con inputs)
  const [estadoPendiente, setEstadoPendiente] = useState({});
  const [nombreTecnico, setNombreTecnico] = useState('');
useEffect(() => {
  if (!userEmail) return;

  const obtenerNombreTecnico = async () => {
    try {
      const res = await fetch(`http://localhost:3001/empleados/nombre/${encodeURIComponent(userEmail)}`);
      if (!res.ok) throw new Error('No se encontró el técnico');
      const data = await res.json();
      setNombreTecnico(data.name);
    } catch (err) {
      console.error('Error al obtener nombre del técnico:', err);
      setNombreTecnico(userEmail); // fallback
    }
  };

  obtenerNombreTecnico();
}, [userEmail]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch('http://localhost:3001/tickets');
        if (!res.ok) throw new Error('Error al obtener tickets');
        const data = await res.json();

        setTickets(data);

        // Extraer estados únicos dinámicamente
        const estadosUnicos = [...new Set(data.map(ticket => ticket.status))];
        setEstados(estadosUnicos);

        // Notificar cantidad de tickets pendientes (no entregados)
        if (onPendingCount) {
          const pendientes = data.filter(ticket => ticket.status !== 'ENTREGADO').length;
          onPendingCount(pendientes);
        }
      } catch (err) {
        console.error('❌ Error al obtener tickets:', err);
        if (onPendingCount) onPendingCount(0);
      }
    };

    fetchTickets();

    // Actualizar estados y tickets cada 300ms para simular tiempo real
    const interval = setInterval(() => {
      fetch('http://localhost:3001/tickets')
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setTickets(data);
          const estadosUnicos = [...new Set(data.map(ticket => ticket.status))];
          setEstados(estadosUnicos);
        })
        .catch(() => {});
    }, 300);

    return () => clearInterval(interval);
  }, [onPendingCount]);

  const toggleTicket = (id) => {
    setAbiertos(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Manejo de inputs locales
  const handleInputChange = (ticketId, field, value) => {
    setInputs(prev => ({
      ...prev,
      [ticketId]: {
        ...prev[ticketId],
        [field]: value
      }
    }));
  };

  // Formateo de precio: puntos de miles y coma decimal
  const formatPrecio = (value) => {
    // Solo números y coma
    let cleaned = value.replace(/[^\d,]/g, '');
    // Separar parte entera y decimal
    let [entera, decimal] = cleaned.split(',');
    entera = entera ? entera.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
    return decimal !== undefined ? `${entera},${decimal}` : entera;
  };

  // Cambiar estado del ticket (para selects SIN inputs)
  const handleEstadoChange = async (ticketId, nuevoEstado) => {
    // Si el nuevo estado requiere inputs, solo setea pendiente
    if (
      nuevoEstado === 'DIAGNOSTICO Y COSTO DE REPARACION' ||
      nuevoEstado === 'PRUEBAS DE RENDIMIENTO' ||
      nuevoEstado === 'ENTREGADO'
    ) {
      setEstadoPendiente(prev => ({ ...prev, [ticketId]: nuevoEstado }));
      return;
    }
    // Si no requiere inputs, guardar de una vez
    try {
      await fetch(`http://localhost:3001/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nuevoEstado })
      });
      setTickets(prev =>
        prev.map(t =>
          t.id === ticketId ? { ...t, status: nuevoEstado } : t
        )
      );
      if (onPendingCount && nuevoEstado === 'ENTREGADO') {
        const pendientes = tickets.filter(ticket => ticket.id !== ticketId && ticket.status !== 'ENTREGADO').length;
        onPendingCount(pendientes);
      }
      toast.success('Servicio actualizado');
      // Cerrar el ticket si no requiere inputs
      setAbiertos(prev => prev.filter(i => i !== ticketId));
    } catch (err) {
      toast.error('Error al actualizar el estado del ticket');
    }
  };

  // Guardar inputs y estado (para selects CON inputs)
  const handleGuardar = async (ticketId) => {
  const nuevoEstado = estadoPendiente[ticketId] || tickets.find(t => t.id === ticketId)?.status;
  let extra = {};
  if (nuevoEstado === 'DIAGNOSTICO Y COSTO DE REPARACION') {
  extra.diagnostico = inputs[ticketId]?.diagnostico || '';
  extra.precio = inputs[ticketId]?.precio || '';
  extra.encargado = nombreTecnico; // 👈 usar el nombre
}

  if (nuevoEstado === 'PRUEBAS DE RENDIMIENTO') {
    extra.pruebas = inputs[ticketId]?.pruebas || '';
  }
  if (nuevoEstado === 'ENTREGADO') {
    extra.observaciones = inputs[ticketId]?.observaciones || '';
  }

  try {
    await fetch(`http://localhost:3001/tickets/${ticketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nuevoEstado, ...extra })
    });
    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId ? { ...t, status: nuevoEstado, ...extra } : t
      )
    );
    setEstadoPendiente(prev => {
      const copy = { ...prev };
      delete copy[ticketId];
      return copy;
    });
    toast.success('Servicio actualizado');
    if (onPendingCount && nuevoEstado === 'ENTREGADO') {
      const pendientes = tickets.filter(ticket => ticket.id !== ticketId && ticket.status !== 'ENTREGADO').length;
      onPendingCount(pendientes);
    }
    setAbiertos(prev => prev.filter(i => i !== ticketId));
  } catch (err) {
    toast.error('Error al actualizar el estado del ticket');
  }
};


  const ticketsFiltrados = estadoSeleccionado
    ? tickets.filter(ticket => ticket.status === estadoSeleccionado)
    : tickets;

  return (
    <section className="tickets-section">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <h2>Todos los Tickets de Mantenimiento</h2>

      <div className="tickets-filter-buttons">
        <button
          className={`filter-btn${estadoSeleccionado === null ? ' active' : ''}`}
          onClick={() => setEstadoSeleccionado(null)}
        >
          Todas
        </button>
        {estados.map(status => (
          <button
            key={status}
            className={`filter-btn${estadoSeleccionado === status ? ' active' : ''}`}
            onClick={() => setEstadoSeleccionado(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {ticketsFiltrados.length === 0 ? (
        <p className="no-tickets">No hay tickets para mostrar.</p>
      ) : (
        <ul className="ticket-list">
          {ticketsFiltrados.map(ticket => {
            // Estado mostrado en el select (puede ser el pendiente si hay)
            const estadoActual = estadoPendiente[ticket.id] || ticket.status;
            // ¿El estado requiere inputs?
            const requiereInputs =
              estadoActual === 'DIAGNOSTICO Y COSTO DE REPARACION' ||
              estadoActual === 'PRUEBAS DE RENDIMIENTO' ||
              estadoActual === 'ENTREGADO';
            // Nuevo: ¿Está entregado?
            const esEntregado = ticket.status === 'ENTREGADO';
            // Nuevo: clase de color según estado
            const estadoClase = (() => {
              switch (ticket.status) {
                case 'DIAGNOSTICO Y COSTO DE REPARACION':
                  return 'status-diagnostico';
                case 'ESPERANDO CONFIRMACION DEL CLIENTE':
                  return 'status-esperando';
                case 'CONFIRMACION DEL CLIENTE':
                  return 'status-confirmacion';
                case 'REPARACION':
                  return 'status-reparacion';
                case 'PRUEBAS DE RENDIMIENTO':
                  return 'status-pruebas';
                case 'ENTREGADO':
                  return 'status-entregado';
                default:
                  return '';
              }
            })();
            return (
              <li key={ticket.id} className="ticket-item">
                <div
                  className={`ticket-header ${estadoClase}`}
                  onClick={() => toggleTicket(ticket.id)}
                >
                  <strong>ticket #{ticket.id}</strong>
                  <span className="ticket-status">{ticket.status}</span>
                </div>
                {abiertos.includes(ticket.id) && (
                  <div className="ticket-body">
                    {/* Solo mostrar select/cambios si NO está entregado */}
                    {!esEntregado && (
                      <div style={{ marginBottom: '1.2rem' }}>
                        <label>
                          <strong>Cambiar estado:&nbsp;</strong>
                          <select
                            value={
                              !estadoActual || estadoActual === 'PENDIENTE'
                                ? 'SELECCIONA UNA OPCION'
                                : estadoActual
                            }
                            onChange={e => handleEstadoChange(ticket.id, e.target.value)}
                          >
                            {ESTADOS_POSIBLES.map(estado => (
                              <option
                                key={estado}
                                value={estado}
                                disabled={estado === 'SELECCIONA UNA OPCION'}
                              >
                                {estado}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    )}
                    {/* Info del ticket */}
                    {ticket.tipo && <p><strong>Tipo:</strong> {ticket.tipo}</p>}
{ticket.descripcion && <p><strong>Descripción:</strong> {ticket.descripcion}</p>}
{ticket.cliente_email && <p><strong>Cliente:</strong> {ticket.cliente_email}</p>}
{ticket.dispositivo_id && <p><strong>Dispositivo:</strong> {ticket.dispositivo_id}</p>}
<p><strong>Encargado:</strong> {ticket.encargado || 'Sin asignar'}</p>
{ticket.created_at && (
  <p><strong>Creado:</strong> {new Date(ticket.created_at).toLocaleString('es-CO')}</p>
)}
{ticket.diagnostico && <p><strong>Diagnóstico:</strong> {ticket.diagnostico}</p>}
{ticket.precio !== null && <p><strong>Precio:</strong> ${Number(ticket.precio).toLocaleString('es-CO')}</p>}
{ticket.pruebas && <p><strong>Pruebas:</strong> {ticket.pruebas}</p>}
{ticket.observaciones && <p><strong>Observaciones:</strong> {ticket.observaciones}</p>}
{ticket.fecha_diagnostico && (
  <p><strong>Fecha diagnóstico:</strong> {new Date(ticket.fecha_diagnostico).toLocaleString('es-CO')}</p>
)}
{ticket.fecha_reparacion && (
  <p><strong>Fecha reparación:</strong> {new Date(ticket.fecha_reparacion).toLocaleString('es-CO')}</p>
)}
{ticket.fecha_entrega && (
  <p><strong>Fecha entrega:</strong> {new Date(ticket.fecha_entrega).toLocaleString('es-CO')}</p>
)}
<p><strong>Encargado:</strong> {ticket.encargado || 'Sin asignar'}</p>


                    {/* Inputs condicionales según estado, solo si NO está entregado */}
                    {!esEntregado && estadoActual === 'DIAGNOSTICO Y COSTO DE REPARACION' && (
                      <div className="ticket-extra-inputs">
                        <label>
                          Diagnóstico:&nbsp;
                          <input
                            type="text"
                            value={inputs[ticket.id]?.diagnostico || ''}
                            onChange={e => handleInputChange(ticket.id, 'diagnostico', e.target.value)}
                            placeholder="Diagnóstico"
                          />
                        </label>
                        <label>
                          Precio:&nbsp;
                          <input
                            type="text"
                            value={inputs[ticket.id]?.precio !== undefined
                              ? inputs[ticket.id].precio
                              : (ticket.precio || '')}
                            onChange={e => {
                              const formatted = formatPrecio(e.target.value);
                              handleInputChange(ticket.id, 'precio', formatted);
                            }}
                            placeholder="0,00"
                            inputMode="decimal"
                          />
                        </label>
                      </div>
                    )}
                    {!esEntregado && estadoActual === 'PRUEBAS DE RENDIMIENTO' && (
                      <div className="ticket-extra-inputs">
                        <label>
                          Pruebas realizadas:&nbsp;
                          <input
                            type="text"
                            value={inputs[ticket.id]?.pruebas || ''}
                            onChange={e => handleInputChange(ticket.id, 'pruebas', e.target.value)}
                            placeholder="Detalle de pruebas"
                          />
                        </label>
                      </div>
                    )}
                    {!esEntregado && estadoActual === 'ENTREGADO' && (
                      <div className="ticket-extra-inputs">
                        <label>
                          Observaciones de entrega:&nbsp;
                          <input
                            type="text"
                            value={inputs[ticket.id]?.observaciones || ''}
                            onChange={e => handleInputChange(ticket.id, 'observaciones', e.target.value)}
                            placeholder="Observaciones"
                          />
                        </label>
                      </div>
                    )}
                    {/* Botón guardar solo si hay inputs y NO está entregado */}
                    {!esEntregado && requiereInputs && (
                      <div style={{ marginTop: '1rem' }}>
                        <button
                          className="guardar-btn"
                          onClick={() => handleGuardar(ticket.id)}
                        >
                          Guardar
                        </button>
                      </div>
                    )}
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
