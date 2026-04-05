export const C = {
  bg: "radial-gradient(circle at 40% 5%, #1f1a10 0%, #080e14 60%)",
  gold: "#f0c040", green: "#40e080", red: "#f06060",
  card: "rgba(18, 22, 28, 0.4)", card2: "rgba(255,255,255,0.04)",
  border: "rgba(240,192,64,0.22)", borderGreen: "rgba(64,224,128,0.3)",
};

export const font = "'Outfit', 'Twemoji Country Flags', 'Segoe UI Emoji', sans-serif";

export const PLAYOFF_ROUTES = [
  { id: "A", label: "Ruta A", destGroup: "B",
    semis: [{id: "rA_s1", t1: "🏴󠁧󠁢󠁷󠁬󠁳󠁿 Gales", t2: "🇧🇦 Bosnia"}, {id: "rA_s2", t1: "🇮🇹 Italia", t2: "🇬🇧 Irlanda del Norte"}] },
  { id: "B", label: "Ruta B", destGroup: "F",
    semis: [{id: "rB_s1", t1: "🇺🇦 Ucrania", t2: "🇸🇪 Suecia"}, {id: "rB_s2", t1: "🇵🇱 Polonia", t2: "🇦🇱 Albania"}] },
  { id: "C", label: "Ruta C", destGroup: "D",
    semis: [{id: "rC_s1", t1: "🇹🇷 Turquía", t2: "🇷🇴 Rumanía"}, {id: "rC_s2", t1: "🇸🇰 Eslovaquia", t2: "🇽🇰 Kosovo"}] },
  { id: "D", label: "Ruta D", destGroup: "A",
    semis: [{id: "rD_s1", t1: "🇩🇰 Dinamarca", t2: "🇲🇰 Macedonia N."}, {id: "rD_s2", t1: "🇨🇿 Rep. Checa", t2: "🇮🇪 Irlanda"}] },
];

export const IC_SEMIS_META = [
  {id: "ic_s1", t1: "🇳🇨 Nueva Caledonia", t2: "🇯🇲 Jamaica", date: "26 Mar", city: "Guadalajara"},
  {id: "ic_s2", t1: "🇧🇴 Bolivia", t2: "🇸🇷 Surinam", date: "26 Mar", city: "Monterrey"},
];

export const IC_FINALS_META = [
  {id: "ic_f1", seed: "🇨🇩 RD Congo", semiIdx: 0, destGroup: "K", date: "31 Mar", city: "Guadalajara"},
  {id: "ic_f2", seed: "🇮🇶 Irak", semiIdx: 1, destGroup: "I", date: "31 Mar", city: "Monterrey"},
];

export const BASE_GROUPS = {
  A: ["🇲🇽 México", "🇿🇦 Sudáfrica", "🇰🇷 Corea del Sur", "TBD:UEFA-D"],
  B: ["🇨🇦 Canadá", "TBD:UEFA-A", "🇶🇦 Qatar", "🇨🇭 Suiza"],
  C: ["🇧🇷 Brasil", "🇲🇦 Marruecos", "🇭🇹 Haití", "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia"],
  D: ["🇺🇸 EE.UU.", "🇵🇾 Paraguay", "🇦🇺 Australia", "TBD:UEFA-C"],
  E: ["🇩🇪 Alemania", "🇨🇼 Curazao", "🇨🇮 Costa de Marfil", "🇪🇨 Ecuador"],
  F: ["🇳🇱 Países Bajos", "🇯🇵 Japón", "TBD:UEFA-B", "🇹🇳 Túnez"],
  G: ["🇧🇪 Bélgica", "🇪🇬 Egipto", "🇮🇷 Irán", "🇳🇿 Nueva Zelanda"],
  H: ["🇪🇸 España", "🇨🇻 Cabo Verde", "🇸🇦 Arabia Saudita", "🇺🇾 Uruguay"],
  I: ["🇫🇷 Francia", "🇸🇳 Senegal", "TBD:IC-F2", "🇳🇴 Noruega"],
  J: ["🇦🇷 Argentina", "🇩🇿 Argelia", "🇦🇹 Austria", "🇯🇴 Jordania"],
  K: ["🇵🇹 Portugal", "TBD:IC-F1", "🇺🇿 Uzbekistán", "🇨🇴 Colombia"],
  L: ["🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra", "🇭🇷 Croacia", "🇬🇭 Ghana", "🇵🇦 Panamá"],
};

export const GROUP_KEYS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
export const ROUND_NAMES = ["16avos de Final", "Octavos de Final", "Cuartos de Final", "Semifinal", "Final"];

export const tdBase = {
  padding: "6px 8px", textAlign: "center", fontFamily: font, color: "#ccc", fontSize: 13
};

export const primaryBtn = {
  padding: "12px 32px", background: `linear-gradient(135deg, ${C.gold}, #c89010)`,
  color: "#080e14", border: "none", borderRadius: 10, fontWeight: 700,
  cursor: "pointer", fontSize: 16, fontFamily: font, letterSpacing: 1,
  boxShadow: `0 4px 20px rgba(240, 192, 64, 0.3)`,
};

export const secBtn = {
  padding: "8px 16px", background: "rgba(255,255,255,0.06)",
  color: "#e0d8c8", border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 600,
  cursor: "pointer", fontSize: 13, fontFamily: font,
};

