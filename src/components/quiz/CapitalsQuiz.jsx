import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { C, font, primaryBtn, secBtn } from '../../constants.js';
import { COUNTRIES, flagFromCode } from '../../data/countries.js';
import { CAPITAL_ES } from '../../data/capitalTranslations.js';
import { DIFFICULTY_CONFIG } from '../../data/quizPools.js';
import { useGameConfig } from '../../context/GameContext.jsx';
import { playDing, playBuzzer } from '../../utils/audio.js';
import confetti from 'canvas-confetti';

// ── Helpers ────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getCapitalEs(c) {
  return CAPITAL_ES[c.capital] || c.capital || null;
}

const _poolCache = {};

function buildPool(difficulty) {
  if (_poolCache[difficulty]) return _poolCache[difficulty];
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const codes = new Set(cfg.pool);
  _poolCache[difficulty] = COUNTRIES.filter(c => codes.has(c.code) && c.capital);
  return _poolCache[difficulty];
}

function buildQuestions(pool, count) {
  const shuffled = shuffle(pool).slice(0, count);

  // Pre-calculate total items with a capital to avoid O(N) per iteration
  const totalWithCapital = pool.reduce((sum, c) => sum + (c.capital ? 1 : 0), 0);

  return shuffled.map(country => {
    const correct = getCapitalEs(country);
    const distractors = [];
    const used = new Set([country.code]);
    const maxDistractors = Math.min(3, pool.length - 1);

    // Safety check: ensure there are enough items with a capital
    // If the current country has a capital, the remaining available is totalWithCapital - 1
    // Otherwise, it's just totalWithCapital.
    const availableWithCapital = totalWithCapital - (country.capital ? 1 : 0);
    const targetDistractors = Math.min(maxDistractors, availableWithCapital);

    while (distractors.length < targetDistractors) {
      const idx = Math.floor(Math.random() * pool.length);
      const c = pool[idx];
      if (!used.has(c.code) && c.capital) {
        used.add(c.code);
        distractors.push(getCapitalEs(c));
      }
    }

    const options = shuffle([correct, ...distractors]);
    return { country, correct, options };
  });
}

function streakMultiplier(streak) {
  if (streak >= 9) return 3;
  if (streak >= 6) return 2.5;
  if (streak >= 3) return 2;
  if (streak >= 1) return 1.5;
  return 1;
}

// ── SCREENS ────────────────────────────────────────────────────────────────

function StartScreen({ onStart }) {
  const [difficulty, setDifficulty] = useState('easy');
  const [mode, setMode] = useState('flash');
  const [flashCount, setFlashCount] = useState(5);

  const cfg = DIFFICULTY_CONFIG[difficulty];
  const pool = buildPool(difficulty);
  const maxFlash = pool.length;

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48 }}>🧠</div>
        <h2 style={{ margin: '8px 0 4px', fontSize: 26, fontFamily: font, background: `linear-gradient(135deg, ${C.gold}, #fff8e0)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Quiz de Capitales
        </h2>
        <p style={{ color: '#666', fontFamily: font, fontSize: 13, margin: 0 }}>¿Cuánto sabes del mundo?</p>
      </div>

      {/* Difficulty */}
      <Section label="Dificultad">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
          {Object.entries(DIFFICULTY_CONFIG).slice(0, 3).map(([key, cfg]) => {
            const pool = buildPool(key);
            const active = difficulty === key;
            return (
              <button key={key} onClick={() => setDifficulty(key)} style={{
                padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${active ? cfg.color : 'rgba(255,255,255,0.07)'}`,
                background: active ? `${cfg.color}18` : 'rgba(255,255,255,0.03)',
                transition: 'all 0.2s', textAlign: 'center',
              }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{cfg.icon}</div>
                <div style={{ fontFamily: font, fontWeight: 700, color: active ? cfg.color : '#aaa', fontSize: 13 }}>{cfg.label}</div>
                <div style={{ fontFamily: font, color: '#555', fontSize: 10 }}>{pool.length} · {cfg.time}s</div>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {Object.entries(DIFFICULTY_CONFIG).slice(3).map(([key, cfg]) => {
            const pool = buildPool(key);
            const active = difficulty === key;
            return (
              <button key={key} onClick={() => setDifficulty(key)} style={{
                padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${active ? cfg.color : 'rgba(255,255,255,0.07)'}`,
                background: active ? `${cfg.color}18` : 'rgba(255,255,255,0.03)',
                transition: 'all 0.2s', textAlign: 'center',
              }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{cfg.icon}</div>
                <div style={{ fontFamily: font, fontWeight: 700, color: active ? cfg.color : '#aaa', fontSize: 13 }}>{cfg.label}</div>
                <div style={{ fontFamily: font, color: '#555', fontSize: 10 }}>{pool.length} · {cfg.time}s</div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Mode */}
      <Section label="Modo">
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { key: 'flash', icon: '⚡', label: 'Flash', desc: 'Corto' },
            { key: 'full',  icon: '🏆', label: 'Completo', desc: `Todo` },
            { key: 'survival', icon: '💀', label: 'Muerte Súbita', desc: `Infinito` },
          ].map(m => {
            const active = mode === m.key;
            return (
              <button key={m.key} onClick={() => setMode(m.key)} style={{
                flex: 1, padding: '14px', borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${active ? C.gold : 'rgba(255,255,255,0.07)'}`,
                background: active ? 'rgba(240,192,64,0.1)' : 'rgba(255,255,255,0.03)',
                transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: 22 }}>{m.icon}</div>
                <div style={{ fontFamily: font, fontWeight: 700, color: active ? C.gold : '#aaa', fontSize: 14, marginTop: 4 }}>{m.label}</div>
                <div style={{ fontFamily: font, color: '#555', fontSize: 11 }}>{m.desc}</div>
              </button>
            );
          })}
        </div>

        {mode === 'flash' && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: font, fontSize: 12, color: '#888' }}>Cantidad de preguntas</span>
              <span style={{ fontFamily: font, fontSize: 14, fontWeight: 700, color: C.gold }}>{flashCount}</span>
            </div>
            <input type="range" min={3} max={maxFlash} value={flashCount}
              onChange={e => setFlashCount(Number(e.target.value))}
              style={{ width: '100%', accentColor: C.gold }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: font, fontSize: 10, color: '#444', marginTop: 2 }}>
              <span>3</span><span>{maxFlash}</span>
            </div>
          </div>
        )}
      </Section>

      <button
        onClick={() => onStart({ difficulty, mode, count: mode === 'flash' ? flashCount : (mode === 'full' ? pool.length : Infinity) })}
        style={{ ...primaryBtn, width: '100%', marginTop: 8, fontSize: 16 }}
      >
        Comenzar Quiz →
      </button>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: font, fontSize: 10, color: '#666', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  );
}

// ── QUESTION SCREEN ────────────────────────────────────────────────────────
function QuestionScreen({ question, questionNum, totalQuestions, timeLimit, streak, score, onAnswer, mode }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [selected, setSelected] = useState(null);
  const [usedFifty, setUsedFifty] = useState(false);
  const [usedExtraTime, setUsedExtraTime] = useState(false);
  const [eliminated, setEliminated] = useState([]);

  useEffect(() => {
    setTimeLeft(timeLimit);
    setSelected(null);
    setUsedFifty(false);
    setUsedExtraTime(false);
    setEliminated([]);
  }, [question, timeLimit]);

  useEffect(() => {
    if (selected !== null) return;
    const iv = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(iv); onAnswer(null, 0); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [selected, question]);

  function handleSelect(opt) {
    if (selected !== null || eliminated.includes(opt)) return;
    setSelected(opt);
    if (opt === correct) {
      playDing();
    } else {
      playBuzzer();
    }
    setTimeout(() => onAnswer(opt, timeLeft, usedFifty), 900);
  }

  function handleFifty() {
    if (usedFifty || selected !== null) return;
    setUsedFifty(true);
    const wrongs = options.filter(o => o !== correct);
    const toE = shuffle(wrongs).slice(0, 2);
    setEliminated(toE);
  }

  function handleExtraTime() {
    if (usedExtraTime || selected !== null) return;
    setUsedExtraTime(true);
    setTimeLeft(t => t + 5);
  }

  const { country, correct, options } = question;
  const flag = flagFromCode(country.code);
  const pct = (timeLeft / timeLimit) * 100;
  const timerColor = pct > 50 ? C.green : pct > 25 ? '#e0c040' : C.red;
  const mult = streakMultiplier(streak);

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      {/* Progress + stats bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontFamily: font, fontSize: 12, color: '#666' }}>{mode === 'survival' ? `Pregunta ${questionNum}` : `${questionNum} / ${totalQuestions}`}</span>
        {streak >= 1 && (
          <span style={{ fontFamily: font, fontSize: 12, color: C.gold, fontWeight: 700 }}>
            🔥 Racha x{mult.toFixed(1)}
          </span>
        )}
        <span style={{ fontFamily: font, fontSize: 12, color: '#888', fontWeight: 700 }}>{Math.round(score)} pts</span>
      </div>

      {/* Progress bar */}
      {mode !== 'survival' && (
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(questionNum - 1) / totalQuestions * 100}%`, background: C.gold, transition: 'width 0.3s' }} />
        </div>
      )}

      {/* Timer ring */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 20, background: `${timerColor}18`, border: `1px solid ${timerColor}44` }}>
          <span style={{ fontFamily: font, fontWeight: 700, color: timerColor, fontSize: 14 }}>{timeLeft}s</span>
          <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: timerColor, transition: 'width 1s linear, background 0.5s' }} />
          </div>
        </div>
      </div>

      {/* Country card */}
      <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 72, lineHeight: 1, fontFamily: "'Twemoji Country Flags', 'Segoe UI Emoji', sans-serif", marginBottom: 12 }}>{flag}</div>
        <div style={{ fontFamily: font, fontSize: 22, fontWeight: 700, color: '#f0e8cc' }}>{country.nameEs}</div>
        <div style={{ fontFamily: font, fontSize: 10, color: '#555', letterSpacing: 1.5, marginTop: 4 }}>{country.code} · {country.region}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleFifty} disabled={usedFifty || selected !== null} style={{
            padding: '6px 12px', borderRadius: 8, border: `1px solid ${usedFifty ? 'rgba(255,255,255,0)' : 'rgba(240,192,64,0.3)'}`,
            background: usedFifty ? 'rgba(255,255,255,0.02)' : 'rgba(240,192,64,0.1)', color: usedFifty ? '#555' : C.gold,
            fontSize: 12, fontFamily: font, fontWeight: 700, cursor: usedFifty ? 'default' : 'pointer', transition: 'all 0.2s',
          }}>
            🌗 50/50
          </button>
          <button onClick={handleExtraTime} disabled={usedExtraTime || selected !== null} style={{
            padding: '6px 12px', borderRadius: 8, border: `1px solid ${usedExtraTime ? 'rgba(255,255,255,0)' : 'rgba(64,224,128,0.3)'}`,
            background: usedExtraTime ? 'rgba(255,255,255,0.02)' : 'rgba(64,224,128,0.1)', color: usedExtraTime ? '#555' : C.green,
            fontSize: 12, fontFamily: font, fontWeight: 700, cursor: usedExtraTime ? 'default' : 'pointer', transition: 'all 0.2s',
          }}>
            ⏱️ +5s
          </button>
        </div>
        <div style={{ fontFamily: font, fontSize: 11, color: '#666', letterSpacing: 1 }}>
          ¿CUÁL ES SU CAPITAL?
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {options.map((opt, i) => {
          const isCorrect = opt === correct;
          const isSelected = selected === opt;
          const isEliminated = eliminated.includes(opt);
          const showResult = selected !== null;
          let bg = 'rgba(255,255,255,0.04)';
          let border = 'rgba(255,255,255,0.08)';
          let color = '#d0c8b8';
          if (showResult && isCorrect)  { bg = 'rgba(64,224,128,0.15)'; border = C.green; color = C.green; }
          if (showResult && isSelected && !isCorrect) { bg = 'rgba(240,96,96,0.15)'; border = C.red; color = C.red; }
          return (
            <button key={i} onClick={() => handleSelect(opt)} disabled={showResult || isEliminated} style={{
              padding: '14px 12px', borderRadius: 12, cursor: (showResult || isEliminated) ? 'default' : 'pointer',
              border: `2px solid ${border}`, background: bg, color, fontFamily: font, fontWeight: 600,
              fontSize: 14, textAlign: 'center', transition: 'all 0.2s',
              transform: showResult && isCorrect ? 'scale(1.02)' : 'scale(1)',
              opacity: isEliminated ? 0.2 : 1, textDecoration: isEliminated ? 'line-through' : 'none'
            }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── RESULTS SCREEN ─────────────────────────────────────────────────────────
function ResultsScreen({ answers, score, difficulty, mode, flashCount, onRestart, onHome }) {
  const { unlockAchievement } = useGameConfig();
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const correct = answers.filter(a => a.isCorrect).length;
  const pct = Math.round((correct / answers.length) * 100);

  useEffect(() => {
    if (pct === 100 && mode === 'full' && (difficulty === 'hard' || difficulty === 'expert')) {
      unlockAchievement('quiz_master', { name: "Mente Maestra", icon: "🧠" });
    }
  }, [pct, mode, difficulty, unlockAchievement]);

  const hsKey = `wc2026_quiz_hs_${difficulty}_${mode}`;
  let prev = null;
  try {
    const item = localStorage.getItem(hsKey);
    if (item) {
      const parsed = JSON.parse(item);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        prev = {
          score: typeof parsed.score === 'number' ? parsed.score : 0,
          pct: typeof parsed.pct === 'number' ? parsed.pct : 0,
          correct: typeof parsed.correct === 'number' ? parsed.correct : 0,
          date: typeof parsed.date === 'string' ? parsed.date : ''
        };
      }
    }
  } catch (e) {
    console.warn("localStorage highscore error", e);
  }
  
  const recordMetric = mode === 'survival' ? correct : Math.round(score);
  const prevMetric = prev ? (mode === 'survival' ? prev.correct : prev.score) : 0;
  
  const isNewRecord = !prev || recordMetric > prevMetric;
  useEffect(() => {
    if (isNewRecord && recordMetric > 0) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: [C.gold, C.green, C.border, '#ffffff']
      });
    }
  }, [isNewRecord, recordMetric]);
  if (isNewRecord) localStorage.setItem(hsKey, JSON.stringify({ score: Math.round(score), pct, correct, date: new Date().toLocaleDateString('es') }));

  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 60 ? '👍' : pct >= 40 ? '😅' : '💀';

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 8 }}>{emoji}</div>
      <h2 style={{ margin: '0 0 4px', fontFamily: font, fontSize: 24, color: '#f0e8cc' }}>Resultado Final</h2>
      <p style={{ fontFamily: font, color: '#666', fontSize: 13, margin: '0 0 24px' }}>
        {cfg.icon} {cfg.label} · {mode === 'flash' ? `Flash ${flashCount}` : 'Completo'}
      </p>

      {/* Score */}
      <div style={{ padding: '24px', background: 'rgba(240,192,64,0.08)', border: `1px solid rgba(240,192,64,0.2)`, borderRadius: 16, marginBottom: 16 }}>
        {mode === 'survival' ? (
          <>
            <div style={{ fontFamily: font, fontSize: 48, fontWeight: 900, color: C.gold, lineHeight: 1 }}>{correct}</div>
            <div style={{ fontFamily: font, fontSize: 13, color: '#888', marginTop: 8 }}>aciertos consecutivos</div>
          </>
        ) : (
          <>
            <div style={{ fontFamily: font, fontSize: 48, fontWeight: 900, color: C.gold, lineHeight: 1 }}>{Math.round(score)}</div>
            <div style={{ fontFamily: font, fontSize: 12, color: '#888', marginTop: 4 }}>puntos</div>
          </>
        )}
        
        {isNewRecord && <div style={{ fontFamily: font, fontSize: 12, color: C.green, marginTop: 8, fontWeight: 700 }}>✨ ¡Nuevo récord personal!</div>}
        {prev && !isNewRecord && <div style={{ fontFamily: font, fontSize: 11, color: '#555', marginTop: 6 }}>Récord: {mode === 'survival' ? `${prev.correct || 0} al hilo` : `${prev.score} pts`} ({prev.date})</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        <StatBox label="Correctas" value={correct} max={answers.length} color={C.green} />
        <StatBox label="Acierto" value={`${pct}%`} color={C.gold} />
        <StatBox label="Incorrectas" value={answers.length - correct} color={C.red} />
      </div>

      {/* Wrong answers review */}
      {answers.filter(a => !a.isCorrect).length > 0 && (
        <div style={{ marginBottom: 20, textAlign: 'left' }}>
          <div style={{ fontFamily: font, fontSize: 10, color: '#666', letterSpacing: 2, marginBottom: 10 }}>RESPUESTAS INCORRECTAS</div>
          {answers.filter(a => !a.isCorrect).map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(240,96,96,0.05)', border: '1px solid rgba(240,96,96,0.1)', borderRadius: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 22, fontFamily: "'Twemoji Country Flags', 'Segoe UI Emoji', sans-serif" }}>{flagFromCode(a.country.code)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: font, fontSize: 12, color: '#aaa' }}>{a.country.nameEs}</div>
                <div style={{ fontFamily: font, fontSize: 12, color: C.green, fontWeight: 700 }}>{a.correct}</div>
              </div>
              {a.userAnswer && <div style={{ fontFamily: font, fontSize: 11, color: C.red }}>{a.userAnswer}</div>}
              {!a.userAnswer && <div style={{ fontFamily: font, fontSize: 11, color: '#555' }}>Tiempo agotado</div>}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onRestart} style={{ ...primaryBtn, flex: 1 }}>🔄 Jugar de nuevo</button>
        <button onClick={onHome} style={{ ...secBtn, flex: 1 }}>← Inicio</button>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ padding: '14px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
      <div style={{ fontFamily: font, fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontFamily: font, fontSize: 10, color: '#555', marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ── ROOT QUIZ COMPONENT ────────────────────────────────────────────────────
export function CapitalsQuiz() {
  const [screen, setScreen] = useState('start');  // 'start' | 'question' | 'results'
  const [config, setConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState([]);

  function handleStart(cfg) {
    const pool = buildPool(cfg.difficulty);
    const qs = buildQuestions(pool, cfg.count);
    setConfig(cfg);
    setQuestions(qs);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setAnswers([]);
    setScreen('question');
  }

  function handleAnswer(selected, timeLeft, usedFifty) {
    const q = questions[currentIdx];
    const isCorrect = selected === q.correct;
    const newStreak = isCorrect ? streak + 1 : 0;
    const mult = streakMultiplier(streak);
    const timeLimit = DIFFICULTY_CONFIG[config.difficulty].time;
    
    const basePts = isCorrect ? (100 + Math.round((timeLeft / timeLimit) * 50)) : 0;
    const fiftyPenalty = usedFifty ? 0.5 : 1;
    const points = basePts * mult * fiftyPenalty;
    const newScore = score + points;

    setStreak(newStreak);
    setScore(newScore);
    setAnswers(prev => [...prev, { country: q.country, correct: q.correct, userAnswer: selected, isCorrect }]);

    const nextIdx = currentIdx + 1;
    
    if (config.mode === 'survival' && !isCorrect) {
      setTimeout(() => setScreen('results'), 900);
      return;
    }

    if (nextIdx >= questions.length) {
      if (config.mode === 'survival') {
        const pool = buildPool(config.difficulty);
        setQuestions(prev => [...prev, ...buildQuestions(pool, Infinity)]);
        setTimeout(() => setCurrentIdx(nextIdx), 900);
      } else {
        setTimeout(() => setScreen('results'), 900);
      }
    } else {
      setTimeout(() => setCurrentIdx(nextIdx), 900);
    }
  }

  if (screen === 'start') return <StartScreen onStart={handleStart} />;

  if (screen === 'question') {
    const q = questions[currentIdx];
    const cfg = DIFFICULTY_CONFIG[config.difficulty];
    return (
      <QuestionScreen
        question={q}
        questionNum={currentIdx + 1}
        totalQuestions={questions.length}
        timeLimit={cfg.time}
        streak={streak}
        score={score}
        onAnswer={handleAnswer}
        mode={config.mode}
      />
    );
  }

  if (screen === 'results') {
    return (
      <ResultsScreen
        answers={answers}
        score={score}
        difficulty={config.difficulty}
        mode={config.mode}
        flashCount={config.count}
        onRestart={() => handleStart(config)}
        onHome={() => setScreen('start')}
      />
    );
  }

  return null;
}
