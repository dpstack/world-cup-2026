import React from 'react';
import { ROUND_NAMES, secBtn, primaryBtn } from '../constants.js';
import { resolveWinner, solveMatch, emptyMatch } from '../utils/helpers.js';
import { GoldTitle } from './ui/Typography.jsx';
import { MatchEntry } from './MatchEntry.jsx';

export function Phase3({ rounds, setRounds, onComplete }) {
  function patchMatch(ri, mi, patch) {
    setRounds(prev => prev.map((r, i) => i !== ri ? r : r.map((m, j) => j !== mi ? m : { ...m, ...patch })));
  }
  
  function confirmMatch(ri, mi) {
    setRounds(prev => {
      const m = prev[ri][mi];
      const w = resolveWinner(m.t1, m.t2, m.g1, m.g2, m.p1, m.p2);
      const updated = prev.map((r, i) => i !== ri ? r : r.map((m, j) => j !== mi ? m : { ...m, confirmed: true, winner: w }));
      const updRound = updated[ri];
      if (updRound.every(m => m.confirmed) && ri + 1 < ROUND_NAMES.length) {
        const winners = updRound.map(m => m.winner);
        const next = [];
        for (let k = 0; k < winners.length; k += 2) next.push(emptyMatch(winners[k], winners[k + 1]));
        if (updated.length <= ri + 1) return [...updated, next];
        return updated.map((r, i) => i === ri + 1 ? next : r);
      }
      return updated;
    });
  }

  function editMatch(ri, mi) {
    setRounds(prev => prev.map((r, i) => {
      if (i < ri) return r;
      if (i === ri) return r.map((m, j) => j !== mi ? m : { ...m, confirmed: false, winner: null });
      return null;
    }).filter(r => r !== null));
  }

  const allFinalDone = rounds.length === 5 && rounds[4] && rounds[4].every(m => m.confirmed);
  const activeRound = rounds.length - 1;

  function autoSimulateActiveRound() {
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

  return (
    <div className="bracket-container">
      {rounds.map((round, ri) => (
        <div key={ri} className="bracket-column">
          <GoldTitle>{ROUND_NAMES[ri]}</GoldTitle>
          {round.map((m, mi) => (
            <MatchEntry
              key={mi} match={m} label={`Partido ${mi + 1}`} isKnockout={true}
              onChange={p => patchMatch(ri, mi, p)}
              onConfirm={() => confirmMatch(ri, mi)}
              onEdit={() => editMatch(ri, mi)}
            />
          ))}
        </div>
      ))}
      {!allFinalDone && (
        <div className="bracket-column" style={{ alignItems: "center", justifyContent: "center", minWidth: 200 }}>
          <button onClick={autoSimulateActiveRound} style={secBtn}>🎲 Autocompletar {ROUND_NAMES[activeRound]}</button>
        </div>
      )}
      {allFinalDone && (
        <div className="bracket-column" style={{ alignItems: "center", justifyContent: "center", minWidth: 250 }}>
          <button onClick={onComplete} style={primaryBtn} className="pulse-anim">🏆 Ver Campeón del Mundo</button>
        </div>
      )}
    </div>
  );
}
