import React from 'react';
import { C, PLAYOFF_ROUTES, IC_SEMIS_META, IC_FINALS_META, secBtn, primaryBtn, font } from '../constants.js';
import { emptyMatch, resolveWinner, solveMatch } from '../utils/helpers.js';
import { Card } from './ui/Card.jsx';
import { GoldTitle, MiniLabel } from './ui/Typography.jsx';
import { MatchEntry } from './MatchEntry.jsx';

export function Phase1({ ic, setIc, routes, setRoutes, onComplete }) {
  function patchIcSemi(idx, patch) {
    setIc(prev => {
      const semis = prev.semis.map((m, i) => i === idx ? { ...m, ...patch } : m);
      const finals = prev.finals.map((f, fi) => fi === idx ? { ...f, t1: semis[idx].winner || "" } : f);
      return { semis, finals };
    });
  }
  function confirmIcSemi(idx) {
    const m = ic.semis[idx];
    patchIcSemi(idx, { confirmed: true, winner: resolveWinner(m.t1, m.t2, m.g1, m.g2, m.p1, m.p2) });
  }
  function editIcSemi(idx) {
    setIc(prev => ({
      semis: prev.semis.map((m, i) => i === idx ? { ...m, confirmed: false, winner: null } : m),
      finals: prev.finals.map((f, fi) => fi === idx ? { ...f, t1: "", confirmed: false, winner: null } : f),
    }));
  }
  function patchIcFinal(idx, patch) {
    setIc(prev => ({ ...prev, finals: prev.finals.map((m, i) => i === idx ? { ...m, ...patch } : m) }));
  }
  function confirmIcFinal(idx) {
    const t1 = ic.semis[IC_FINALS_META[idx].semiIdx].winner || "";
    const t2 = IC_FINALS_META[idx].seed;
    const m = { ...ic.finals[idx], t1, t2 };
    patchIcFinal(idx, { t1, t2, confirmed: true, winner: resolveWinner(t1, t2, m.g1, m.g2, m.p1, m.p2) });
  }
  function editIcFinal(idx) { patchIcFinal(idx, { confirmed: false, winner: null }); }

  function patchRouteSemi(ri, si, patch) {
    setRoutes(prev => prev.map((r, i) => i !== ri ? r : { ...r, semis: r.semis.map((m, j) => j !== si ? m : { ...m, ...patch }) }));
  }
  function confirmRouteSemi(ri, si) {
    const m = routes[ri].semis[si];
    patchRouteSemi(ri, si, { confirmed: true, winner: resolveWinner(m.t1, m.t2, m.g1, m.g2, m.p1, m.p2) });
  }
  function editRouteSemi(ri, si) {
    setRoutes(prev => prev.map((r, i) => i !== ri ? r : {
      ...r,
      semis: r.semis.map((m, j) => j !== si ? m : { ...m, confirmed: false, winner: null }),
      final: emptyMatch("", ""),
    }));
  }
  function patchRouteFinal(ri, patch) {
    setRoutes(prev => prev.map((r, i) => i !== ri ? r : { ...r, final: { ...r.final, ...patch } }));
  }
  function confirmRouteFinal(ri) {
    const r = routes[ri];
    const t1 = r.semis[0].winner || "";
    const t2 = r.semis[1].winner || "";
    const m = { ...r.final, t1, t2 };
    patchRouteFinal(ri, { t1, t2, confirmed: true, winner: resolveWinner(t1, t2, m.g1, m.g2, m.p1, m.p2) });
  }
  function editRouteFinal(ri) { patchRouteFinal(ri, { confirmed: false, winner: null }); }

  function autoSimulate() {
    setIc(prev => {
      const semis = prev.semis.map(m => solveMatch(m, false));
      const finals = prev.finals.map((f, i) => solveMatch({ ...f, t1: semis[IC_FINALS_META[i].semiIdx].winner }, false));
      return { semis, finals };
    });
    setRoutes(prev => prev.map(r => {
      const semis = r.semis.map(m => solveMatch(m, false));
      const final = solveMatch({ ...r.final, t1: semis[0].winner, t2: semis[1].winner }, false);
      return { ...r, semis, final };
    }));
  }

  const allDone = ic.semis.every(m => m.confirmed) && ic.finals.every(m => m.confirmed) && routes.every(r => r.final.confirmed);

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <GoldTitle sub="2 cupos">🌍 Repechaje Intercontinental</GoldTitle>
        <div className="grid-2col">
          <div>
            <MiniLabel>SEMIFINALES</MiniLabel>
            {IC_SEMIS_META.map((meta, i) => (
              <MatchEntry
                key={meta.id}
                match={ic.semis[i]}
                label={`${meta.date} · ${meta.city}`} isKnockout={true}
                onChange={p => patchIcSemi(i, p)}
                onConfirm={() => confirmIcSemi(i)}
                onEdit={() => editIcSemi(i)}
              />
            ))}
          </div>
          <div>
            <MiniLabel>FINALES → GRUPOS {IC_FINALS_META.map(f => f.destGroup).join(" / ")}</MiniLabel>
            {IC_FINALS_META.map((meta, i) => {
              const semiDone = ic.semis[meta.semiIdx].confirmed;
              if (!semiDone) return <div key={meta.id} style={{ padding: "12px 14px", background: C.card, border: `1px dashed ${C.border}`, borderRadius: 10, marginBottom: 8, color: "#555", fontSize: 12, fontFamily: font }}>`⏳ Esperando Semi ${i + 1}…`</div>;
              const dm = { ...ic.finals[i], t1: ic.semis[meta.semiIdx].winner || `Ganador Semi ${i + 1}`, t2: meta.seed };
              return <MatchEntry
                key={meta.id} match={dm}
                label={`→ Grupo ${meta.destGroup} · ${meta.date} · ${meta.city}`} isKnockout={true}
                onChange={p => patchIcFinal(i, p)}
                onConfirm={() => confirmIcFinal(i)}
                onEdit={() => editIcFinal(i)}
              />;
            })}
          </div>
        </div>
      </Card>
      
      <Card style={{ marginBottom: 24 }}>
        <GoldTitle sub="4 cupos">🇪🇺 Playoffs UEFA</GoldTitle>
        <div className="grid-2col">
          {PLAYOFF_ROUTES.map((route, ri) => {
            const rs = routes[ri];
            const bothDone = rs.semis.every(s => s.confirmed);
            const finalMatch = { ...rs.final, t1: rs.semis[0].winner || "", t2: rs.semis[1].winner || "" };
            return (
              <div key={route.id} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 14, border: `1px solid ${rs.final.confirmed ? C.borderGreen : C.border}` }}>
                <div style={{ color: C.gold, fontWeight: 700, marginBottom: 12, fontSize: 14, fontFamily: font }}>
                  {route.label} → Grupo {route.destGroup}
                  {rs.final.confirmed && <span style={{ color: C.green, marginLeft: 8, fontSize: 12 }}>✓ {rs.final.winner}</span>}
                </div>
                <MiniLabel>SEMIFINALES</MiniLabel>
                {route.semis.map((s, si) => (
                  <MatchEntry
                    key={s.id} match={rs.semis[si]} label={`Semifinal ${si + 1}`} isKnockout={true}
                    onChange={p => patchRouteSemi(ri, si, p)}
                    onConfirm={() => confirmRouteSemi(ri, si)}
                    onEdit={() => editRouteSemi(ri, si)}
                  />
                ))}
                {!bothDone
                  ? <div style={{ padding: "10px 14px", background: C.card, border: `1px dashed ${C.border}`, borderRadius: 10, marginTop: 4, color: "#555", fontSize: 12, fontFamily: font }}>🔒 Final — completa ambas semifinales</div>
                  : <div>
                      <MiniLabel>FINAL → GRUPO {route.destGroup}</MiniLabel>
                      <MatchEntry
                        match={finalMatch} label={null} isKnockout={true}
                        onChange={p => patchRouteFinal(ri, p)}
                        onConfirm={() => confirmRouteFinal(ri)}
                        onEdit={() => editRouteFinal(ri)}
                      />
                    </div>
                }
              </div>
            );
          })}
        </div>
      </Card>
      
      <div style={{ textAlign: "center", marginTop: 28, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        {!allDone && <button onClick={autoSimulate} style={secBtn}>🎲 Simular todo el Repechaje</button>}
        {allDone && <button onClick={onComplete} style={primaryBtn}>▶ Avanzar a Fase de Grupos</button>}
      </div>
    </div>
  );
}
