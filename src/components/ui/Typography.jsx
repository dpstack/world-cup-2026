import React from 'react';
import { C, font } from '../../constants.js';

export function GoldTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: C.gold, fontFamily: font }}>{children}</span>
      {sub && <span style={{ fontSize: 11, color: "#777", marginLeft: 8 }}>{sub}</span>}
    </div>
  );
}

export function MiniLabel({ children }) {
  return (
    <div style={{ fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 8, fontWeight: 700, fontFamily: font }}>
      {children}
    </div>
  );
}
