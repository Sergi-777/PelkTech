import React, { useRef, useState, useEffect } from 'react';
import './HomePage_Admin.css';
import { getAuth, signOut } from "firebase/auth";
// Importa Firestore
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
// Agrega import para Productos
import Productos from '../PRODUCTOS/Productos';
import { FaBox } from 'react-icons/fa';

export default function HomePage_Admin() {
  const [comobarExpanded, setComobarExpanded] = useState(false);
  const [selectedSection, setSelectedSection] = useState('ventas');
  const [empleados, setEmpleados] = useState([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const [editEmpleado, setEditEmpleado] = useState(null);
  const [adminName, setAdminName] = useState(""); // Nuevo: nombre real del admin
  const [showAddEmpleado, setShowAddEmpleado] = useState(false);
  const [newEmpleado, setNewEmpleado] = useState({
    name: "",
    email: "",
    rol: "",
    telefono: ""
  });
  const [addingEmpleado, setAddingEmpleado] = useState(false);
  const [carritos, setCarritos] = useState([]);
  const [carritosClientes, setCarritosClientes] = useState({});
  const [ventasEstadoFiltro, setVentasEstadoFiltro] = useState('Todas');
  const [serviciosEstadoFiltro, setServiciosEstadoFiltro] = useState('Todas');
  const [ventasExpandido, setVentasExpandido] = useState(null);
  const [serviciosExpandido, setServiciosExpandido] = useState(null);
  const [redesInfo, setRedesInfo] = useState({
    correo: "",
    facebook: "",
    twitter: "",
    instagram: "",
    whatsapp: ""
  });
  const [loadingRedes, setLoadingRedes] = useState(false);
  const [editandoRedes, setEditandoRedes] = useState(false);
  const [redesGuardando, setRedesGuardando] = useState(false);
  const hoverTimeout = useRef(null);

  // Obtener email del usuario autenticado
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user && user.email) {
        // Busca en EMPLEADOS el documento con ese email
        const ref = doc(db, 'EMPLEADOS', user.email);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setAdminName(snap.data().name || "");
        } else {
          setAdminName(""); // fallback
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Simula datos de usuario administrador (puedes reemplazarlo por los datos reales si los tienes)
  const user = { name: "" };

  // Obtiene el primer nombre
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
    const auth = getAuth();
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  // Cargar empleados de Firestore
  useEffect(() => {
    if (selectedSection !== 'empleados') return;
    setLoadingEmpleados(true);
    async function fetchEmpleados() {
      try {
        const col = collection(db, 'EMPLEADOS');
        const snap = await getDocs(col);
        const arr = [];
        snap.forEach(docSnap => {
          arr.push({ id: docSnap.id, ...docSnap.data() });
        });
        setEmpleados(arr);
      } catch (err) {
        alert('Error al cargar empleados: ' + err.message);
      }
      setLoadingEmpleados(false);
    }
    fetchEmpleados();
  }, [selectedSection]);

  // Eliminar empleado
  const handleBorrarEmpleado = async (empleado) => {
    if (!window.confirm(`¿Seguro que deseas borrar a ${empleado.name}?`)) return;
    try {
      await deleteDoc(doc(db, 'EMPLEADOS', empleado.email));
      setEmpleados(prev => prev.filter(e => e.email !== empleado.email));
    } catch (err) {
      alert('Error al borrar empleado: ' + err.message);
    }
  };

  // Guardar edición de empleado
  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'EMPLEADOS', editEmpleado.email), {
        name: editEmpleado.name,
        telefono: editEmpleado.telefono,
        rol: editEmpleado.rol
      });
      setEmpleados(prev =>
        prev.map(emp => emp.email === editEmpleado.email ? { ...emp, ...editEmpleado } : emp)
      );
      setEditEmpleado(null);
    } catch (err) {
      alert('Error al editar empleado: ' + err.message);
    }
  };

  // Agregar empleado
  const handleAgregarEmpleado = async (e) => {
    e.preventDefault();
    if (!newEmpleado.name || !newEmpleado.email || !newEmpleado.rol) {
      alert("Completa todos los campos obligatorios.");
      return;
    }
    setAddingEmpleado(true);
    try {
      // Obtener fecha formateada
      const now = new Date();
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const fecha_creacion_ = `${now.getDate()} de ${meses[now.getMonth()]} de ${now.getFullYear()}, ${now.toLocaleTimeString('es-CO')} UTC${-now.getTimezoneOffset()/60}`;
      await setDoc(doc(db, 'EMPLEADOS', newEmpleado.email), {
        ...newEmpleado,
        fecha_creacion_,
        timestamp: serverTimestamp()
      });
      setEmpleados(prev => [...prev, { ...newEmpleado, fecha_creacion_ }]);
      setShowAddEmpleado(false);
      setNewEmpleado({ name: "", email: "", rol: "", telefono: "" });
    } catch (err) {
      alert('Error al agregar empleado: ' + err.message);
    }
    setAddingEmpleado(false);
  };

  // Cargar todos los carritos (HISTORIAL)
  useEffect(() => {
    if (selectedSection !== 'ventas' && selectedSection !== 'servicios') return;
    const fetchCarritos = async () => {
      try {
        const col = collection(db, 'HISTORIAL');
        const snap = await getDocs(col);
        let allCarritos = [];
        snap.forEach(docSnap => {
          const data = docSnap.data();
          const carritosArr = Object.entries(data)
            .filter(([key, value]) =>
              typeof value === 'object' &&
              value !== null &&
              !Array.isArray(value)
            )
            .map(([id, carrito]) => ({
              id,
              ...carrito,
              _usuario: docSnap.id
            }));
          allCarritos = allCarritos.concat(carritosArr);
        });
        setCarritos(allCarritos);
      } catch (err) {
        alert('Error al cargar ventas/servicios: ' + err.message);
      }
    };
    fetchCarritos();
  }, [selectedSection]);

  // Cargar clientes de carritos
  useEffect(() => {
    async function fetchClientes() {
      const clientesObj = {};
      for (const carrito of carritos) {
        if (carritosClientes[carrito.id]) continue;
        if (!carrito.email) continue;
        let clienteData = null;
        try {
          const ref = doc(db, 'CLIENTES', carrito.email);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            clienteData = snap.data();
          }
        } catch {}
        clientesObj[carrito.id] = {
          name: clienteData?.name || clienteData?.nombre || '',
          lastName: clienteData?.lastName || clienteData?.apellido || '',
          email: clienteData?.email || carrito.email,
          telefono: clienteData?.telefono || '',
          direccion: clienteData?.direccion || ''
        };
      }
      if (Object.keys(clientesObj).length > 0) {
        setCarritosClientes(prev => ({ ...prev, ...clientesObj }));
      }
    }
    if ((selectedSection === 'ventas' || selectedSection === 'servicios') && carritos.length > 0) fetchClientes();
    // eslint-disable-next-line
  }, [carritos, selectedSection]);

  // Utilidad para formatear fecha
  function formatFechaCreacion(ts) {
    if (!ts) return 'N/A';
    // Si es string en formato YYYY-MM-DD, parsear manualmente
    if (typeof ts === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(ts)) {
      const [anio, mes, dia] = ts.split('-');
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return `${parseInt(dia, 10)} de ${meses[parseInt(mes, 10) - 1]} del ${anio}`;
    }
    let dateObj = ts.toDate ? ts.toDate() : ts;
    if (!(dateObj instanceof Date)) dateObj = new Date(dateObj);
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const dia = dateObj.getDate();
    const mes = meses[dateObj.getMonth()];
    const anio = dateObj.getFullYear();
    return `${dia} de ${mes} del ${anio}`;
  }

  // Utilidad para formatear fecha de Firebase Timestamp o string
  function formatFechaCreacionEmpleado(fecha) {
    if (!fecha) return 'N/A';
    if (typeof fecha === 'string') return fecha;
    if (fecha.toDate) {
      const d = fecha.toDate();
      return `${d.getDate()} de ${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][d.getMonth()]} del ${d.getFullYear()}, ${d.toLocaleTimeString('es-CO')}`;
    }
    if (fecha instanceof Date) {
      return `${fecha.getDate()} de ${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][fecha.getMonth()]} del ${fecha.getFullYear()}, ${fecha.toLocaleTimeString('es-CO')}`;
    }
    return String(fecha);
  }

  // Estados únicos para ventas y servicios
  const ventasEstadosUnicos = Array.from(
    new Set(carritos.filter(c => (c.type || '').toUpperCase() === 'PRODUCTOS').map(c => (c.status || c.estado || '').toUpperCase()).filter(Boolean))
  );
  const ventasCategorias = ['Todas', ...ventasEstadosUnicos];

  const serviciosEstadosUnicos = Array.from(
    new Set(carritos.filter(c => (c.type || '').toUpperCase() !== 'PRODUCTOS').map(c => (c.status || c.estado || '').toUpperCase()).filter(Boolean))
  );
  const serviciosCategorias = ['Todas', ...serviciosEstadosUnicos];

  // Calcular total generado para ventas (carritos)
  const totalVentasGenerado = carritos
    .filter(carrito => (carrito.type || '').toUpperCase() === 'PRODUCTOS')
    .filter(carrito => (carrito.status || carrito.estado || '').toUpperCase() !== 'PENDIENTE PAGO')
    .reduce((sum, carrito) => sum + (Number(carrito.total) || 0), 0);

  // Calcular total generado para servicios (tickets)
  const totalServiciosGenerado = carritos
    .filter(carrito => (carrito.type || '').toUpperCase() !== 'PRODUCTOS')
    .filter(carrito => {
      const estado = (carrito.status || carrito.estado || '').toUpperCase();
      return estado === 'REPARACION' || estado === 'PRUEBAS DE RENDIMIENTO' || estado === 'ENTREGADO';
    })
    .reduce((sum, carrito) => sum + (Number(carrito.precio) || 0), 0);

  // Nuevo: cargar datos de REDES/REDESSOCIALES
  useEffect(() => {
    if (selectedSection !== 'info') return;
    setLoadingRedes(true);
    async function fetchRedes() {
      try {
        const ref = doc(db, "REDES", "REDESSOCIALES");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRedesInfo(snap.data());
        } else {
          setRedesInfo({
            correo: "",
            facebook: "",
            twitter: "",
            instagram: "",
            whatsapp: ""
          });
        }
      } catch {
        setRedesInfo({
          correo: "",
          facebook: "",
          twitter: "",
          instagram: "",
          whatsapp: ""
        });
      }
      setLoadingRedes(false);
    }
    fetchRedes();
  }, [selectedSection]);

  // Nuevo: guardar cambios en REDES/REDESSOCIALES y mostrar toast
  const handleGuardarRedes = async (e) => {
    e.preventDefault();
    setRedesGuardando(true);
    try {
      await setDoc(doc(db, "REDES", "REDESSOCIALES"), redesInfo);
      setEditandoRedes(false);
      toast.success("Información actualizada correctamente.");
    } catch (err) {
      toast.error("Error al guardar información: " + err.message);
    }
    setRedesGuardando(false);
  };

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
            >
              <span className="homepage-admin-nav-icon" aria-label="Ventas">💰</span>
              <span className="homepage-admin-nav-text">Ventas</span>
            </li>
            <li
              onClick={() => setSelectedSection('servicios')}
              className={selectedSection === 'servicios' ? 'homepage-admin-nav-li selected' : 'homepage-admin-nav-li'}
            >
              <span className="homepage-admin-nav-icon" aria-label="Servicios">🛠️</span>
              <span className="homepage-admin-nav-text">Servicios</span>
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
              <span className="homepage-admin-nav-icon" aria-label="Productos"><FaBox /></span>
              <span className="homepage-admin-nav-text">Productos</span>
            </li>
            {/* Nuevo botón Información */}
            <li
              onClick={() => setSelectedSection('info')}
              className={selectedSection === 'info' ? 'homepage-admin-nav-li selected' : 'homepage-admin-nav-li'}
            >
              <span className="homepage-admin-nav-icon" aria-label="Información">ℹ️</span>
              <span className="homepage-admin-nav-text">Información</span>
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
            ¡Bienvenido, {getPrimerNombre(adminName) || 'Administrador'}!
          </h1>
          <p>
            Aquí puedes gestionar ventas, servicios y empleados.
          </p>
        </header>
        {selectedSection === 'ventas' && (
          <section className="homepage-admin-section">
            <h2>Ventas</h2>
            {/* Total generado */}
            <div style={{ fontWeight: 600, marginBottom: '0.7em', color: '#2563eb', fontSize: '1.15em' }}>
              Total generado: ${totalVentasGenerado.toLocaleString('es-CO')}
            </div>
            {/* Filtros de estado */}
            <div className="homepage-admin-estado-filtros">
              {ventasCategorias.map(cat => (
                <button
                  key={cat}
                  className={`homepage-admin-estado-btn${ventasEstadoFiltro === cat ? ' selected' : ''}`}
                  onClick={() => setVentasEstadoFiltro(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            {/* Lista de ventas (carritos productos) */}
            <ul className="homepage-admin-ventas-list">
              {carritos
                .filter(carrito => (carrito.type || '').toUpperCase() === 'PRODUCTOS')
                .filter(carrito => {
                  if (ventasEstadoFiltro === 'Todas') return true;
                  const estado = (carrito.status || carrito.estado || '').toUpperCase();
                  return estado === ventasEstadoFiltro.toUpperCase();
                }).length === 0 ? (
                <div className="homepage-admin-loading">No hay ventas registradas.</div>
              ) : (
                carritos
                  .filter(carrito => (carrito.type || '').toUpperCase() === 'PRODUCTOS')
                  .filter(carrito => {
                    if (ventasEstadoFiltro === 'Todas') return true;
                    const estado = (carrito.status || carrito.estado || '').toUpperCase();
                    return estado === ventasEstadoFiltro.toUpperCase();
                  })
                  .map(carrito => {
                    const cliente = carritosClientes[carrito.id] || {};
                    const expandido = ventasExpandido === carrito.id;
                    return (
                      <li
                        key={`${carrito._usuario || 'unknown'}_${carrito.id}`}
                        className="homepage-admin-ventas-li"
                        onClick={() => setVentasExpandido(expandido ? null : carrito.id)}
                      >
                        <div className="homepage-admin-ventas-header">
                          <span>Carrito #{carrito.id}</span>
                          <span className={`homepage-admin-ventas-arrow${expandido ? ' expanded' : ''}`}>▶</span>
                        </div>
                        <div>
                          <strong>Estado:</strong>{" "}
                          <span className="homepage-admin-ventas-estado">
                            {carrito.status || carrito.estado || 'Desconocido'}
                          </span>
                        </div>
                        {expandido && (
                          <>
                            <div className="homepage-admin-ventas-detalle">
                              <strong>Cliente:</strong> {cliente.name} {cliente.lastName} <br />
                              <strong>Email:</strong> {cliente.email} <br />
                              <strong>Teléfono:</strong> {cliente.telefono} <br />
                              {cliente.direccion && (
                                <>
                                  <strong>Dirección:</strong> {cliente.direccion} <br />
                                </>
                              )}
                            </div>
                            <div>
                              <strong>Productos:</strong>
                              <ul className="homepage-admin-ventas-productos">
                                {Array.isArray(carrito.items) && carrito.items.length > 0 ? (
                                  carrito.items.map((item, idx) => (
                                    <li key={idx} className="homepage-admin-ventas-producto">
                                      {item.url && (
                                        <img
                                          src={item.url}
                                          alt={item.name}
                                          className="homepage-admin-ventas-img"
                                        />
                                      )}
                                      <div>
                                        <div className="homepage-admin-ventas-producto-nombre">{item.name || 'Producto'}</div>
                                        <div className="homepage-admin-ventas-producto-detalle">
                                          Cantidad: {item.cantidad || 1} &nbsp;|&nbsp; Precio: ${item.price?.toLocaleString?.() ?? item.price ?? 0}
                                        </div>
                                      </div>
                                    </li>
                                  ))
                                ) : (
                                  <li className="homepage-admin-ventas-producto-sin">Sin productos</li>
                                )}
                              </ul>
                            </div>
                            <div className="homepage-admin-ventas-total">
                              <strong>Total:</strong> ${carrito.total?.toLocaleString?.() ?? carrito.total ?? 'N/A'}
                            </div>
                            {carrito.createdAt && (
                              <div className="homepage-admin-ventas-fecha">
                                <strong>Fecha:</strong> {formatFechaCreacion(carrito.createdAt)}
                              </div>
                            )}
                          </>
                        )}
                      </li>
                    );
                  })
              )}
            </ul>
          </section>
        )}
        {selectedSection === 'servicios' && (
          <section className="homepage-admin-section">
            <h2>Servicios</h2>
            {/* Total generado */}
            <div style={{ fontWeight: 600, marginBottom: '0.7em', color: '#2563eb', fontSize: '1.15em' }}>
              Total generado: ${totalServiciosGenerado.toLocaleString('es-CO')}
            </div>
            {/* Filtros de estado */}
            <div className="homepage-admin-estado-filtros">
              {serviciosCategorias.map(cat => (
                <button
                  key={cat}
                  className={`homepage-admin-estado-btn${serviciosEstadoFiltro === cat ? ' selected' : ''}`}
                  onClick={() => setServiciosEstadoFiltro(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            {/* Lista de servicios (tickets) */}
            <ul className="homepage-admin-servicios-list">
              {carritos
                .filter(carrito => (carrito.type || '').toUpperCase() !== 'PRODUCTOS')
                .filter(carrito => {
                  if (serviciosEstadoFiltro === 'Todas') return true;
                  const estado = (carrito.status || carrito.estado || '').toUpperCase();
                  return estado === serviciosEstadoFiltro.toUpperCase();
                }).length === 0 ? (
                <div className="homepage-admin-loading">No hay servicios registrados.</div>
              ) : (
                carritos
                  .filter(carrito => (carrito.type || '').toUpperCase() !== 'PRODUCTOS')
                  .filter(carrito => {
                    if (serviciosEstadoFiltro === 'Todas') return true;
                    const estado = (carrito.status || carrito.estado || '').toUpperCase();
                    return estado === serviciosEstadoFiltro.toUpperCase();
                  })
                  .map(carrito => {
                    const cliente = carritosClientes[carrito.id] || {};
                    const expandido = serviciosExpandido === carrito.id;
                    return (
                      <li
                        key={`${carrito._usuario || 'unknown'}_${carrito.id}`}
                        className="homepage-admin-servicios-li"
                        onClick={() => setServiciosExpandido(expandido ? null : carrito.id)}
                      >
                        <div className="homepage-admin-servicios-header">
                          <span>Ticket #{carrito.id}</span>
                          <span className={`homepage-admin-servicios-arrow${expandido ? ' expanded' : ''}`}>▶</span>
                        </div>
                        <div>
                          <strong>Estado:</strong>{" "}
                          <span className="homepage-admin-servicios-estado">
                            {carrito.status || carrito.estado || 'Desconocido'}
                          </span>
                        </div>
                        {expandido && (
                          <>
                            <div className="homepage-admin-servicios-detalle">
                              <strong>Cliente:</strong> {cliente.name} {cliente.lastName} <br />
                              <strong>Email:</strong> {cliente.email} <br />
                              <strong>Teléfono:</strong> {cliente.telefono} <br />
                              {cliente.direccion && (
                                <>
                                  <strong>Dirección:</strong> {cliente.direccion} <br />
                                </>
                              )}
                            </div>
                            <div>
                              <strong>Tipo:</strong> {carrito.type || 'N/A'}
                            </div>
                            {carrito.dispositivo && (
                              <div>
                                <strong>Dispositivo:</strong>{" "}
                                {carrito.dispositivo.marca} {carrito.dispositivo.modelo} {carrito.dispositivo.serie}
                              </div>
                            )}
                            {carrito.problema && (
                              <div>
                                <strong>Problema:</strong> {carrito.problema}
                              </div>
                            )}
                            {carrito.como && (
                              <div>
                                <strong>¿Cómo sucedió?:</strong> {carrito.como}
                              </div>
                            )}
                            {carrito.createdAt && (
                              <div className="homepage-admin-servicios-fecha">
                                <strong>Fecha de creación:</strong> {formatFechaCreacion(carrito.createdAt)}
                              </div>
                            )}
                            {/* Mostrar fecha de la cita si existe */}
                            {carrito.fechadelacita && (
                              <div className="homepage-admin-servicios-fecha-cita">
                                <strong>Fecha de la cita:</strong>{" "}
                                {formatFechaCreacion(carrito.fechadelacita)}
                              </div>
                            )}
                            {(carrito.diagnostico || carrito.fechaDiagnostico || carrito.fechaReparacion || carrito.fechaEntregado) && (
                              <div className="homepage-admin-servicios-mantenimiento">
                                {carrito.fechaDiagnostico && (
                                  <div>
                                    <strong>Fecha diagnóstico:</strong>{" "}
                                    {(() => {
                                      const d = new Date(carrito.fechaDiagnostico);
                                      return `${d.getDate()} de ${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][d.getMonth()]} del ${d.getFullYear()}`;
                                    })()}
                                  </div>
                                )}
                                {carrito.diagnostico && (
                                  <div>
                                    <strong>Diagnóstico:</strong> {carrito.diagnostico}
                                  </div>
                                )}
                                {carrito.precio && (
                                  <div>
                                    <strong>Precio:</strong> {carrito.precio ? `$${Number(carrito.precio).toLocaleString('es-CO')}` : 'N/A'}
                                  </div>
                                )}
                                {carrito.fechaReparacion && (
                                  <div>
                                    <strong>Fecha reparación:</strong>{" "}
                                    {(() => {
                                      const d = new Date(carrito.fechaReparacion);
                                      return `${d.getDate()} de ${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][d.getMonth()]} del ${d.getFullYear()}`;
                                    })()}
                                  </div>
                                )}
                                {carrito.observaciones && (
                                  <div>
                                    <strong>Pruebas de rendimiento / Observaciones:</strong> {carrito.observaciones}
                                  </div>
                                )}
                                {carrito.fechaEntregado && (
                                  <div>
                                    <strong>Fecha entregado:</strong>{" "}
                                    {(() => {
                                      const d = new Date(carrito.fechaEntregado);
                                      return `${d.getDate()} de ${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][d.getMonth()]} del ${d.getFullYear()}`;
                                    })()}
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </li>
                    );
                  })
              )}
            </ul>
          </section>
        )}
        {selectedSection === 'empleados' && (
          <section className="homepage-admin-section">
            <h2>Empleados</h2>
            {/* Botón agregar empleado */}
            <button
              className="homepage-admin-btn-add"
              onClick={() => setShowAddEmpleado(true)}
            >
              + Agregar empleado
            </button>
            {/* Modal agregar empleado */}
            {showAddEmpleado && (
              <div
                className="editar-empleado-overlay"
                onClick={e => {
                  if (e.target.classList.contains('editar-empleado-overlay')) setShowAddEmpleado(false);
                }}
              >
                <form
                  className="editar-empleado-modal"
                  onClick={e => e.stopPropagation()}
                  onSubmit={handleAgregarEmpleado}
                >
                  <div className="editar-empleado-modal-title">Agregar empleado</div>
                  <label>
                    Nombre:
                    <input
                      type="text"
                      value={newEmpleado.name}
                      onChange={e => setNewEmpleado({ ...newEmpleado, name: e.target.value })}
                      className="editar-empleado-input"
                      autoFocus
                      required
                    />
                  </label>
                  <label>
                    Rol:
                    <select
                      value={newEmpleado.rol}
                      onChange={e => setNewEmpleado({ ...newEmpleado, rol: e.target.value })}
                      className="editar-empleado-select"
                      required
                    >
                      <option value="">Selecciona rol</option>
                      <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                      <option value="TECNICO">TECNICO</option>
                    </select>
                  </label>
                  <label>
                    Teléfono:
                    <input
                      type="text"
                      value={newEmpleado.telefono}
                      onChange={e => setNewEmpleado({ ...newEmpleado, telefono: e.target.value })}
                      className="editar-empleado-input"
                    />
                  </label>
                  <label>
                    Email:
                    <input
                      type="email"
                      value={newEmpleado.email}
                      onChange={e => setNewEmpleado({ ...newEmpleado, email: e.target.value })}
                      className="editar-empleado-input"
                      required
                    />
                  </label>
                  <div className="editar-empleado-modal-btns">
                    <button
                      type="submit"
                      className="editar-empleado-btn-guardar"
                      disabled={addingEmpleado}
                    >
                      {addingEmpleado ? "Agregando..." : "Agregar"}
                    </button>
                    <button
                      type="button"
                      className="editar-empleado-btn-cancelar"
                      onClick={() => setShowAddEmpleado(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
            {/* Aquí va el contenido de empleados */}
            {loadingEmpleados ? (
              <div className="homepage-admin-loading">Cargando empleados...</div>
            ) : empleados.length === 0 ? (
              <div className="homepage-admin-loading">No hay empleados registrados.</div>
            ) : (
              <div className="homepage-admin-empleados-list">
                {empleados.map(emp => (
                  <div key={emp.email} className="homepage-admin-empleado-card">
                    <div className="homepage-admin-empleado-nombre">{emp.name}</div>
                    <div className="homepage-admin-empleado-email">{emp.email}</div>
                    <div className="homepage-admin-empleado-rol">
                      <strong>Rol:</strong> {emp.rol}
                    </div>
                    <div className="homepage-admin-empleado-tel">
                      <strong>Teléfono:</strong> {emp.telefono}
                    </div>
                    {/* Mostrar fecha de creación si existe */}
                    {emp.fecha_creacion_ && (
                      <div className="homepage-admin-empleado-fecha">
                        <strong>Fecha de creación:</strong> {formatFechaCreacionEmpleado(emp.fecha_creacion_)}
                      </div>
                    )}
                    <div className="homepage-admin-empleado-btns">
                      <button
                        className="homepage-admin-btn-editar"
                        onClick={() => setEditEmpleado(emp)}
                      >
                        Editar
                      </button>
                      <button
                        className="homepage-admin-btn-borrar"
                        onClick={() => handleBorrarEmpleado(emp)}
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Modal de edición */}
            {editEmpleado && (
              <div
                className="editar-empleado-overlay"
                onClick={e => {
                  if (e.target.classList.contains('editar-empleado-overlay')) setEditEmpleado(null);
                }}
              >
                <form
                  className="editar-empleado-modal"
                  onClick={e => e.stopPropagation()}
                  onSubmit={handleGuardarEdicion}
                >
                  <div className="editar-empleado-modal-title">Editar empleado</div>
                  <label>
                    Nombre:
                    <input
                      type="text"
                      value={editEmpleado.name}
                      onChange={e => setEditEmpleado({ ...editEmpleado, name: e.target.value })}
                      className="editar-empleado-input"
                      autoFocus
                    />
                  </label>
                  <label>
                    Rol:
                    <select
                      value={editEmpleado.rol}
                      onChange={e => setEditEmpleado({ ...editEmpleado, rol: e.target.value })}
                      className="editar-empleado-select"
                      required
                    >
                      <option value="">Selecciona rol</option>
                      <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                      <option value="TECNICO">TECNICO</option>
                    </select>
                  </label>
                  <label>
                    Teléfono:
                    <input
                      type="text"
                      value={editEmpleado.telefono}
                      onChange={e => setEditEmpleado({ ...editEmpleado, telefono: e.target.value })}
                      className="editar-empleado-input"
                    />
                  </label>
                  <label>
                    Email:
                    <input
                      type="text"
                      value={editEmpleado.email}
                      readOnly
                      className="editar-empleado-input editar-empleado-input-readonly"
                    />
                  </label>
                  {/* Mostrar fecha de creación solo si existe */}
                  {editEmpleado.fecha_creacion_ && (
                    <label>
                      Fecha de creación:
                      <input
                        type="text"
                        value={formatFechaCreacionEmpleado(editEmpleado.fecha_creacion_)}
                        readOnly
                        className="editar-empleado-input editar-empleado-input-readonly"
                      />
                    </label>
                  )}
                  <div className="editar-empleado-modal-btns">
                    <button
                      type="submit"
                      className="editar-empleado-btn-guardar"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      className="editar-empleado-btn-cancelar"
                      onClick={() => setEditEmpleado(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}
        {/* Renderiza Productos */}
        {selectedSection === 'productos' && (
          <Productos />
        )}
        {/* Sección de Información de Redes Sociales */}
        {selectedSection === 'info' && (
          <section className="homepage-admin-section">
            <h2>Información de Redes Sociales</h2>
            {loadingRedes ? (
              <div className="homepage-admin-loading">Cargando información...</div>
            ) : (
              <form onSubmit={handleGuardarRedes} style={{ maxWidth: 480 }}>
                <label>
                  Correo:
                  <input
                    type="email"
                    value={redesInfo.correo || ""}
                    onChange={e => setRedesInfo({ ...redesInfo, correo: e.target.value })}
                    className="editar-empleado-input"
                    disabled={!editandoRedes}
                  />
                </label>
                <label>
                  Facebook:
                  <input
                    type="url"
                    value={redesInfo.facebook || ""}
                    onChange={e => setRedesInfo({ ...redesInfo, facebook: e.target.value })}
                    className="editar-empleado-input"
                    disabled={!editandoRedes}
                  />
                </label>
                <label>
                  Twitter:
                  <input
                    type="url"
                    value={redesInfo.twitter || ""}
                    onChange={e => setRedesInfo({ ...redesInfo, twitter: e.target.value })}
                    className="editar-empleado-input"
                    disabled={!editandoRedes}
                  />
                </label>
                <label>
                  Instagram:
                  <input
                    type="url"
                    value={redesInfo.instagram || ""}
                    onChange={e => setRedesInfo({ ...redesInfo, instagram: e.target.value })}
                    className="editar-empleado-input"
                    disabled={!editandoRedes}
                  />
                </label>
                <label>
                  WhatsApp:
                  <input
                    type="text"
                    value={redesInfo.whatsapp || ""}
                    onChange={e => setRedesInfo({ ...redesInfo, whatsapp: e.target.value })}
                    className="editar-empleado-input"
                    disabled={!editandoRedes}
                  />
                </label>
                <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    className="editar-empleado-btn-guardar"
                    onClick={() => setEditandoRedes(!editandoRedes)}
                  >
                    {editandoRedes ? "Cancelar" : "Editar"}
                  </button>
                  <button
                    type="submit"
                    className="editar-empleado-btn-guardar"
                    style={{ display: editandoRedes ? "inline-block" : "none" }}
                    disabled={redesGuardando}
                  >
                    {redesGuardando ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
      </main>
      <ToastContainer />
    </div>
  );
}