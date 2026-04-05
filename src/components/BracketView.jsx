import React from 'react';
import { C, font, ROUND_NAMES } from '../constants.js';
import { MatchEntry } from './MatchEntry.jsx';
import { useGameConfig } from '../context/GameContext.jsx';

const MATCH_WIDTH = 255;
const COL_GAP = 56;
const TOTAL_ROUNDS = 5;
const MATCH_COUNTS = [16, 8, 4, 2, 1];

function getSlotH(ri, base) { return base * Math.pow(2, ri); }

function getConnectorPaths(base) {
  const paths = [];
  for (let ri = 0; ri < TOTAL_ROUNDS - 1; ri++) {
    const slotH = getSlotH(ri, base);
    const xRight = ri * (MATCH_WIDTH + COL_GAP) + MATCH_WIDTH;
    const xLeft = (ri + 1) * (MATCH_WIDTH + COL_GAP);
    const xMid = (xRight + xLeft) / 2;
    for (let mi = 0; mi < MATCH_COUNTS[ri]; mi++) {
      const sourceY = mi * slotH + slotH / 2;
      const targetY = (Math.floor(mi / 2) * 2 + 1) * slotH;
      paths.push({ path: `M${xRight} ${sourceY} H${xMid} V${targetY} H${xLeft}`, ri, mi, key: `${ri}-${mi}` });
    }
  }
  return paths;
}

// ── DRAG MODE MATCH CARD ──────────────────────────────────────────────────
function DragMatchCard({ match, ri, mi, onSelectWinner, onEdit, favoriteTeam }) {
  const { t1, t2, winner, confirmed } = match;

  const bothDefined = !!t1 && !!t2;

  const TeamRow = ({ team }) => {
    const isWinner = confirmed && winner === team;
    const isLoser  = confirmed && winner !== team;
    const canClick = !confirmed && !!team && bothDefined;
    return (
      <div
        onClick={() => canClick && onSelectWinner(ri, mi, team)}
        style={{
          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, fontFamily: font, fontWeight: isWinner ? 700 : 400,
          color: isWinner ? C.green : isLoser ? '#555' : '#e0d8c8',
          opacity: isLoser ? 0.45 : 1, textDecoration: isLoser ? 'line-through' : 'none',
          background: isWinner ? 'rgba(64,224,128,0.09)' : 'transparent',
          cursor: canClick ? 'pointer' : 'default', transition: 'all 0.2s', userSelect: 'none',
        }}
      >
        {isWinner && <span style={{ color: C.green, fontSize: 11 }}>✓</span>}
        {canClick && <span style={{ fontSize: 10, color: '#555' }}>⠿</span>}
        <span style={{ flex: 1 }}>{team || <em style={{ color: '#444' }}>Por definir</em>}</span>
      </div>
    );
  };

  const isFav = (t) => favoriteTeam && t === favoriteTeam.nameEs;
  const hasFav = isFav(t1) || isFav(t2);

  return (
    <div style={{
      width: MATCH_WIDTH,
      background: confirmed ? 'rgba(64,224,128,0.06)' : bothDefined ? (hasFav ? 'rgba(240,192,64,0.1)' : 'rgba(18,22,28,0.85)') : 'rgba(10,13,18,0.7)',
      border: `1px solid ${confirmed ? C.borderGreen : bothDefined ? (hasFav ? C.gold : 'rgba(240,192,64,0.18)') : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 10, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      overflow: 'hidden', boxShadow: hasFav ? '0 0 20px rgba(240,192,64,0.25)' : '0 4px 24px rgba(0,0,0,0.4)', transition: 'all 0.3s',
    }}>
      <div style={{ fontSize: 9, color: bothDefined ? C.gold : '#444', letterSpacing: 2, padding: '4px 12px', background: 'rgba(0,0,0,0.35)', fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{ROUND_NAMES[ri]} · #{mi + 1}{!bothDefined && !confirmed && <span style={{ marginLeft: 6, color: '#555' }}>· esperando rival…</span>}</span>
        {confirmed && (
          <button
            onClick={() => onEdit(ri, mi)}
            title="Cambiar ganador"
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, padding: '0 2px', lineHeight: 1 }}
          >↩</button>
        )}
      </div>
      <TeamRow team={t1} />
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 12px' }} />
      <TeamRow team={t2} />
    </div>
  );
}


// ── SCORE MODE MATCH CARD ─────────────────────────────────────────────────
function ScoreMatchCard({ match, ri, mi, onPatch, onConfirm, onEdit }) {
  return (
    <div style={{ width: MATCH_WIDTH }}>
      <MatchEntry
        match={match}
        label={`${ROUND_NAMES[ri]} · #${mi + 1}`}
        isKnockout={true}
        onChange={p => onPatch(ri, mi, p)}
        onConfirm={() => onConfirm(ri, mi)}
        onEdit={() => onEdit(ri, mi)}
      />
    </div>
  );
}

// ── BRACKET VIEW ─────────────────────────────────────────────────────────
export function BracketView({ rounds, mode, onPatch, onConfirm, onEdit, onSelectWinner }) {
  const { favoriteTeam } = useGameConfig();
  const base = mode === 'drag' ? 108 : 190;
  const totalH = MATCH_COUNTS[0] * base;
  const totalW = TOTAL_ROUNDS * (MATCH_WIDTH + COL_GAP) - COL_GAP;
  const connPaths = getConnectorPaths(base);

  return (
    <div style={{ position: 'relative', width: totalW, height: totalH }}>
      {/* SVG connector lines */}
      <svg style={{ position: 'absolute', inset: 0, width: totalW, height: totalH, pointerEvents: 'none', zIndex: 0 }} viewBox={`0 0 ${totalW} ${totalH}`}>
        <defs>
          <filter id="ln-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {connPaths.map(({ path, ri, mi, key }) => {
          const done = rounds[ri]?.[mi]?.confirmed;
          return (
            <path key={key} d={path} fill="none"
              stroke={done ? C.gold : 'rgba(255,255,255,0.07)'}
              strokeWidth={done ? 1.5 : 1}
              filter={done ? 'url(#ln-glow)' : ''}
              style={{ transition: 'stroke 0.5s, stroke-width 0.4s' }}
            />
          );
        })}
      </svg>

      {/* Match cards per round */}
      {Array.from({ length: TOTAL_ROUNDS }, (_, ri) => {
        const slotH = getSlotH(ri, base);
        const count = MATCH_COUNTS[ri];
        const colX = ri * (MATCH_WIDTH + COL_GAP);
        return Array.from({ length: count }, (_, mi) => {
          const centerY = mi * slotH + slotH / 2;
          const topY = centerY - base / 2;
          const match = rounds[ri]?.[mi];
          return (
            <div key={`${ri}-${mi}`} style={{ position: 'absolute', left: colX, top: topY, zIndex: 1 }}>
              {match ? (
                mode === 'drag'
                  ? <DragMatchCard match={match} ri={ri} mi={mi} onSelectWinner={onSelectWinner} onEdit={onEdit} favoriteTeam={favoriteTeam} />
                  : <ScoreMatchCard match={match} ri={ri} mi={mi} onPatch={onPatch} onConfirm={onConfirm} onEdit={onEdit} />
              ) : (
                <div style={{
                  width: MATCH_WIDTH, height: base * 0.7,
                  border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#2a2a2a', fontSize: 11, fontFamily: font,
                }}>
                  Por jugar
                </div>
              )}
            </div>
          );
        });
      })}
    </div>
  );
}
