import React, { useState, useEffect } from 'react';
import './Empleado.css';

export default function Empleado() {
  const [empleados, setEmpleados] = useState([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const [editEmpleado, setEditEmpleado] = useState(null);
  const [showAddEmpleado, setShowAddEmpleado] = useState(false);
  const [newEmpleado, setNewEmpleado] = useState({
    name: "",
    email: "",
    rol: "",
    telefono: ""
  });
  const [addingEmpleado, setAddingEmpleado] = useState(false);

  const API_URL = 'http://localhost:3001'; // Ajusta si usas otro puerto/backend

  // GET: Cargar empleados
  useEffect(() => {
  async function fetchEmpleados() {
    setLoadingEmpleados(true);
    try {
      const res = await fetch(`${API_URL}/empleados`);
      const data = await res.json();

      // 👇 Validar que es un array
      if (Array.isArray(data)) {
        setEmpleados(data);
      } else {
        console.warn("Respuesta inesperada:", data);
        setEmpleados([]);
      }
    } catch (err) {
      alert('Error al cargar empleados: ' + err.message);
      setEmpleados([]);
    }
    setLoadingEmpleados(false);
  }

  fetchEmpleados();
}, []);



  // DELETE: Eliminar empleado
  const handleBorrarEmpleado = async (empleado) => {
    if (!window.confirm(`¿Seguro que deseas borrar a ${empleado.name}?`)) return;
    try {
      const res = await fetch(`${API_URL}/empleados/${empleado.email}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setEmpleados(prev => prev.filter(e => e.email !== empleado.email));
      } else {
        alert('No se pudo borrar: ' + result.message);
      }
    } catch (err) {
      alert('Error al borrar empleado: ' + err.message);
    }
  };

  // PUT: Guardar edición
  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/empleados/${editEmpleado.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editEmpleado.name,
          rol: editEmpleado.rol,
          telefono: editEmpleado.telefono
        })
      });
      const result = await res.json();
      if (result.success) {
        setEmpleados(prev =>
          prev.map(emp => emp.email === editEmpleado.email ? { ...emp, ...editEmpleado } : emp)
        );
        setEditEmpleado(null);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      alert('Error al editar empleado: ' + err.message);
    }
  };

  // POST: Agregar nuevo empleado
  const handleAgregarEmpleado = async (e) => {
    e.preventDefault();
    if (!newEmpleado.name || !newEmpleado.email || !newEmpleado.rol) {
      alert("Completa todos los campos obligatorios.");
      return;
    }
    setAddingEmpleado(true);
    try {
      const res = await fetch(`${API_URL}/empleados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmpleado)
      });
      const result = await res.json();
      if (result.success) {
        setEmpleados(prev => [...prev, { ...newEmpleado, id: result.id }]);
        setShowAddEmpleado(false);
        setNewEmpleado({ name: "", email: "", rol: "", telefono: "" });
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      alert('Error al agregar empleado: ' + err.message);
    }
    setAddingEmpleado(false);
  };

  // Formato de fecha para mostrar
  function formatFechaCreacionEmpleado(fecha) {
    if (!fecha) return 'N/A';
    return fecha;
  }

  return (
    <section className="empleado-section">
      <h2>Empleados</h2>
      {/* Botón agregar empleado */}
      <button
        className="empleado-btn-add"
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
        <div className="empleado-loading">Cargando empleados...</div>
      ) : empleados.length === 0 ? (
        <div className="empleado-loading">No hay empleados registrados.</div>
      ) : (
        <div className="empleado-list">
          {empleados.map(emp => (
            <div key={emp.email} className="empleado-card">
              <div className="empleado-nombre">{emp.name}</div>
              <div className="empleado-email">{emp.email}</div>
              <div className="empleado-rol">
                <strong>Rol:</strong> {emp.rol}
              </div>
              <div className="empleado-tel">
                <strong>Teléfono:</strong> {emp.telefono}
              </div>
              {/* Mostrar fecha de creación si existe */}
              {emp.fecha_creacion_ && (
                <div className="empleado-fecha">
                  <strong>Fecha de creación:</strong> {formatFechaCreacionEmpleado(emp.fecha_creacion_)}
                </div>
              )}
              <div className="empleado-btns">
                <button
                  className="empleado-btn-editar"
                  onClick={() => setEditEmpleado(emp)}
                >
                  Editar
                </button>
                <button
                  className="empleado-btn-borrar"
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
  );
}
