import React, { useState, useEffect } from 'react';
import './AgregarDispositivos.css';
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
      tipo: dispositivo.nombre || '',               // <== nombre es 'tipo'
      componentes: dispositivo.observaciones || '', // <== observaciones es 'componentes'
      marca: dispositivo.marca || '',
      modelo: dispositivo.modelo || '',
      serie: dispositivo.serie || ''
    });
  } else if (open) {
    setForm(initialForm);
  }
}, [dispositivo, open]);


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

  const data = {
    cliente_email: user.email,
    nombre: form.tipo,
    marca: form.marca,
    modelo: form.modelo,
    serie: form.serie,
    observaciones: form.componentes
  };

  try {
    const url = dispositivo?.id
      ? `http://localhost:3001/dispositivos/${dispositivo.id}`
      : `http://localhost:3001/dispositivos`;
    const method = dispositivo?.id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
      toast.success(dispositivo?.id ? 'Dispositivo actualizado' : 'Dispositivo agregado');
      onClose();
    } else {
      toast.error('Error al guardar dispositivo');
    }
  } catch (err) {
    toast.error('Error de red');
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