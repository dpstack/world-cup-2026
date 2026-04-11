import React, { useState, useMemo, useRef, useEffect } from 'react';
import { C, font } from '../constants.js';
import { COUNTRIES, REGIONS, flagFromCode } from '../data/countries.js';
import { COUNTRY_LANG } from '../data/countryLangs.js';
import { CAPITAL_ES } from '../data/capitalTranslations.js';

const speak = (texts, lang = 'en') => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  (Array.isArray(texts) ? texts : [texts]).forEach(text => {
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    window.speechSynthesis.speak(u);
  });
};

const REGION_ICONS = {
  All: '🌍', Africa: '🌍', Americas: '🌎', Antarctic: '🧊',
  Asia: '🌏', Europe: '🇪🇺', Oceania: '🌊',
};

function formatPop(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return n.toString();
}

function formatArea(n) {
  if (!n) return '—';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M km²';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K km²';
  return n.toLocaleString() + ' km²';
}

// ── POPUP ────────────────────────────────────────────────────────────────────
function CountryPopup({ country, lang, anchorRef, onClose }) {
  const popupRef = useRef(null);
  const flag = flagFromCode(country.code);
  const name = lang === 'es' ? country.nameEs : country.nameEn;

  // Position the popup near the card
  useEffect(() => {
    const popup = popupRef.current;
    const anchor = anchorRef.current;
    if (!popup || !anchor) return;

    const aRect = anchor.getBoundingClientRect();
    const pRect = popup.getBoundingClientRect();
    const vw = window.innerWidth;
    const scrollY = window.scrollY;

    let left = aRect.left + aRect.width / 2 - pRect.width / 2;
    let top = aRect.top + scrollY - pRect.height - 12;

    // Flip below if not enough space above
    if (top < scrollY + 8) top = aRect.bottom + scrollY + 12;

    // Clamp horizontal
    left = Math.max(8, Math.min(left, vw - pRect.width - 8));

    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
    popup.style.opacity = '1';
    popup.style.transform = 'translateY(0) scale(1)';
  }, [anchorRef]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target) &&
          anchorRef.current && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorRef]);

  return (
    <div
      ref={popupRef}
      style={{
        position: 'absolute',
        zIndex: 9999,
        opacity: 0,
        transform: 'translateY(6px) scale(0.97)',
        transition: 'opacity 0.18s, transform 0.18s',
        width: 230,
        background: 'rgba(12,16,22,0.97)',
        border: `1px solid rgba(240,192,64,0.3)`,
        borderRadius: 14,
        boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(240,192,64,0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '14px 16px 10px',
        background: 'linear-gradient(135deg, rgba(240,192,64,0.1), rgba(240,192,64,0.03))',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 40, lineHeight: 1, fontFamily: "'Twemoji Country Flags', 'Segoe UI Emoji', sans-serif" }}>
          {flag}
        </span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f0e8cc', fontFamily: font, lineHeight: 1.2 }}>
            {name}
          </div>
          <div style={{ fontSize: 10, color: '#888', fontFamily: font, letterSpacing: 1.5, marginTop: 3 }}>
            {country.code} · {country.region}
          </div>
        </div>
        <button
          onClick={() => {
            if (lang === 'es') {
              const capEs = CAPITAL_ES[country.capital] || country.capital;
              speak([name, capEs].filter(Boolean), 'es-ES');
            } else {
              const nativeLang = COUNTRY_LANG[country.code] || 'en';
              speak([country.nameEn, country.capital].filter(Boolean), nativeLang);
            }
          }}
          title="Pronunciar"
          style={{
            marginLeft: 'auto', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
            color: '#aaa', cursor: 'pointer', fontSize: 16,
            padding: '5px 8px', lineHeight: 1, flexShrink: 0,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = 'rgba(240,192,64,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
        >🔊</button>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 16px 14px' }}>
        <Row icon="🏛️" label="Capital"
          value={(lang === 'es' ? (CAPITAL_ES[country.capital] || country.capital) : country.capital) || '—'}
          highlight />
        {country.sub && <Row icon="🗺️" label="Región" value={country.sub} />}
        {country.pop > 0 && <Row icon="👥" label="Población" value={formatPop(country.pop)} />}
        {country.area > 0 && <Row icon="📐" label="Área" value={formatArea(country.area)} />}
      </div>
    </div>
  );
}

function Row({ icon, label, value, highlight }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 13, lineHeight: 1.5, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 9, color: '#666', fontFamily: font, letterSpacing: 1.5, textTransform: 'uppercase', lineHeight: 1 }}>
          {label}
        </div>
        <div style={{ fontSize: 13, color: highlight ? C.gold : '#c0b888', fontWeight: highlight ? 700 : 400, fontFamily: font, marginTop: 2 }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ── COUNTRY CARD ─────────────────────────────────────────────────────────────
function CountryCard({ country, lang }) {
  const [open, setOpen] = useState(false);
  const cardRef = useRef(null);
  const flag = flagFromCode(country.code);
  const name = lang === 'es' ? country.nameEs : country.nameEn;

  return (
    <>
      <div
        ref={cardRef}
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 6, padding: '16px 8px',
          background: open ? 'rgba(240,192,64,0.07)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${open ? 'rgba(240,192,64,0.3)' : 'rgba(255,255,255,0.05)'}`,
          borderRadius: 12, cursor: 'pointer', transition: 'all 0.18s',
          transform: open ? 'translateY(-2px)' : 'none',
          boxShadow: open ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
          userSelect: 'none', position: 'relative',
        }}
      >
        <span style={{ fontSize: 36, lineHeight: 1, fontFamily: "'Twemoji Country Flags', 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif" }}>
          {flag}
        </span>
        <span style={{
          fontSize: 11, fontFamily: font, textAlign: 'center',
          color: open ? '#e0d8c8' : '#aaa', fontWeight: open ? 600 : 400,
          lineHeight: 1.3, transition: 'color 0.18s', wordBreak: 'break-word',
        }}>
          {name}
        </span>
        <span style={{ fontSize: 9, color: '#444', fontFamily: font, letterSpacing: 1 }}>
          {country.code}
        </span>
      </div>

      {open && (
        <CountryPopup
          country={country}
          lang={lang}
          anchorRef={cardRef}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// ── GALLERY ──────────────────────────────────────────────────────────────────
export function CountriesGallery() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');
  const [lang, setLang] = useState(() => localStorage.getItem('wc2026_countryLang') || 'es');
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('wc2026_countrySort') || 'alpha-asc');

  function toggleLang(l) {
    setLang(l);
    localStorage.setItem('wc2026_countryLang', l);
  }
  function toggleSort(s) {
    setSortBy(s);
    localStorage.setItem('wc2026_countrySort', s);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = COUNTRIES.filter(c => {
      const name = lang === 'es' ? c.nameEs : c.nameEn;
      return (
        (region === 'All' || c.region === region) &&
        (!q || name.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q) ||
         c.code.toLowerCase().includes(q) || (c.capital && c.capital.toLowerCase().includes(q)) ||
         (lang === 'es' && c.capital && (CAPITAL_ES[c.capital]||'').toLowerCase().includes(q)))
      );
    });
    return list.sort((a, b) => {
      const na = lang === 'es' ? a.nameEs : a.nameEn;
      const nb = lang === 'es' ? b.nameEs : b.nameEn;
      switch (sortBy) {
        case 'alpha-asc':  return na.localeCompare(nb, lang);
        case 'alpha-desc': return nb.localeCompare(na, lang);
        case 'pop-desc':   return b.pop - a.pop;
        case 'pop-asc':    return a.pop - b.pop;
        case 'area-desc':  return b.area - a.area;
        case 'area-asc':   return a.area - b.area;
        default: return 0;
      }
    });
  }, [search, region, lang, sortBy]);

  return (
    <div>
      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
          <input
            type="text"
            placeholder={lang === 'es' ? 'País, código o capital…' : 'Country, code or capital…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 12px 10px 36px',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${search ? C.gold : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 10, color: '#e0d8c8',
              fontFamily: font, fontSize: 13, outline: 'none', transition: 'border 0.2s',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {REGIONS.map(r => (
            <button key={r} onClick={() => setRegion(r)} style={{
              padding: '7px 14px', borderRadius: 20,
              border: `1.5px solid ${region === r ? C.gold : 'rgba(255,255,255,0.08)'}`,
              background: region === r ? 'rgba(240,192,64,0.14)' : 'transparent',
              color: region === r ? C.gold : '#888',
              fontWeight: region === r ? 700 : 400,
              cursor: 'pointer', fontSize: 12, fontFamily: font,
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}>
              {REGION_ICONS[r] || '🌐'} {r}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: '#555', fontFamily: font, flexShrink: 0 }}>
          <span style={{ color: C.gold, fontWeight: 700 }}>{filtered.length}</span> / {COUNTRIES.length}
        </div>

        {/* Sort controls */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { key: 'alpha-asc',  label: 'A → Z' },
            { key: 'alpha-desc', label: 'Z → A' },
            { key: 'pop-desc',   label: '👥 Mayor' },
            { key: 'pop-asc',   label: '👥 Menor' },
            { key: 'area-desc',  label: '📐 Mayor' },
            { key: 'area-asc',  label: '📐 Menor' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => toggleSort(key)} style={{
              padding: '5px 11px', borderRadius: 20,
              border: `1px solid ${sortBy === key ? 'rgba(64,224,128,0.5)' : 'rgba(255,255,255,0.07)'}`,
              background: sortBy === key ? 'rgba(64,224,128,0.12)' : 'transparent',
              color: sortBy === key ? C.green : '#666',
              fontWeight: sortBy === key ? 700 : 400,
              cursor: 'pointer', fontSize: 11, fontFamily: font,
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}>{label}</button>
          ))}
        </div>

        {/* EN / ES + count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: '#555', fontFamily: font }}>
            <span style={{ color: C.gold, fontWeight: 700 }}>{filtered.length}</span> / {COUNTRIES.length}
          </div>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3, border: '1px solid rgba(255,255,255,0.08)' }}>
            {['es', 'en'].map(l => (
              <button key={l} onClick={() => toggleLang(l)} style={{
                padding: '5px 12px', borderRadius: 6, border: 'none',
                background: lang === l ? `linear-gradient(135deg, ${C.gold}, #c89010)` : 'transparent',
                color: lang === l ? '#080e14' : '#666',
                fontWeight: lang === l ? 700 : 400,
                cursor: 'pointer', fontSize: 12, fontFamily: font, transition: 'all 0.2s',
              }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div role="status" style={{ textAlign: 'center', padding: 60, color: '#444', fontFamily: font }}>
          {lang === 'es' ? 'No se encontraron resultados para ' : 'No results for '} "<span style={{ color: '#666' }}>{search}</span>"
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
          {filtered.map(c => <CountryCard key={c.code} country={c} lang={lang} />)}
        </div>
      )}
    </div>
  );
}
