import React from 'react';
import { C, font } from '../../constants.js';

export function ScoreBox({ value, onChange, error }) {
  return (
    <input
      aria-label="Ingresar puntaje"
      type="number"
      min="0"
      max="99"
      value={value}
      onChange={e => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length > 2) val = val.slice(0, 2);
        onChange(val);
      }}
      style={{
        width: 44, height: 44, textAlign: "center", fontSize: 20, fontWeight: 700,
        background: "rgba(255,255,255,0.07)",
        border: `2px solid ${error ? C.red : value !== "" ? C.green : "rgba(255,255,255,0.15)"}`,
        borderRadius: 8, color: "#fff", outline: "none", fontFamily: font,
        boxSizing: "border-box",
        boxShadow: error ? `0 0 8px ${C.red}` : "none",
      }}
    />
  );
}
