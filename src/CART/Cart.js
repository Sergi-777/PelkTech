import React, { useEffect, useState } from 'react';
import './Cart.css';
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { FaShoppingBag } from 'react-icons/fa';

const Cart = ({ open, onClose, user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [successMsg, setSuccessMsg] = useState(""); // Nuevo estado para mensaje de éxito

  useEffect(() => {
    if (!open || !user?.email) {
      setCartItems([]);
      setSuccessMsg(""); // Limpiar mensaje al cerrar
      return;
    }
    const db = getFirestore();
    const cartDocRef = doc(db, "CARRITO", user.email);
    const unsubscribe = onSnapshot(cartDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Convierte el objeto de productos a un array
        setCartItems(
          Object.values(data)
            .filter(item => !!item)
            .map(item => ({
              ...item,
              cantidad: item.cantidad || 1,
              price: item.price || 0
            }))
        );
      } else {
        setCartItems([]);
      }
    });
    return () => unsubscribe();
  }, [open, user]);

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.cantidad), 0);

  // Nuevo: función para mover el carrito a HISTORIAL (un documento por email, cada compra es un campo tipo mapa)
  const handleBuy = async () => {
    if (!user?.email || cartItems.length === 0) return;
    const db = getFirestore();
    const historialDocRef = doc(db, "HISTORIAL", user.email);
    const cartDocRef = doc(db, "CARRITO", user.email);

    // Generar un id único para la compra (timestamp)
    const compraId = Date.now().toString();

    // Estructura de la compra
    const compra = {
      items: cartItems,
      total,
      status: 'PENDIENTE PAGO',
      type: 'PRODUCTOS',
      createdAt: new Date(),
      email: user.email // Añadido el campo email
    };

    // Obtener historial actual y agregar la nueva compra como campo mapa
    const historialSnap = await getDoc(historialDocRef);
    let historialData = {};
    if (historialSnap.exists()) {
      historialData = historialSnap.data();
    }
    historialData[compraId] = compra;

    await setDoc(historialDocRef, historialData);
    await setDoc(cartDocRef, {});

    setSuccessMsg("Carrito pagado con éxito, espera confirmación");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  // Handler para cerrar el modal al hacer click en el overlay
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('cart-modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className={`cart-modal-overlay${open ? ' open' : ''}`} onClick={handleOverlayClick}>
      <div className={`cart-modal${open ? ' open' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="cart-modal-header">
          <span>Carrito</span>
          <button className="cart-modal-close-btn" onClick={onClose}>×</button>
        </div>
        {/* Mensaje de éxito */}
        {successMsg && (
          <div style={{
            background: '#4caf50',
            color: 'white',
            padding: '12px 18px',
            borderRadius: 8,
            margin: '16px 20px 0 20px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {successMsg}
          </div>
        )}
        <div className="cart-modal-body">
          {cartItems.length === 0 ? (
            <div className="cart-modal-empty">No hay productos en el carrito.</div>
          ) : (
            cartItems.map((item, idx) => (
              <div className="cart-modal-item" key={idx}>
                <img
                  src={item.url}
                  alt={item.name}
                  className="cart-modal-item-img"
                  style={{
                    width: 54,
                    height: 54,
                    objectFit: 'cover',
                    borderRadius: 8,
                    marginRight: 12,
                    background: '#f3f3f3'
                  }}
                />
                <div className="cart-modal-item-info">
                  <div className="cart-modal-item-name">{item.name}</div>
                  <div className="cart-modal-item-qty">Cantidad: {item.cantidad}</div>
                </div>
                <div className="cart-modal-item-price">
                  ${item.price?.toLocaleString?.() ?? item.price}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="cart-modal-footer">
          <div className="cart-modal-total">
            Total: <b>${total.toLocaleString()}</b>
          </div>
          <button
            className="cart-modal-buy-btn"
            style={{
              marginTop: 16,
              width: '100%',
              background: 'var(--color-primary, #1976d2)',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '12px 0',
              fontWeight: 'bold',
              fontSize: '1.1em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              cursor: 'pointer'
            }}
            onClick={handleBuy}
          >
            <FaShoppingBag />
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
