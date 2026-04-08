import React, { useState, useMemo } from 'react';
import { C, GROUP_KEYS, font, tdBase, secBtn, primaryBtn } from '../constants.js';
import { computeTable, solveMatch, getLiveStandings } from '../utils/helpers.js';
import { Card } from './ui/Card.jsx';
import { GoldTitle, MiniLabel } from './ui/Typography.jsx';
import { ScoreBox } from './ui/ScoreBox.jsx';
import { useGameConfig } from '../context/GameContext.jsx';
import { playWhistle } from '../utils/audio.js';

function GroupPanel({ gk, gd, onUpdate }) {
  const { favoriteTeam } = useGameConfig();
  const { teams, matches, tieBreakers } = gd;
  const table = useMemo(() => computeTable(teams, matches, tieBreakers), [teams, matches, tieBreakers]);
  const allConfirmed = matches.every(m => m.confirmed);

  function patch(idx, p) { onUpdate({ ...gd, matches: matches.map((m, i) => i === idx ? { ...m, ...p } : m) }); }
  function confirm(idx) { const m = matches[idx]; if (m.g1 === "" || m.g2 === "") return; patch(idx, { confirmed: true }); }
  function edit(idx) { patch(idx, { confirmed: false }); }

  return (
    <div className="grid-2col-gap24">
      <div>
        <MiniLabel>PARTIDOS</MiniLabel>
        {matches.map((m, i) => {
          if (m.confirmed) return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(64,224,128,0.04)", border: `1px solid ${C.borderGreen}`, borderRadius: 8, marginBottom: 6 }}>
              <span style={{ flex: 1, fontSize: 12, color: "#ccc", fontFamily: font }}>{m.t1}</span>
              <span style={{ fontWeight: 700, color: C.green, minWidth: 40, textAlign: "center", fontSize: 15 }}>{m.g1}–{m.g2}</span>
              <span style={{ flex: 1, textAlign: "right", fontSize: 12, color: "#ccc", fontFamily: font }}>{m.t2}</span>
              <button onClick={() => edit(i)} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", fontSize: 13 }}>✏️</button>
            </div>
          );
          const valid = m.g1 !== "" && m.g2 !== "";
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 6 }}>
              <span style={{ flex: 1, fontSize: 12, color: "#bbb", fontFamily: font }}>{m.t1}</span>
              <ScoreBox value={m.g1} onChange={v => patch(i, { g1: v })} />
              <span style={{ color: "#444" }}>–</span>
              <ScoreBox value={m.g2} onChange={v => patch(i, { g2: v })} />
              <span style={{ flex: 1, textAlign: "right", fontSize: 12, color: "#bbb", fontFamily: font }}>{m.t2}</span>
              <button disabled={!valid} onClick={() => confirm(i)} style={{ padding: "5px 11px", background: valid ? `linear-gradient(135deg,${C.gold},#c89010)` : "#1a1a1a", color: valid ? "#080e14" : "#444", border: "none", borderRadius: 6, cursor: valid ? "pointer" : "default", fontSize: 13, fontWeight: 700 }}>✓</button>
            </div>
          );
        })}
      </div>
      <div>
        <MiniLabel>TABLA — GRUPO {gk}</MiniLabel>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["#", "Selección", "PJ", "GF", "GC", "DG", "Pts"].map((h, i) => <th key={h} style={{ ...tdBase, color: C.gold, textAlign: i === 1 ? "left" : "center" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => {
              const dg = row.gf - row.gc;
              const q = allConfirmed && i < 2;
              const isFav = favoriteTeam && row.team === favoriteTeam.nameEs;

              return (
                <tr key={row.team} style={{ background: isFav ? "rgba(240,192,64,0.15)" : q ? "rgba(64,224,128,0.07)" : "transparent", backdropFilter: q ? "blur(4px)" : "none", WebkitBackdropFilter: q ? "blur(4px)" : "none", borderBottom: `1px solid ${isFav ? 'rgba(240,192,64,0.3)' : 'rgba(255,255,255,0.04)'}` }}>
                  <td style={{ ...tdBase, color: isFav ? C.gold : q ? C.green : "#777", fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ ...tdBase, textAlign: "left", color: isFav ? C.gold : "#e0d8c8", fontSize: 12, fontWeight: isFav ? 700 : 400 }}>{row.team} {isFav && '★'}</td>
                  <td style={{ ...tdBase }}>{row.pj}</td>
                  <td style={{ ...tdBase }}>{row.gf}</td>
                  <td style={{ ...tdBase }}>{row.gc}</td>
                  <td style={{ ...tdBase, color: dg > 0 ? C.green : dg < 0 ? C.red : "#888", fontWeight: 600 }}>{`${dg > 0 ? "+" : ""}${dg}`}</td>
                  <td style={{ ...tdBase, fontWeight: 700, color: "#fff" }}>{row.pts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {allConfirmed && <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(64,224,128,0.07)", border: `1px solid ${C.borderGreen}`, borderRadius: 8, fontSize: 12, color: C.green, textAlign: "center", fontFamily: font }}>
          ✓ {table[0].team} & {table[1].team} clasificados
        </div>}
      </div>
    </div>
  );
}

function StandingsTable({ title, data, cutoffIndex, cutColor, normalColor }) {
  const { favoriteTeam } = useGameConfig();
  if (!data || data.length === 0) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <MiniLabel>{title}</MiniLabel>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr>{["#", "Gr", "Equipo", "Pts", "DG", "GF"].map(h => <th key={h} style={{ color: C.gold, textAlign: "left", paddingBottom: 8 }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((t, i) => {
            const passes = i < cutoffIndex;
            const isFav = favoriteTeam && t.team === favoriteTeam.nameEs;
            const style = { 
              background: isFav ? 'rgba(240,192,64,0.15)' : 'transparent',
              borderBottom: `1px solid ${isFav ? 'rgba(240,192,64,0.3)' : 'rgba(255,255,255,0.05)'}`, 
              color: isFav ? C.gold : (passes ? cutColor : normalColor) 
            };
            return (
              <tr key={t.team} style={style}>
                <td style={{ padding: "6px 0", color: isFav ? C.gold : "rgba(255,255,255,0.3)" }}>{i + 1}</td>
                <td style={{ fontWeight: "bold" }}>{t.group}</td>
                <td style={{ fontWeight: isFav ? 700 : 400 }}>{t.team} {isFav && '★'}</td>
                <td style={{ fontWeight: "bold" }}>{t.pts}</td>
                <td>{t.gf - t.gc}</td>
                <td>{t.gf}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LivePanel({ groupData }) {
  const { firsts, seconds, thirds } = useMemo(() => getLiveStandings(groupData), [groupData]);
  return (
    <Card style={{ maxHeight: "85vh", overflowY: "auto", padding: "16px 20px" }}>
      <GoldTitle>🏆 Clasificatorios en Vivo</GoldTitle>
      <StandingsTable title="🥇 1ros LUGARES (Top 8 contra Terceros)" data={firsts} cutoffIndex={8} cutColor={C.green} normalColor="#88cc88" />
      <StandingsTable title="🥈 2dos LUGARES" data={seconds} cutoffIndex={8} cutColor={C.green} normalColor="#88cc88" />
      <StandingsTable title="🥉 TABLA DE TERCEROS (Pasan 8)" data={thirds} cutoffIndex={8} cutColor={C.green} normalColor={C.red} />
    </Card>
  );
}

export function Phase2({ groupData, setGroupData, onComplete }) {
  const [activeGroup, setActiveGroup] = useState("A");
  const allDone = GROUP_KEYS.every(k => groupData[k] && groupData[k].matches.every(m => m.confirmed));

  const [isSimulating, setIsSimulating] = useState(false);

  function autoSimulateGroup() {
    if (isSimulating) return;
    setIsSimulating(true);
    let ticks = 0;
    const finalMatches = groupData[activeGroup].matches.map(m => solveMatch(m, true));
    
    const iv = setInterval(() => {
      ticks++;
      if (ticks >= 15) {
        clearInterval(iv);
        setGroupData(prev => ({ ...prev, [activeGroup]: { ...prev[activeGroup], matches: finalMatches } }));
        setIsSimulating(false);
        playWhistle();
      } else {
        setGroupData(prev => ({
          ...prev, [activeGroup]: {
            ...prev[activeGroup], matches: prev[activeGroup].matches.map(m => ({ ...m, g1: Math.floor(Math.random() * 5), g2: Math.floor(Math.random() * 5) }))
          }
        }));
      }
    }, 35);
  }

  function autoSimulateAll() {
    if (isSimulating) return;
    setIsSimulating(true);
    let ticks = 0;
    const nextFinal = {};
    GROUP_KEYS.forEach(k => { nextFinal[k] = { ...groupData[k], matches: groupData[k].matches.map(m => solveMatch(m, true)) }; });

    const iv = setInterval(() => {
      ticks++;
      if (ticks >= 15) {
        clearInterval(iv);
        setGroupData(prev => ({ ...prev, ...nextFinal }));
        setIsSimulating(false);
        playWhistle();
      } else {
        setGroupData(prev => {
          const next = { ...prev };
          GROUP_KEYS.forEach(k => { next[k] = { ...next[k], matches: next[k].matches.map(m => ({ ...m, g1: Math.floor(Math.random() * 5), g2: Math.floor(Math.random() * 5) })) }; });
          return next;
        });
      }
    }, 35);
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
        {GROUP_KEYS.map(k => {
          const done = groupData[k] && groupData[k].matches.every(m => m.confirmed);
          const active = activeGroup === k;
          return <button key={k} onClick={() => setActiveGroup(k)} style={{
            padding: "7px 18px", borderRadius: 8,
            border: `1.5px solid ${active ? C.gold : done ? C.borderGreen : C.border}`,
            background: active ? "rgba(240,192,64,0.13)" : "transparent",
            color: done ? C.green : active ? C.gold : "#999",
            fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: font,
          }}>{k + (done ? "✓" : "")}</button>;
        })}
      </div>
      <div className="grid-2col">
        {groupData[activeGroup] && <div>
          <Card>
            <GoldTitle>Grupo {activeGroup}</GoldTitle>
            <GroupPanel gk={activeGroup} gd={groupData[activeGroup]} onUpdate={updated => setGroupData(prev => ({ ...prev, [activeGroup]: updated }))} />
          </Card>
          <div style={{ textAlign: "center", marginTop: 28, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {!allDone && <button disabled={isSimulating} onClick={autoSimulateGroup} style={{...secBtn, opacity: isSimulating ? 0.5 : 1}}>🎲 Simular Grupo {activeGroup}</button>}
            {!allDone && <button disabled={isSimulating} onClick={autoSimulateAll} style={{...secBtn, opacity: isSimulating ? 0.5 : 1}}>🎲 Simular Todos los Grupos</button>}
            {allDone && <button onClick={onComplete} style={primaryBtn}>▶ Generar Cuadro Eliminatorio</button>}
          </div>
        </div>}
        <LivePanel groupData={groupData} />
      </div>
    </div>
  );
}
