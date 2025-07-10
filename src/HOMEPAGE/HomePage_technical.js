import React, { useRef, useState, useEffect } from 'react';
import './HomePage_technical.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Tickets from '../TICKETS/tickets';
import Carritos from '../COMPRAS/Carritos';

export default function HomePage_technical() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const hoverTimeout = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", rol: "", telefono: "" });
  const [editing, setEditing] = useState(false);
  const [profileCollapsed, setProfileCollapsed] = useState(false);
  const [selectedSection, setSelectedSection] = useState('tickets');
  const [userEmail, setUserEmail] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  // Nuevo estado para carritos pendientes
  const [pendingCarritos, setPendingCarritos] = useState(0);

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (localUser?.email) {
      setUserEmail(localUser.email);
    }
  }, []);

  useEffect(() => {
    if (!userEmail) return;
    const fetchEmpleado = async () => {
      try {
        const res = await fetch(`http://localhost:3001/empleados/email/${encodeURIComponent(userEmail.toLowerCase())}`);
        if (!res.ok) throw new Error("No se pudo obtener los datos del empleado");
        const data = await res.json();
        setForm({
  name: data.name || '',
  email: data.email || '',
  rol: data.rol || '',
  telefono: data.telefono || '',
  fecha_vinculacion: data.fecha_vinculacion || null
});

      } catch (err) {
        console.error("Error al obtener datos del técnico:", err);
        setForm({ name: "", email: userEmail, rol: "", telefono: "" });
      }
    };
    fetchEmpleado();
  }, [userEmail]);

  // Notificaciones de carritos pendientes
  useEffect(() => {
    if (!userEmail) return;
    // Traer todos los carritos
    const fetchCarritos = async () => {
      try {
        const res = await fetch('http://localhost:3001/carritos');
        if (!res.ok) throw new Error('No se pudo obtener carritos');
        const data = await res.json();
        // Solo cuenta los que NO sean entregado, completado, cancelado
        const pendientes = data.filter(c => {
          const estado = (c.status || c.estado || '').toUpperCase();
          return !['ENTREGADO', 'COMPLETADO', 'CANCELADO'].includes(estado);
        });
        setPendingCarritos(pendientes.length);
      } catch (err) {
        setPendingCarritos(0);
      }
    };
    fetchCarritos();
    const interval = setInterval(fetchCarritos, 3000);
    return () => clearInterval(interval);
  }, [userEmail]);

  // Notificaciones de tickets pendientes en tiempo real
  useEffect(() => {
    if (!userEmail) return;
    const fetchTickets = async () => {
      try {
        const res = await fetch('http://localhost:3001/tickets');
        if (!res.ok) throw new Error('No se pudo obtener tickets');
        const data = await res.json();
        // Solo cuenta los que NO sean entregado
        const pendientes = data.filter(t => (t.status || '').toUpperCase() !== 'ENTREGADO');
        setPendingCount(pendientes.length);
      } catch (err) {
        setPendingCount(0);
      }
    };
    fetchTickets();
    const interval = setInterval(fetchTickets, 3000);
    return () => clearInterval(interval);
  }, [userEmail]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const handleSidebarMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      setSidebarExpanded(true);
    }, 1000);
  };

  const handleSidebarMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    setSidebarExpanded(false);
  };

  const handleEdit = () => setEditing(true);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:3001/empleados/${encodeURIComponent(form.email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          rol: form.rol,
          telefono: form.telefono
        })
      });
      if (!res.ok) throw new Error('Error al guardar los cambios');
      toast.success('Perfil actualizado correctamente');
      setEditing(false);
    } catch (err) {
      toast.error('Error al actualizar el perfil: ' + err.message);
    }
  };

  const getPrimerNombre = (nombreCompleto) => {
    if (!nombreCompleto) return '';
    return nombreCompleto.split(' ')[0];
  };
const formatearFecha = (fecha) => {
  const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
  const fechaObj = new Date(fecha);
  const partes = fechaObj.toLocaleDateString('es-ES', opciones).split(' de ');
  // partes: [día, mes, año] → ej: ["9", "julio", "2025"]
  return `${partes[0]} de ${partes[1]} del ${partes[2]}`;
};


  return (
    <div className="homepage-technical-container">
      {sidebarExpanded && (
        <div className="homepage-technical-overlay" onClick={() => setSidebarExpanded(false)} />
      )}
      <aside
        className={`homepage-technical-sidebar${sidebarExpanded ? ' expanded' : ''}`}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <h2 className="homepage-technical-title">
          <span className="homepage-technical-nav-icon" aria-label="Panel">🛠️</span>
          <span className="homepage-technical-title-text">Panel Técnico</span>
        </h2>
        <nav className="homepage-technical-nav">
          <ul>
            <li
              onClick={() => setSelectedSection('tickets')}
              className={selectedSection === 'tickets' ? 'sidebar-selected' : ''}
              style={{ position: 'relative' }}
            >
              <span className="homepage-technical-nav-icon" aria-label="Tickets">
                🎫
              </span>
              <span className="homepage-technical-nav-text">Tickets</span>
              {pendingCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 18,
                    background: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 7px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    zIndex: 2
                  }}
                  title={`${pendingCount} tickets pendientes`}
                >
                  {pendingCount}
                </span>
              )}
            </li>
            <li
              onClick={() => setSelectedSection('carritos')}
              className={selectedSection === 'carritos' ? 'sidebar-selected' : ''}
              style={{ position: 'relative' }}
            >
              <span className="homepage-technical-nav-icon" aria-label="Carritos">
                🛒
              </span>
              <span className="homepage-technical-nav-text">Carritos</span>
              {pendingCarritos > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 18,
                    background: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 7px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    zIndex: 2
                  }}
                  title={`${pendingCarritos} carritos pendientes`}
                >
                  {pendingCarritos}
                </span>
              )}
            </li>
            <li
              onClick={() => setSelectedSection('perfil')}
              className={selectedSection === 'perfil' ? 'sidebar-selected' : ''}
            >
              <span className="homepage-technical-nav-icon" aria-label="Perfil">👤</span>
              <span className="homepage-technical-nav-text">Perfil</span>
            </li>
          </ul>
        </nav>
        <button className="homepage-technical-logout" onClick={handleLogout}>
          <span className="homepage-technical-nav-icon" aria-label="Salir">🚪</span>
          <span className="homepage-technical-logout-text">Cerrar sesión</span>
        </button>
      </aside>
      <main className={`homepage-technical-main${sidebarExpanded ? ' sidebar-expanded' : ''}`}>
        <header className="homepage-technical-header">
          <h1>¡Bienvenido, {getPrimerNombre(form.name) || 'Técnico'}!</h1>
          <p>Aquí puedes actualizar tu perfil.</p>
        </header>

        {selectedSection === 'perfil' && (
          <section
            className={`homepage-technical-section homepage-technical-profile${profileCollapsed ? ' collapsed' : ''}`}
            onClick={() => setProfileCollapsed(!profileCollapsed)}
          >
            <h2>Mi perfil</h2>
            {!profileCollapsed && (
              <>
                <p><strong>Nombre:</strong> {form.name}</p>
                <p><strong>Correo:</strong> {form.email}</p>
                <p><strong>Rol:</strong> {form.rol}</p>
                <p><strong>Teléfono:</strong> {form.telefono}</p>
<p><strong>Fecha de Vinculación:</strong> {form.fecha_vinculacion ? formatearFecha(form.fecha_vinculacion) : 'Sin asignar'}</p>

                <button
                  className="homepage-technical-edit-profile"
                  onClick={e => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                >
                  Editar perfil
                </button>
              </>
            )}
          </section>
        )}

        {selectedSection === 'tickets' && (
          <Tickets userEmail={userEmail} onPendingCount={setPendingCount} />
        )}

        {selectedSection === 'carritos' && (
          <Carritos userEmail={userEmail} />
        )}

        {editing && (
          <div
            className="agregar-dispositivo-overlay editar-perfil-overlay"
            onClick={e => {
              if (e.target.classList.contains('agregar-dispositivo-overlay')) setEditing(false);
            }}
          >
            <div
              className="myprofile-modal myprofile-edit-modal"
              onClick={e => e.stopPropagation()}
            >
              <div className="myprofile-modal-header myprofile-modal-header-edit">
                <span className="myprofile-title myprofile-title-edit">Editar información</span>
                <button
                  className="myprofile-close-btn"
                  onClick={() => setEditing(false)}
                >
                  ×
                </button>
              </div>
              <form
                className="myprofile-edit-form"
                onSubmit={e => { e.preventDefault(); handleSave(); }}
              >
                <div>
                  <label>Nombre:</label>
                  <input name="name" value={form.name} onChange={handleChange} autoFocus />
                </div>
                <div>
                  <label>Email:</label>
                  <input name="email" value={form.email} readOnly className="input-readonly" tabIndex={-1} />
                </div>
                <div>
                  <label>Rol:</label>
                  <input name="rol" value={form.rol} readOnly className="input-readonly" tabIndex={-1} />
                </div>
                <div>
                  <label>Teléfono:</label>
                  <input name="telefono" value={form.telefono} onChange={handleChange} />
                </div>
                <div className="myprofile-edit-form-actions">
                  <button type="submit" className="myprofile-action-btn myprofile-action-btn-save">
                    Guardar
                  </button>
                  <button type="button" className="myprofile-action-btn myprofile-action-btn-cancel" onClick={() => setEditing(false)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar />
      </main>
    </div>
  );
}