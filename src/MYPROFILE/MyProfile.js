import React, { useState, useEffect } from 'react';
// Importa Firestore y helpers
import { db } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot, updateDoc as updateDocFirestore, deleteField } from 'firebase/firestore';
import AgregarDispositivos from '../AGREGARDISPOSITIVOS/AgregarDispositivos';
import { MdDevices } from 'react-icons/md'; // Icono de dispositivo
import { FiMoreVertical } from 'react-icons/fi'; // Icono de tres puntos
import ConfirmationMessage from '../RESOURCES/CONFIRMATIONDELETE/ConfirmationMessage';
import Mantenimiento from '../MANTENIMIENTO/Mantenimiento'; // Importa el modal de mantenimiento
import './MyProfileweb.css';
import './MyProfileMovil.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Hook para detectar si es móvil
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.innerWidth <= 900 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      : false
  );
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

const MyProfile = ({ open, onClose, user, userName, userLastName }) => {
  const [editing, setEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Abre el modal de edición
  const [form, setForm] = useState({
    nombre: userName || '',
    apellido: userLastName || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || ''
  });
  const [timestamp, setTimestamp] = useState(user?.timestamp || null);
  const [showAgregarDispositivo, setShowAgregarDispositivo] = useState(false);
  const [dispositivoEditando, setDispositivoEditando] = useState(null); // Nuevo estado para edición
  const [dispositivos, setDispositivos] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null); // id del dispositivo con menú abierto
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [dispositivoAEliminar, setDispositivoAEliminar] = useState(null);
  const [carritos, setCarritos] = useState([]); // Nuevo estado para historial de carritos
  const [carritoExpandido, setCarritoExpandido] = useState(null); // Nuevo estado para expandir detalles
  const [estadoFiltro, setEstadoFiltro] = useState('Todas'); // Nuevo estado para filtro de estado
  const [showMantenimiento, setShowMantenimiento] = useState(false); // Nuevo estado para modal de mantenimiento
  const [dispositivoMantenimiento, setDispositivoMantenimiento] = useState(null); // Dispositivo seleccionado para mantenimiento
  const isMobile = useIsMobile();

  // Sincroniza datos en tiempo real desde Firestore
  useEffect(() => {
    if (!user?.email) return;
    const userRef = doc(db, 'CLIENTES', user.email);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setForm({
          nombre: data.name || '',
          apellido: data.lastName || '',
          email: data.email || '',
          telefono: data.telefono || '',
          direccion: data.direccion || ''
        });
        setTimestamp(data.timestamp || null);
      }
    });
    return () => unsubscribe();
  }, [user?.email]);

  // Snapshot para dispositivos del usuario
  useEffect(() => {
    if (!user?.email) return;
    const dispositivosRef = doc(db, 'DISPOSITIVOS', user.email);
    const unsubscribe = onSnapshot(dispositivosRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // Convierte el objeto de dispositivos en un array [{id, ...info}]
        const dispositivosArr = Object.entries(data).map(([id, info]) => ({
          id,
          ...info
        }));
        setDispositivos(dispositivosArr);
      } else {
        setDispositivos([]);
      }
    });
    return () => unsubscribe();
  }, [user?.email]);

  // Snapshot para historial de carritos del usuario
  useEffect(() => {
    if (!user?.email) return;
    const historialRef = doc(db, 'HISTORIAL', user.email);
    const unsubscribe = onSnapshot(historialRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // Filtra solo los campos que sean tipo mapa (objeto plano, no array, no null)
        const carritosArr = Object.entries(data)
          .filter(([key, value]) =>
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
          )
          .map(([id, carrito]) => ({ id, ...carrito }));
        setCarritos(carritosArr);
      } else {
        setCarritos([]);
      }
    });
    return () => unsubscribe();
  }, [user?.email]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setEditing(true);
    setShowEditModal(true); // Abre el modal de edición
  };

  const handleSave = async () => {
    try {
      const userRef = doc(db, 'CLIENTES', user?.email);
      const userSnap = await getDoc(userRef);
      let updateData = {
        name: form.nombre,
        lastName: form.apellido,
        email: form.email,
        telefono: form.telefono,
        direccion: form.direccion
      };
      // Si no existe el campo timestamp, agrégalo como serverTimestamp
      if (!userSnap.exists() || !userSnap.data().timestamp) {
        updateData.timestamp = serverTimestamp();
      }
      await updateDoc(userRef, updateData);
      toast.success('Actualización de datos correcta');
      setEditing(false);
      setShowEditModal(false); // Cierra el modal de edición
    } catch (err) {
      toast.error('Error al actualizar los datos');
    }
  };

  // Función para formatear la fecha como "28 de Junio del 2025"
  function formatFechaCreacion(ts) {
    if (!ts) return 'N/A';
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

  // Cierra el menú contextual al hacer click fuera
  useEffect(() => {
    if (menuOpen === null) return;
    const handleClick = (e) => {
      if (!e.target.closest('.dispositivo-menu')) setMenuOpen(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Función para borrar el dispositivo
  const handleDeleteDispositivo = async () => {
    if (!user?.email || !dispositivoAEliminar) return;
    try {
      const dispositivosRef = doc(db, 'DISPOSITIVOS', user.email);
      const { id } = dispositivoAEliminar;
      await updateDocFirestore(dispositivosRef, {
        [id]: deleteField()
      });
      toast.success('Dispositivo eliminado correctamente');
    } catch (err) {
      toast.error('Error al eliminar el dispositivo');
    } finally {
      setConfirmationOpen(false);
      setDispositivoAEliminar(null);
    }
  };

  // Obtener dinámicamente los estados presentes en los carritos
  const estadosUnicos = Array.from(
    new Set(carritos.map(c => (c.status || c.estado || '').toUpperCase()).filter(Boolean))
  );
  const categorias = ['Todas', ...estadosUnicos];

  // Helper: obtener el último status de mantenimiento para un dispositivo desde el historial
  const getEstadoDispositivoDesdeHistorial = (dispId) => {
    // Filtra solo pedidos de tipo SERVICIO para este dispositivo
    const servicios = carritos
      .filter(c => c.type === 'SERVICIO' && c.dispositivo && c.dispositivo.id === dispId)
      // Ordena por fecha de creación descendente
      .sort((a, b) => {
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return bDate - aDate;
      });
    // Devuelve el status del más reciente, o null si no hay
    return servicios.length > 0 ? (servicios[0].status || servicios[0].estado || null) : null;
  };

  if (!open || !user) return null;

  // Handler para cerrar el modal principal al hacer click en el overlay
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('myprofile-modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="myprofile-modal-overlay" onClick={handleOverlayClick}>
      <div className="myprofile-modal" onClick={e => e.stopPropagation()}>
        <div className="myprofile-modal-header">
          <span className="myprofile-title">Perfil</span>
          <button
            className="myprofile-close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {/* Layout: grid para web, vertical para móvil */}
        {isMobile ? (
          <div className="myprofile-main-vertical" style={{ display: 'flex', flexDirection: 'column', gap: '1.5em', padding: '1.5em', overflowY: 'auto', height: 'calc(100vh - 80px)' }}>
            {/* Perfil */}
            <div className="myprofile-container">
              <h2>Mi Perfil</h2>
              <div><strong>Nombre:</strong> {form.nombre} {form.apellido}</div>
              <div><strong>Email:</strong> {form.email}</div>
              <div><strong>Teléfono:</strong> {form.telefono}</div>
              <div><strong>Dirección:</strong> {form.direccion}</div>
              <div style={{ marginTop: '1em', borderTop: '1px solid #eee', paddingTop: '1em' }}>
                <div><strong>Rol:</strong> {user?.rol || 'Usuario'}</div>
                <div>
                  <strong>Fecha de Vinculación:</strong>{" "}
                  {timestamp ? formatFechaCreacion(timestamp) : 'N/A'}
                </div>
              </div>
              <div style={{ marginTop: '1.5em', display: 'flex', gap: '1em' }}>
                <button
                  className="myprofile-action-btn"
                  onClick={() => setShowAgregarDispositivo(true)}
                >
                  Agregar dispositivo
                </button>
                <button
                  className="myprofile-action-btn"
                  onClick={handleEdit}
                >
                  Editar información personal
                </button>
              </div>
            </div>
            {/* Dispositivos */}
            <div className="myprofile-right-col">
              <h3 style={{ marginBottom: '0.5em' }}>Mis dispositivos</h3>
              {dispositivos.length === 0 ? (
                <div style={{ color: '#888', fontSize: '0.98em' }}>No tienes dispositivos registrados.</div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1em',
                    justifyContent: 'flex-start'
                  }}
                >
                  {dispositivos.map((disp) => {
                    // Obtener el estado desde el historial, si existe
                    const estadoHistorial = getEstadoDispositivoDesdeHistorial(disp.id);
                    // Si el status es ENTREGADO, no mostrar nada
                    const mostrarEstado = estadoHistorial && estadoHistorial.toUpperCase() !== 'ENTREGADO';
                    return (
                      <div
                        key={disp.id}
                        style={{
                          border: '1px solid #eee',
                          borderRadius: '14px',
                          padding: '1.2em 1em 1em 1em',
                          background: '#fafbfc',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          position: 'relative',
                          width: '180px',
                          minHeight: '180px',
                          boxSizing: 'border-box',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}
                      >
                        {/* Icono */}
                        <MdDevices size={38} style={{ marginBottom: '0.5em', color: '#404040' }} />
                        {/* Info principal */}
                        <div style={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                          <div style={{ fontWeight: 600, color: '#222', fontSize: '1.08em', textAlign: 'center' }}>{disp.marca}</div>
                          <div style={{ color: '#007bff', fontWeight: 500, fontSize: '1em', marginTop: '0.3em', textAlign: 'center' }}>
                            {mostrarEstado
                              ? estadoHistorial
                              : (estadoHistorial === null ? disp.estado : '')}
                          </div>
                        </div>
                        {/* Botón de tres puntos */}
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.3em',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '0.7em',
                            right: '0.7em'
                          }}
                          onClick={() => setMenuOpen(menuOpen === disp.id ? null : disp.id)}
                          aria-label="Opciones"
                        >
                          <FiMoreVertical size={22} color="#888" />
                        </button>
                        {/* Menú contextual */}
                        {menuOpen === disp.id && (
                          <div
                            className="dispositivo-menu"
                            style={{
                              position: 'absolute',
                              top: '2.2em',
                              right: '0.5em',
                              background: '#fff',
                              border: '1px solid #eee',
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                              zIndex: 10,
                              minWidth: '110px'
                            }}
                          >
                            <button
                              style={{
                                width: '100%',
                                padding: '0.6em 1em',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: '#222',
                                fontSize: '1em',
                                borderBottom: '1px solid #f0f0f0'
                              }}
                              onClick={() => {
                                setMenuOpen(null);
                                setDispositivoEditando(disp); // Selecciona el dispositivo a editar
                                setShowAgregarDispositivo(true); // Abre el modal de agregar/editar
                              }}
                            >
                              Editar
                            </button>
                            <button
                              style={{
                                width: '100%',
                                padding: '0.6em 1em',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: '#e74c3c',
                                fontSize: '1em',
                                borderBottom: '1px solid #f0f0f0'
                              }}
                              onClick={() => {
                                setMenuOpen(null);
                                setDispositivoAEliminar(disp);
                                setConfirmationOpen(true);
                              }}
                            >
                              Borrar
                            </button>
                            <button
                              style={{
                                width: '100%',
                                padding: '0.6em 1em',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: '#2563eb',
                                fontSize: '1em'
                              }}
                              onClick={() => {
                                setMenuOpen(null);
                                setDispositivoMantenimiento(disp);
                                setShowMantenimiento(true);
                              }}
                            >
                              Mantenimiento
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Historial */}
            <div className="myprofile-historial-section">
              <h3 style={{ marginBottom: '0.5em' }}>Historial</h3>
              <div style={{ display: 'flex', gap: '0.7em', marginBottom: '1em', flexWrap: 'wrap' }}>
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    style={{
                      padding: '0.4em 1.1em',
                      borderRadius: 18,
                      border: estadoFiltro === cat ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      background: estadoFiltro === cat ? '#2563eb' : '#f3f3f3',
                      color: estadoFiltro === cat ? '#fff' : '#222',
                      fontWeight: estadoFiltro === cat ? 700 : 500,
                      fontSize: '1em',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                    onClick={() => setEstadoFiltro(cat)}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              {carritos.length === 0 ? (
                <div style={{ color: '#888', fontSize: '0.98em' }}>No hay historial de carritos.</div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1em',
                    marginBottom: '1em'
                  }}
                >
                  {carritos
                    .filter(carrito => {
                      if (estadoFiltro === 'Todas') return true;
                      const estado = (carrito.status || carrito.estado || '').toUpperCase();
                      return estado === estadoFiltro;
                    })
                    .map((carrito, idx) => {
                      // Color según tipo
                      const isServicio = carrito.type === 'SERVICIO';
                      const isCompra = carrito.type === 'PRODUCTOS';
                      const cardBg = isServicio
                        ? 'linear-gradient(90deg,#e0f2fe 60%,#bae6fd 100%)'
                        : 'linear-gradient(90deg,#f3f4f6 60%,#e5e7eb 100%)';
                      const borderColor = isServicio
                        ? '#38bdf8'
                        : '#d1d5db';
                      return (
                        <div
                          key={carrito.id || idx}
                          style={{
                            border: `2px solid ${borderColor}`,
                            borderRadius: '10px',
                            padding: '1em',
                            background: cardBg,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                            cursor: 'pointer',
                            transition: 'box-shadow 0.2s',
                            position: 'relative'
                          }}
                          onClick={() => setCarritoExpandido(carritoExpandido === carrito.id ? null : carrito.id)}
                        >
                          <div style={{
                            fontWeight: 600,
                            color: isServicio ? '#0ea5e9' : '#222',
                            fontSize: '1.05em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                          }}>
                            {isServicio ? 'Servicio' : 'Compra'} #{carrito.id || idx + 1}
                          </div>
                          <div>
                            <strong>Estado:</strong>{" "}
                            <span style={{
                              color:
                                (carrito.status || carrito.estado) === 'pendiente' || (carrito.status || carrito.estado) === 'PENDIENTE' ? '#e67e22' :
                                (carrito.status || carrito.estado) === 'completado' || (carrito.status || carrito.estado) === 'COMPLETADO' ? '#27ae60' :
                                (carrito.status || carrito.estado) === 'cancelado' || (carrito.status || carrito.estado) === 'CANCELADO' ? '#e74c3c' :
                                (isServicio ? '#0ea5e9' : '#007bff'),
                              fontWeight: 500
                            }}>
                              {carrito.status || carrito.estado || 'Desconocido'}
                            </span>
                          </div>
                          {/* Mostrar detalles solo si está expandido */}
                          {carritoExpandido === carrito.id && (
                            <>
                              {isCompra && (
                                <>
                                  <div>
                                    <strong>Detalles:</strong>
                                    <ul style={{ margin: 0, paddingLeft: '1.2em', fontSize: '0.98em' }}>
                                      {Array.isArray(carrito.items)
                                        ? carrito.items.map((item, i) => (
                                            <li key={i}>
                                              {item.name
                                                ? `${item.name} (${item.cantidad || 1}) - $${item.price?.toLocaleString?.() ?? item.price ?? 0}`
                                                : JSON.stringify(item)}
                                            </li>
                                          ))
                                        : <li>Sin detalles</li>
                                      }
                                    </ul>
                                  </div>
                                  <div>
                                    <strong>Total:</strong> ${carrito.total?.toLocaleString?.() ?? carrito.total ?? 'N/A'}
                                  </div>
                                </>
                              )}
                              {isServicio && (
                                <>
                                  <div>
                                    <strong>Dispositivo:</strong>{" "}
                                    {carrito.dispositivo?.marca} {carrito.dispositivo?.modelo} {carrito.dispositivo?.serie}
                                  </div>
                                  <div>
                                    <strong>Problema:</strong> {carrito.problema}
                                  </div>
                                  <div>
                                    <strong>¿Cómo sucedió?:</strong> {carrito.como}
                                  </div>
                                  {/* Detalles de diagnóstico y fechas */}
                                  {(carrito.diagnostico || carrito.fechaDiagnostico || carrito.fechaReparacion || carrito.fechaEntregado) && (
                                    <div style={{ marginTop: 8, marginBottom: 8 }}>
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
                              {carrito.createdAt && (
                                <div style={{ color: '#888', fontSize: '0.95em', marginTop: '0.3em' }}>
                                  <strong>Fecha:</strong> {formatFechaCreacion(carrito.createdAt)}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="myprofile-main-grid">
            <div className="myprofile-left-col">
              <div className="myprofile-container">
                <h2>Mi Perfil</h2>
                <div><strong>Nombre:</strong> {form.nombre} {form.apellido}</div>
                <div><strong>Email:</strong> {form.email}</div>
                <div><strong>Teléfono:</strong> {form.telefono}</div>
                <div><strong>Dirección:</strong> {form.direccion}</div>
                <div style={{ marginTop: '1em', borderTop: '1px solid #eee', paddingTop: '1em' }}>
                  <div><strong>Rol:</strong> {user?.rol || 'Usuario'}</div>
                  <div>
                    <strong>Fecha de Vinculación:</strong>{" "}
                    {timestamp ? formatFechaCreacion(timestamp) : 'N/A'}
                  </div>
                </div>
                <div style={{ marginTop: '1.5em', display: 'flex', gap: '1em' }}>
                  <button
                    className="myprofile-action-btn"
                    onClick={() => setShowAgregarDispositivo(true)}
                  >
                    Agregar dispositivo
                  </button>
                  <button
                    className="myprofile-action-btn"
                    onClick={handleEdit}
                  >
                    Editar información personal
                  </button>
                </div>
              </div>
              <div className="myprofile-historial-section">
                <h3 style={{ marginBottom: '0.5em' }}>Historial</h3>
                <div style={{ display: 'flex', gap: '0.7em', marginBottom: '1em', flexWrap: 'wrap' }}>
                  {categorias.map((cat) => (
                    <button
                      key={cat}
                      style={{
                        padding: '0.4em 1.1em',
                        borderRadius: 18,
                        border: estadoFiltro === cat ? '2px solid #2563eb' : '1px solid #e5e7eb',
                        background: estadoFiltro === cat ? '#2563eb' : '#f3f3f3',
                        color: estadoFiltro === cat ? '#fff' : '#222',
                        fontWeight: estadoFiltro === cat ? 700 : 500,
                        fontSize: '1em',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                      onClick={() => setEstadoFiltro(cat)}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
                {carritos.length === 0 ? (
                  <div style={{ color: '#888', fontSize: '0.98em' }}>No hay historial de carritos.</div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1em',
                      marginBottom: '1em'
                    }}
                  >
                    {carritos
                      .filter(carrito => {
                        if (estadoFiltro === 'Todas') return true;
                        const estado = (carrito.status || carrito.estado || '').toUpperCase();
                        return estado === estadoFiltro;
                      })
                      .map((carrito, idx) => {
                        // Color según tipo
                        const isServicio = carrito.type === 'SERVICIO';
                        const isCompra = carrito.type === 'PRODUCTOS';
                        const cardBg = isServicio
                          ? 'linear-gradient(90deg,#e0f2fe 60%,#bae6fd 100%)'
                          : 'linear-gradient(90deg,#f3f4f6 60%,#e5e7eb 100%)';
                        const borderColor = isServicio
                          ? '#38bdf8'
                          : '#d1d5db';
                        return (
                          <div
                            key={carrito.id || idx}
                            style={{
                              border: `2px solid ${borderColor}`,
                              borderRadius: '10px',
                              padding: '1em',
                              background: cardBg,
                              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                              cursor: 'pointer',
                              transition: 'box-shadow 0.2s',
                              position: 'relative'
                            }}
                            onClick={() => setCarritoExpandido(carritoExpandido === carrito.id ? null : carrito.id)}
                          >
                            <div style={{
                              fontWeight: 600,
                              color: isServicio ? '#0ea5e9' : '#222',
                              fontSize: '1.05em',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8
                            }}>
                              {isServicio ? 'Servicio' : 'Compra'} #{carrito.id || idx + 1}
                            </div>
                            <div>
                              <strong>Estado:</strong>{" "}
                              <span style={{
                                color:
                                  (carrito.status || carrito.estado) === 'pendiente' || (carrito.status || carrito.estado) === 'PENDIENTE' ? '#e67e22' :
                                  (carrito.status || carrito.estado) === 'completado' || (carrito.status || carrito.estado) === 'COMPLETADO' ? '#27ae60' :
                                  (carrito.status || carrito.estado) === 'cancelado' || (carrito.status || carrito.estado) === 'CANCELADO' ? '#e74c3c' :
                                  (isServicio ? '#0ea5e9' : '#007bff'),
                                fontWeight: 500
                              }}>
                                {carrito.status || carrito.estado || 'Desconocido'}
                              </span>
                            </div>
                            {/* Mostrar detalles solo si está expandido */}
                            {carritoExpandido === carrito.id && (
                              <>
                                {isCompra && (
                                  <>
                                    <div>
                                      <strong>Detalles:</strong>
                                      <ul style={{ margin: 0, paddingLeft: '1.2em', fontSize: '0.98em' }}>
                                        {Array.isArray(carrito.items)
                                          ? carrito.items.map((item, i) => (
                                              <li key={i}>
                                                {item.name
                                                  ? `${item.name} (${item.cantidad || 1}) - $${item.price?.toLocaleString?.() ?? item.price ?? 0}`
                                                  : JSON.stringify(item)}
                                              </li>
                                            ))
                                          : <li>Sin detalles</li>
                                        }
                                      </ul>
                                    </div>
                                    <div>
                                      <strong>Total:</strong> ${carrito.total?.toLocaleString?.() ?? carrito.total ?? 'N/A'}
                                    </div>
                                  </>
                                )}
                                {isServicio && (
                                  <>
                                    <div>
                                      <strong>Dispositivo:</strong>{" "}
                                      {carrito.dispositivo?.marca} {carrito.dispositivo?.modelo} {carrito.dispositivo?.serie}
                                    </div>
                                    <div>
                                      <strong>Problema:</strong> {carrito.problema}
                                    </div>
                                    <div>
                                      <strong>¿Cómo sucedió?:</strong> {carrito.como}
                                    </div>
                                    {/* Detalles de diagnóstico y fechas */}
                                    {(carrito.diagnostico || carrito.fechaDiagnostico || carrito.fechaReparacion || carrito.fechaEntregado) && (
                                      <div style={{ marginTop: 8, marginBottom: 8 }}>
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
                                {carrito.createdAt && (
                                  <div style={{ color: '#888', fontSize: '0.95em', marginTop: '0.3em' }}>
                                    <strong>Fecha:</strong> {formatFechaCreacion(carrito.createdAt)}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
            <div className="myprofile-right-col">
              <h3 style={{ marginBottom: '0.5em' }}>Mis dispositivos</h3>
              {dispositivos.length === 0 ? (
                <div style={{ color: '#888', fontSize: '0.98em' }}>No tienes dispositivos registrados.</div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1em',
                    justifyContent: 'flex-start'
                  }}
                >
                  {dispositivos.map((disp) => {
                    // Obtener el estado desde el historial, si existe
                    const estadoHistorial = getEstadoDispositivoDesdeHistorial(disp.id);
                    // Si el status es ENTREGADO, no mostrar nada
                    const mostrarEstado = estadoHistorial && estadoHistorial.toUpperCase() !== 'ENTREGADO';
                    return (
                      <div
                        key={disp.id}
                        style={{
                          border: '1px solid #eee',
                          borderRadius: '14px',
                          padding: '1.2em 1em 1em 1em',
                          background: '#fafbfc',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          position: 'relative',
                          width: '180px',
                          minHeight: '180px',
                          boxSizing: 'border-box',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}
                      >
                        {/* Icono */}
                        <MdDevices size={38} style={{ marginBottom: '0.5em', color: '#404040' }} />
                        {/* Info principal */}
                        <div style={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                          <div style={{ fontWeight: 600, color: '#222', fontSize: '1.08em', textAlign: 'center' }}>{disp.marca}</div>
                          <div style={{ color: '#007bff', fontWeight: 500, fontSize: '1em', marginTop: '0.3em', textAlign: 'center' }}>
                            {mostrarEstado
                              ? estadoHistorial
                              : (estadoHistorial === null ? disp.estado : '')}
                          </div>
                        </div>
                        {/* Botón de tres puntos */}
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.3em',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '0.7em',
                            right: '0.7em'
                          }}
                          onClick={() => setMenuOpen(menuOpen === disp.id ? null : disp.id)}
                          aria-label="Opciones"
                        >
                          <FiMoreVertical size={22} color="#888" />
                        </button>
                        {/* Menú contextual */}
                        {menuOpen === disp.id && (
                          <div
                            className="dispositivo-menu"
                            style={{
                              position: 'absolute',
                              top: '2.2em',
                              right: '0.5em',
                              background: '#fff',
                              border: '1px solid #eee',
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                              zIndex: 10,
                              minWidth: '110px'
                            }}
                          >
                            <button
                              style={{
                                width: '100%',
                                padding: '0.6em 1em',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: '#222',
                                fontSize: '1em',
                                borderBottom: '1px solid #f0f0f0'
                              }}
                              onClick={() => {
                                setMenuOpen(null);
                                setDispositivoEditando(disp); // Selecciona el dispositivo a editar
                                setShowAgregarDispositivo(true); // Abre el modal de agregar/editar
                              }}
                            >
                              Editar
                            </button>
                            <button
                              style={{
                                width: '100%',
                                padding: '0.6em 1em',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: '#e74c3c',
                                fontSize: '1em',
                                borderBottom: '1px solid #f0f0f0'
                              }}
                              onClick={() => {
                                setMenuOpen(null);
                                setDispositivoAEliminar(disp);
                                setConfirmationOpen(true);
                              }}
                            >
                              Borrar
                            </button>
                            <button
                              style={{
                                width: '100%',
                                padding: '0.6em 1em',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: '#2563eb',
                                fontSize: '1em'
                              }}
                              onClick={() => {
                                setMenuOpen(null);
                                setDispositivoMantenimiento(disp);
                                setShowMantenimiento(true);
                              }}
                            >
                              Mantenimiento
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar />
        {/* ConfirmationMessage para borrar dispositivo */}
        <ConfirmationMessage
          open={confirmationOpen}
          title="Borrar dispositivo"
          message={
            dispositivoAEliminar
              ? `¿Deseas eliminar el dispositivo "${dispositivoAEliminar.marca} ${dispositivoAEliminar.modelo || ''} ${dispositivoAEliminar.serie || ''}"? Esta acción no tiene reversa.`
              : ''
          }
          onAccept={handleDeleteDispositivo}
          onReject={() => {
            setConfirmationOpen(false);
            setDispositivoAEliminar(null);
          }}
        />
      </div>
      {(showAgregarDispositivo || dispositivoEditando) && (
        <AgregarDispositivos
          open={showAgregarDispositivo || !!dispositivoEditando}
          onClose={() => {
            setShowAgregarDispositivo(false);
            setDispositivoEditando(null); // Limpia el estado al cerrar
          }}
          user={user}
          dispositivo={dispositivoEditando} // Pasa el dispositivo a editar (puede ser null)
        />
      )}
      {/* Modal overlay para edición */}
      {showEditModal && (
        <div
          className="agregar-dispositivo-overlay"
          style={{
            zIndex: 2000
          }}
          onClick={e => {
            if (e.target.classList.contains('agregar-dispositivo-overlay')) {
              setEditing(false);
              setShowEditModal(false);
            }
          }}
        >
          <div
            className="myprofile-modal myprofile-edit-modal"
            style={{
              maxWidth: 420,
              margin: 'auto',
              height: 'auto',
              minHeight: 'unset',
              borderRadius: 18,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              background: 'var(--color-surface, #fff)',
              display: 'flex',
              flexDirection: 'column',
              padding: '0 1.5rem 1.5rem 1.5rem'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="myprofile-modal-header" style={{ borderRadius: '18px 18px 0 0', paddingBottom: 0 }}>
              <span className="myprofile-title" style={{ fontSize: '1.25rem' }}>Editar información</span>
              <button
                className="myprofile-close-btn"
                onClick={() => { setEditing(false); setShowEditModal(false); }}
                style={{ background: 'none', color: '#888', fontSize: '1.5rem' }}
              >
                ×
              </button>
            </div>
            <form
              className="myprofile-edit-form"
              style={{
                marginTop: '1.2rem',
                marginBottom: 0,
                gap: '0.8rem'
              }}
              onSubmit={e => { e.preventDefault(); handleSave(); }}
            >
              <div>
                <label>Nombre:</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} autoFocus />
              </div>
              <div>
                <label>Apellido:</label>
                <input name="apellido" value={form.apellido} onChange={handleChange} />
              </div>
              <div>
                <label>Email:</label>
                <input
                  name="email"
                  value={form.email}
                  readOnly
                  style={{
                    background: '#f3f3f3',
                    color: '#888',
                    cursor: 'not-allowed'
                  }}
                  tabIndex={-1}
                />
              </div>
              <div>
                <label>Teléfono:</label>
                <input name="telefono" value={form.telefono} onChange={handleChange} />
              </div>
              <div>
                <label>Dirección:</label>
                <input name="direccion" value={form.direccion} onChange={handleChange} />
              </div>
              <div style={{ display: 'flex', gap: '0.7rem', marginTop: '0.7rem', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="myprofile-action-btn"
                  style={{
                    minWidth: 110,
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: 8
                  }}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  className="myprofile-action-btn"
                  style={{
                    background: 'var(--color-muted-bg, #f3f3f3)',
                    color: 'var(--color-primary, #2563eb)',
                    border: '1px solid var(--color-border, #e5e7eb)',
                    minWidth: 110,
                    fontWeight: 500,
                    fontSize: '1rem',
                    borderRadius: 8
                  }}
                  onClick={() => { setEditing(false); setShowEditModal(false); }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de mantenimiento */}
      {showMantenimiento && dispositivoMantenimiento && (
        <Mantenimiento
          open={showMantenimiento}
          onClose={() => {
            setShowMantenimiento(false);
            setDispositivoMantenimiento(null);
          }}
          dispositivo={dispositivoMantenimiento}
          user={user}
        />
      )}
    </div>
  );
};

export default MyProfile;

