import { getLiveStandings } from './src/utils/helpers.js';

// Create a mock groupData object
const GROUP_KEYS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const groupData = {};

GROUP_KEYS.forEach(k => {
  groupData[k] = {
    teams: [`Team1_${k}`, `Team2_${k}`, `Team3_${k}`, `Team4_${k}`],
    matches: [
      { t1: `Team1_${k}`, t2: `Team2_${k}`, g1: 2, g2: 1, confirmed: true },
      { t1: `Team3_${k}`, t2: `Team4_${k}`, g1: 0, g2: 0, confirmed: true },
      { t1: `Team1_${k}`, t2: `Team3_${k}`, g1: 1, g2: 1, confirmed: true },
      { t1: `Team2_${k}`, t2: `Team4_${k}`, g1: 3, g2: 0, confirmed: true },
      { t1: `Team1_${k}`, t2: `Team4_${k}`, g1: 2, g2: 0, confirmed: true },
      { t1: `Team2_${k}`, t2: `Team3_${k}`, g1: 1, g2: 2, confirmed: true },
    ],
    tieBreakers: {}
  };
});

const iterations = 10000;

console.log(`Running benchmark with ${iterations} iterations...`);

const start = performance.now();
for (let i = 0; i < iterations; i++) {
  getLiveStandings(groupData);
}
const end = performance.now();

const timeTaken = end - start;
console.log(`Time taken for ${iterations} iterations: ${timeTaken.toFixed(2)} ms`);
console.log(`Average time per iteration: ${(timeTaken / iterations).toFixed(4)} ms`);
