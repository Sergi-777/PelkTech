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
    const db = getFirestore();
    const historialDocRef = doc(db, "HISTORIAL", user.email);

    // Generar un id único para la solicitud (timestamp)
    const servicioId = Date.now().toString();

    // No incluir el campo estado en el objeto dispositivo
    const dispositivoData = {
      id: dispositivo.id,
      marca: dispositivo.marca,
      modelo: dispositivo.modelo,
      serie: dispositivo.serie
      // estado: NO SE INCLUYE
    };

    // Estructura del pedido de servicio
    const pedidoObj = {
      dispositivo: dispositivoData,
      problema,
      como,
      descripcion: `${problema}\n${como}`,
      status: 'PENDIENTE',
      type: 'SERVICIO',
      createdAt: new Date(),
      email: user.email,
      fechadelacita: fechaMantenimiento // <-- Guarda la fecha de la cita
    };

    // Obtener historial actual y agregar el nuevo pedido como campo mapa
    const historialSnap = await getDoc(historialDocRef);
    let historialData = {};
    if (historialSnap.exists()) {
      historialData = historialSnap.data();
    }
    historialData[servicioId] = pedidoObj;

    await setDoc(historialDocRef, historialData);

    setSuccessMsg('Pedido de mantenimiento enviado con éxito');
    setProblema('');
    setComo('');
    setFechaMantenimiento('');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 2000);
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