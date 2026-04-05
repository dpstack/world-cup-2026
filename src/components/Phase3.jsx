import React, { useState } from 'react';
import { ROUND_NAMES, secBtn, primaryBtn, font, C } from '../constants.js';
import { resolveWinner, solveMatch, emptyMatch } from '../utils/helpers.js';
import { GoldTitle } from './ui/Typography.jsx';
import { BracketView } from './BracketView.jsx';

export function Phase3({ rounds, setRounds, onComplete }) {
  const [mode, setMode] = useState(() => localStorage.getItem('wc2026_bracketMode') || 'drag');

  function saveMode(m) {
    setMode(m);
    localStorage.setItem('wc2026_bracketMode', m);
  }

  // ── advance to next round helper ──────────────────────────────────────
  function advanceIfRoundDone(updated, ri) {
    const updRound = updated[ri];
    if (updRound.every(m => m.confirmed) && ri + 1 < ROUND_NAMES.length) {
      const winners = updRound.map(m => m.winner);
      const next = [];
      for (let k = 0; k < winners.length; k += 2) next.push(emptyMatch(winners[k], winners[k + 1]));
      if (updated.length <= ri + 1) return [...updated, next];
      return updated.map((r, i) => i === ri + 1 ? next : r);
    }
    return updated;
  }

  // ── score mode handlers ───────────────────────────────────────────────
  function patchMatch(ri, mi, patch) {
    setRounds(prev => prev.map((r, i) => i !== ri ? r : r.map((m, j) => j !== mi ? m : { ...m, ...patch })));
  }
  function confirmMatch(ri, mi) {
    setRounds(prev => {
      const m = prev[ri][mi];
      const w = resolveWinner(m.t1, m.t2, m.g1, m.g2, m.p1, m.p2);
      const updated = prev.map((r, i) => i !== ri ? r : r.map((m, j) => j !== mi ? m : { ...m, confirmed: true, winner: w }));
      return advanceIfRoundDone(updated, ri);
    });
  }
  function editMatch(ri, mi) {
    setRounds(prev => prev.map((r, i) => {
      if (i < ri) return r;
      if (i === ri) return r.map((m, j) => j !== mi ? m : { ...m, confirmed: false, winner: null });
      return null;
    }).filter(Boolean));
  }

  // ── drag mode handler ─────────────────────────────────────────────────
  function selectWinner(ri, mi, team) {
    setRounds(prev => {
      const updated = prev.map((r, i) => i !== ri ? r : r.map((m, j) => j !== mi ? m : { ...m, confirmed: true, winner: team }));
      return advanceIfRoundDone(updated, ri);
    });
  }

  // ── auto simulate ─────────────────────────────────────────────────────
  function autoSimulate() {
    const activeRound = rounds.length - 1;
    setRounds(prev => {
      const curr = prev[activeRound].map(m => solveMatch(m, false));
      let updated = [...prev];
      updated[activeRound] = curr;
      if (curr.every(m => m.confirmed) && activeRound + 1 < ROUND_NAMES.length) {
        const winners = curr.map(m => m.winner);
        const nextMatches = [];
        for (let k = 0; k < winners.length; k += 2) nextMatches.push(emptyMatch(winners[k], winners[k + 1]));
        if (updated.length <= activeRound + 1) updated.push(nextMatches);
        else updated[activeRound + 1] = nextMatches;
      }
      return updated;
    });
  }

  const allFinalDone = rounds.length === 5 && rounds[4]?.every(m => m.confirmed);
  const activeRound = rounds.length - 1;

  return (
    <div>
      {/* Header + Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <GoldTitle>⚔️ Cuadro Eliminatorio</GoldTitle>

        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.04)',
          borderRadius: 10, padding: 4,
          border: `1px solid rgba(240,192,64,0.18)`,
        }}>
          {[
            { key: 'drag', label: '🤏 Drag & Drop' },
            { key: 'score', label: '📊 Marcadores' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => saveMode(key)}
              style={{
                padding: '8px 18px', borderRadius: 8, border: 'none',
                background: mode === key ? `linear-gradient(135deg, ${C.gold}, #c89010)` : 'transparent',
                color: mode === key ? '#080e14' : '#888',
                fontWeight: mode === key ? 700 : 500,
                cursor: 'pointer', fontSize: 13, fontFamily: font, transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode hint */}
      {mode === 'drag' && (
        <div style={{
          marginBottom: 16, padding: '9px 16px',
          background: 'rgba(240,192,64,0.06)', border: `1px solid rgba(240,192,64,0.2)`,
          borderRadius: 10, fontSize: 12, color: '#c0a030', fontFamily: font,
        }}>
          💡 Haz clic en un equipo para avanzarlo al siguiente round sin necesidad de ingresar marcador.
        </div>
      )}

      {/* Bracket */}
      <div style={{ overflowX: 'auto', overflowY: 'auto', paddingBottom: 40, maxHeight: '80vh' }}>
        <BracketView
          rounds={rounds}
          mode={mode}
          onPatch={patchMatch}
          onConfirm={confirmMatch}
          onEdit={editMatch}
          onSelectWinner={selectWinner}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
        {!allFinalDone && (
          <button onClick={autoSimulate} style={secBtn}>
            🎲 Autocompletar {ROUND_NAMES[activeRound]}
          </button>
        )}
        {allFinalDone && (
          <button onClick={onComplete} style={{ ...primaryBtn }} className="pulse-anim">
            🏆 Ver Campeón del Mundo
          </button>
        )}
      </div>
    </div>
  );
}
