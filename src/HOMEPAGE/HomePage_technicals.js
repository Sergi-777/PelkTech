
                background: selectedSection === 'carritos' ? 'rgba(255,255,255,0.12)' : 'transparent',
                borderRadius: 8,
                position: 'relative'
              }}
            >
              <span className="homepage-technical-nav-icon" aria-label="Historial" style={{ position: 'relative', display: 'inline-block' }}>
                📜
                {carritosPendientes.filter(
                  c => (c.type || '').toUpperCase() === 'PRODUCTOS' && (c.status || c.estado || '').toUpperCase() !== 'ENTREGADO'
                ).length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -10,
                      background: '#e11d48',
                      color: '#fff',
                      borderRadius: '50%',
                      fontSize: '0.75em',
                      minWidth: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 5px',
                      fontWeight: 700,
                      border: '2px solid #fff',
                      boxSizing: 'border-box',
                      zIndex: 2
                    }}
                  >
                    {carritosPendientes.filter(
                      c => (c.type || '').toUpperCase() === 'PRODUCTOS' && (c.status || c.estado || '').toUpperCase() !== 'ENTREGADO'
                    ).length}
                  </span>
                )}
              </span>
              <span className="homepage-technical-nav-text">Carritos Pendientes</span>
            </li>
            <li
              onClick={() => setSelectedSection('tickets')}
              style={{
                background: selectedSection === 'tickets' ? 'rgba(255,255,255,0.12)' : 'transparent',
                borderRadius: 8,
                position: 'relative'
              }}
            >
              <span className="homepage-technical-nav-icon" aria-label="Tickets" style={{ position: 'relative', display: 'inline-block' }}>
                🎫
                {carritosPendientes.filter(
                  c => (c.type || '').toUpperCase() !== 'PRODUCTOS' && (c.status || c.estado || '').toUpperCase() !== 'ENTREGADO'
                ).length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -10,
                      background: '#e11d48',
                      color: '#fff',
                      borderRadius: '50%',
                      fontSize: '0.75em',
                      minWidth: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 5px',
                      fontWeight: 700,
                      border: '2px solid #fff',
                      boxSizing: 'border-box',
                      zIndex: 2
                    }}
                  >
                    {carritosPendientes.filter(
                      c => (c.type || '').toUpperCase() !== 'PRODUCTOS' && (c.status || c.estado || '').toUpperCase() !== 'ENTREGADO'
                    ).length}
                  </span>
                )}
              </span>
              <span className="homepage-technical-nav-text">Tickets asignados</span>
            </li>
            <li
              onClick={() => setSelectedSection('perfil')}
              style={{
                background: selectedSection === 'perfil' ? 'rgba(255,255,255,0.12)' : 'transparent',
                borderRadius: 8
              }}
            >
              <span className="homepage-technical-nav-icon" aria-label="Perfil">👤</span>
              <span className="homepage-technical-nav-text">Perfil</span>
            </li>
          </ul>
        </nav>
        <button className="homepage-technical-logout" onClick={handleLogout} style={{ position: 'relative' }}>
          <span className="homepage-technical-nav-icon" aria-label="Salir">🚪</span>
          <span className="homepage-technical-logout-text">Cerrar sesión</span>
        </button>
      </aside>
      {/* Main Content */}
      <main className={`homepage-technical-main${sidebarExpanded ? ' sidebar-expanded' : ''}`}>
        <header className="homepage-technical-header">
          <h1>
            ¡Bienvenido, {getPrimerNombre(form.name) || 'Técnico'}!
          </h1>
          <p>
            Aquí puedes gestionar tus tickets, ver tu historial y actualizar tu perfil.
          </p>
        </header>
        {/* Tickets asignados */}
        {selectedSection === 'tickets' && (
          <section className="homepage-technical-section homepage-technical-tickets">
            <h2>Tickets asignados</h2>
            {/* Filtros de estado para tickets */}
            <div style={{ display: 'flex', gap: '0.7em', marginBottom: '1em', flexWrap: 'wrap' }}>
              {categoriasTickets.map((cat) => (
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
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {carritosPendientes
                .filter(carrito => (carrito.type || '').toUpperCase() !== 'PRODUCTOS')
                .filter(carrito => {
                  if (estadoFiltro === 'Todas') return true;
                  const estado = (carrito.status || carrito.estado || '').toUpperCase();
                  return estado === estadoFiltro.toUpperCase();
                })
                .map(carrito => {
                  const cliente = carritosClientes[carrito.id] || {};
                  const expandido = carritoExpandido === carrito.id;
                  const handleLiClick = (e) => {
                    if (
                      e.target.tagName === 'SELECT' ||
                      e.target.closest('select')
                    ) {
                      return;
                    }
                    setCarritoExpandido(expandido ? null : carrito.id);
                  };
                  return (
                    <li
                      key={`${carrito._usuario || 'unknown'}_${carrito.id}`}
                      style={{
                        border: '1px solid #eee',
                        borderRadius: 10,
                        marginBottom: 18,
                        padding: '1em',
                        background: '#f8fafc',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s'
                      }}
                      onClick={handleLiClick}
                    >
                      <div style={{ fontWeight: 600, color: '#222', fontSize: '1.05em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        Ticket #{carrito.id}
                        <span style={{
                          marginLeft: 10,
                          fontSize: '1.2em',
                          transform: expandido ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}>
                          ▶
                        </span>
                      </div>
                      <div>
                        <strong>Estado:</strong>{" "}
                        <span style={{
                          color:
                            (carrito.status || carrito.estado) === 'pendiente' || (carrito.status || carrito.estado) === 'PENDIENTE' ? '#e67e22' :
                            (carrito.status || carrito.estado) === 'completado' || (carrito.status || carrito.estado) === 'COMPLETADO' ? '#27ae60' :
                            (carrito.status || carrito.estado) === 'cancelado' || (carrito.status || carrito.estado) === 'CANCELADO' ? '#e74c3c' : '#007bff',
                          fontWeight: 500
                        }}>
                          {carrito.status || carrito.estado || 'Desconocido'}
                        </span>
                      </div>
                      {expandido && (
                        <>
                          {/* Detalles del cliente */}
                          <div style={{ margin: '10px 0 10px 0' }}>
                            <strong>Cliente:</strong> {cliente.name} {cliente.lastName} <br />
                            <strong>Email:</strong> {cliente.email} <br />
                            <strong>Teléfono:</strong> {cliente.telefono} <br />
                            {cliente.direccion && (
                              <>
                                <strong>Dirección:</strong> {cliente.direccion} <br />
                              </>
                            )}
                          </div>
                          {/* Detalles del ticket */}
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
                            <div className="detalle-fecha">
                              <span className="detalle-label">Fecha de creación:</span> {formatFechaCreacion(carrito.createdAt)}
                            </div>
                          )}
                          {/* Mostrar fecha de la cita si existe */}
                          {carrito.fechadelacita && (
                            <div className="detalle-fecha-cita">
                              <span className="detalle-label">Fecha de la cita:</span> {formatFechaCreacion(carrito.fechadelacita)}
                            </div>
                          )}
                          {/* Bloque de fechas y estados de mantenimiento */}
                          {(carrito.diagnostico || carrito.fechaDiagnostico || carrito.fechaReparacion || carrito.fechaEntregado) && (
                            <div className="detalle-mantenimiento-bloque">
                              {carrito.fechaDiagnostico && (
                                <div>
                                  <span className="detalle-label">Fecha diagnóstico:</span>{" "}
                                  {(() => {
                                    const d = new Date(carrito.fechaDiagnostico);
                                    return `${d.getDate()} de ${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][d.getMonth()]} del ${d.getFullYear()}`;
                                  })()}
                                </div>
                              )}
                              {carrito.diagnostico && (
                                <div>
                                  <span className="detalle-label">Diagnóstico:</span> {carrito.diagnostico}
                                </div>
                              )}
                              {carrito.precio && (
                                <div>
                                  <span className="detalle-label">Precio:</span> {carrito.precio ? `$${Number(carrito.precio).toLocaleString('es-CO')}` : 'N/A'}
                                </div>
                              )}
                              {/* FECHA DE REPARACION */}
                              {carrito.fechaReparacion && (
                                <div>
                                  <span className="detalle-label">Fecha reparación:</span>{" "}
                                  {(() => {
                                    const d = new Date(carrito.fechaReparacion);
                                    return `${d.getDate()} de ${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][d.getMonth()]} del ${d.getFullYear()}`;
                                  })()}
                                </div>
                              )}
                              {carrito.observaciones && (
                                <div>
                                  <span className="detalle-label">Pruebas de rendimiento / Observaciones:</span> {carrito.observaciones}
                                </div>
                              )}
                              {/* FECHA DE ENTREGA */}
                              {carrito.fechaEntregado && (
                                <div>
                                  <span className="detalle-label">Fecha entregado:</span>{" "}
                                  {(() => {
                                    const d = new Date(carrito.fechaEntregado);
                                    return `${d.getDate()} de ${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][d.getMonth()]} del ${d.getFullYear()}`;
                                  })()}
                                </div>
                              )}
                            </div>
                          )}
                          {/* Estados de mantenimiento: solo si NO está entregado */}
                          {(carrito.status || carrito.estado) !== 'ENTREGADO' && (carrito.status || carrito.estado) !== 'entregado' && (
                            <MantenimientoEstados
                              carrito={carrito}
                              onEstadoChange={handleEstadoChange}
                            />
                          )}
                        </>
                      )}
                    </li>
                  );
                })}
            </ul>
          </section>
        )}
        {/* Carritos Pendientes */}
        {selectedSection === 'carritos' && (
          <section className="homepage-technical-section homepage-technical-carritos">
            <h2>Carritos Pendientes</h2>
            {/* Filtros de estado */}
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
            {carritosPendientes
              .filter(carrito => (carrito.type || '').toUpperCase() === 'PRODUCTOS')
              .filter(carrito => {
                if (estadoFiltro === 'Todas') return true;
                const estado = (carrito.status || carrito.estado || '').toUpperCase();
                return estado === estadoFiltro.toUpperCase();
              }).length === 0 ? (
              <div style={{ color: '#888', fontSize: '0.98em' }}>No hay carritos pendientes.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {carritosPendientes
                  .filter(carrito => (carrito.type || '').toUpperCase() === 'PRODUCTOS')
                  .filter(carrito => {
                    if (estadoFiltro === 'Todas') return true;
                    const estado = (carrito.status || carrito.estado || '').toUpperCase();
                    return estado === estadoFiltro.toUpperCase();
                  })
                  .map(carrito => {
                    const cliente = carritosClientes[carrito.id] || {};
                    const expandido = carritoExpandido === carrito.id;
                    // Nuevo: para evitar que el select cierre el expandido, manejamos el click solo en el li excepto si el target es el select o un hijo del select
                    const handleLiClick = (e) => {
                      // Si el click fue en un select o dentro de un select, no expandas/colapses
                      if (
                        e.target.tagName === 'SELECT' ||
                        e.target.closest('select')
                      ) {
                        return;
                      }
                      setCarritoExpandido(expandido ? null : carrito.id);
                    };
                    // Cambia la key para que sea única por usuario y carrito
                    return (
                      <li
                        key={`${carrito._usuario || 'unknown'}_${carrito.id}`}
                        style={{
                          border: '1px solid #eee',
                          borderRadius: 10,
                          marginBottom: 18,
                          padding: '1em',
                          background: '#f8fafc',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                          cursor: 'pointer',
                          transition: 'box-shadow 0.2s'
                        }}
                        onClick={handleLiClick}
                      >
                        <div style={{ fontWeight: 600, color: '#222', fontSize: '1.05em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          Carrito #{carrito.id}
                          <span style={{
                            marginLeft: 10,
                            fontSize: '1.2em',
                            transform: expandido ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                          }}>
                            ▶
                          </span>
                        </div>
                        <div>
                          <strong>Estado:</strong>{" "}
                          <span style={{
                            color:
                              (carrito.status || carrito.estado) === 'pendiente' || (carrito.status || carrito.estado) === 'PENDIENTE' ? '#e67e22' :
                              (carrito.status || carrito.estado) === 'completado' || (carrito.status || carrito.estado) === 'COMPLETADO' ? '#27ae60' :
                              (carrito.status || carrito.estado) === 'cancelado' || (carrito.status || carrito.estado) === 'CANCELADO' ? '#e74c3c' : '#007bff',
                            fontWeight: 500
                          }}>
                            {carrito.status || carrito.estado || 'Desconocido'}
                          </span>
                        </div>
                        {expandido && (
                          <>
                            {/* Detalles del cliente */}
                            <div style={{ margin: '10px 0 10px 0' }}>
                              <strong>Cliente:</strong> {cliente.name} {cliente.lastName} <br />
                              <strong>Email:</strong> {cliente.email} <br />
                              <strong>Teléfono:</strong> {cliente.telefono} <br />
                              {cliente.direccion && (
                                <>
                                  <strong>Dirección:</strong> {cliente.direccion} <br />
                                </>
                              )}
                              {/* Botón para hablar con el cliente */}
                              <button
                                style={{
                                  marginTop: 8,
                                  background: '#25d366',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 8,
                                  padding: '0.4em 1.2em',
                                  fontWeight: 600,
                                  fontSize: '1em',
                                  cursor: 'pointer'
                                }}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleHablarConCliente(carrito, cliente);
                                }}
                              >
                                Hablar con cliente
                              </button>
                            </div>
                            {/* Detalles de productos */}
                            <div>
                              <strong>Productos:</strong>
                              <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
                                {Array.isArray(carrito.items) && carrito.items.length > 0 ? (
                                  carrito.items.map((item, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                                      {item.url && (
                                        <img
                                          src={item.url}
                                          alt={item.name}
                                          style={{
                                            width: 44,
                                            height: 44,
                                            objectFit: 'cover',
                                            borderRadius: 8,
                                            marginRight: 10,
                                            background: '#f3f3f3',
                                            border: '1px solid #eee'
                                          }}
                                        />
                                      )}
                                      <div>
                                        <div style={{ fontWeight: 500 }}>{item.name || 'Producto'}</div>
                                        <div style={{ fontSize: '0.97em', color: '#555' }}>
                                          Cantidad: {item.cantidad || 1} &nbsp;|&nbsp; Precio: ${item.price?.toLocaleString?.() ?? item.price ?? 0}
                                        </div>
                                      </div>
                                    </li>
                                  ))
                                ) : (
                                  <li style={{ color: '#888' }}>Sin productos</li>
                                )}
                              </ul>
                            </div>
                            {/* Total y fecha */}
                            <div style={{ marginTop: 10 }}>
                              <strong>Total:</strong> ${carrito.total?.toLocaleString?.() ?? carrito.total ?? 'N/A'}
                            </div>
                            {carrito.createdAt && (
                              <div style={{ color: '#888', fontSize: '0.95em', marginTop: '0.3em' }}>
                                <strong>Fecha:</strong> {formatFechaCreacion(carrito.createdAt)}
                              </div>
                            )}
                            {/* Select para cambiar estado */}
                            <div style={{ margin: '10px 0 10px 0' }}>
                              <label>
                                <strong>Cambiar estado:&nbsp;</strong>
                                <select
                                  value={carrito.status || carrito.estado || ''}
                                  onChange={e => {
                                    e.stopPropagation();
                                    handleEstadoChange(carrito, e.target.value);
                                  }}
                                  style={{
                                    padding: '0.4em 1em',
                                    borderRadius: 8,
                                    border: '1px solid #ccc',
                                    fontSize: '1em',
                                    marginLeft: 8
                                  }}
                                  onClick={e => e.stopPropagation()}
                                >
                                  <option value="">Selecciona estado</option>
                                  {estadosPedido.map(estado => (
                                    <option key={estado} value={estado}>
                                      {estado}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          </>
                        )}
                      </li>
                    );
                  })}
              </ul>
            )}
          </section>
        )}
        {/* Perfil */}
        {selectedSection === 'perfil' && (
          <section
            className="homepage-technical-section homepage-technical-profile"
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s',
              minHeight: profileCollapsed ? 0 : undefined,
              overflow: profileCollapsed ? 'hidden' : undefined,
              padding: profileCollapsed ? '1.2em 1em' : undefined
            }}
            onClick={() => setProfileCollapsed(!profileCollapsed)}
          >
            <h2>Mi perfil</h2>
    {!profileCollapsed && (
      <>
        <p><strong>Nombre:</strong> {form.name}</p>
        <p><strong>Correo:</strong> {form.email}</p>
        <p><strong>Rol:</strong> {form.rol}</p>
        <p><strong>Teléfono:</strong> {form.telefono}</p>
        <p><strong>Fecha de Vinculación:</strong> N/A</p>
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
        {/* Modal para editar información */}
        {editing && (
          <div
            className="agregar-dispositivo-overlay"
            style={{ zIndex: 2000 }}
            onClick={e => {
              if (e.target.classList.contains('agregar-dispositivo-overlay')) setEditing(false);
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
                background: '#fff',
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
                  onClick={() => setEditing(false)}
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
                  <input name="name" value={form.name} onChange={handleChange} autoFocus />
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
                  <label>Rol:</label>
                  <input
                    name="rol"
                    value={form.rol}
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
                      background: '#f3f3f3',
                      color: '#2563eb',
                      border: '1px solid #e5e7eb',
                      minWidth: 110,
                      fontWeight: 500,
                      fontSize: '1rem',
                      borderRadius: 8
                    }}
                    onClick={() => setEditing(false)}
                  >
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

const estadosMantenimiento = [
  'DIAGNOSTICO Y COSTO DE REPARACION',
  'ESPERANDO CONFIRMACION DEL CLIENTE',
  'CONFIRMACION DEL CLIENTE',
  'REPARACION',
  'PRUEBAS DE RENDIMIENTO',
  'ENTREGADO'
];

function MantenimientoEstados({ carrito, onEstadoChange }) {
  const [diagnostico, setDiagnostico] = React.useState(carrito.diagnostico || '');
  const [precio, setPrecio] = React.useState(carrito.precio || '');
  const [observaciones, setObservaciones] = React.useState(carrito.observaciones || '');
  const [estado, setEstado] = React.useState(carrito.status || carrito.estado || '');
  const [guardando, setGuardando] = React.useState(false);
  const [fechaDiagnostico, setFechaDiagnostico] = React.useState(carrito.fechaDiagnostico || '');
  const [fechaReparacion, setFechaReparacion] = React.useState(carrito.fechaReparacion || '');
  const [fechaEntregado, setFechaEntregado] = React.useState(carrito.fechaEntregado || '');

  React.useEffect(() => {
    setDiagnostico(carrito.diagnostico || '');
    setPrecio(carrito.precio || '');
    setObservaciones(carrito.observaciones || '');
    setEstado(carrito.status || carrito.estado || '');
    setFechaDiagnostico(carrito.fechaDiagnostico || '');
    setFechaReparacion(carrito.fechaReparacion || '');
    setFechaEntregado(carrito.fechaEntregado || '');
  }, [carrito]);

  const formatPrecio = (value) => {
    if (value === '' || value === null || value === undefined) return '';
    const num = Number(value);
    if (isNaN(num)) return '';
    return '$' + num.toLocaleString('es-CO');
  };

  const handlePrecioChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    setPrecio(raw ? Number(raw) : '');
  };

  // Solo guarda el estado de diagnóstico si ambos campos están llenos y se hace click en el botón
  const handleGuardarDiagnostico = async (e) => {
    e.stopPropagation();
    if (!diagnostico || !precio) {
      toast.error('Debes ingresar diagnóstico y precio');
      return;
    }
    setGuardando(true);
    await onEstadoChange(
      carrito,
      'DIAGNOSTICO Y COSTO DE REPARACION',
      {
        diagnostico,
        precio: Number(precio),
        fechaDiagnostico: new Date().toISOString()
      }
    );
    setEstado('DIAGNOSTICO Y COSTO DE REPARACION');
    setFechaDiagnostico(new Date().toISOString());
    setGuardando(false);
  };

  const handleChangeEstado = async (nuevoEstado) => {
    if (nuevoEstado === 'DIAGNOSTICO Y COSTO DE REPARACION') {
      setEstado(nuevoEstado);
      return;
    }
    setEstado(nuevoEstado);
    let extra = {};
    if (nuevoEstado === 'PRUEBAS DE RENDIMIENTO') {
      extra = { observaciones };
    }
    if (nuevoEstado === 'REPARACION') {
      const fecha = new Date().toISOString();
      extra = { fechaReparacion: fecha };
      setFechaReparacion(fecha);
    }
    if (nuevoEstado === 'ENTREGADO') {
      const fecha = new Date().toISOString();
      extra = { fechaEntregado: fecha };
      setFechaEntregado(fecha);
    }
    await onEstadoChange(carrito, nuevoEstado, extra);
  };

  return (
    <div style={{ margin: '10px 0 10px 0' }}>
      <label>
        <strong>Cambiar estado:&nbsp;</strong>
        <select
          value={estado}
          onChange={e => handleChangeEstado(e.target.value)}
          style={{
            padding: '0.4em 1em',
            borderRadius: 8,
            border: '1px solid #ccc',
            fontSize: '1em',
            marginLeft: 8
          }}
          onClick={e => e.stopPropagation()}
        >
          <option value="">Selecciona estado</option>
          {estadosMantenimiento.map(estado => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      </label>
      {/* Inputs adicionales según el estado */}
      {estado === 'DIAGNOSTICO Y COSTO DE REPARACION' && (
        <div style={{ marginTop: 10 }}>
          <div>
            <label>
              Diagnóstico:
              <input
                type="text"
                value={diagnostico}
                onChange={e => setDiagnostico(e.target.value)}
                style={{ marginLeft: 8, width: '70%' }}
                onClick={e => e.stopPropagation()}
              />
            </label>
          </div>
          <div>
            <label>
              Precio:
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formatPrecio(precio)}
                onChange={handlePrecioChange}
                style={{ marginLeft: 8, width: 120 }}
                onClick={e => e.stopPropagation()}
                placeholder="$0"
                autoComplete="off"
              />
            </label>
          </div>
          <button
            style={{
              marginTop: 8,
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.4em 1.2em',
              fontWeight: 600,
              fontSize: '1em',
              cursor: 'pointer'
            }}
            onClick={handleGuardarDiagnostico}
            disabled={guardando}
          >
            Guardar diagnóstico y precio
          </button>
        </div>
      )}
      {estado === 'PRUEBAS DE RENDIMIENTO' && (
        <div style={{ marginTop: 10 }}>
          <label>
            Observaciones:
            <input
              type="text"
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              style={{ marginLeft: 8, width: '70%' }}
              onClick={e => e.stopPropagation()}
            />
          </label>
          <button
            style={{
              marginTop: 8,
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.4em 1.2em',
              fontWeight: 600,
              fontSize: '1em',
              cursor: 'pointer'
            }}
            onClick={async e => {
              e.stopPropagation();
              await onEstadoChange(carrito, 'PRUEBAS DE RENDIMIENTO', { observaciones });
            }}
          >
            Guardar observaciones
          </button>
        </div>
      )}
    </div>
  );
}