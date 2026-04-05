import React from 'react';
import { C, font } from '../constants.js';
import { ScoreBox } from './ui/ScoreBox.jsx';

export function MatchEntry({ match, label, onChange, onConfirm, onEdit, isKnockout = false }) {
  const { t1, t2, g1, g2, p1, p2, confirmed, winner } = match;
  const hasScores = g1 !== "" && g2 !== "";
  const isDraw = hasScores && +g1 === +g2;
  const pErr = p1 !== "" && p2 !== "" && +p1 === +p2;
  const pensFilled = p1 !== "" && p2 !== "" && !pErr;
  const canConfirm = hasScores && (!isKnockout || !isDraw || pensFilled);

  if (confirmed) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        padding: "10px 14px", background: "rgba(64,224,128,0.04)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        border: `1px solid ${C.borderGreen}`, boxShadow: "inset 0 0 10px rgba(64,224,128,0)", borderRadius: 10, marginBottom: 8,
      }}>
        <span style={{ flex: 1, fontSize: 13, color: winner === t1 ? C.green : "#ccc", fontWeight: winner === t1 ? 700 : 400, fontFamily: font }}>{t1 || "—"}</span>
        <div style={{ textAlign: "center", minWidth: 70 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.green }}>{g1} – {g2}</div>
          {p1 !== "" && <div style={{ fontSize: 11, color: "#999" }}>({p1}–{p2} pen)</div>}
        </div>
        <span style={{ flex: 1, textAlign: "right", fontSize: 13, color: winner === t2 ? C.green : "#ccc", fontWeight: winner === t2 ? 700 : 400, fontFamily: font }}>{t2 || "—"}</span>
        <button onClick={onEdit} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", fontSize: 15, padding: 2 }}>✏️</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 14px", background: C.card2, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: `1px solid rgba(255,255,255,0.06)`, boxShadow: "0 4px 16px 0 rgba(0,0,0,0.2)", borderRadius: 10, marginBottom: 8 }}>
      {label && <div style={{ fontSize: 10, color: C.gold, letterSpacing: 1.5, marginBottom: 8, fontFamily: font }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ flex: 1, fontSize: 13, color: "#e0d8c8", fontFamily: font, minWidth: 90 }}>{t1 || "—"}</span>
        <ScoreBox value={g1} onChange={v => onChange({ g1: v })} error={g1 !== "" && +g1 < 0} />
        <span style={{ color: "#555", fontSize: 16 }}>–</span>
        <ScoreBox value={g2} onChange={v => onChange({ g2: v })} error={g2 !== "" && +g2 < 0} />
        <span style={{ flex: 1, textAlign: "right", fontSize: 13, color: "#e0d8c8", fontFamily: font, minWidth: 90 }}>{t2 || "—"}</span>
      </div>
      {isDraw && isKnockout && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize: 12, color: C.gold, fontFamily: font, minWidth: 60 }}>Penales:</span>
          <span style={{ flex: 1, fontSize: 11, color: "#aaa", textAlign: "right", fontFamily: font }}>{t1}</span>
          <ScoreBox value={p1} onChange={v => onChange({ p1: v })} error={pErr} />
          <span style={{ color: "#555" }}>–</span>
          <ScoreBox value={p2} onChange={v => onChange({ p2: v })} error={pErr} />
          <span style={{ flex: 1, fontSize: 11, color: "#aaa", fontFamily: font }}>{t2}</span>
        </div>
      )}
      {isDraw && isKnockout && !pensFilled && !pErr && (
        <div style={{ fontSize: 11, color: "#f0a040", marginTop: 6, fontFamily: font, animation: "pulse 1.5s infinite" }}>⚠ Empate — ingresa penales (deben ser distintos)</div>
      )}
      {isDraw && isKnockout && pErr && (
        <div style={{ fontSize: 11, color: C.red, marginTop: 6, fontFamily: font, fontWeight: 700 }}>❌ Los penales no pueden empatar</div>
      )}
      <button
        disabled={!canConfirm}
        onClick={onConfirm}
        style={{
          marginTop: 10, padding: "7px 20px",
          background: canConfirm ? `linear-gradient(135deg,${C.gold},#c89010)` : "rgba(255,255,255,0.06)",
          color: canConfirm ? "#080e14" : "#444",
          border: "none", borderRadius: 8, fontWeight: 700,
          cursor: canConfirm ? "pointer" : "default",
          fontSize: 13, fontFamily: font,
        }}
      >
        Confirmar resultado
      </button>
    </div>
  );
}
