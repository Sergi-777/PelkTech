import React from 'react';
import './ConfirmationMessage.css';

export default function ConfirmationMessage({
  open,
  title = 'Confirmación',
  message = '¿Estás seguro que deseas continuar?',
  onAccept,
  onReject,
}) {
  if (!open) return null;
  return (
    <div className="confirmation-overlay">
      <div className="confirmation-modal">
        <div className="confirmation-title">{title}</div>
        <div className="confirmation-message">{message}</div>
        <div className="confirmation-buttons">
          <button className="confirmation-accept" onClick={onAccept}>Acepto</button>
          <button className="confirmation-reject" onClick={onReject}>No acepto</button>
        </div>
      </div>
    </div>
  );
}
