import React, { useState } from 'react';
import { C, font, primaryBtn } from '../../constants.js';
import { COUNTRIES, flagFromCode } from '../../data/countries.js';
import { useGameConfig } from '../../context/GameContext.jsx';

export function OnboardingModal() {
  const { favoriteTeam, setFavoriteTeam } = useGameConfig();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  if (favoriteTeam) return null;

  const filtered = COUNTRIES.filter(c => 
    c.nameEs.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(8,14,20,0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: 'rgba(18,22,28,0.95)', border: `1px solid rgba(240,192,64,0.3)`,
        borderRadius: 24, padding: 32, width: '100%', maxWidth: 480,
        boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 0 40px rgba(240,192,64,0.05)',
        textAlign: 'center', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '85vh'
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏟️</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 26, fontFamily: font, background: `linear-gradient(135deg, ${C.gold}, #fff8e0)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ¡Bienvenido al simulador!
        </h2>
        <p style={{ color: '#aaa', fontFamily: font, fontSize: 14, margin: '0 0 24px' }}>
          Para una experiencia más inmersiva, elige a tu selección favorita. La seguiremos de cerca en tu Mundial.
        </p>

        <input
          placeholder="Buscar un país..."
          value={search} onChange={e => setSearch(e.target.value)}
          maxLength={50}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: 15, fontFamily: font, marginBottom: 16,
            outline: 'none', boxSizing: 'border-box'
          }}
        />

        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8, paddingBottom: 20, textAlign: 'left' }}>
          {filtered.map(c => {
            const isSelected = selected?.code === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setSelected({ nameEs: c.nameEs, code: c.code })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px',
                  background: isSelected ? 'rgba(240,192,64,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isSelected ? C.gold : 'rgba(255,255,255,0.05)'}`,
                  color: isSelected ? C.gold : '#e0d8c8',
                  borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', fontFamily: font,
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: 20 }}>{flagFromCode(c.code)}</span>
                <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nameEs}</span>
              </button>
            )
          })}
        </div>

        <button
          disabled={!selected}
          onClick={() => setFavoriteTeam(selected)}
          style={{
            ...primaryBtn, width: '100%', padding: '14px', fontSize: 16, marginTop: 16,
            opacity: selected ? 1 : 0.5, cursor: selected ? 'pointer' : 'default'
          }}
        >
          Confirmar selección {selected && flagFromCode(selected.code)}
        </button>
      </div>
    </div>
  );
}
