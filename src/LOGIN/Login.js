import React, { useState } from "react";
import "./login.css";

export default function Login({ open = true, onLogin, onShowRegister, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMsg("");

  try {
    const res = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error("Correo o contraseña incorrectos.");
    }

    const data = await res.json();

    // Guardar usuario en localStorage
    localStorage.setItem("user", JSON.stringify(data));

    if (onLogin) onLogin(data);

    // ✅ Recargar para activar redirección por rol
    window.location.reload();

    setEmail("");
    setPassword("");
  } catch (err) {
    setErrorMsg(err.message);
  }
};


  return (
    <div className="login-overlay" onClick={onClose} style={{ cursor: "pointer" }}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Hola, veo que no haz iniciado sesión</h2>
        <form onSubmit={handleSubmit} className="login-form">
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
          <div className="login-register-link" style={{ marginTop: "1rem", textAlign: "center" }}>
            <span>¿No tienes cuenta? </span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onClose) onClose(); // Cierra el Login antes de mostrar Register
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
