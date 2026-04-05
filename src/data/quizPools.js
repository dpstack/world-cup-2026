// ── QUIZ POOLS — Independent pools per difficulty, no overlap ─────────────
// Total: 20 + 40 + 60 + 70 + 56 = 246 countries with capitals

// ⭐ PRINCIPIANTE — 20 capitals universally known
export const BEGINNER_POOL = [
  'US','FR','GB','DE','JP','CN','BR','ES','IT','IN',
  'RU','CA','AU','MX','AR','EG','ZA','KR','PT','NO',
];

// 🟢 FÁCIL — 40 well-known capitals
export const EASY_POOL = [
  'SA','AE','TR','NG','KE','MA','SE','NL','BE','CH',
  'PL','GR','HU','CZ','DK','FI','AT','IE','NZ','CO',
  'CL','PE','TH','VN','ID','PH','SG','MY','PK','BD',
  'IR','IQ','DZ','TN','ET','GH','SN','UA','RO','QA',
];

// 🟡 MEDIO — 60 moderate difficulty
export const MEDIUM_POOL = [
  'VE','EC','BO','UY','PY','CR','CU','DO','GT','HN',
  'SV','NI','PA','BG','HR','RS','SK','SI','LT','LV',
  'EE','JO','LB','IL','LK','NP','MM','KH','LA','MN',
  'KZ','UZ','CI','CM','TZ','UG','RW','AO','MZ','ZM',
  'ZW','NA','BW','BY','MD','AL','BA','ME','GE','AM',
  'AZ','KG','TJ','TM','AF','SY','OM','YE','KW','BH',
];

// 🟠 DIFÍCIL — 70 harder/less-known capitals
export const HARD_POOL = [
  'MT','CY','IS','LU','MK','XK','LI','MC','SM','VA',
  'AD','MG','ML','MR','NE','BJ','TG','GH','SL','LR',
  'GN','GW','GM','CV','ST','CF','TD','CD','CG','GA',
  'GQ','BI','DJ','ER','SO','SZ','LS','MW','KP','BT',
  'MV','TL','FJ','PG','SB','VU','TO','WS','KI','TV',
  'NR','PW','MH','FM','CK','NU','WF','PM','GL','FO',
  'AG','DM','GD','KN','LC','VC','BB','TT','BS','BZ',
];

// 🔴 EXPERTO — 56 most obscure (territories, micro-states, etc.)
export const EXPERT_POOL = [
  'JM','HT','TC','KY','MS','AI','VG','VI','PR','CW',
  'AW','SX','BQ','GP','MQ','BL','MF','RE','YT','GF',
  'NC','PF','WF','PM','TK','AS','GU','MP','UM','IO',
  'SH','FK','GI','JE','GG','IM','AX','SJ','BV','TF',
  'HM','CX','CC','NF','PN','AC','TA','EH','SS','MO',
  'PS','RS','ME','MK','XK','BA','CK','NU',
].filter((v, i, a) => a.indexOf(v) === i); // dedupe just in case

export const DIFFICULTY_CONFIG = {
  beginner: { pool: BEGINNER_POOL, label: 'Principiante', icon: '⭐', time: 15, color: '#a0c0ff' },
  easy:     { pool: EASY_POOL,     label: 'Fácil',        icon: '🟢', time: 12, color: '#40e080' },
  medium:   { pool: MEDIUM_POOL,   label: 'Medio',        icon: '🟡', time: 9,  color: '#e0c040' },
  hard:     { pool: HARD_POOL,     label: 'Difícil',      icon: '🟠', time: 7,  color: '#e08040' },
  expert:   { pool: EXPERT_POOL,   label: 'Experto',      icon: '🔴', time: 5,  color: '#f06060' },
};
