import React, { useEffect, useState } from 'react';
import './Cart.css';
import { FaShoppingBag } from 'react-icons/fa';

const Cart = ({ open, onClose, user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");

  // Cargar carrito desde backend MySQL cada 2 segundos
  useEffect(() => {
    if (!open || !user?.email) {
      setCartItems([]);
      setSuccessMsg("");
      return;
    }

    const fetchCartItems = async () => {
      try {
        const res = await fetch(`http://localhost:3001/carrito/productos?email=${user.email}`);
        const data = await res.json();
        setCartItems(data || []);
      } catch (err) {
        console.error("Error al obtener carrito:", err);
      }
    };

    fetchCartItems();
    const intervalId = setInterval(fetchCartItems, 2000); // Actualiza cada 2 segundos
    return () => clearInterval(intervalId);
  }, [open, user]);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Simular compra: limpiar el carrito desde el backend
  const handleBuy = async () => {
  if (!user?.email || cartItems.length === 0) return;

  try {
    const res = await fetch(`http://localhost:3001/carrito/comprar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: user.email,
        encargado: "SIN ASIGNAR"  // o un nombre real si lo tienes en contexto
      }),
    });

    const data = await res.json();
    if (data.success) {
      setSuccessMsg("Carrito pagado con éxito, espera confirmación");
      setCartItems([]);
      setTimeout(() => setSuccessMsg(""), 3500);
    } else {
      console.error("Fallo en la compra:", data.message);
    }
  } catch (err) {
    console.error("Error al pagar:", err);
  }
};


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
                  <div className="cart-modal-item-qty">Cantidad: {item.quantity}</div>

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
