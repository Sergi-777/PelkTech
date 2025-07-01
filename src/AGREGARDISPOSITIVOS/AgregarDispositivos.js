import React, { useState, useEffect } from 'react';
import './AgregarDispositivos.css';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';

const initialForm = {
  tipo: '',
  componentes: '',
  marca: '',
  modelo: '',
  serie: ''
};

const AgregarDispositivos = ({ open, onClose, user, dispositivo }) => {
  const [form, setForm] = useState(initialForm);

  // Si se pasa un dispositivo para editar, actualiza el formulario
  useEffect(() => {
    if (dispositivo) {
      setForm({
        tipo: dispositivo.tipo || '',
        componentes: dispositivo.componentes || '',
        marca: dispositivo.marca || '',
        modelo: dispositivo.modelo || '',
        serie: dispositivo.serie || ''
      });
    } else if (open) {
      setForm(initialForm);
    }
  }, [dispositivo, open]);

  if (!open) return null;

  // Handler para cerrar si se hace click en el overlay
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('agregar-dispositivo-overlay')) {
      onClose();
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value.toUpperCase() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) return;

    try {
      const docId = user.email;
      const dispositivoKey = form.serie?.trim() ? form.serie.trim().toUpperCase() : `DISP_${Date.now()}`;
      // Convierte todos los campos del formulario a mayúsculas antes de guardar
      // EXCEPTO el campo 'estado', que no se guarda en Firestore
      const { estado, ...formSinEstado } = form;
      const dispositivoData = {
        ...Object.fromEntries(Object.entries(formSinEstado).map(([k, v]) => [k, v.toUpperCase?.() ?? v])),
        creado: dispositivo?.creado || serverTimestamp()
      };

      const dispositivosRef = doc(db, 'DISPOSITIVOS', docId);
      const dispositivosSnap = await getDoc(dispositivosRef);

      if (dispositivosSnap.exists()) {
        // Actualiza el campo mapa agregando o editando el dispositivo
        await updateDoc(dispositivosRef, {
          [`${dispositivoKey}`]: dispositivoData
        });
      } else {
        // Crea el documento con el primer dispositivo como campo mapa
        await setDoc(dispositivosRef, {
          [dispositivoKey]: dispositivoData
        });
      }

      toast.success(dispositivo ? 'Dispositivo actualizado correctamente' : 'Dispositivo agregado correctamente');
      setForm(initialForm);
      onClose();
    } catch (err) {
      toast.error('Error al guardar el dispositivo');
    }
  };

  return (
    <div className="agregar-dispositivo-overlay" onClick={handleOverlayClick}>
      <div className="agregar-dispositivo-modal" onClick={e => e.stopPropagation()}>
        <div className="agregar-dispositivo-header">
          <span>{dispositivo ? 'Editar Dispositivo' : 'Agregar Dispositivo'}</span>
          <button className="agregar-dispositivo-close-btn" onClick={onClose}>×</button>
        </div>
        <form className="agregar-dispositivo-form" onSubmit={handleSubmit}>
          <div>
            <label>Tipo:</label>
            <input name="tipo" value={form.tipo} onChange={handleChange} required />
          </div>
          <div>
            <label>Componentes:</label>
            <input name="componentes" value={form.componentes} onChange={handleChange} required />
          </div>
          <div>
            <label>Marca:</label>
            <input name="marca" value={form.marca} onChange={handleChange} required />
          </div>
          <div>
            <label>Modelo:</label>
            <input name="modelo" value={form.modelo} onChange={handleChange} required />
          </div>
          <div>
            <label>Serie:</label>
            <input name="serie" value={form.serie} onChange={handleChange} required />
          </div>
          <button type="submit" className="agregar-dispositivo-action-btn">Guardar</button>
        </form>
      </div>
    </div>
  );
};

export default AgregarDispositivos;