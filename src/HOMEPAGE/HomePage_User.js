import React, { useEffect, useState, useRef } from 'react';
import { FaShoppingCart, FaFacebook, FaTwitter, FaInstagram, FaUser, FaSignOutAlt, FaWhatsapp, FaBars } from 'react-icons/fa';
import './HomePage_User.css';
import LoginCart from '../LOGIN/Login';
import RegisterModal from '../REGISTER/Register';
import MyProfile from '../MYPROFILE/MyProfile';
import Cart from '../CART/Cart';
import ConfirmationMessage from '../RESOURCES/CONFIRMATIONDELETE/ConfirmationMessage';

const HomePage_User = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [productos, setProductos] = useState([]);
  const [categoriasUnicas, setCategoriasUnicas] = useState([]);
  const [showLoginCart, setShowLoginCart] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [userName, setUserName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [redes, setRedes] = useState(null);
  const [isWhatsappFabVisible, setIsWhatsappFabVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const footerRef = useRef(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch('http://localhost:3001/productos');
        const data = await res.json();
        setProductos(data);
        const cats = [...new Set(data.map(item => item.category))];
        setCategoriasUnicas(cats);
      } catch (err) {
        console.error('Error al obtener productos:', err);
      }
    };
    fetchProductos();
    const intervalId = setInterval(fetchProductos, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const handleAddToCart = async (producto) => {
    if (!user) return setShowLoginCart(true);
    try {
      const res = await fetch('http://localhost:3001/carrito/agregar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, productoId: producto.id, cantidad: 1 })
      });
      const data = await res.json();
      setToastMsg(data.success ? "Producto añadido al carrito" : "Error al añadir al carrito");
    } catch {
      setToastMsg("Error de red al añadir al carrito");
    }
    setTimeout(() => setToastMsg(""), 2000);
  };

  const handleLogin = async (credentials) => {
    setUser(credentials);
    localStorage.setItem('user', JSON.stringify(credentials));
    setShowLoginCart(false);

    // Si el rol es USER (cliente), obtener el nombre desde el backend
    if (credentials.rol === "USER") {
      try {
        const res = await fetch(`http://localhost:3001/clientes/${credentials.email}`);
        if (res.ok) {
          const cliente = await res.json();
          setUserName(cliente.name || "");
          setUserLastName(cliente.lastName || "");
        } else {
          setUserName("");
          setUserLastName("");
        }
      } catch {
        setUserName("");
        setUserLastName("");
      }
    } else {
      // Si no es cliente, limpiar nombre
      setUserName("");
      setUserLastName("");
    }
  };

  const handleRegister = (credentials) => {
    setUser(credentials);
    localStorage.setItem('user', JSON.stringify(credentials));
    setShowRegister(false);
    setUserName(credentials.name || "");
    setUserLastName(credentials.lastName || "");
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  useEffect(() => {
    const fetchRedes = async () => {
      try {
        const res = await fetch('http://localhost:3001/redes');
        const data = await res.json();
        setRedes(data);
      } catch (e) {
        console.error('Error al obtener redes:', e);
      }
    };
    fetchRedes();
  }, []);

  const productosFiltrados = productos.filter(p => {
    const categoryMatch = selectedCategory ? p.category === selectedCategory : true;
    const search = searchTerm.trim().toLowerCase();
    return categoryMatch && (
      p.name?.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search) ||
      p.category?.toLowerCase().includes(search)
    );
  });

  // Manejar cambios de tamaño de ventana para isMobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para manejar carga de archivos (puede dejarse vacía o implementar lógica)
  const handleFileChange = (e) => {
    // Implementar lógica si es necesario
    // Por ahora, solo limpiar el input
    e.target.value = '';
  };

  // Funciones para abrir/cerrar modales de login/register
  const handleShowRegister = () => setShowRegister(true);
  const handleCloseLogin = () => setShowLoginCart(false);
  const handleShowLogin = () => setShowLoginCart(true);
  const handleCloseRegister = () => setShowRegister(false);
// Obtener nombre y apellido del cliente si ya está autenticado (por persistencia localStorage)
useEffect(() => {
  const fetchClienteInfo = async () => {
    if (user && user.rol === "USER") {
      try {
        const res = await fetch(`http://localhost:3001/clientes/${user.email}`);
        if (res.ok) {
          const cliente = await res.json();
          setUserName(cliente.name || "");
          setUserLastName(cliente.lastName || "");
        } else {
          setUserName("");
          setUserLastName("");
        }
      } catch {
        setUserName("");
        setUserLastName("");
      }
    }
  };
  fetchClienteInfo();
}, [user]);

useEffect(() => {
  if (!user || !user.email) return;

  const fetchCartCount = async () => {
    try {
      const res = await fetch(`http://localhost:3001/carrito/cantidad?email=${user.email}`);
      const data = await res.json();
      setCartCount(data.cantidad || 0);
    } catch (error) {
      console.error("Error al obtener el total del carrito:", error);
    }
  };

  fetchCartCount();
  const interval = setInterval(fetchCartCount, 1000); // Actualiza cada 5 segundos

  return () => clearInterval(interval);
}, [user]);



  return (
    <div className="homepage-user-container">
      {/* Toast de confirmación */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#222',
          color: '#fff',
          padding: '14px 28px',
          borderRadius: 8,
          zIndex: 9999,
          fontWeight: 'bold',
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)'
        }}>
          {toastMsg}
        </div>
      )}
      {/* Header */}
      <header className="homepage-user-header">
        {/* Botón menú hamburguesa solo en móvil */}
        {isMobile && (
          <button
            className="homepage-user-menu-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-white)',
              fontSize: 28,
              cursor: 'pointer',
              marginRight: 12
            }}
            aria-label="Abrir menú"
          >
            <FaBars />
          </button>
        )}
        {/* Nombre */}
        <div className="homepage-user-logo">Pelktech</div>
        {/* Barra de búsqueda */}
        <input
          type="text"
          placeholder="Buscar productos..."
          className="homepage-user-search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {/* Botones (ocultos en móvil) */}
        {!isMobile && (
          <div className="homepage-user-buttons">
            {/* Botón cerrar sesión solo si hay usuario */}
            {user && (
              <button
                className="homepage-user-logout-btn"
                onClick={() => setShowLogoutConfirm(true)}
                title="Cerrar sesión"
              >
                <FaSignOutAlt style={{ marginRight: 6 }} />
                Cerrar sesión
              </button>
            )}
            <button
              className="homepage-user-login-btn"
              onClick={() => {
                if (user) {
                  setShowProfile(true);
                } else {
                  setShowLoginCart(true);
                }
              }}
            >
              <FaUser style={{ marginRight: 8 }} />
              {userName ? userName.split(" ")[0] : "Iniciar Sesión"}
            </button>
            <button
              className="homepage-user-cart-btn"
              onClick={() => setShowCart(true)}
            >
              <FaShoppingCart />
              Carrito
              {cartCount > 0 && (
                <span className="homepage-user-cart-count">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        )}
      </header>

      {/* Menú móvil modal */}
      {isMobile && isMobileMenuOpen && (
        <div className="homepage-user-mobilemenu-backdrop" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="homepage-user-mobilemenu"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="homepage-user-mobilemenu-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Cerrar menú"
            >
              ×
            </button>
            {user && (
              <button
                className="homepage-user-mobilemenu-btn"
                onClick={() => {
                  setShowLogoutConfirm(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <FaSignOutAlt style={{ marginRight: 8 }} />
                Cerrar sesión
              </button>
            )}
            <button
              className="homepage-user-mobilemenu-btn"
              onClick={() => {
                if (user) {
                  setShowProfile(true);
                } else {
                  setShowLoginCart(true);
                }
                setIsMobileMenuOpen(false);
              }}
            >
              <FaUser style={{ marginRight: 8 }} />
              {userName ? userName.split(" ")[0] : "Iniciar Sesión"}
            </button>
            <button
              className="homepage-user-mobilemenu-btn"
              onClick={() => {
                setShowCart(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <FaShoppingCart />
Carrito
{cartCount > 0 && (
  <span className="homepage-user-cart-count">
    {cartCount}
  </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <main className="homepage-user-main">
        {/* Botón subir archivo (invisible) */}
        <div style={{ display: 'none' }}>
          <label htmlFor="upload-json">
            Subir archivo
            <input
              id="upload-json"
              type="file"
              accept="application/json"
              onChange={handleFileChange}
            />
          </label>
        </div>
        {/* Categorías */}
        <div
          className="homepage-user-categories"
          onWheel={e => {
            if (e.deltaY !== 0) {
              e.currentTarget.scrollLeft += e.deltaY;
              e.preventDefault();
            }
          }}
        >
          <button
            className="homepage-user-category-btn"
            style={{
              fontWeight: !selectedCategory ? 'bold' : undefined,
              background: !selectedCategory ? 'var(--color-hover)' : undefined,
              color: !selectedCategory ? 'var(--color-white)' : undefined
            }}
            onClick={() => setSelectedCategory(null)}
          >
            Todas
          </button>
          {categoriasUnicas.map(cat => (
            <button
              key={cat}
              className="homepage-user-category-btn"
              style={{
                fontWeight: selectedCategory === cat ? 'bold' : undefined,
                background: selectedCategory === cat ? 'var(--color-hover)' : undefined,
                color: selectedCategory === cat ? 'var(--color-white)' : undefined
              }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Productos */}
        <div className="homepage-user-products-grid">
          {productosFiltrados.map((producto, idx) => (
            <div
              key={producto.id}
              className={`homepage-user-product-card${hoveredIndex === idx ? ' hovered' : ''}`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <img
                src={producto.url}
                alt={producto.name}
                className="homepage-user-product-img"
              />
              <div className="homepage-user-product-info">
                <div className="homepage-user-product-name">{producto.name}</div>
                <div className="homepage-user-product-category">{producto.category}</div>
                <div className="homepage-user-product-description">{producto.description}</div>
                <div className="homepage-user-product-meta">
                  <span className="homepage-user-product-price">${producto.price?.toLocaleString?.() ?? producto.price}</span>
                  <span className="homepage-user-product-stock">Stock: {producto.stock}</span>
                </div>
                {/* Botón agregar al carrito */}
                <button
                  className="homepage-user-addcart-btn"
                  onClick={() => handleAddToCart(producto)}
                >
                  <FaShoppingCart />
                  Agregar al carrito
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* ...aquí va el contenido principal... */}
      </main>

      <footer className="homepage-user-footer" ref={footerRef}>
  {/* Contacto */}
  <div className="homepage-user-footer-contact">
    <div className="homepage-user-footer-title">Contáctanos</div>
    {redes?.correo && <div><strong>Correo:</strong> {redes.correo}</div>}
    {redes?.whatsapp && <div><strong>WhatsApp:</strong> {redes.whatsapp}</div>}
  </div>

  {/* Derechos reservados */}
  <div className="homepage-user-footer-rights">
    © {new Date().getFullYear()} Pelktech. Todos los derechos reservados.
  </div>

  {/* Redes sociales */}
  <div className="homepage-user-footer-socials">
    {redes?.facebook && (
      <a href={redes.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
        <FaFacebook />
      </a>
    )}
    {redes?.twitter && (
      <a href={redes.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
        <FaTwitter />
      </a>
    )}
    {redes?.instagram && (
      <a href={redes.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <FaInstagram />
      </a>
    )}
  </div>
</footer>

      <>
        <LoginCart
          open={showLoginCart}
          onLogin={handleLogin}
          onShowRegister={handleShowRegister}
          onClose={handleCloseLogin}
        />
        <RegisterModal
          open={showRegister}
          onRegister={handleRegister}
          onShowLogin={handleShowLogin}
          showGreeting={true}
          onClose={handleCloseRegister}
        />
        {/* Renderiza MyProfile como modal */}
        <MyProfile
          open={showProfile}
          onClose={() => setShowProfile(false)}
          user={user}
          userName={userName}
          userLastName={userLastName}
        />
        <Cart
          open={showCart}
          onClose={() => setShowCart(false)}
          user={user}
        />
        <ConfirmationMessage
          open={showLogoutConfirm}
          title="Cerrar sesión"
          message="¿Estás seguro que deseas cerrar sesión?"
          onAccept={handleLogout}
          onReject={() => setShowLogoutConfirm(false)}
        />
      </>
      {/* Botón flotante de WhatsApp */}
      {redes?.whatsapp && (
        <a
          href={`https://wa.me/${redes.whatsapp.replace(/[^0-9]/g, "")}`}
          className={
            "homepage-user-whatsapp-fab" +
            (isWhatsappFabVisible ? "" : " homepage-user-whatsapp-fab--moveup")
          }
          target="_blank"
          rel="noopener noreferrer"
          title="Contáctanos por WhatsApp"
        >
          <FaWhatsapp style={{ fontSize: 28, marginRight: 10 }} />
          <span>Contáctanos</span>
        </a>
      )}
    </div>
  );
};

export default HomePage_User;