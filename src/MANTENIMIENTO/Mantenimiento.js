import React, { useState } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import './Mantenimiento.css';

const Mantenimiento = ({ open, onClose, dispositivo, user, pedido }) => {
  const [problema, setProblema] = useState('');
  const [como, setComo] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fechaMantenimiento, setFechaMantenimiento] = useState('');

  if (!open) return null;

  // Determina el estado a mostrar: del historial (pedido) o del dispositivo
  const estadoDispositivo = pedido?.dispositivo?.estado ?? dispositivo?.estado ?? '';

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!user?.email || !dispositivo || !problema.trim() || !como.trim()) return;

  const mantenimiento = {
    cliente_email: user.email,
    dispositivo_id: dispositivo.id,
    status: 'PENDIENTE',
    tipo: problema.length > como.length ? 'HARDWARE' : 'SOFTWARE', // o una lógica personalizada
    descripcion: `${problema}\n${como}`
  };

  try {
    const res = await fetch('http://localhost:3001/mantenimiento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mantenimiento)
    });

    const result = await res.json();

    if (result.success) {
      setSuccessMsg('Pedido de mantenimiento enviado con éxito');
      setProblema('');
      setComo('');
      setFechaMantenimiento('');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 2000);
    } else {
      alert('Error al registrar el mantenimiento');
    }
  } catch (err) {
    alert('Error de red al registrar el mantenimiento');
  }
};


  return (
    <div className="mantenimiento-modal-overlay" onClick={e => {
      if (e.target.classList.contains('mantenimiento-modal-overlay')) onClose();
    }}>
      <div className="mantenimiento-modal" onClick={e => e.stopPropagation()}>
        <h2>Mantenimiento</h2>
        <div>
          <strong>Dispositivo:</strong> {dispositivo?.marca} {dispositivo?.modelo} {dispositivo?.serie}
        </div>
        <div>
          <strong>Estado actual:</strong> {estadoDispositivo}
        </div>
        <form onSubmit={handleSubmit} className="mantenimiento-form">
          <label>
            ¿Cuál es el problema?
            <textarea
              value={problema}
              onChange={e => setProblema(e.target.value)}
              rows={2}
              className="mantenimiento-textarea"
              placeholder="Describe el problema..."
              required
            />
          </label>
          <label>
            ¿Cómo sucedió?
            <textarea
              value={como}
              onChange={e => setComo(e.target.value)}
              rows={2}
              className="mantenimiento-textarea"
              placeholder="Explica cómo ocurrió el problema..."
              required
            />
          </label>
          <div style={{ margin: '1.2em 0' }}>
            <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>
              Seleccionar fecha de mantenimiento
            </label>
            <input
              type="date"
              value={fechaMantenimiento}
              onChange={e => setFechaMantenimiento(e.target.value)}
              style={{
                padding: '0.5em 1em',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
                fontSize: '1rem',
                background: '#fff',
                color: '#222'
              }}
            />
          </div>
          <button
            type="submit"
            className="mantenimiento-btn"
            disabled={!problema.trim() || !como.trim()}
          >
            Enviar a Mantenimiento
          </button>
        </form>
        {successMsg && (
          <div className="mantenimiento-success">
            {successMsg}
          </div>
        )}
        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
          <button onClick={onClose} className="mantenimiento-close-btn">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Mantenimiento;