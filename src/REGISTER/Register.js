import React, { useState } from "react";
import "./register.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Register({ open = true, onRegister, onShowLogin, showGreeting, onClose }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, lastName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al registrar el cliente.");
      }

      toast.success("Cliente registrado correctamente");

      if (onRegister) {
        onRegister({ email, name, lastName });
      }

      setEmail("");
      setName("");
      setLastName("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="register-overlay" onClick={onClose} style={{ cursor: "pointer" }}>
      <div className="register-modal" onClick={e => e.stopPropagation()}>
        <h2>{showGreeting ? "Hola, aquí te puedes registrar" : "Regístrate"}</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <input
            className="register-input"
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="register-input"
            type="text"
            placeholder="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            className="register-input"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div style={{ position: "relative" }}>
            <input
              className="register-input"
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
                fontSize: "0.9em"
              }}
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <input
              className="register-input"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                fontSize: "0.9em"
              }}
              onClick={() => setShowConfirmPassword((v) => !v)}
              tabIndex={-1}
            >
              {showConfirmPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {error && (
            <div style={{ color: "red", marginBottom: "0.5rem", textAlign: "center" }}>
              {error}
            </div>
          )}
          <button className="register-btn" type="submit">
            Registrarse
          </button>
          <div className="register-register-link" style={{ marginTop: "1rem", textAlign: "center" }}>
            <span>¿Ya tienes cuenta? </span>
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                if (onClose) onClose(); // Cierra el Register antes de mostrar Login
                if (onShowLogin) onShowLogin();
              }}
            >
              Inicia sesión
            </a>
          </div>
        </form>
        <ToastContainer position="top-center" autoClose={2000} hideProgressBar />
      </div>
    </div>
  );
}
