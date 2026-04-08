import { DIFFICULTY_CONFIG } from './src/data/quizPools.js';
import { COUNTRIES } from './src/data/countries.js';

function buildPoolOld(difficulty) {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const codes = new Set(cfg.pool);
  return COUNTRIES.filter(c => codes.has(c.code) && c.capital);
}

const _poolCache = {};
function buildPoolNew(difficulty) {
  if (_poolCache[difficulty]) return _poolCache[difficulty];
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const codes = new Set(cfg.pool);
  _poolCache[difficulty] = COUNTRIES.filter(c => codes.has(c.code) && c.capital);
  return _poolCache[difficulty];
}

const iterations = 100000;
const difficulties = Object.keys(DIFFICULTY_CONFIG);

console.log("Measuring old approach...");
const startOld = performance.now();
for (let i = 0; i < iterations; i++) {
  for (const diff of difficulties) {
    buildPoolOld(diff);
  }
}
const endOld = performance.now();
console.log(`Old approach: ${(endOld - startOld).toFixed(2)} ms`);

console.log("Measuring new approach...");
const startNew = performance.now();
for (let i = 0; i < iterations; i++) {
  for (const diff of difficulties) {
    buildPoolNew(diff);
  }
}
const endNew = performance.now();
console.log(`New approach: ${(endNew - startNew).toFixed(2)} ms`);
