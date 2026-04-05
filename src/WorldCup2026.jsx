import React, { useState } from 'react';
import { GROUP_KEYS, PLAYOFF_ROUTES, BASE_GROUPS, font, C } from './constants.js';
import { initIcState, initRoutesState, makeGroupMatches, buildBracket } from './utils/helpers.js';
import { useLocalStorageState } from './hooks/useLocalStorageState.js';
import { Phase1 } from './components/Phase1.jsx';
import { Phase2 } from './components/Phase2.jsx';
import { Phase3 } from './components/Phase3.jsx';
import { Phase4 } from './components/Phase4.jsx';
import { CountriesGallery } from './components/CountriesGallery.jsx';

export default function WorldCup2026() {
  const [phase, setPhase] = useLocalStorageState('wc2026_phase', 0);
  const [showCountries, setShowCountries] = useState(false);
  const [ic, setIc] = useLocalStorageState('wc2026_ic', initIcState);
  const [routes, setRoutes] = useLocalStorageState('wc2026_routes', initRoutesState);
  const [groupData, setGroupData] = useLocalStorageState('wc2026_groupData', {});
  const [rounds, setRounds] = useLocalStorageState('wc2026_rounds', []);

  function resetTournament() {
    if (!window.confirm("¿Estás seguro de que quieres borrar todo el torneo y empezar de cero?")) return;
    window.localStorage.removeItem('wc2026_phase');
    window.localStorage.removeItem('wc2026_ic');
    window.localStorage.removeItem('wc2026_routes');
    window.localStorage.removeItem('wc2026_groupData');
    window.localStorage.removeItem('wc2026_rounds');
    setPhase(0);
    setIc(initIcState());
    setRoutes(initRoutesState());
    setGroupData({});
    setRounds([]);
  }

  function handlePhase1Complete() {
    const q = {};
    ic.finals.forEach((f, i) => { q[`IC-F${i + 1}`] = f.winner; });
    routes.forEach((r, i) => { q[`UEFA-${PLAYOFF_ROUTES[i].id}`] = r.final.winner; });
    const data = {};
    GROUP_KEYS.forEach(k => {
      const teams = BASE_GROUPS[k].map(t => t.startsWith("TBD:") ? q[t.replace("TBD:", "")] || t : t);
      const tieBreakers = {};
      teams.forEach(t => { tieBreakers[t] = Math.random(); });
      data[k] = { teams, matches: makeGroupMatches(teams), tieBreakers };
    });
    setGroupData(data);
    setPhase(1);
  }

  function handlePhase2Complete() {
    setRounds([buildBracket(groupData)]);
    setPhase(2);
  }

  const champion = rounds[4] && rounds[4][0] ? rounds[4][0].winner : null;

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 40% 5%, #1f1a10 0%, #080e14 60%)", color: "#e0d8c8", fontFamily: font, padding: "20px 10px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, letterSpacing: -1, background: "linear-gradient(135deg, #f0c040 0%, #fff8e0 50%, #c89010 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              World Cup 2026
            </h1>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4, letterSpacing: 1 }}>SIMULADOR OFICIAL</div>
          </div>
          
          <div className="tabs-container">
            {["Repechaje", "Fase de Grupos", "Eliminatorias", "Campeón"].map((label, i) => {
              const active = !showCountries && phase === i;
              const past = phase > i;
              return (
                <button
                  key={i}
                  onClick={() => { setShowCountries(false); past && setPhase(i); }}
                  disabled={!past && !active}
                  style={{
                    padding: "8px 20px", borderRadius: 20, whiteSpace: "nowrap",
                    border: active ? "1px solid rgba(240,192,64,0.4)" : past ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                    background: active ? "rgba(240,192,64,0.1)" : past ? "rgba(255,255,255,0.03)" : "transparent",
                    color: active ? "#f0c040" : past ? "#ccc" : "#555",
                    fontWeight: active ? 700 : 500, cursor: past || active ? "pointer" : "default", fontSize: 14, fontFamily: font,
                    transition: "all 0.2s"
                  }}
                >
                  {label}
                </button>
              );
            })}
            {/* Separator */}
            <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', alignSelf: 'center', margin: '0 4px' }} />
            <button
              onClick={() => setShowCountries(v => !v)}
              style={{
                padding: "8px 20px", borderRadius: 20, whiteSpace: "nowrap",
                border: showCountries ? `1px solid rgba(64,224,128,0.5)` : "1px solid rgba(255,255,255,0.1)",
                background: showCountries ? "rgba(64,224,128,0.12)" : "rgba(255,255,255,0.03)",
                color: showCountries ? C.green : "#888",
                fontWeight: showCountries ? 700 : 500, cursor: "pointer", fontSize: 14, fontFamily: font,
                transition: "all 0.2s"
              }}
            >
              🌍 Países
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ minHeight: "60vh" }}>
          {showCountries ? (
            <CountriesGallery />
          ) : (
            <>
              {phase === 0 && <Phase1 ic={ic} setIc={setIc} routes={routes} setRoutes={setRoutes} onComplete={handlePhase1Complete} />}
              {phase === 1 && <Phase2 groupData={groupData} setGroupData={setGroupData} onComplete={handlePhase2Complete} />}
              {phase === 2 && <Phase3 rounds={rounds} setRounds={setRounds} onComplete={() => setPhase(3)} />}
              {phase === 3 && <Phase4 rounds={rounds} champion={champion} />}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: "center", marginTop: 60, paddingTop: 30, borderTop: "1px solid rgba(255,255,255,0.05)", paddingBottom: 20 }}>
           <button
             onClick={resetTournament}
             style={{ background: "none", border: "1px solid rgba(240,96,96,0.3)", color: "#f06060", padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: font }}
           >
             ⚠️ Reiniciar Simulación
           </button>
           <div style={{ fontSize: 11, color: "#555", marginTop: 12 }}>
             Basado en el formato oficial de la Copa Mundial de la FIFA 2026™
           </div>
        </div>

      </div>
    </div>
  );
}
