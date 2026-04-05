import React, { useEffect } from 'react';
import { C, font, tdBase, ROUND_NAMES } from '../constants.js';
import { MiniLabel } from './ui/Typography.jsx';
import confetti from 'canvas-confetti';
import { playStadiumRoar } from '../utils/audio.js';

export function Phase4({ rounds, champion }) {
  useEffect(() => {
    if (champion) {
      playStadiumRoar(4);
      confetti({
        particleCount: 250,
        spread: 120,
        origin: { y: 0.5 },
        colors: [C.gold, C.green, '#ffffff', '#e0d8c8']
      });
    }
  }, [champion]);

  if (!champion) return <div style={{ color: "#777", textAlign: "center", padding: 40, fontFamily: font }}>No hay campeón aún.</div>;
  const path = rounds.map((round, i) => {
    const m = round.find(m => m.winner === champion);
    if (!m) return null;
    return { round: ROUND_NAMES[i], rival: m.t1 === champion ? m.t2 : m.t1, g1: m.g1, g2: m.g2, p1: m.p1, p2: m.p2 };
  }).filter(Boolean);
  const flag = champion.split(" ")[0];
  const name = champion.replace(/^\\S+\\s/, "");
  return (
    <div style={{ textAlign: "center", padding: "20px 0 40px" }}>
      <div style={{ fontSize: 80, marginBottom: 8 }}>🏆</div>
      <div style={{ fontSize: 72, marginBottom: 4 }}>{flag}</div>
      <div style={{ fontSize: 34, fontWeight: 700, fontFamily: font, letterSpacing: 3, background: `linear-gradient(135deg,${C.gold} 0%,#fff8e0 50%,#c89010 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>{name}</div>
      <div style={{ fontSize: 20, color: "#fff", letterSpacing: 4, fontFamily: font, marginBottom: 6 }}>CAMPEÓN DEL MUNDO 2026</div>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 36, fontFamily: font }}>19 Jul 2026 · MetLife Stadium, Nueva York</div>
      <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "left" }}>
        <MiniLabel>RUTA AL TÍTULO</MiniLabel>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Ronda", "Rival", "Marcador", "Penales"].map((h, i) => <th key={h} style={{ ...tdBase, color: C.gold, textAlign: i < 2 ? "left" : "center", paddingBottom: 10 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {path.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ ...tdBase, textAlign: "left", color: "#888", fontSize: 12 }}>{row.round}</td>
                <td style={{ ...tdBase, textAlign: "left", color: "#e0d8c8" }}>{row.rival}</td>
                <td style={{ ...tdBase, color: C.green, fontWeight: 700 }}>{row.g1}–{row.g2}</td>
                <td style={{ ...tdBase, color: "#999", fontSize: 12 }}>{row.p1 ? `${row.p1}–${row.p2}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
