import React, { useState } from "react";
import "./login.css";
// Agrega imports de Firebase
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function Login({ open = true, onLogin, onShowRegister, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Nuevo estado
  const [errorMsg, setErrorMsg] = useState(""); // Nuevo estado para errores

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userEmail = userCredential.user.email;
      // Busca el rol en EMPLEADOS
      const db = getFirestore();
      const empleadoDoc = await getDoc(doc(db, "EMPLEADOS", userEmail));
      let rol = "USER";
      if (empleadoDoc.exists() && empleadoDoc.data().rol === "TECNICO") {
        rol = "TECNICO";
      }
      // Solo pasa email y rol, no guardes la contraseña ni el objeto completo
      if (onLogin) onLogin({ email: userEmail, rol });
      // Limpia los campos de email y password después de iniciar sesión
      setEmail("");
      setPassword("");
    } catch (err) {
      setErrorMsg("Correo o contraseña incorrectos.");
    }
  };

  return (
    <div
      className="login-overlay"
      onClick={onClose}
      style={{ cursor: "pointer" }}
    >
      <div
        className="login-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Hola, veo que no haz iniciado sesión</h2>
        <form onSubmit={handleSubmit} className="login-form">
          {/* Mensaje de error */}
          {errorMsg && (
            <div style={{ color: "crimson", marginBottom: 8, fontWeight: "bold" }}>
              {errorMsg}
            </div>
          )}
          <input
            className="login-input"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div style={{ position: "relative" }}>
            <input
              className="login-input"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.9em",
              }}
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <button className="login-btn" type="submit">
            Iniciar sesión
          </button>
          <div
            className="login-register-link"
            style={{ marginTop: "1rem", textAlign: "center" }}
          >
            <span>¿No tienes cuenta? </span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onShowRegister) onShowRegister();
              }}
            >
              Regístrate
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}