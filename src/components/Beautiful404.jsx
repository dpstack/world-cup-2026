import React from 'react';
import { NavLink } from 'react-router-dom';
import { font, C } from '../constants';

export function Beautiful404() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "#e0d8c8", fontFamily: font }}>
      <h1 style={{ fontSize: 120, margin: 0, letterSpacing: -5, background: "linear-gradient(135deg, #f0c040 0%, #fff8e0 50%, #c89010 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        404
      </h1>
      <h2 style={{ fontSize: 24, marginTop: -20, marginBottom: 20 }}>¡Fuera de Juego!</h2>
      <p style={{ fontSize: 16, color: "#aaa", maxWidth: 400, margin: "0 auto 40px" }}>
        Parece que el árbitro anuló esta jugada. La ruta que buscas no existe o está en posición adelantada.
      </p>
      <NavLink
        to="/"
        style={{
          display: "inline-block",
          padding: "12px 30px",
          borderRadius: 30,
          background: "linear-gradient(135deg, rgba(240,192,64,0.15) 0%, rgba(200,144,16,0.15) 100%)",
          border: "1px solid rgba(240,192,64,0.4)",
          color: C.gold,
          textDecoration: "none",
          fontWeight: 700,
          fontSize: 16,
          transition: "all 0.2s"
        }}
      >
        ⚽ Volver a la Simulación
      </NavLink>
    </div>
  );
}
