// ── QUIZ POOLS — Country ISO codes by difficulty ──────────────────────────

export const EASY_POOL = [
  'US','BR','FR','GB','DE','JP','CN','IN','RU','CA',
  'AU','MX','AR','ZA','ES','IT','KR','SA','AE','TR',
  'EG','NG','KE','MA','SE','NO','NL','BE','CH','PL',
  'PT','GR','HU','CZ','DK','FI','AT','IE','NZ','CO',
]; // 40 countries

export const MEDIUM_POOL = [
  ...EASY_POOL,
  'VN','TH','ID','PH','SG','MY','PK','BD','IR','IQ',
  'DZ','TN','ET','GH','SN','CM','TZ','CL','PE','VE',
  'EC','BO','UY','PY','CU','DO','UA','RO','BG','HR',
  'RS','SK','SI','LT','LV','EE','JO','QA','CI','UG',
]; // 80 countries

export const HARD_POOL = [
  ...MEDIUM_POOL,
  'BY','MD','AL','BA','ME','GE','AM','AZ','KZ','UZ',
  'TM','KG','TJ','MN','MM','KH','LA','NP','LK','KW',
  'BH','OM','YE','LB','SY','AF','LU','MT','CY','IS',
  'MG','MZ','ZM','ZW','AO','NA','BW','RW','BI','DJ',
  'ER','CD','CG','GA','GQ','TD','CF','GN','GM','GW',
  'SL','LR','TG','BJ','NE','ML','MR','CV','ST','SO',
  'SZ','LS','MW','IL','MV','BT','AG','BB','BZ','GT',
]; // 150 countries

export const DIFFICULTY_CONFIG = {
  easy:   { pool: EASY_POOL,   label: 'Fácil',   icon: '🟢', time: 12, color: '#40e080' },
  medium: { pool: MEDIUM_POOL, label: 'Medio',   icon: '🟡', time: 9,  color: '#e0c040' },
  hard:   { pool: HARD_POOL,   label: 'Difícil', icon: '🟠', time: 7,  color: '#e08040' },
  expert: { pool: null,        label: 'Experto', icon: '🔴', time: 5,  color: '#f06060' },
  // expert pool is built at runtime from all COUNTRIES with a capital
};
