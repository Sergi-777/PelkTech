import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './HOMEPAGE/HomePage_User';
import HomePageTechnical from './HOMEPAGE/HomePage_technical';
import HomePage_Admin from './HOMEPAGE/HomePage_Admin';
import Carga from './RESOURCES/LOADING/Carga';
import reportWebVitals from './reportWebVitals';

// Firebase imports
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const Root = () => {
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // 'user' | 'technical' | 'admin' | null
  const [currentUser, setCurrentUser] = useState(null); // { email, rol }

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserType('user');
        setCurrentUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const db = getFirestore();
        const docRef = doc(db, "EMPLEADOS", user.email);
        const docSnap = await getDoc(docRef);
        let rol = "USER";
        if (docSnap.exists()) {
          const rolDb = docSnap.data().rol;
          if (rolDb === "TECNICO") {
            rol = "TECNICO";
            setUserType('technical');
          } else if (rolDb === "ADMINISTRADOR") {
            rol = "ADMINISTRADOR";
            setUserType('admin');
          } else {
            setUserType('user');
          }
        } else {
          setUserType('user');
        }
        setCurrentUser({ email: user.email, rol });
      } catch (e) {
        setUserType('user');
        setCurrentUser({ email: user.email, rol: "USER" });
      }
      setLoading(false);
    });
    return () => unsubscribe();
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

// Redirección automática a /pelktech si no está en la URL
if (!window.location.pathname.startsWith('/PelkTech')) {
  window.location.replace('/PelkTech' + window.location.search + window.location.hash);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
