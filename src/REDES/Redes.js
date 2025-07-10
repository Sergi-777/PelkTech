import React, { useEffect, useState } from 'react';
import './Redes.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Redes() {
  const [redesInfo, setRedesInfo] = useState({
    correo: "",
    facebook: "",
    twitter: "",
    instagram: "",
    whatsapp: ""
  });
  const [redesId, setRedesId] = useState(1); // ID por defecto
  const [loadingRedes, setLoadingRedes] = useState(false);
  const [editandoRedes, setEditandoRedes] = useState(false);
  const [redesGuardando, setRedesGuardando] = useState(false);

  useEffect(() => {
    setLoadingRedes(true);
    fetch('http://localhost:3001/redes')
      .then(res => res.json())
      .then(data => {
        setRedesInfo(data || {});
        setRedesId(data.id || 1); // Asignar el ID para el PUT
      })
      .catch(() => toast.error("Error al cargar redes sociales"))
      .finally(() => setLoadingRedes(false));
  }, []);

  const handleGuardarRedes = async (e) => {
    e.preventDefault();
    setRedesGuardando(true);
    try {
      const res = await fetch(`http://localhost:3001/redes/${redesId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(redesInfo)
      });
      const result = await res.json();

      if (res.ok && result?.success !== false) {
        toast.success("Información actualizada correctamente.");
        setEditandoRedes(false);
      } else {
        toast.error("Error al actualizar.");
      }
    } catch (err) {
      toast.error("Error al guardar información: " + err.message);
    } finally {
      setRedesGuardando(false);
    }
  };

  return (
    <section className="redes-section">
      <h2>Información de Redes Sociales</h2>
      {loadingRedes ? (
        <div className="redes-loading">Cargando información...</div>
      ) : (
        <form onSubmit={handleGuardarRedes} style={{ maxWidth: 480 }}>
          <label>
            Correo:
            <input
              type="email"
              value={redesInfo.correo || ""}
              onChange={e => setRedesInfo({ ...redesInfo, correo: e.target.value })}
              className="redes-input"
              disabled={!editandoRedes}
            />
          </label>
          <label>
            Facebook:
            <input
              type="url"
              value={redesInfo.facebook || ""}
              onChange={e => setRedesInfo({ ...redesInfo, facebook: e.target.value })}
              className="redes-input"
              disabled={!editandoRedes}
            />
          </label>
          <label>
            Twitter:
            <input
              type="url"
              value={redesInfo.twitter || ""}
              onChange={e => setRedesInfo({ ...redesInfo, twitter: e.target.value })}
              className="redes-input"
              disabled={!editandoRedes}
            />
          </label>
          <label>
            Instagram:
            <input
              type="url"
              value={redesInfo.instagram || ""}
              onChange={e => setRedesInfo({ ...redesInfo, instagram: e.target.value })}
              className="redes-input"
              disabled={!editandoRedes}
            />
          </label>
          <label>
            WhatsApp:
            <input
              type="text"
              value={redesInfo.whatsapp || ""}
              onChange={e => setRedesInfo({ ...redesInfo, whatsapp: e.target.value })}
              className="redes-input"
              disabled={!editandoRedes}
            />
          </label>
          <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
            <button
              type="button"
              className="redes-btn-guardar"
              onClick={() => setEditandoRedes(!editandoRedes)}
            >
              {editandoRedes ? "Cancelar" : "Editar"}
            </button>
            <button
              type="submit"
              className="redes-btn-guardar"
              style={{ display: editandoRedes ? "inline-block" : "none" }}
              disabled={redesGuardando}
            >
              {redesGuardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      )}
      <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar />
    </section>
  );
}
