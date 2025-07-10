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
      try {
        const res = await fetch('http://localhost:3001/productos');
        const data = await res.json();
        setProductos(data);
      } catch (err) {
        alert('Error al cargar productos');
      }
    };
    fetchProductos();
    const interval = setInterval(fetchProductos, 1000);
    return () => clearInterval(interval);
  }, []);


  const handleAdd = async (e) => {
  e.preventDefault();
  const { name, description, category, price, stock } = addForm;
  if (!name || !description || !category || !price || !stock) {
    alert('Todos los campos son obligatorios excepto la URL.');
    return;
  }
  setAddLoading(true);
  try {
    const res = await fetch('http://localhost:3001/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addForm, price: Number(price), stock: Number(stock) })
    });
    const newProduct = await res.json();
    setProductos(prev => [...prev, newProduct]);
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
    await fetch(`http://localhost:3001/productos/${editForm.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editForm, price: Number(price), stock: Number(stock) })
    });
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
const handleDelete = async (id) => {
  const confirm = window.confirm("¿Estás seguro de que deseas eliminar este producto?");
  if (!confirm) return;

  try {
    const res = await fetch(`http://localhost:3001/productos/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      throw new Error('Error al eliminar producto');
    }

    setProductos(prev => prev.filter(p => p.id !== id));
  } catch (error) {
    alert('Error eliminando producto');
    console.error(error);
  }
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
              <button
  className="productos-admin-delete-btn"
  type="button"
  onClick={() => {
    handleDelete(editForm.id);
    setEditIdx(null); // cerrar modal después
  }}
>
  🗑️ Eliminar
</button>


            </div>
          </form>
        </div>
      )}
    </div>
  );
}
