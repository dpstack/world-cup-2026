import React from 'react';
import { C, font } from '../constants.js';
import { ScoreBox } from './ui/ScoreBox.jsx';
import { useGameConfig } from '../context/GameContext.jsx';

export function MatchEntry({ match, label, onChange, onConfirm, onEdit, isKnockout = false }) {
  const { favoriteTeam } = useGameConfig();
  const { t1, t2, g1, g2, p1, p2, confirmed, winner } = match;
  const hasScores = g1 !== "" && g2 !== "";
  const isDraw = hasScores && +g1 === +g2;
  const pErr = p1 !== "" && p2 !== "" && +p1 === +p2;
  const pensFilled = p1 !== "" && p2 !== "" && !pErr;
  const canConfirm = hasScores && (!isKnockout || !isDraw || pensFilled);

  const isFav = (t) => favoriteTeam && t === favoriteTeam.nameEs;

  if (confirmed) {
    const isT1Fav = isFav(t1);
    const isT2Fav = isFav(t2);
    const hasFav = isT1Fav || isT2Fav;
    
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        padding: "10px 14px", background: hasFav ? "rgba(240,192,64,0.1)" : "rgba(64,224,128,0.04)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        border: `1px solid ${hasFav ? C.gold : C.borderGreen}`, boxShadow: hasFav ? "0 0 16px rgba(240,192,64,0.2)" : "inset 0 0 10px rgba(64,224,128,0)", borderRadius: 10, marginBottom: 8,
      }}>
        <span style={{ flex: 1, fontSize: 13, color: winner === t1 ? (isT1Fav ? C.gold : C.green) : (isT1Fav ? "#e0d8c8" : "#ccc"), fontWeight: winner === t1 ? 700 : 400, fontFamily: font }}>{t1 || "—"}</span>
        <div style={{ textAlign: "center", minWidth: 70 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: hasFav ? C.gold : C.green }}>{g1} – {g2}</div>
          {p1 !== "" && <div style={{ fontSize: 11, color: "#999" }}>({p1}–{p2} pen)</div>}
        </div>
        <span style={{ flex: 1, textAlign: "right", fontSize: 13, color: winner === t2 ? (isT2Fav ? C.gold : C.green) : (isT2Fav ? "#e0d8c8" : "#ccc"), fontWeight: winner === t2 ? 700 : 400, fontFamily: font }}>{t2 || "—"}</span>
        <button onClick={onEdit} aria-label="Editar resultado" title="Editar resultado" style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", fontSize: 15, padding: 2 }}>✏️</button>
      </div>
    );
  }

  const isT1Fav = isFav(t1);
  const isT2Fav = isFav(t2);
  const hasFav = isT1Fav || isT2Fav;

  return (
    <div style={{ padding: "12px 14px", background: hasFav ? "rgba(240,192,64,0.05)" : C.card2, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: `1px solid ${hasFav ? 'rgba(240,192,64,0.3)' : 'rgba(255,255,255,0.06)'}`, boxShadow: hasFav ? "0 4px 20px rgba(240,192,64,0.15)" : "0 4px 16px 0 rgba(0,0,0,0.2)", borderRadius: 10, marginBottom: 8 }}>
      {label && <div style={{ fontSize: 10, color: C.gold, letterSpacing: 1.5, marginBottom: 8, fontFamily: font }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ flex: 1, fontSize: 13, color: isT1Fav ? C.gold : "#e0d8c8", fontWeight: isT1Fav ? 700 : 400, fontFamily: font, minWidth: 90 }}>{t1 || "—"}</span>
        <ScoreBox value={g1} onChange={v => onChange({ g1: v })} error={g1 !== "" && +g1 < 0} />
        <span style={{ color: "#555", fontSize: 16 }}>–</span>
        <ScoreBox value={g2} onChange={v => onChange({ g2: v })} error={g2 !== "" && +g2 < 0} />
        <span style={{ flex: 1, textAlign: "right", fontSize: 13, color: isT2Fav ? C.gold : "#e0d8c8", fontWeight: isT2Fav ? 700 : 400, fontFamily: font, minWidth: 90 }}>{t2 || "—"}</span>
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
