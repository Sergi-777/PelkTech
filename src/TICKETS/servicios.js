import React, { useEffect, useState } from 'react';
import './tickets.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ESTADOS_BALANCE = [
  'CONFIRMACION DEL CLIENTE',
  'REPARACION',
  'PRUEBAS DE RENDIMIENTO',
  'ENTREGADO'
];

export default function Servicios({ userEmail }) {
  const [tickets, setTickets] = useState([]);
  const [estados, setEstados] = useState([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [abiertos, setAbiertos] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch('http://localhost:3001/tickets');
        if (!res.ok) throw new Error('Error al obtener tickets');
        const data = await res.json();
        setTickets(data);
        const estadosUnicos = [...new Set(data.map(ticket => ticket.status))];
        setEstados(estadosUnicos);
      } catch (err) {
        setTickets([]);
        setEstados([]);
      }
    };

    fetchTickets();
    const interval = setInterval(fetchTickets, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTicket = (id) => {
    setAbiertos(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Balance solo de los estados permitidos
  const totalBalance = tickets
    .filter(ticket => ESTADOS_BALANCE.includes(ticket.status))
    .reduce((sum, ticket) => sum + (Number(ticket.precio) || 0), 0);

  const ticketsFiltrados = estadoSeleccionado
    ? tickets.filter(ticket => ticket.status === estadoSeleccionado)
    : tickets;

  return (
    <section className="tickets-section">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <h2>Todos los Servicios de Mantenimiento</h2>
      <div style={{ fontWeight: 600, marginBottom: '0.7em', color: '#2563eb', fontSize: '1.15em' }}>
        Total balance: ${totalBalance.toLocaleString('es-CO')}
      </div>
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
        <p className="no-tickets">No hay servicios para mostrar.</p>
      ) : (
        <ul className="ticket-list">
          {ticketsFiltrados.map(ticket => {
            // ...solo visualización...
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
                  <strong>servicio #{ticket.id}</strong>
                  <span className="ticket-status">{ticket.status}</span>
                </div>
                {abiertos.includes(ticket.id) && (
                  <div className="ticket-body">
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