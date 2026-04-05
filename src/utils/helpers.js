import {
  GROUP_KEYS,
  IC_SEMIS_META,
  IC_FINALS_META,
  BASE_GROUPS,
  PLAYOFF_ROUTES
} from "../constants.js";

export function emptyMatch(t1, t2) {
  return { t1: t1 || "", t2: t2 || "", g1: "", g2: "", p1: "", p2: "", confirmed: false, winner: null };
}

export function completedMatch(t1, t2, g1, g2, p1 = "", p2 = "") {
  return {
    t1, t2, g1: String(g1), g2: String(g2), p1: String(p1), p2: String(p2),
    confirmed: true,
    winner: resolveWinner(t1, t2, g1, g2, p1, p2)
  };
}

export function makeGroupMatches(teams) {
  if (teams.length === 4) {
    // Official round-robin 4-team tournament order
    return [
      emptyMatch(teams[0], teams[1]),
      emptyMatch(teams[2], teams[3]),
      emptyMatch(teams[0], teams[2]),
      emptyMatch(teams[1], teams[3]),
      emptyMatch(teams[0], teams[3]),
      emptyMatch(teams[1], teams[2]),
    ];
  }
  // Generic fallback
  const m = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      m.push(emptyMatch(teams[i], teams[j]));
    }
  }
  return m;
}

export function computeTable(teams, matches, tieBreakers = {}) {
  const s = {};
  teams.forEach(t => { s[t] = { team: t, pj: 0, gf: 0, gc: 0, pts: 0 }; });
  matches.forEach(m => {
    if (!m.confirmed) return;
    const g1 = +m.g1, g2 = +m.g2;
    s[m.t1].pj++; s[m.t2].pj++;
    s[m.t1].gf += g1; s[m.t1].gc += g2;
    s[m.t2].gf += g2; s[m.t2].gc += g1;
    if (g1 > g2) s[m.t1].pts += 3;
    else if (g2 > g1) s[m.t2].pts += 3;
    else { s[m.t1].pts += 1; s[m.t2].pts += 1; }
  });
  return Object.values(s).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const da = a.gf - a.gc, db = b.gf - b.gc;
    if (db !== da) return db - da;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return (tieBreakers[b.team] || 0) - (tieBreakers[a.team] || 0);
  });
}

export function resolveWinner(t1, t2, g1, g2, p1, p2) {
  if (+g1 > +g2) return t1;
  if (+g2 > +g1) return t2;
  return +p1 > +p2 ? t1 : t2;
}

export function initIcState() {
  return {
    semis: [
      completedMatch("🇳🇨 Nueva Caledonia", "🇯🇲 Jamaica", 0, 1),
      completedMatch("🇧🇴 Bolivia", "🇸🇷 Surinam", 2, 1)
    ],
    finals: [
      completedMatch("🇯🇲 Jamaica", "🇨🇩 RD Congo", 0, 1),
      completedMatch("🇧🇴 Bolivia", "🇮🇶 Irak", 1, 2)
    ],
  };
}

export function initRoutesState() {
  return [
    {
      semis: [completedMatch("🏴󠁧󠁢󠁷󠁬󠁳󠁿 Gales", "🇧🇦 Bosnia", 1, 1, 2, 4), completedMatch("🇮🇹 Italia", "🇬🇧 Irlanda del Norte", 2, 0)],
      final: completedMatch("🇧🇦 Bosnia", "🇮🇹 Italia", 1, 1, 4, 1)
    },
    {
      semis: [completedMatch("🇺🇦 Ucrania", "🇸🇪 Suecia", 1, 3), completedMatch("🇵🇱 Polonia", "🇦🇱 Albania", 2, 1)],
      final: completedMatch("🇸🇪 Suecia", "🇵🇱 Polonia", 3, 2)
    },
    {
      semis: [completedMatch("🇹🇷 Turquía", "🇷🇴 Rumanía", 1, 0), completedMatch("🇸🇰 Eslovaquia", "🇽🇰 Kosovo", 3, 4)],
      final: completedMatch("🇹🇷 Turquía", "🇽🇰 Kosovo", 1, 0)
    },
    {
      semis: [completedMatch("🇩🇰 Dinamarca", "🇲🇰 Macedonia N.", 4, 0), completedMatch("🇨🇿 Rep. Checa", "🇮🇪 Irlanda", 2, 2, 4, 3)],
      final: completedMatch("🇩🇰 Dinamarca", "🇨🇿 Rep. Checa", 2, 2, 1, 3)
    }
  ];
}

export function solveMatch(m, allowTies) {
  if (m.confirmed) return m;
  const rs = () => {
    const r = Math.random();
    if (r < 0.2) return 0; if (r < 0.5) return 1; if (r < 0.8) return 2; if (r < 0.95) return 3; return 4;
  };
  const g1 = m.g1 !== "" ? +m.g1 : rs();
  const g2 = m.g2 !== "" ? +m.g2 : rs();
  let p1 = m.p1, p2 = m.p2;
  if (!allowTies && g1 === g2 && (p1 === "" || p2 === "")) {
    p1 = Math.floor(Math.random() * 4) + 2; p2 = Math.floor(Math.random() * 4) + 2;
    while (p1 === p2) p2 = Math.floor(Math.random() * 4) + 2;
  }
  return { ...m, g1, g2, p1, p2, confirmed: true, winner: resolveWinner(m.t1, m.t2, g1, g2, p1, p2) };
}

export function getLiveStandings(groupData) {
  const ranked = {};
  GROUP_KEYS.forEach(k => {
    if (groupData[k]) {
      ranked[k] = computeTable(groupData[k].teams, groupData[k].matches, groupData[k].tieBreakers);
    }
  });
  const firsts = [], seconds = [], thirds = [];
  GROUP_KEYS.forEach(k => {
    if (!ranked[k]) return;
    if (ranked[k][0]) firsts.push({ ...ranked[k][0], group: k });
    if (ranked[k][1]) seconds.push({ ...ranked[k][1], group: k });
    if (ranked[k][2]) thirds.push({ ...ranked[k][2], group: k });
  });

  const sortGlobal = (a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const da = a.gf - a.gc, db = b.gf - b.gc;
    if (db !== da) return db - da;
    if (b.gf !== a.gf) return b.gf - a.gf;
    const tbB = groupData[b.group].tieBreakers ? groupData[b.group].tieBreakers[b.team] : 0;
    const tbA = groupData[a.group].tieBreakers ? groupData[a.group].tieBreakers[a.team] : 0;
    return (tbB || 0) - (tbA || 0);
  };
  
  firsts.sort(sortGlobal);
  seconds.sort(sortGlobal);
  thirds.sort(sortGlobal);
  return { firsts, seconds, thirds };
}

export function allocateThirds(best8Thirds) {
  const slots = [
    "ABCDF", "CDFGH", "BEFIJ", "AEHIJ",
    "CEFHI", "EHIJK", "EFGIJ", "DEIJL"
  ];
  const result = new Array(8).fill(null);
  const used = new Array(8).fill(false);
  function backtrack(idx) {
    if (idx === 8) return true;
    for (let i = 0; i < 8; i++) {
      if (!used[i] && slots[idx].includes(best8Thirds[i].group)) {
        used[i] = true;
        result[idx] = best8Thirds[i];
        if (backtrack(idx + 1)) return true;
        used[i] = false;
        result[idx] = null;
      }
    }
    return false;
  }
  if (!backtrack(0)) return best8Thirds; // fallback
  return result;
}

export function buildBracket(groupData) {
  const { firsts, seconds, thirds } = getLiveStandings(groupData);
  const getTeam = (arr, group) => {
    const t = arr.find(x => x.group === group);
    return t ? t.team : "TBD";
  };
  const best8Thirds = thirds.slice(0, 8);
  const placedThirds = allocateThirds(best8Thirds);
  const safe3 = (idx) => placedThirds[idx] ? placedThirds[idx].team : "TBD";

  const pairs = [
    [getTeam(firsts, "E"), safe3(0)],
    [getTeam(firsts, "I"), safe3(1)],
    [getTeam(seconds, "A"), getTeam(seconds, "B")],
    [getTeam(firsts, "F"), getTeam(seconds, "C")],
    [getTeam(seconds, "K"), getTeam(seconds, "L")],
    [getTeam(firsts, "H"), getTeam(seconds, "J")],
    [getTeam(firsts, "D"), safe3(2)],
    [getTeam(firsts, "G"), safe3(3)],

    [getTeam(firsts, "C"), getTeam(seconds, "F")],
    [getTeam(seconds, "E"), getTeam(seconds, "I")],
    [getTeam(firsts, "A"), safe3(4)],
    [getTeam(firsts, "L"), safe3(5)],
    [getTeam(firsts, "J"), getTeam(seconds, "H")],
    [getTeam(seconds, "D"), getTeam(seconds, "G")],
    [getTeam(firsts, "B"), safe3(6)],
    [getTeam(firsts, "K"), safe3(7)]
  ];
  return pairs.map(([t1, t2]) => emptyMatch(t1, t2));
}
