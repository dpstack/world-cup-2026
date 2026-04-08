import React, { useState, useRef, useCallback } from 'react';
import { ROUND_NAMES, secBtn, primaryBtn, font, C } from '../constants.js';
import { resolveWinner, solveMatch, emptyMatch } from '../utils/helpers.js';
import { GoldTitle } from './ui/Typography.jsx';
import { BracketView } from './BracketView.jsx';

export function Phase3({ rounds, setRounds, onComplete }) {
  const [mode, setMode] = useState(() => localStorage.getItem('wc2026_bracketMode') || 'drag');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const bracketRef = useRef(null);

  const toggleFullscreen = useCallback(() => {
    const el = bracketRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Keep state in sync if user presses Escape
  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  function saveMode(m) {
    setMode(m);
    localStorage.setItem('wc2026_bracketMode', m);
  }

  // ── propagate winner to the next round slot immediately ─────────────────
  function propagateWinner(prev, ri, mi, winner) {
    const nextRi = ri + 1;
    if (nextRi >= ROUND_NAMES.length) return prev;
    const nextMi = Math.floor(mi / 2);
    const isTop = mi % 2 === 0;
    let updated = prev.map(r => [...r]);
    if (!updated[nextRi]) {
      const nextCount = prev[ri].length / 2;
      updated = [...updated, Array.from({ length: nextCount }, () => emptyMatch('', ''))];
    }
    updated[nextRi] = updated[nextRi].map((m, i) =>
      i !== nextMi ? m : isTop ? { ...m, t1: winner } : { ...m, t2: winner }
    );
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
      const withWinner = prev.map((r, i) => i !== ri ? r : r.map((m, j) => j !== mi ? m : { ...m, confirmed: true, winner: w }));
      return propagateWinner(withWinner, ri, mi, w);
    });
  }
  function editMatch(ri, mi) {
    const nextMi = Math.floor(mi / 2);
    const isTop = mi % 2 === 0;
    setRounds(prev => prev.map((r, i) => {
      if (i < ri) return r;
      if (i === ri) return r.map((m, j) => j !== mi ? m : { ...m, confirmed: false, winner: null });
      if (i === ri + 1) return r.map((m, j) =>
        j !== nextMi ? m : isTop ? { ...m, t1: '', confirmed: false, winner: null } : { ...m, t2: '', confirmed: false, winner: null }
      );
      return null;
    }).filter(Boolean));
  }

  // ── drag mode handler ─────────────────────────────────────────────────
  function selectWinner(ri, mi, team) {
    setRounds(prev => {
      const withWinner = prev.map((r, i) => i !== ri ? r : r.map((m, j) => j !== mi ? m : { ...m, confirmed: true, winner: team }));
      return propagateWinner(withWinner, ri, mi, team);
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

        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          style={{
            background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(240,192,64,0.2)`,
            borderRadius: 8, color: '#aaa', cursor: 'pointer',
            fontSize: 18, padding: '6px 12px', lineHeight: 1,
            transition: 'all 0.2s', fontFamily: font,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = C.gold; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = 'rgba(240,192,64,0.2)'; }}
        >
          {isFullscreen ? '⛶' : '⛶'}
        </button>
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
      <div
        ref={bracketRef}
        style={{
          overflowX: 'auto', overflowY: 'auto', paddingBottom: 40,
          maxHeight: isFullscreen ? '100vh' : '80vh',
          background: isFullscreen ? 'radial-gradient(circle at 40% 5%, #1f1a10 0%, #080e14 60%)' : 'transparent',
          padding: isFullscreen ? '24px' : '0 0 40px 0',
        }}
      >
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
