import React, { useEffect, useState, useRef } from 'react';
import { FaShoppingCart, FaFacebook, FaTwitter, FaInstagram, FaUser, FaSignOutAlt, FaWhatsapp, FaBars } from 'react-icons/fa';
import './HomePage_User.css'; 
// Importa Firestore
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import '../firebase'; // Asegúrate que inicializa Firebase
import LoginCart from '../LOGIN/Login';
import RegisterModal from '../REGISTER/Register'; // Importa el modal de registro
import MyProfile from '../MYPROFILE/MyProfile'; // Importa MyProfile
import Cart from '../CART/Cart'; // Importa el modal del carrito
import { getAuth, signOut } from "firebase/auth"; // Agrega import
import ConfirmationMessage from '../RESOURCES/CONFIRMATIONDELETE/ConfirmationMessage';

// Quita el estado local user y usa el prop
const HomePage_User = ({ user }) => {
  const [productos, setProductos] = useState([]);
  const [categoriasUnicas, setCategoriasUnicas] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null); // Nuevo estado para hover
  const [showLoginCart, setShowLoginCart] = useState(false);
  const [showRegister, setShowRegister] = useState(false); // Nuevo estado para registro
  const [userName, setUserName] = useState(""); // Estado para el nombre
  const [userLastName, setUserLastName] = useState(""); // Nuevo estado para apellido
  const [toastMsg, setToastMsg] = useState(""); // Nuevo: para mostrar toast
  const [selectedCategory, setSelectedCategory] = useState(null); // Nuevo: categoría seleccionada
  const [showProfile, setShowProfile] = useState(false); // Nuevo estado para mostrar perfil
  const [searchTerm, setSearchTerm] = useState(""); // Nuevo: estado para el término de búsqueda
  const [cartCount, setCartCount] = useState(0); // Nuevo: cantidad de productos en carrito
  const [showCart, setShowCart] = useState(false); // Nuevo: estado para mostrar el modal del carrito
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // Nuevo: para modal de confirmación
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [redes, setRedes] = useState(null);
  const [isWhatsappFabVisible, setIsWhatsappFabVisible] = useState(true); // Nuevo: visibilidad del botón
  const footerRef = useRef(null); // Nuevo: referencia al footer

  // Detectar si es móvil (ancho <= 700px)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      const db = getFirestore();
      const productosCol = collection(db, "PRODUCTOS");
      const productosSnapshot = await getDocs(productosCol);
      const productosList = productosSnapshot.docs.map(doc => doc.data());
      setProductos(productosList);

      // Extraer categorías únicas
      const cats = [...new Set(productosList.map(item => item.category))];
      setCategoriasUnicas(cats);
    };
    fetchProductos();
  }, []);

  const handleAddToCart = async (producto) => {
    if (!user) {
      setShowLoginCart(true);
      return;
    }
    // Nuevo: Agregar producto al carrito en Firestore
    try {
      const db = getFirestore();
      // El carrito es por usuario, documento con id = email
      const cartDocRef = doc(db, "CARRITO", user.email);
      // Cada producto es un campo en el documento, la clave es el id del producto
      // Si ya existe, solo suma cantidad, si no, lo crea con cantidad 1
      const cartSnap = await getDoc(cartDocRef);
      let newCart = {};
      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        const prev = cartData[producto.id];
        newCart = {
          ...cartData,
          [producto.id]: {
            ...producto,
            cantidad: prev ? (prev.cantidad || 1) + 1 : 1
          }
        };
      } else {
        newCart = {
          [producto.id]: {
            ...producto,
            cantidad: 1
          }
        };
      }
      await setDoc(cartDocRef, newCart);
      setToastMsg("Añadido al carrito");
      setTimeout(() => setToastMsg(""), 2000);
    } catch (err) {
      setToastMsg("Error al añadir al carrito");
      setTimeout(() => setToastMsg(""), 2000);
    }
  };

  const handleLogin = async (credentials) => {
    setShowLoginCart(false);

    // Obtener el nombre del usuario desde CLIENTES
    const db = getFirestore();
    const userDocRef = doc(db, "CLIENTES", credentials.email);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      setUserName(userDocSnap.data().name || "");
      setUserLastName(userDocSnap.data().lastName || "");
    } else {
      setUserName("");
      setUserLastName("");
    }
  };

  // Nuevo: cuando se solicita registro desde login
  const handleShowRegister = () => {
    setShowLoginCart(false);
    setShowRegister(true);
  };

  // Nuevo: cuando se solicita login desde registro
  const handleShowLogin = () => {
    setShowRegister(false);
    setShowLoginCart(true);
  };

  // Nuevo: manejar registro exitoso
  const handleRegister = async (credentials) => {
    setShowRegister(false);

    // Guardar nombre y apellido en la colección CLIENTES
    const db = getFirestore();
    const userDocRef = doc(db, "CLIENTES", credentials.email);
    await setDoc(userDocRef, {
      name: credentials.name,
      lastName: credentials.lastName,
      email: credentials.email
    });

    setUserName(credentials.name || "");
    setUserLastName(credentials.lastName || "");
  };

  // Nuevo: cerrar modales
  const handleCloseLogin = () => setShowLoginCart(false);
  const handleCloseRegister = () => setShowRegister(false);
  const handleCloseProfile = () => setShowProfile(false);

  // Si ya está autenticado y recarga, obtener el nombre
  useEffect(() => {
    if (user && user.email) {
      const db = getFirestore();
      const userDocRef = doc(db, "CLIENTES", user.email);
      getDoc(userDocRef).then(userDocSnap => {
        if (userDocSnap.exists()) {
          setUserName(userDocSnap.data().name || "");
          setUserLastName(userDocSnap.data().lastName || "");
        } else {
          setUserName("");
          setUserLastName("");
        }
      });
    }
  }, [user]);

  // Nuevo: manejar carga masiva de productos desde archivo JSON y subir a Firestore
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (Array.isArray(json)) {
          setProductos(prev => [...prev, ...json]);
          // Actualizar categorías únicas también
          const cats = [...new Set([...productos, ...json].map(item => item.category))];
          setCategoriasUnicas(cats);

          // Subir productos a Firestore
          const db = getFirestore();
          const uploadPromises = json.map(prod =>
            setDoc(doc(db, "PRODUCTOS", prod.id || Math.random().toString(36).slice(2)), prod)
          );
          await Promise.all(uploadPromises);

          // Mostrar toast
          setToastMsg("Productos subidos a la base de datos");
          setTimeout(() => setToastMsg(""), 3000);
        } else {
          alert("El archivo JSON debe ser un arreglo de productos.");
        }
      } catch (err) {
        alert("Archivo JSON inválido.");
      }
    };
    reader.readAsText(file);
  };

  // Filtrar productos según la categoría seleccionada y el término de búsqueda
  const productosFiltrados = productos.filter(p => {
    // Filtrado por categoría
    const categoryMatch = selectedCategory ? p.category === selectedCategory : true;
    // Filtrado por búsqueda flexible
    if (!searchTerm.trim()) return categoryMatch;
    // Normaliza y busca coincidencia parcial en nombre, descripción o categoría
    const normalize = s => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const search = normalize(searchTerm);
    return (
      categoryMatch &&
      (
        normalize(p.name).includes(search) ||
        normalize(p.description).includes(search) ||
        normalize(p.category).includes(search)
      )
    );
  });

  // Escuchar en tiempo real los cambios en el carrito del usuario
  useEffect(() => {
    if (!user?.email) {
      setCartCount(0);
      return;
    }
    const db = getFirestore();
    const cartDocRef = doc(db, "CARRITO", user.email);
    const unsubscribe = onSnapshot(cartDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Suma todas las cantidades de productos en el carrito
        const total = Object.values(data).reduce((acc, prod) => acc + (prod.cantidad || 1), 0);
        setCartCount(total);
      } else {
        setCartCount(0);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Nuevo: función para cerrar sesión
  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      setShowProfile(false);
      setShowLogoutConfirm(false);
      // Recargar la pantalla al cerrar sesión como usuario
      window.location.reload();
    } catch (e) {
      setToastMsg("Error al cerrar sesión");
      setTimeout(() => setToastMsg(""), 2000);
    }
  };

  // Nuevo: cargar datos de REDES/REDESSOCIALES al montar
  useEffect(() => {
    const fetchRedes = async () => {
      try {
        const db = getFirestore();
        const docRef = doc(db, "REDES", "REDESSOCIALES");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRedes(docSnap.data());
        }
      } catch (e) {
        setRedes(null);
      }
    };
    fetchRedes();
  }, []);

  // Nuevo: ocultar el botón de WhatsApp cuando el footer es visible
  useEffect(() => {
    if (!footerRef.current) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => setIsWhatsappFabVisible(!entry.isIntersecting),
      { threshold: 0.01 }
    );
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

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
              <FaShoppingCart style={{ marginRight: 8 }} />
              Carrito
              {cartCount > 0 && (
                <span className="homepage-user-cart-count" style={{ marginLeft: 8 }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <main className="homepage-user-main">
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

      {/* Footer */}
      <footer className="homepage-user-footer" ref={footerRef}>
        {/* Contacto */}
        <div>
          <div className="homepage-user-footer-title">Contáctanos</div>
          {redes?.correo && <div>{redes.correo}</div>}
          {redes?.whatsapp && <div>{redes.whatsapp}</div>}
        </div>
        {/* Derechos reservados */}
        <div className="homepage-user-footer-rights">
          © {new Date().getFullYear()} Pelktech. Todos los derechos reservados.
        </div>
        {/* Redes sociales */}
        <div className="homepage-user-footer-socials">
          {redes?.facebook && (
            <a href={redes.facebook} target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
          )}
          {redes?.twitter && (
            <a href={redes.twitter} target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
          )}
          {redes?.instagram && (
            <a href={redes.instagram} target="_blank" rel="noopener noreferrer">
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