import React, { useRef, useState, useEffect } from 'react';
import './HomePage_Admin.css';
import Ventas from '../COMPRAS/ventas';
import Empleado from '../EMPLEADOS/Empleado';
import Servicios from '../TICKETS/servicios'; // Agrega esta línea
import Redes from '../REDES/Redes'; // Importa el componente Redes
import Productos from '../PRODUCTOS/Productos'; // Importa Productos

export default function HomePage_Admin() {
  const [comobarExpanded, setComobarExpanded] = useState(false);
  const [selectedSection, setSelectedSection] = useState('ventas');
  const [adminData, setAdminData] = useState({ name: "", email: "", rol: "", telefono: "" }); // datos completos del admin
  const hoverTimeout = useRef(null);

  // Estados para carritos y clientes
  const [carritos, setCarritos] = useState([]);
  const [carritosClientes, setCarritosClientes] = useState({});
  const [ventasEstadoFiltro, setVentasEstadoFiltro] = useState('Todas');
  const [serviciosEstadoFiltro, setServiciosEstadoFiltro] = useState('Todas');
  const [ventasExpandido, setVentasExpandido] = useState(null);
  const [serviciosExpandido, setServiciosExpandido] = useState(null);
  const [serviciosPendientes, setServiciosPendientes] = useState(0); // Nuevo estado para notificación
  const [pendingCarritos, setPendingCarritos] = useState(0); // Nuevo estado para carritos pendientes

  // Obtener datos del usuario autenticado desde localStorage (igual que técnico)
  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user"));
    const email = localUser?.email || localStorage.getItem('email') || sessionStorage.getItem('email');
    if (email) {
      fetch(`http://localhost:3001/empleados/email/${encodeURIComponent(email.toLowerCase())}`)
        .then(res => res.json())
        .then(data => {
          setAdminData({
            name: data.name || '',
            email: data.email || '',
            rol: data.rol || '',
            telefono: data.telefono || ''
          });
        })
        .catch(() => setAdminData({ name: "", email: "", rol: "", telefono: "" }));
    }
  }, []);

  // Notificaciones de servicios pendientes en tiempo real (igual que técnico)
  useEffect(() => {
    const fetchServiciosPendientes = async () => {
      try {
        const res = await fetch('http://localhost:3001/tickets');
        if (!res.ok) throw new Error('No se pudo obtener tickets');
        const data = await res.json();
        // Solo cuenta los que NO sean entregado, completado, cancelado
        const pendientes = data.filter(
          t => !['ENTREGADO', 'COMPLETADO', 'CANCELADO'].includes((t.status || '').toUpperCase())
        );
        setServiciosPendientes(pendientes.length);
      } catch (err) {
        setServiciosPendientes(0);
      }
    };
    fetchServiciosPendientes();
    const interval = setInterval(fetchServiciosPendientes, 3000);
    return () => clearInterval(interval);
  }, []);

  // Notificaciones de carritos pendientes
  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user"));
    const userEmail = localUser?.email || localStorage.getItem('email') || sessionStorage.getItem('email');
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
  }, []);

  const getPrimerNombre = (nombreCompleto) => {
    if (!nombreCompleto) return '';
    return nombreCompleto.split(' ')[0];
  };

  const handleComobarMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      setComobarExpanded(true);
    }, 1000);
  };

  const handleComobarMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    setComobarExpanded(false);
  };

  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  useEffect(() => {
    if (selectedSection !== 'ventas' && selectedSection !== 'servicios') return;
    fetch('http://localhost:3001/carritos')
      .then(res => res.json())
      .then(data => setCarritos(data))
      .catch(() => setCarritos([]));
  }, [selectedSection]);

  useEffect(() => {
    async function fetchClientes() {
      const clientesObj = {};
      for (const carrito of carritos) {
        if (carritosClientes[carrito.id]) continue;
        if (!carrito.cliente_email) continue;
        try {
          const res = await fetch(`http://localhost:3001/clientes/email/${encodeURIComponent(carrito.cliente_email)}`);
          if (res.ok) {
            const clienteData = await res.json();
            clientesObj[carrito.id] = {
              name: clienteData.nombre || clienteData.name || '',
              lastName: clienteData.apellido || clienteData.lastName || '',
              email: clienteData.email,
              telefono: clienteData.telefono || '',
              direccion: clienteData.direccion || ''
            };
          }
        } catch {}
      }
      if (Object.keys(clientesObj).length > 0) {
        setCarritosClientes(prev => ({ ...prev, ...clientesObj }));
      }
    }
    if ((selectedSection === 'ventas' || selectedSection === 'servicios') && carritos.length > 0) fetchClientes();
  }, [carritos, selectedSection]);

  function formatFechaCreacion(ts) {
    if (!ts) return 'N/A';
    if (typeof ts === 'string' && /^\d{4}-\d{2}-\d{2}/.test(ts)) {
      const [anio, mes, dia] = ts.split(' ')[0].split('-');
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return `${parseInt(dia, 10)} de ${meses[parseInt(mes, 10) - 1]} del ${anio}`;
    }
    let dateObj = ts instanceof Date ? ts : new Date(ts);
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const dia = dateObj.getDate();
    const mes = meses[dateObj.getMonth()];
    const anio = dateObj.getFullYear();
    return `${dia} de ${mes} del ${anio}`;
  }

  const ventasEstadosUnicos = Array.from(
    new Set(carritos.filter(c => (c.type || '').toUpperCase() === 'PRODUCTOS').map(c => (c.status || c.estado || '').toUpperCase()).filter(Boolean))
  );
  const ventasCategorias = ['Todas', ...ventasEstadosUnicos];

  const serviciosEstadosUnicos = Array.from(
    new Set(carritos.filter(c => (c.type || '').toUpperCase() !== 'PRODUCTOS').map(c => (c.status || c.estado || '').toUpperCase()).filter(Boolean))
  );
  const serviciosCategorias = ['Todas', ...serviciosEstadosUnicos];

  const totalVentasGenerado = carritos
    .filter(carrito => (carrito.type || '').toUpperCase() === 'PRODUCTOS')
    .filter(carrito => (carrito.status || carrito.estado || '').toUpperCase() !== 'PENDIENTE PAGO')
    .reduce((sum, carrito) => sum + (Number(carrito.total) || 0), 0);

  const totalServiciosGenerado = carritos
    .filter(carrito => (carrito.type || '').toUpperCase() !== 'PRODUCTOS')
    .filter(carrito => {
      const estado = (carrito.status || carrito.estado || '').toUpperCase();
      return estado === 'REPARACION' || estado === 'PRUEBAS DE RENDIMIENTO' || estado === 'ENTREGADO';
    })
    .reduce((sum, carrito) => sum + (Number(carrito.precio) || 0), 0);



  return (
    <div className="homepage-admin-container">
      {/* Overlay para oscurecer el fondo cuando el comobar está expandido */}
      {comobarExpanded && (
        <div
          className="homepage-admin-overlay"
          onClick={() => setComobarExpanded(false)}
        />
      )}
      {/* Comobar */}
      <aside
        className={`homepage-admin-comobar${comobarExpanded ? ' expanded' : ''}`}
        onMouseEnter={handleComobarMouseEnter}
        onMouseLeave={handleComobarMouseLeave}
      >
        <h2 className="homepage-admin-title">
          <span className="homepage-admin-nav-icon" aria-label="Panel">🛡️</span>
          <span className="homepage-admin-title-text">Panel Admin</span>
        </h2>
        <nav className="homepage-admin-nav">
          <ul>
            <li
              onClick={() => setSelectedSection('ventas')}
              className={selectedSection === 'ventas' ? 'homepage-admin-nav-li selected' : 'homepage-admin-nav-li'}
              style={{ position: 'relative' }}
            >
              <span className="homepage-admin-nav-icon" aria-label="Ventas">💰</span>
              <span className="homepage-admin-nav-text">Ventas</span>
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
                  title={`${pendingCarritos} ventas/carritos pendientes`}
                >
                  {pendingCarritos}
                </span>
              )}
            </li>
            <li
              onClick={() => setSelectedSection('servicios')}
              className={selectedSection === 'servicios' ? 'homepage-admin-nav-li selected' : 'homepage-admin-nav-li'}
              style={{ position: 'relative' }}
            >
              <span className="homepage-admin-nav-icon" aria-label="Servicios">🛠️</span>
              <span className="homepage-admin-nav-text">Servicios</span>
              {serviciosPendientes > 0 && (
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
                  title={`${serviciosPendientes} servicios pendientes`}
                >
                  {serviciosPendientes}
                </span>
              )}
            </li>
            <li
              onClick={() => setSelectedSection('empleados')}
              className={selectedSection === 'empleados' ? 'homepage-admin-nav-li selected' : 'homepage-admin-nav-li'}
            >
              <span className="homepage-admin-nav-icon" aria-label="Empleados">👥</span>
              <span className="homepage-admin-nav-text">Empleados</span>
            </li>
            {/* Nuevo botón Productos */}
            <li
              onClick={() => setSelectedSection('productos')}
              className={selectedSection === 'productos' ? 'homepage-admin-nav-li selected' : 'homepage-admin-nav-li'}
            >
              <span className="homepage-admin-nav-icon" aria-label="Productos">📦</span>
              <span className="homepage-admin-nav-text">Productos</span>
            </li>
            {/* Nuevo botón para Redes */}
            <li
              onClick={() => setSelectedSection('redes')}
              className={selectedSection === 'redes' ? 'homepage-admin-nav-li selected' : 'homepage-admin-nav-li'}
            >
              <span className="homepage-admin-nav-icon" aria-label="Redes">🌐</span>
              <span className="homepage-admin-nav-text">Redes</span>
            </li>
          </ul>
        </nav>
        <button className="homepage-admin-logout" onClick={handleLogout}>
          <span className="homepage-admin-nav-icon" aria-label="Salir">🚪</span>
          <span className="homepage-admin-logout-text">Cerrar sesión</span>
        </button>
      </aside>
      {/* Main Content */}
      <main className={`homepage-admin-main${comobarExpanded ? ' comobar-expanded' : ''}`}>
        <header className="homepage-admin-header">
          <h1>
            ¡Bienvenido, {getPrimerNombre(adminData.name) || 'Administrador'}!
          </h1>
          <p>
            Aquí puedes gestionar ventas, servicios y empleados.
          </p>
        </header>
        {selectedSection === 'ventas' && (
          // Recuerda: "carrito" es el componente de ventas y debe usarse aquí.
          <Ventas
            carritos={carritos}
            carritosClientes={carritosClientes}
            ventasEstadoFiltro={ventasEstadoFiltro}
            setVentasEstadoFiltro={setVentasEstadoFiltro}
            ventasCategorias={ventasCategorias}
            ventasExpandido={ventasExpandido}
            setVentasExpandido={setVentasExpandido}
            totalVentasGenerado={totalVentasGenerado}
            formatFechaCreacion={formatFechaCreacion}
          />
        )}
        {selectedSection === 'servicios' && (
          <Servicios
            userEmail={adminData.email}
            onPendingCount={setServiciosPendientes}
          />
        )}
        {selectedSection === 'empleados' && (
          <Empleado />
        )}
        {selectedSection === 'productos' && (
          <Productos />
        )}
        {/* Renderiza Redes si está seleccionada */}
        {selectedSection === 'redes' && (
          <Redes />
        )}
      </main>
    </div>
  );
}