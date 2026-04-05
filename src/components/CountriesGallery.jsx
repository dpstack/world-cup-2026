import React, { useState, useMemo } from 'react';
import { C, font } from '../constants.js';
import { COUNTRIES, REGIONS, flagFromCode } from '../data/countries.js';

const REGION_ICONS = {
  All: '🌍', Africa: '🌍', Americas: '🌎', Antarctic: '🧊',
  Asia: '🌏', Europe: '🇪🇺', Oceania: '🌊',
};

export function CountriesGallery() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return COUNTRIES.filter(c =>
      (region === 'All' || c.region === region) &&
      (!q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
    );
  }, [search, region]);

  return (
    <div>
      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar país o código…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 12px 10px 36px',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${search ? C.gold : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 10, color: '#e0d8c8',
              fontFamily: font, fontSize: 13, outline: 'none',
              transition: 'border 0.2s',
            }}
          />
        </div>

        {/* Region pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              style={{
                padding: '7px 14px', borderRadius: 20,
                border: `1.5px solid ${region === r ? C.gold : 'rgba(255,255,255,0.08)'}`,
                background: region === r ? `rgba(240,192,64,0.14)` : 'transparent',
                color: region === r ? C.gold : '#888',
                fontWeight: region === r ? 700 : 400,
                cursor: 'pointer', fontSize: 12, fontFamily: font,
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              {REGION_ICONS[r] || '🌐'} {r}
            </button>
          ))}
        </div>

        {/* Count badge */}
        <div style={{ fontSize: 12, color: '#555', fontFamily: font, flexShrink: 0 }}>
          <span style={{ color: C.gold, fontWeight: 700 }}>{filtered.length}</span> / {COUNTRIES.length}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#444', fontFamily: font }}>
          No hay resultados para "<span style={{ color: '#666' }}>{search}</span>"
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 10,
        }}>
          {filtered.map(c => (
            <CountryCard key={c.code} country={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function CountryCard({ country }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 6,
        padding: '16px 8px',
        background: hovered ? 'rgba(240,192,64,0.07)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(240,192,64,0.3)' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: 12,
        cursor: 'default',
        transition: 'all 0.18s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: 36, lineHeight: 1, fontFamily: "'Twemoji Country Flags', 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif" }}>{flagFromCode(country.code)}</span>
      <span style={{
        fontSize: 11, fontFamily: font, textAlign: 'center',
        color: hovered ? '#e0d8c8' : '#aaa',
        fontWeight: hovered ? 600 : 400,
        lineHeight: 1.3, transition: 'color 0.18s',
        wordBreak: 'break-word',
      }}>
        {country.name}
      </span>
      <span style={{ fontSize: 9, color: '#444', fontFamily: font, letterSpacing: 1 }}>
        {country.code}
      </span>
    </div>
  );
}
