import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './HOMEPAGE/HomePage_User';
import HomePageTechnical from './HOMEPAGE/HomePage_technical';
import HomePage_Admin from './HOMEPAGE/HomePage_Admin';
import Carga from './RESOURCES/LOADING/Carga';
import reportWebVitals from './reportWebVitals';

const Root = () => {
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // 'user' | 'technical' | 'admin' | null
  const [currentUser, setCurrentUser] = useState(null); // { email, rol, name }

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setUserType('user');
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(stored);
    setCurrentUser(parsed);

    // Determinar tipo por rol
    if (parsed.rol === "ADMINISTRADOR") setUserType("admin");
    else if (parsed.rol === "TECNICO") setUserType("technical");
    else setUserType("user");

    setLoading(false);
  }, []);

  if (loading) return <Carga />;

  return (
    <React.StrictMode>
      {userType === 'admin'
        ? <HomePage_Admin user={currentUser} />
        : userType === 'technical'
        ? <HomePageTechnical user={currentUser} />
        : <App user={currentUser} />}
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);

// Redirección automática a /PelkTech si no está en la URL
if (!window.location.pathname.startsWith('/PelkTech')) {
  window.location.replace('/PelkTech' + window.location.search + window.location.hash);
}

reportWebVitals();
