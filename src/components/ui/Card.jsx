import React from 'react';
import { C } from '../../constants.js';

export function Card({ children, style }) {
  return (
    <div style={{
      background: C.card,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: `1px solid rgba(240,192,64,0.12)`,
      boxShadow: "0 8px 32px 0 rgba(0,0,0,0.4)",
      borderRadius: 12,
      padding: 16,
      ...(style || {})
    }}>
      {children}
    </div>
  );
}
