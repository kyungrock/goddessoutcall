/**
 * korea-regions-seo-profiles.md 기반 지역 SEO 본문(HTML) 생성
 * — 업체 카드 아래 "지역 안내"용. 공백 포함 약 2000~2500자(태그 제외).
 */
const fs = require('fs');
const path = require('path');

const MD_PATH = path.join(__dirname, 'korea-regions-seo-profiles.md');

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stripTags(html) {
  return String(html || '').replace(/<[^>]+>/g, ' ');
}

function textLen(html) {
  return stripTags(html).replace(/\s+/g, ' ').trim().length;
}

/** ## 서울 / ## 서울.종로 → Map 키 "서울|" , "서울|종로" */
function parseProfiles(mdPath) {
  const raw = fs.readFileSync(mdPath, 'utf8');
  const map = new Map();
  const parts = raw.split(/\n## /);
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const nl = chunk.indexOf('\n');
    const header = (nl === -1 ? chunk : chunk.slice(0, nl)).trim();
    const body = nl === -1 ? '' : chunk.slice(nl + 1);
    const fields = {};
    const lines = body.split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/^\d+\.\s*([^:]+):\s*(.+)$/);
      if (m) fields[m[1].trim()] = m[2].trim();
    }
    if (!fields['핵심 테마']) continue;
    let key;
    if (header.includes('.')) {
      const [prov, ...rest] = header.split('.');
      key = `${prov}|${rest.join('.')}`;
    } else {
      key = `${header}|`;
    }
    map.set(key, fields);
  }
  return map;
}

let _cache = null;
function getProfiles() {
  if (!_cache) _cache = parseProfiles(MD_PATH);
  return _cache;
}

const INTROS = [
  (ctx) =>
    `브레이크 밟는 발이 멈추질 않네. ${ctx.placeHint} 쪽으로 빠졌다가 다시 ${ctx.kw} 찾아보게 된 건, 그날따라 허리가 먼저 말해서야. 아, 오늘 진짜 힘들다 싶은 날은 이동이 끝나도 몸이 안 따라와.`,
  (ctx) =>
    `카페에서 자리만 옮겼는데 벌써 세 번째야. 창밖은 ${ctx.placeHint} 느낌이고, 나는 ${ctx.kw} 검색창만 열어둔 채로 목이 먼저 굳었어.`,
  (ctx) =>
    `줄 서서 기다리는 동안 다리는 시큰하고, 폰만 보다 보니 어깨가 먼저 반항해. ${ctx.localHint} 같은 동선을 하루에 몇 번이나 밟았는지 세다가 포기했지. 그날은 정말이지 ${ctx.kw} 말고 답이 안 보였어.`,
  (ctx) =>
    `운전석에 앉아있는 시간이 곧 업무인 날이야. ${ctx.placeHint} 일대는 신호만 걸려도 골반이 무거워져. 퇴근하고 나서야 아, 오늘 진짜 힘들다—가 실감나.`,
  (ctx) =>
    `산책은 좋다더니 계단·언덕이 숨어 있었어. ${ctx.localHint} 지나온 뒤엔 종아리가 먼저 타는 소리를 해. 집에 오면 ${ctx.kw}랑 근육 이완 이야기부터 찾게 되더라.`,
  (ctx) =>
    `대기 번호가 줄었을 때쯤엔 이미 허리가 먼저 지쳐 있었어. ${ctx.placeHint} 근처는 사람만 많은 게 아니라 내 몸도 같이 붐비는 느낌이야. 피로 회복은 뒷전이고, 그날은 그냥 버티기 급급했지.`,
  (ctx) =>
    `비 온 뒤 포장은 미끄럽고, 우산은 한손에, 짐은 다른 손에. ${ctx.kw}를 왜 찾게 됐냐면, 그날은 걷기만 해도 어깨가 먼저 신호를 보냈거든.`,
  (ctx) =>
    `막차 생각하니까 더 긴장돼. ${ctx.placeHint} 쪽 야근·회식 뒤에는 발바닥이 아니라 목 뒤가 먼저 뻐근해. 방문 마사지로 집에서 정리해볼까 하다가도 시간이 애매해.`,
];

function pickLocalSnippet(localRaw, rng) {
  const s = String(localRaw || '').replace(/^["'「」]/, '').replace(/["'」]$/, '');
  const bits = s.split(/[",]/).map((x) => x.trim()).filter(Boolean);
  if (!bits.length) return '동네 골목';
  return bits[Math.floor(rng() * bits.length)] || bits[0];
}

function buildParagraphs(fields, displayCityText, rng, regionAux) {
  const theme = fields['핵심 테마'] || '';
  const places = fields['주요 장소'] || '';
  const life = fields['생활 패턴'] || '';
  const tired = fields['피로 상황'] || '';
  const local = fields['로컬 지명·동선'] || fields['로컬 지명'] || '';

  const kwPhrase = `${displayCityText} 출장마사지`;
  const placeHint = places.split(/[·,]/)[0]?.trim() || displayCityText;
  const localHint = pickLocalSnippet(local, rng);
  const ctx = { placeHint, localHint, kw: kwPhrase };
  const introFn = INTROS[Math.floor(rng() * INTROS.length)];
  const intro = introFn(ctx);

  const auxTheme = regionAux && regionAux['핵심 테마'] ? regionAux['핵심 테마'] : '';
  const auxLife = regionAux && regionAux['생활 패턴'] ? regionAux['생활 패턴'] : '';

  const lead = `${displayCityText} 기준으로 보면 핵심은 해당 시·구 블록이야. 광역 블록은 오늘 동선을 해석하는 보조로만 붙여서 읽으면 정확해. ${kwPhrase}를 찾을 때도 같은 원칙으로 보면 선택이 빨라져.`;
  const support = `${localHint} 같은 로컬 동선을 하루에 몇 번 밟았는지와 ${tired} 체감이 만나는 지점이 상담 품질을 좌우해. 방문 마사지로 이동을 줄이고 피로 회복과 근육 이완 순서를 맞추는 게 관건이야.`;

  const section1 = `${theme}.${auxTheme ? ` (광역 보조: ${auxTheme})` : ''}`;
  const section2 = `${places}. 동선이 길어진 축부터 먼저 체크하면 ${displayCityText} 출장마사지 선택이 쉬워져.`;
  const section3 = `${life}.${auxLife ? ` 광역 생활 패턴(${auxLife})은 보조 기준으로만 참고.` : ''}`;
  const section4 = `${tired}. 같은 날 여러 항목이 겹치면 피로 회복이 느려지고 다음 날 컨디션까지 흔들리기 쉬워.`;
  const section5 = `${local}. 오늘 실제로 밟은 루트를 한 줄로 전달하면 방문 마사지 상담이 빨라지고 근육 이완 우선순위도 명확해져.`;

  const close = `${displayCityText}${topicParticle(displayCityText)} "해당 시·구 블록 중심 + 광역 보조"로 읽어야 과장 없이 정확해. 결론은 단순해. ${kwPhrase}를 찾을 때 1~5 항목을 그대로 붙여 말하면, 피로 회복과 근육 이완 체감이 훨씬 안정적으로 맞춰진다.`;

  return {
    intro,
    lead,
    support,
    section1,
    section2,
    section3,
    section4,
    section5,
    close,
    kwPhrase,
    displayCityText,
  };
}

function buildTable(displayCityText, rng) {
  const rows = [
    ['시간대', '회식·야근 직후는 소화가 돌고 나서. 급하면 몸만 더 긴장돼.'],
    ['장소', '주차·엘리베이터·층수. 짐 옮긴 날엔 그 동선까지 같이 말해줘.'],
    ['상태', '오늘 제일 먼저 뭉친 부위 한두 곳. "다 아파"보다 낫다.'],
    ['키워드', '피로 회복·방문 마사지·근육 이완 중 뭐가 제일 급한지.'],
    ['금지 케이스', '과음 직후·열 많이 날 때·특이 증상 있으면 병원 먼저.'],
  ];
  const shuf = rng() > 0.5 ? rows : [rows[2], rows[0], rows[1], rows[3], rows[4]];

  let tbody = '';
  for (const [a, b] of shuf) {
    tbody += `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`;
  }
  return `<table class="seo-tips-table"><thead><tr><th>체크</th><th>${esc(displayCityText)} 예약 팁</th></tr></thead><tbody>${tbody}</tbody></table>`;
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function topicParticle(word) {
  const s = String(word || '').trim();
  if (!s) return '는';
  const ch = s.charCodeAt(s.length - 1);
  if (ch < 0xac00 || ch > 0xd7a3) return '는';
  const hasBatchim = (ch - 0xac00) % 28 !== 0;
  return hasBatchim ? '은' : '는';
}

function assembleHtml(p) {
  const core = [
    `<p>${esc(p.intro)}</p>`,
    `<p class="seo-theme">${esc(p.lead)}</p>`,
    `<p>${esc(p.support)}</p>`,
    `<p>1. <strong>핵심 테마:</strong> ${esc(p.section1)}</p>`,
    `<p>2. <strong>주요 장소:</strong> ${esc(p.section2)}</p>`,
    `<p>3. <strong>생활 패턴:</strong> ${esc(p.section3)}</p>`,
    `<p>4. <strong>피로 상황:</strong> ${esc(p.section4)}</p>`,
    `<p>5. <strong>로컬 지명·동선:</strong> ${esc(p.section5)}</p>`,
    `<p>${esc(p.close)}</p>`,
  ].join('');
  return `${core}${p.tableHtml}`.trim();
}

function padToRange(html, seed, fields, displayCityText) {
  let out = html;
  const local = String(fields['로컬 지명·동선'] || fields['로컬 지명'] || '').slice(0, 120);
  const tired = String(fields['피로 상황'] || '').slice(0, 120);
  const places = String(fields['주요 장소'] || '').slice(0, 120);
  const fillers = [
    `${displayCityText} 동선은 짧아 보여도 반복되면 피로가 길게 남아. 오늘은 어디서 제일 오래 머물렀는지 먼저 정리해봐.`,
    `${displayCityText} 출장마사지 검색에는 "걷기 많음/대기 많음/운전 많음"처럼 패턴을 붙이면 상담 정확도가 올라가.`,
    `방문 마사지 장점은 이동을 더하지 않는 거야. 이미 ${places} 축을 충분히 쓴 날이라면 더 맞아.`,
    `피로 회복이 느린 날은 보통 ${tired} 항목이 겹친 경우가 많아. 겹친 항목부터 말하면 우선순위가 빨리 잡혀.`,
    `근육 이완은 강도보다 순서가 핵심이야. 오늘 처음 신호 온 부위를 먼저 전달해줘.`,
    `${displayCityText}${topicParticle(displayCityText)} 생활 패턴이 매일 달라 보여도, 실제로는 반복되는 루트가 있어. 그 루트를 기준으로 잡아봐.`,
    `로컬 동선(${local})을 한 줄로 적으면 "감각적인 설명"보다 훨씬 빠르게 방향이 정리돼.`,
    `오늘 컨디션이 애매하면 시간대도 같이 말해줘. 야간/주간 패턴 차이로 체감이 크게 달라질 수 있어.`,
    `같은 거리라도 대기와 정체가 길면 피로 축이 달라져. 이동 시간보다 정차 시간을 같이 보는 게 좋아.`,
    `몸이 먼저 굳는 날엔 쉬는 방식도 전략이 필요해. 이동 최소화 + 순서 정리가 기본이야.`,
  ];
  let idx = 0;
  let guard = 0;
  while (textLen(out) < 900 && guard < fillers.length) {
    const line = fillers[idx];
    out += `<p>${esc(line)}</p>`;
    idx++;
    guard++;
  }
  guard = 0;
  while (textLen(out) > 1000 && guard < 30) {
    out = out.replace(/<p>[^<]*<\/p>\s*$/i, '');
    guard++;
  }
  return out;
}

/**
 * @param {string} region
 * @param {string} district - 시·구명, 광역 단독 페이지는 ''
 * @param {string} displayCityText - 예: "서울 종로", "삼척"
 * @returns {string|null} HTML 또는 없음
 */
function buildProfileBodyHtml(region, district, displayCityText) {
  const key = district ? `${region}|${district}` : `${region}|`;
  const map = getProfiles();
  const fields = map.get(key);
  if (!fields) return null;

  const seed = hashString(`seo:${key}`);
  const rng = mulberry32(seed);
  const regionAux = district ? map.get(`${region}|`) : null;
  const p = buildParagraphs(fields, displayCityText, rng, regionAux);
  p.tableHtml = buildTable(displayCityText, rng);

  let html = assembleHtml(p);
  html = padToRange(html, seed, fields, displayCityText);

  // 키워드 "[지역] 출장마사지" 2회 확보 (부족하면 문장 하나 추가)
  const plain = stripTags(html);
  const re = new RegExp(`${displayCityText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*출장마사지`, 'g');
  const matches = plain.match(re) || [];
  if (matches.length < 2) {
    html += `<p>${esc(displayCityText)} 출장마사지로 찾을 때는 그날 동선을 한 줄로만 적어도 상담이 빨라져. 같은 ${displayCityText} 출장마사지라도 우선순위가 사람마다 다르거든.</p>`;
  }

  return html;
}

module.exports = {
  buildProfileBodyHtml,
  getProfiles,
  parseProfiles,
};
