import React, { useEffect, useState } from 'react';
import './Productos.css';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc } from "firebase/firestore";
import { FaEdit, FaPlus } from 'react-icons/fa';

const initialForm = {
  name: '',
  description: '',
  category: '',
  price: '',
  stock: '',
  url: ''
};

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(initialForm);
  const [addLoading, setAddLoading] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const fetchProductos = async () => {
      const db = getFirestore();
      const productosCol = collection(db, "PRODUCTOS");
      const productosSnapshot = await getDocs(productosCol);
      const productosList = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductos(productosList);
    };
    fetchProductos();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    // Validar campos obligatorios
    const { name, description, category, price, stock } = addForm;
    if (!name || !description || !category || !price || !stock) {
      alert('Todos los campos son obligatorios excepto la URL.');
      return;
    }
    setAddLoading(true);
    try {
      const db = getFirestore();
      // Buscar el ID más alto existente
      let maxId = 0;
      productos.forEach(p => {
        const n = Number(p.id);
        if (!isNaN(n) && n > maxId) maxId = n;
      });
      const newIdNum = maxId + 1;
      const id = String(newIdNum).padStart(13, '0');
      await setDoc(doc(db, "PRODUCTOS", id), { ...addForm, price: Number(price), stock: Number(stock), id });
      setProductos(prev => [...prev, { ...addForm, price: Number(price), stock: Number(stock), id }]);
      setShowAdd(false);
      setAddForm(initialForm);
    } catch (err) {
      alert('Error al agregar producto');
    }
    setAddLoading(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const { name, description, category, price, stock } = editForm;
    if (!name || !description || !category || !price || !stock) {
      alert('Todos los campos son obligatorios excepto la URL.');
      return;
    }
    setEditLoading(true);
    try {
      const db = getFirestore();
      await updateDoc(doc(db, "PRODUCTOS", editForm.id), { ...editForm, price: Number(price), stock: Number(stock) });
      setProductos(prev =>
        prev.map((p, idx) => idx === editIdx ? { ...editForm, price: Number(price), stock: Number(stock) } : p)
      );
      setEditIdx(null);
      setEditForm(initialForm);
    } catch (err) {
      alert('Error al editar producto');
    }
    setEditLoading(false);
  };

  return (
    <div className="productos-admin-container">
      <div className="productos-admin-header">
        <h2>Productos</h2>
        <button className="productos-admin-add-btn" onClick={() => setShowAdd(true)}>
          <FaPlus /> Agregar producto
        </button>
      </div>
      <div className="productos-admin-grid">
        {productos.map((producto, idx) => (
          <div className="productos-admin-card" key={producto.id}>
            {producto.url && (
              <img src={producto.url} alt={producto.name} className="productos-admin-img" />
            )}
            <div className="productos-admin-info">
              <div className="productos-admin-name">{producto.name}</div>
              <div className="productos-admin-category">{producto.category}</div>
              <div className="productos-admin-description">{producto.description}</div>
              <div className="productos-admin-meta">
                <span className="productos-admin-price">${producto.price?.toLocaleString?.() ?? producto.price}</span>
                <span className="productos-admin-stock">Stock: {producto.stock}</span>
              </div>
              <button
                className="productos-admin-edit-btn"
                onClick={() => {
                  setEditIdx(idx);
                  setEditForm(producto);
                }}
              >
                <FaEdit /> Editar producto
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Modal agregar */}
      {showAdd && (
        <div className="productos-admin-modal-overlay" onClick={e => { if (e.target.classList.contains('productos-admin-modal-overlay')) setShowAdd(false); }}>
          <form className="productos-admin-modal" onClick={e => e.stopPropagation()} onSubmit={handleAdd}>
            <h3>Agregar producto</h3>
            <label>Nombre*:<input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} required /></label>
            <label>Descripción*:<input value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} required /></label>
            <label>Categoría*:<input value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))} required /></label>
            <label>Precio*:<input type="number" value={addForm.price} onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))} required /></label>
            <label>Stock*:<input type="number" value={addForm.stock} onChange={e => setAddForm(f => ({ ...f, stock: e.target.value }))} required /></label>
            <label>URL imagen:<input value={addForm.url} onChange={e => setAddForm(f => ({ ...f, url: e.target.value }))} /></label>
            <div className="productos-admin-modal-btns">
              <button type="submit" disabled={addLoading}>{addLoading ? 'Agregando...' : 'Agregar'}</button>
              <button type="button" onClick={() => setShowAdd(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      {/* Modal editar */}
      {editIdx !== null && (
        <div className="productos-admin-modal-overlay" onClick={e => { if (e.target.classList.contains('productos-admin-modal-overlay')) setEditIdx(null); }}>
          <form className="productos-admin-modal" onClick={e => e.stopPropagation()} onSubmit={handleEdit}>
            <h3>Editar producto</h3>
            <label>Nombre*:<input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required /></label>
            <label>Descripción*:<input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} required /></label>
            <label>Categoría*:<input value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} required /></label>
            <label>Precio*:<input type="number" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} required /></label>
            <label>Stock*:<input type="number" value={editForm.stock} onChange={e => setEditForm(f => ({ ...f, stock: e.target.value }))} required /></label>
            <label>URL imagen:<input value={editForm.url} onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))} /></label>
            <div className="productos-admin-modal-btns">
              <button type="submit" disabled={editLoading}>{editLoading ? 'Guardando...' : 'Guardar'}</button>
              <button type="button" onClick={() => setEditIdx(null)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
