const fs = require('fs');
const path = require('path');
const { buildProfileBodyHtml } = require('./seo-profile-bodies.js');
const seoulSeoBodies = require('./seoul-seo-bodies.js');
const gyeonggiSeoBodies = require('./gyeonggi-seo-bodies.js');
const incheonSeoBodies = require('./incheon-seo-bodies.js');
const gangwonSeoBodies = require('./gangwon-seo-bodies.js');
const busanSeoBodies = require('./busan-seo-bodies.js');
const daeguSeoBodies = require('./daegu-seo-bodies.js');
const gwangjuSeoBodies = require('./gwangju-seo-bodies.js');
const daejeonSeoBodies = require('./daejeon-seo-bodies.js');
const ulsanSeoBodies = require('./ulsan-seo-bodies.js');
const chungbukSeoBodies = require('./chungbuk-seo-bodies.js');
const chungnamSeoBodies = require('./chungnam-seo-bodies.js');
const gyeongbukSeoBodies = require('./gyeongbuk-seo-bodies.js');
const gyeongnamSeoBodies = require('./gyeongnam-seo-bodies.js');
const jeonbukSeoBodies = require('./jeonbuk-seo-bodies.js');
const jeonnamSeoBodies = require('./jeonnam-seo-bodies.js');
const jejuSeoBodies = require('./jeju-seo-bodies.js');
const sejongSeoBodies = require('./sejong-seo-bodies.js');
const shopCardHtml = require('./shop-card-html.js');

const rootDir = __dirname;
const outDir = path.join(rootDir, 'static-pages');

function readJson(file) {
  const raw = fs.readFileSync(path.join(rootDir, file), 'utf8');
  return JSON.parse(raw);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeDistrictName(name) {
  return String(name || '')
    .replace(/\s+/g, '')
    .replace(/(시|군|구)$/, '');
}

function pageFileName(region, district) {
  const r = String(region || '').trim();
  const d = String(district || '').trim();
  if (d) return `${r}--${d}.html`;
  return `${r}.html`;
}

function pagePath(region, district) {
  return path.join(outDir, pageFileName(region, district));
}

function buildLayout({
  title,
  description,
  heading,
  intro,
  linksHtml,
  chipsHtml,
  bodyText,
  bodyHtml,
  regionValue,
  districtValue,
  searchKeywordPrefix,
  regionsDataLiteral,
  hotDataLiteral,
  shopGridHtml = '',
  ogImageUrl = 'https://outcall.kr/images/연동마사지_프라이빗.jpg',
}) {
  const pageKey = `${regionValue || ''}|${districtValue || ''}`;
  const fileName = pageFileName(regionValue, districtValue);
  const encodedFileName = encodeURIComponent(fileName);
  const canonicalUrl = `https://outcall.kr/static-pages/${encodedFileName}`;
  const sectionTitleVariants = {
    guide: ['지역 안내', '이 지역 이용 가이드', '방문 케어 안내', '지역별 힐링 안내'],
    keywords: ['연관 키워드', '추천 검색 키워드', '자주 찾는 키워드', '검색 확장 키워드'],
    links: ['바로가기', '지역·시/구 바로가기', '빠른 이동 링크', '연결 페이지 모음'],
  };
  const introVariants = [
    `${regionValue || ''}${districtValue ? ` ${districtValue}` : ''} 이용자를 위한 핵심 포인트부터 먼저 확인해보세요.`,
    `${regionValue || ''}${districtValue ? ` ${districtValue}` : ''} 동선에 맞춰 상담 전 체크할 기준을 정리했습니다.`,
    `${regionValue || ''}${districtValue ? ` ${districtValue}` : ''} 이용 패턴을 기준으로 빠르게 비교할 수 있게 구성했습니다.`,
  ];
  const conclusionVariants = [
    '마무리로 운영시간·위치·연락 가능 시간대를 함께 확인하면 선택 정확도가 올라갑니다.',
    '마지막으로 이동 동선과 예산을 함께 비교하면 재방문 만족도를 높일 수 있습니다.',
    '끝으로 원하는 관리 유형과 가능한 시간대를 함께 전달하면 상담 효율이 좋아집니다.',
  ];
  const tableHeaderSets = [
    { item: '점검 항목', tip: '추천 확인 포인트' },
    { item: '비교 항목', tip: '선택 가이드' },
    { item: '체크 포인트', tip: '실전 팁' },
  ];
  const hashLocal = (s) => {
    let h = 2166136261;
    const str = String(s || '');
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  const pick = (arr, seed) => arr[hashLocal(seed) % arr.length];
  const guideTitle = pick(sectionTitleVariants.guide, `${pageKey}:guide`);
  const keywordsTitle = pick(sectionTitleVariants.keywords, `${pageKey}:keywords`);
  const linksTitle = pick(sectionTitleVariants.links, `${pageKey}:links`);
  const introLead = pick(introVariants, `${pageKey}:intro`);
  const conclusionLead = pick(conclusionVariants, `${pageKey}:conclusion`);
  const tableHeader = pick(tableHeaderSets, `${pageKey}:table`);
  const bodyContentRaw = bodyHtml != null && bodyHtml !== '' ? bodyHtml : escHtml(bodyText);
  const bodyContent = bodyHtml != null && bodyHtml !== ''
    ? bodyContentRaw
      .replace(/<th>\s*항목\s*<\/th>/g, `<th>${tableHeader.item}</th>`)
      .replace(/<th>\s*팁\s*<\/th>/g, `<th>${tableHeader.tip}</th>`)
    : bodyContentRaw;
  const breadcrumbItems = [
    { name: '홈', url: 'https://outcall.kr/' },
    { name: '지역 페이지', url: 'https://outcall.kr/static-pages/' },
    regionValue
      ? { name: `${regionValue} 출장마사지`, url: `https://outcall.kr/static-pages/${encodeURIComponent(pageFileName(regionValue, ''))}` }
      : null,
    districtValue ? { name: `${districtValue} 출장마사지`, url: canonicalUrl } : null,
  ].filter(Boolean);
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(title)}</title>
  <meta name="description" content="${escHtml(description)}" />
  <meta name="google-site-verification" content="XFm21TyCnCjA4dHXag5jR63WrpmMh6DUPGM9lY4-Et8" />
  <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
  <meta name="theme-color" content="#020617" />
  <meta name="format-detection" content="telephone=yes" />
  <meta http-equiv="content-language" content="ko" />
  <link rel="alternate" hreflang="ko-KR" href="${canonicalUrl}" />
  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />
  <meta property="og:locale" content="ko_KR" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="여신 출장마사지 전국 검색" />
  <meta property="og:title" content="${escHtml(title)}" />
  <meta property="og:description" content="${escHtml(description)}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${escHtml(ogImageUrl)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escHtml(title)}" />
  <meta name="twitter:description" content="${escHtml(description)}" />
  <meta name="twitter:image" content="${escHtml(ogImageUrl)}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    inLanguage: 'ko-KR',
    url: canonicalUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: '여신 출장마사지 전국 검색',
      url: 'https://outcall.kr/',
    },
  })}</script>
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  })}</script>
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: canonicalUrl,
    inLanguage: 'ko-KR',
    isPartOf: {
      '@type': 'WebSite',
      name: '여신 출장마사지 전국 검색',
      url: 'https://outcall.kr/',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        item: item.url,
      })),
    },
  })}</script>
  <style>
    :root { --bg:#050816; --text:#e5e7eb; --soft:#9ca3af; --border:#1f2933; --radius:18px; --primary-soft: rgba(99, 102, 241, 0.12); }
    * { box-sizing: border-box; }
    body { margin:0; font-family:-apple-system,BlinkMacSystemFont,"Pretendard",system-ui,sans-serif; background:radial-gradient(circle at top,#111827 0,#020617 50%,#000 100%); color:var(--text); }
    .page { max-width: 980px; margin: 0 auto; padding: 24px 16px 72px; }
    .top { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:14px; }
    .logo { font-size:18px; font-weight:700; color:var(--text); text-decoration:none; display:inline-block; }
    .logo:hover { opacity:0.92; }
    .back { font-size:12px; color:var(--soft); border:1px solid var(--border); border-radius:999px; padding:5px 10px; text-decoration:none; }
    .card { background:rgba(15,23,42,.9); border:1px solid var(--border); border-radius:var(--radius); padding:18px 16px 22px; display:flex; flex-direction:column; }
    h1 { margin:0 0 8px; font-size:23px; }
    .intro { font-size:13px; color:var(--soft); line-height:1.7; margin-bottom:10px; }
    .search-bar {
      margin: 24px 0 8px;
      display: flex;
      flex-direction: column;
      gap: clamp(8px, 1.8vw, 10px);
      padding: clamp(10px, 2vw, 12px) clamp(10px, 2vw, 12px) clamp(12px, 2.6vw, 14px);
      border: 1px solid rgba(99, 102, 241, 0.35);
      border-radius: 16px;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(14px);
      box-shadow: 0 18px 55px rgba(2, 6, 23, 0.55);
    }
    .search-input-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .search-input-wrap { flex: 1 1 220px; position: relative; }
    .search-input-wrap input {
      width: 100%;
      padding: 10px 36px 10px 30px;
      border-radius: 999px;
      border: 1px solid rgba(31, 41, 55, 0.95);
      background: rgba(2, 6, 23, 0.55);
      color: var(--text);
      font-size: 14px;
      outline: none;
    }
    .search-input-wrap input:focus {
      border-color: rgba(129, 140, 248, 0.9);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.18);
    }
    .search-input-wrap input::placeholder { color: #6b7280; }
    .search-input-wrap span.icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #6b7280; }
    .search-input-wrap button.clear-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); border: none; background: transparent; color: #6b7280; font-size: 16px; cursor: pointer; }
    .pill-filters { display: flex; flex-wrap: wrap; gap: 6px; font-size: 11px; }
    #quick-region-pills { display:none !important; }
    /* search-bar select 배치: 모바일은 2열 그리드, PC는 4열 그리드 */
    .select-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      font-size: 12px;
      align-items: end;
    }
    .select-row label { color: var(--soft); font-size: 11px; margin-right: 2px; }
    .select-row select {
      min-width: 110px;
      padding: 6px 24px 6px 8px;
      border-radius: 999px;
      border: 1px solid rgba(31, 41, 55, 0.95);
      background: rgba(2, 6, 23, 0.52);
      color: var(--text);
      font-size: 11px;
      outline: none;
      appearance: none;
      position: relative;
    }
    .select-row select:focus,
    .select-row select:active {
      border-color: rgba(129, 140, 248, 0.9);
      /* 일부 브라우저가 포커스 시 배경을 흰색으로 바꿔서 글자가 안 보일 수 있음 */
      background: rgba(2, 6, 23, 0.62);
      color: var(--text);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.14);
    }
    .select-row select option {
      background: rgba(2, 6, 23, 0.95);
      color: var(--text);
    }
    /* 모바일에서 깨지지 않게: 폭은 컨테이너(그리드 셀)에 맞춰 유동 */
    #region-select,
    #city-select,
    #subdistrict-select {
      width: 100%;
      min-width: 0;
    }
    .select-wrap { position: relative; }
    /* 요청: region-select 라벨은 위, 선택(셀렉트)은 아래 */
    .select-wrap-stacked {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: stretch;
    }
    .select-wrap-stacked::after { content: none; }
    .select-wrap-stacked label { margin-right: 0; }
    .select-wrap::after { content: "▾"; position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 10px; color: #6b7280; pointer-events: none; }
    .keyword-toggle {
      border:1px solid rgba(129,140,248,.85);
      background:rgba(99,102,241,.18);
      color:#e5e7ff;
      border-radius:999px;
      padding:6px 9px;
      font-size:11px;
      cursor:pointer;
      width: fit-content;
      transition: transform 0.12s ease, background 0.12s ease, border-color 0.12s ease;
    }
    .keyword-toggle:hover {
      transform: translateY(-1px);
      border-color: rgba(129, 140, 248, 1);
      background: rgba(99, 102, 241, 0.22);
    }
    .keyword-anchor { position:relative; display:inline-flex; justify-self: end; }
    .region-keywords {
      display:flex;
      flex-wrap:wrap;
      gap:6px;
      max-height:260px;
      overflow:auto;
      padding-right:4px;
      margin-top:0;
      border:1px solid var(--border);
      border-radius:12px;
      background:rgba(2,6,23,.95);
      padding:10px;
      position:absolute;
      top:100%;
      right:0;
      width:min(680px,92vw);
      z-index:40;
      box-shadow:0 18px 40px rgba(2,6,23,.85);
    }
    .region-keywords.is-collapsed { display:none; }

    @media (min-width: 960px) {
      .select-row {
        /* 모바일과 동일하게 2열 유지 */
        grid-template-columns: 1fr 1fr;
      }
      .keyword-anchor { justify-self: end; }
      .select-wrap { width: 100%; }
    }
    .result-text { font-size:12px; color:var(--soft); margin:8px 0 6px; }
    .card-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:10px; margin-top:8px; }
    .shop-card {
      border-radius:14px; border:1px solid rgba(31,41,55,.9);
      background:radial-gradient(circle at top left,rgba(99,102,241,.12),transparent 55%);
      overflow:hidden; padding:0;
      transition: transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease;
    }
    .shop-card > a {
      display:flex; flex-direction:column; height:100%;
      text-decoration:none; color:inherit; border-radius:inherit; overflow:hidden;
    }
    .shop-card-image {
      width:100%; aspect-ratio: 16 / 10; background:#0f172a; overflow:hidden;
    }
    .shop-card-image img { width:100%; height:100%; object-fit:cover; display:block; }
    .shop-card-body { padding:10px 12px 12px; display:flex; flex-direction:column; gap:0; flex:1; }
    .shop-card:hover {
      transform: translateY(-2px);
      border-color: rgba(129, 140, 248, 0.9);
      box-shadow: 0 14px 40px rgba(15, 23, 42, 0.9);
    }
    .shop-card-header {
      display:flex; justify-content:space-between; align-items:flex-start; gap:8px;
    }
    .shop-card-title {
      margin:0; font-size:14px; font-weight:600; letter-spacing:-0.02em;
      line-height:1.35; flex:1; min-width:0;
    }
    .shop-card-rating { font-size:12px; color:var(--soft); white-space:nowrap; flex-shrink:0; }
    .shop-card-rating span { font-size:11px; color:var(--soft); }
    .shop-card-meta {
      display:flex; flex-direction:column; gap:4px;
      font-size:11px; color:var(--soft); margin-top:6px;
    }
    .shop-card-meta > span {
      display:flex; flex-wrap:wrap; align-items:baseline; gap:4px;
      line-height:1.45; word-break:keep-all;
    }
    .shop-card-price-row {
      display:flex; flex-direction:row; align-items:center; justify-content:space-between;
      gap:10px; margin-top:8px; width:100%;
    }
    .shop-card-price-row .shop-card-price {
      font-size:14px; font-weight:800; color:#e5e7ff; margin-top:0; flex:1; min-width:0;
    }
    .shop-card-phone {
      font-size:13px; font-weight:600; color:var(--soft); white-space:nowrap; flex-shrink:0;
    }
    .shop-card-greeting {
      margin:6px 0 0; font-size:11px; color:var(--soft); line-height:1.55;
      display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical; overflow:hidden;
    }
    .shop-card-tags { display:flex; flex-wrap:wrap; gap:4px; margin-top:8px; }
    .shop-card-tag {
      font-size:10px; padding:2px 6px; border-radius:999px;
      border:1px solid rgba(55,65,81,.9); color:#9ca3af;
    }
    .shop-card-footer {
      margin-top:10px; padding-top:8px;
      border-top:1px solid rgba(31,41,55,.5);
    }
    .shop-card-link {
      font-size:12px; color:#c7d2fe; display:inline-flex; align-items:center; gap:4px;
    }
    @media (max-width: 960px) {
      .shop-card-image { aspect-ratio: 16 / 9; }
      .shop-card-body { padding: 8px 10px 10px; }
      .shop-card-title { font-size: 13px; }
      .shop-card-rating { font-size: 11px; }
      .shop-card-meta { margin-top: 4px; gap: 2px; font-size: 10px; }
      .shop-card-meta > span:nth-child(2) { flex-wrap: nowrap; white-space: nowrap; }
      .shop-card-meta > span:nth-child(2) > span {
        min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .shop-card-price-row { margin-top: 6px; gap: 6px; }
      .shop-card-price-row .shop-card-price { font-size: 13px; }
      .shop-card-phone { font-size: 11px; }
      .shop-card-greeting, .shop-card-tags, .shop-card-footer { display: none !important; }
    }
    .sec { margin-top: 16px; }
    .sec h2 { margin:0 0 7px; font-size:15px; }
    .chips { display:flex; flex-wrap:wrap; gap:6px; }
    .chip { font-size:11px; padding:3px 8px; border-radius:999px; border:1px dashed rgba(55,65,81,.9); color:var(--soft); background:rgba(15,23,42,.8); cursor:pointer; }
    .links { display:flex; flex-wrap:wrap; gap:7px; }
    .links a { font-size:12px; border:1px solid var(--border); border-radius:999px; padding:4px 9px; text-decoration:none; color:#c7d2fe; background:rgba(99,102,241,.12); }
    .body { font-size:13px; color:var(--soft); line-height:1.8; white-space:pre-line; }
    .body-seo { white-space: normal; }
    .body-seo p { margin: 0 0 1em; color: var(--soft); line-height: 1.85; }
    .body-seo .seo-theme { color: #e5e7eb; line-height: 1.95; font-size: 13px; }
    .seo-tips-table { width: 100%; border-collapse: collapse; margin: 1.1em 0 0.4em; font-size: 12px; }
    .seo-tips-table th, .seo-tips-table td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; vertical-align: top; }
    .seo-tips-table thead th { background: rgba(99, 102, 241, 0.1); color: #c7d2fe; font-weight: 600; }

    /* 모바일에서: h1/intro를 업체 카드(grid) 제일 아래로 */
    @media (max-width: 960px) {
      article.card > h1 { order: 999; }
      article.card > .intro { order: 1000; }
      /* search-bar는 화면이 커져도/작아져도 상단 유지 */
      article.card > .search-bar { order: 0; }
    }

    /* PC: search-bar는 왼쪽, h1은 오른쪽 */
    @media (min-width: 960px) {
      article.card {
        display: grid;
        grid-template-columns: minmax(280px, 380px) minmax(0, 1fr);
        column-gap: 16px;
        align-items: start;
      }
      article.card > .search-bar {
        grid-column: 1;
        grid-row: 1 / span 2;
        margin: 0; /* grid 안에서 마진 제거 */
      }
      article.card > h1 {
        grid-column: 2;
        grid-row: 1;
        margin: 0 0 6px;
      }
      article.card > .intro {
        grid-column: 2;
        grid-row: 2;
        margin-bottom: 0;
      }
      /* 아래 영역은 전체폭 사용 */
      #result-text,
      #shop-card-grid,
      .sec {
        grid-column: 1 / -1;
      }
      /* search-bar를 조금 더 또렷하게 */
      article.card > .search-bar {
        background: rgba(15, 23, 42, 0.7);
      }
    }

    /* 홈과 동일: 하단 탭 카테고리 바 */
    .bottom-category-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 50;
      display: flex;
      justify-content: center;
      gap: 0;
      padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px));
      background: rgba(15, 23, 42, 0.92);
      border-top: 1px solid var(--border);
      backdrop-filter: blur(12px);
    }
    .bottom-category-bar .cat-btn {
      flex: 1;
      max-width: 200px;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 600;
      border: 1px solid rgba(55, 65, 81, 0.9);
      background: rgba(2, 6, 23, 0.6);
      color: var(--soft);
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .bottom-category-bar .cat-btn:first-child { border-radius: 12px 0 0 12px; border-right: none; }
    .bottom-category-bar .cat-btn:last-child { border-radius: 0 12px 12px 0; }
    .bottom-category-bar .cat-btn.is-active {
      background: var(--primary-soft);
      color: #e5e7ff;
      border-color: rgba(129, 140, 248, 0.85);
    }
    .bottom-category-bar .cat-btn:not(.is-active):hover {
      color: #e5e7eb;
      border-color: rgba(99, 102, 241, 0.4);
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="top">
      <a href="../index.html" class="logo">여신 출장마사지 전국 검색</a>
      <a href="../index.html" class="back">← 메인으로</a>
    </div>
    <article class="card">
      <h1>${escHtml(heading)}</h1>
      <div class="intro">${escHtml(intro)}</div>
      <div class="search-bar">
        <div class="search-input-row">
          <div class="search-input-wrap">
            <span class="icon">🔍</span>
            <input id="shop-search-input" type="search" placeholder="예: 강남 출장마사지, 제주 연동 홈타이, 부산 서면 마사지" autocomplete="off" value="${escHtml((searchKeywordPrefix ? searchKeywordPrefix + ' ' : ((regionValue ? regionValue + ' ' : '') + (districtValue ? districtValue + ' ' : ''))) + '출장마사지')}" />
            <button class="clear-btn" id="search-clear-btn" aria-label="검색어 초기화">×</button>
          </div>
          <div class="pill-filters" id="quick-region-pills">
            <!-- 선택한 지역의 시/구 빠른 선택 -->
          </div>
        </div>
        <div class="select-row">
          <div class="select-wrap select-wrap-stacked">
            <label for="region-select">지역</label>
            <select id="region-select"><option value="">전체</option></select>
          </div>
          <div class="select-wrap">
            <label for="city-select">시/구</label>
            <select id="city-select" disabled><option value="">전체</option></select>
          </div>
          <div class="select-wrap">
            <label for="subdistrict-select">동/읍/면</label>
            <select id="subdistrict-select" disabled><option value="">전체</option></select>
          </div>
          <div class="keyword-anchor">
            <button type="button" id="keyword-toggle-btn" class="keyword-toggle" aria-expanded="false">키워드 보기</button>
            <div id="region-keyword-list" class="region-keywords is-collapsed">
              <div class="chips">${chipsHtml}</div>
            </div>
          </div>
        </div>
      </div>
      <div id="result-text" class="result-text">업체 데이터를 불러오는 중…</div>
      <div id="shop-card-grid" class="card-grid">
<!-- AUTO_SHOP_GRID_BEGIN -->
${shopGridHtml}
<!-- AUTO_SHOP_GRID_END -->
      </div>
      <div class="sec">
        <h2>${escHtml(guideTitle)}</h2>
        <div class="body body-seo"><p>${escHtml(introLead)}</p>${bodyContent}<p>${escHtml(conclusionLead)}</p></div>
      </div>
      <div class="sec">
        <h2>${escHtml(keywordsTitle)}</h2>
        <div class="chips">${chipsHtml}</div>
      </div>
      <div class="sec">
        <h2>${escHtml(linksTitle)}</h2>
        <div class="links">${linksHtml}</div>
      </div>
    </article>
  </div>

  <nav class="bottom-category-bar" id="bottom-category-bar">
    <button type="button" class="cat-btn is-active" data-category="outcall" id="cat-btn-outcall-static">출장마사지</button>
    <button type="button" class="cat-btn" data-category="shop" id="cat-btn-shop-static">마사지</button>
  </nav>

  <script src="../shop-card-data.js"></script>
  <script src="../shops.json"></script>
  <script src="../shop-resolve.js"></script>
  <script>
    (function () {
      var categoryMode = 'outcall';
      var PRESET_REGION = ${JSON.stringify(regionValue || '')};
      var PRESET_CITY = ${JSON.stringify(districtValue || '')};
      var HOT_SUB_VAL_SEP = '|||';
      var input = document.getElementById('shop-search-input');
      var clearBtn = document.getElementById('search-clear-btn');
      var regionSelect = document.getElementById('region-select');
      var citySelect = document.getElementById('city-select');
      var subdistrictSelect = document.getElementById('subdistrict-select');
      var gridEl = document.getElementById('shop-card-grid');
      var resultTextEl = document.getElementById('result-text');
      var toggleBtn = document.getElementById('keyword-toggle-btn');
      var kwPanel = document.getElementById('region-keyword-list');
      var keywordAnchorEl = toggleBtn.closest('.keyword-anchor');
      var isInitializing = true;
      var regionData = { regions: ${regionsDataLiteral} };
      var hotData = { regions: ${hotDataLiteral} };

      function isOutcallItem(item) {
        var typeStr = (item.type || '').toString();
        if (/출장/i.test(typeStr)) return true;
        if (typeStr === '출장마사지') return true;
        var svcs = item.services || [];
        if (Array.isArray(svcs) && svcs.some(function (s) { return /출장|홈타이|방문/i.test(String(s)); })) return true;
        var blob = [item.name, item.description, item.greeting || ''].filter(Boolean).join(' ');
        if (/출장마사지|출장안마|홈타이|방문마사지/i.test(blob)) return true;
        return false;
      }

      function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = a[i];
          a[i] = a[j];
          a[j] = t;
        }
        return a;
      }

      function buildAllShopCards() {
        var rawList = (window.shopCardData || []).slice();
        var shopsArr = (window.shopsData && window.shopsData.shops) || [];
        var usedShopIds = new Set();

        if (window.shopResolve && shopsArr.length) {
          rawList.forEach(function (c) {
            var sh = window.shopResolve.findShopByCard(c, shopsArr);
            if (sh && sh.id != null) usedShopIds.add(String(sh.id));
          });
        }

        var shopOnlyRows = shopsArr
          .filter(function (s) { return s && s.id != null && !usedShopIds.has(String(s.id)); })
          .map(function (s) {
            return {
              id: s.id,
              name: s.name,
              type: s.type,
              region: s.region,
              district: s.district,
              dong: s.dong || '',
              address: s.address,
              detailAddress: s.detailAddress,
              phone: s.phone,
              rating: s.rating,
              reviewCount: s.reviewCount,
              price: s.price,
              description: s.description,
              image: s.image,
              alt: s.name,
              services: Array.isArray(s.services) ? s.services : [],
              tags: Array.isArray(s.tags) ? s.tags : [],
              operatingHours: s.operatingHours,
              greeting: s.greeting || '',
              showHealingShop: false,
              _fromShopsJsonOnly: true,
            };
          });

        var healingGroup = rawList.filter(function (s) { return s.showHealingShop; });
        var normalGroup = rawList.filter(function (s) { return !s.showHealingShop; });
        return shuffle(healingGroup).concat(shuffle(normalGroup), shuffle(shopOnlyRows));
      }

      var allShopCards = buildAllShopCards();

      function getListForCategory() {
        if (categoryMode === 'outcall') return allShopCards.filter(isOutcallItem);
        return allShopCards.filter(function (it) { return !isOutcallItem(it); });
      }

      function normalizeDistrictName(name) {
        return String(name || '').replace(/\\s+/g, '').replace(/(시|군|구)$/, '');
      }

      function fillSubdistrictOptions(selectedRegion, selectedCity) {
        subdistrictSelect.innerHTML = '<option value="">전체</option>';
        if (!selectedRegion || !hotData) {
          subdistrictSelect.disabled = true;
          return;
        }
        var hr = (hotData.regions || []).find(function (x) { return x.region === selectedRegion; });
        if (!hr || !Array.isArray(hr.cities)) {
          subdistrictSelect.disabled = true;
          return;
        }
        var count = 0;
        hr.cities.forEach(function (city) {
          if (selectedCity && normalizeDistrictName(city.district) !== normalizeDistrictName(selectedCity)) return;
          (city.subdistricts || []).forEach(function (sub) {
            count += 1;
            var opt = document.createElement('option');
            opt.value = city.district + HOT_SUB_VAL_SEP + sub;
            opt.textContent = selectedCity ? sub : city.district + ' · ' + sub;
            subdistrictSelect.appendChild(opt);
          });
        });
        subdistrictSelect.disabled = count === 0;
      }

      function createCard(item) {
        var article = document.createElement('article');
        article.className = 'shop-card';
        article.setAttribute('data-id', item.id);

        var link = document.createElement('a');
        link.href = 'shop-' + encodeURIComponent(item.id) + '.html';
        link.setAttribute('aria-label', (item.name || '업체') + ' 상세보기');

        var thumb = document.createElement('div');
        thumb.className = 'shop-card-image';
        var img = document.createElement('img');
        var src = cardImageSrc(item) || item.image || '';
        img.src = normalizeImageSrcForStatic(src);
        img.alt = item.alt || item.name || '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.onerror = function () { thumb.style.display = 'none'; };
        thumb.appendChild(img);

        var body = document.createElement('div');
        body.className = 'shop-card-body';

        var hdr = document.createElement('div');
        hdr.className = 'shop-card-header';

        var h2 = document.createElement('h2');
        h2.className = 'shop-card-title';
        h2.textContent = item.name || '';

        var ratingRow = document.createElement('div');
        ratingRow.className = 'shop-card-rating';
        ratingRow.appendChild(document.createTextNode('★ ' + (item.rating != null ? item.rating : '-') + ' '));
        var rcSpan = document.createElement('span');
        rcSpan.textContent = '(' + (item.reviewCount != null ? item.reviewCount : '-') + ')';
        ratingRow.appendChild(rcSpan);

        hdr.appendChild(h2);
        hdr.appendChild(ratingRow);

        function metaLine(emoji, text) {
          var outer = document.createElement('span');
          outer.appendChild(document.createTextNode(emoji + ' '));
          var inner = document.createElement('span');
          inner.textContent = text;
          outer.appendChild(inner);
          return outer;
        }

        var metaBlock = document.createElement('div');
        metaBlock.className = 'shop-card-meta';
        metaBlock.appendChild(metaLine('📍', [item.region, item.district, item.dong].filter(Boolean).join(' ')));
        metaBlock.appendChild(metaLine('⏱', item.operatingHours || '상담 시 안내'));

        var priceRow = document.createElement('div');
        priceRow.className = 'shop-card-price-row';
        var priceSpan = document.createElement('span');
        priceSpan.className = 'shop-card-price';
        priceSpan.textContent = item.price || '가격 상담';
        var phoneSpan = document.createElement('span');
        phoneSpan.className = 'shop-card-phone';
        phoneSpan.textContent = item.phone || '문의 시 안내';
        priceRow.appendChild(priceSpan);
        priceRow.appendChild(phoneSpan);

        var greet = document.createElement('p');
        greet.className = 'shop-card-greeting';
        var g = String(item.greeting || item.description || '').trim();
        greet.textContent = g.slice(0, 280) + (g.length > 280 ? '…' : '');

        var tagsWrap = document.createElement('div');
        tagsWrap.className = 'shop-card-tags';
        (item.services || []).slice(0, 6).forEach(function (svc) {
          var span = document.createElement('span');
          span.className = 'shop-card-tag';
          span.textContent = svc;
          tagsWrap.appendChild(span);
        });

        var foot = document.createElement('div');
        foot.className = 'shop-card-footer';
        var linkLbl = document.createElement('span');
        linkLbl.className = 'shop-card-link';
        linkLbl.appendChild(document.createTextNode('상세 보기 '));
        var arr = document.createElement('span');
        arr.textContent = '↗';
        linkLbl.appendChild(arr);
        foot.appendChild(linkLbl);

        body.appendChild(hdr);
        body.appendChild(metaBlock);
        body.appendChild(priceRow);
        body.appendChild(greet);
        body.appendChild(tagsWrap);
        body.appendChild(foot);

        link.appendChild(thumb);
        link.appendChild(body);
        article.appendChild(link);
        return article;
      }

      function normalizeImageSrcForStatic(src) {
        var s = String(src || '');
        // 정적 페이지는 static-pages/ 아래에 있으므로, 루트 상대 경로(images/...)는 한 단계 상위로 보정
        if (/^\\.\\/images\\//i.test(s)) return '../' + s.slice(2);
        if (/^images\\//i.test(s)) return '../' + s;
        return s;
      }

      function cardImageSrc(item) {
        var shopsArr = (window.shopsData && window.shopsData.shops) || [];
        if (window.shopResolve) {
          var shop = null;
          if (item && item._fromShopsJsonOnly) {
            shop = shopsArr.find(function (s) { return String(s.id) === String(item.id); });
          }
          if (!shop) shop = window.shopResolve.findShopByCard(item, shopsArr);
          return window.shopResolve.resolveImage(item, shop) || '';
        }
        return item.image || '';
      }

      function buildHay(s) {
        var tags = Array.isArray(s.tags) ? s.tags.join(' ') : '';
        return [
          s.name,
          s.region,
          s.district,
          s.dong,
          s.address,
          s.detailAddress,
          s.description,
          s.type,
          (s.services || []).join(' '),
          tags,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
      }

      /** 지역 선택: region 필드 일치 또는 주소/시군구/설명/태그 등에 지역명이 포함(다지역 출장 등) */
      function buildRegionMatchBlob(s) {
        var tags = Array.isArray(s.tags) ? s.tags.join(' ') : '';
        return [s.region, s.district, s.dong, s.address, s.detailAddress, s.description, tags]
          .filter(Boolean)
          .join(' ');
      }

      function itemMatchesSelectedRegion(s, selectedRegion) {
        if (!selectedRegion) return true;
        if (String(s.region || '').trim() === selectedRegion) return true;
        var blob = buildRegionMatchBlob(s);
        if (blob.indexOf(selectedRegion) !== -1) return true;
        return false;
      }

      function tokenMatchesHay(hay, token) {
        if (!token) return true;
        if (hay.indexOf(token) !== -1) return true;
        if (token === '출장마사지' || token === '출장안마') {
          return /출장|홈타이|방문|홈케어/.test(hay);
        }
        if (token === '마사지') {
          return /마사지|스웨디시|테라피|왁싱/.test(hay);
        }
        return false;
      }

      function handleSearch() {
        var list = getListForCategory();
        var q = (input.value || '').trim().toLowerCase();
        var tokens = q ? q.split(/\\s+/).filter(Boolean) : [];
        var selectedRegion = regionSelect.value;
        var selectedCity = citySelect.value;
        var selectedSub = '';
        if (subdistrictSelect.value && subdistrictSelect.value.indexOf(HOT_SUB_VAL_SEP) !== -1) {
          selectedSub = subdistrictSelect.value.split(HOT_SUB_VAL_SEP)[1] || '';
        }
        var filtered = list.filter(function (s) {
          var ok = true;
          if (selectedRegion) ok = ok && itemMatchesSelectedRegion(s, selectedRegion);
          // 요청: 출장마사지(outcall)에서 지역이 선택되면 시/구/동은 결과 필터에서 무시
          if (!(categoryMode === 'outcall' && selectedRegion)) {
            if (selectedCity) ok = ok && normalizeDistrictName(s.district) === normalizeDistrictName(selectedCity);
            if (selectedSub) ok = ok && String(s.dong || '').indexOf(selectedSub) !== -1;
          }
          if (tokens.length) {
            var hay = buildHay(s);
            ok = ok && tokens.every(function (t) { return tokenMatchesHay(hay, t); });
          }
          return ok;
        });
        gridEl.innerHTML = '';
        filtered.forEach(function (item) { gridEl.appendChild(createCard(item)); });
        resultTextEl.textContent = '검색 결과 ' + filtered.length + '개';
      }

      function syncSearchFromSelects() {
        var parts = [];
        if (regionSelect.value) parts.push(regionSelect.value);
        if (citySelect.value) parts.push(citySelect.value);
        if (
          subdistrictSelect.value &&
          subdistrictSelect.value.indexOf(HOT_SUB_VAL_SEP) !== -1
        ) {
          parts.push(subdistrictSelect.value.split(HOT_SUB_VAL_SEP)[1] || '');
        }
        var suffix = categoryMode === 'outcall' ? ' 출장마사지' : ' 마사지';
        input.value = parts.length ? parts.join(' ') + suffix : '';
      }

      function handleRegionChange() {
        var selectedRegion = regionSelect.value;
        if (!selectedRegion) {
          if (!isInitializing) window.location.href = '../index.html';
          return;
        }
        // 요청: 지역 변경 시 해당 지역 정적 페이지로 이동
        if (!isInitializing) {
          window.location.href = selectedRegion + '.html';
          return;
        }

        citySelect.innerHTML = '<option value="">전체</option>';
        citySelect.disabled = !selectedRegion;
        if (!regionData) {
          subdistrictSelect.innerHTML = '<option value="">전체</option>';
          subdistrictSelect.disabled = true;
          syncSearchFromSelects();
          handleSearch();
          return;
        }
        var r = (regionData.regions || []).find(function (x) { return x.name === selectedRegion; });
        (r && r.districts || []).forEach(function (d) {
          var opt = document.createElement('option');
          opt.value = d;
          opt.textContent = d;
          citySelect.appendChild(opt);
        });
        fillSubdistrictOptions(selectedRegion, '');
        syncSearchFromSelects();
        handleSearch();
      }

      function handleCityChange() {
        var selectedRegion = regionSelect.value;
        var selectedCity = citySelect.value || '';

        // 요청: 시/구 변경 시 해당 시/구 정적 페이지로 이동
        if (!isInitializing) {
          if (!selectedRegion) {
            window.location.href = '../index.html';
            return;
          }
          if (!selectedCity) {
            window.location.href = selectedRegion + '.html';
            return;
          }
          window.location.href = selectedRegion + '--' + selectedCity + '.html';
          return;
        }

        fillSubdistrictOptions(selectedRegion, selectedCity);
        syncSearchFromSelects();
        handleSearch();
      }

      function handleSubdistrictChange() {
        syncSearchFromSelects();
        handleSearch();
      }

      clearBtn.addEventListener('click', function () {
        input.value = '';
        handleSearch();
      });
      input.addEventListener('input', handleSearch);
      regionSelect.addEventListener('change', handleRegionChange);
      citySelect.addEventListener('change', handleCityChange);
      subdistrictSelect.addEventListener('change', handleSubdistrictChange);

      function setCategory(mode) {
        categoryMode = mode;
        var outBtn = document.getElementById('cat-btn-outcall-static');
        var shopBtn = document.getElementById('cat-btn-shop-static');
        if (outBtn) outBtn.classList.toggle('is-active', mode === 'outcall');
        if (shopBtn) shopBtn.classList.toggle('is-active', mode === 'shop');
        var hasArea = regionSelect.value || citySelect.value || subdistrictSelect.value;
        if (hasArea) syncSearchFromSelects();
        handleSearch();
      }

      var catBtnOutcall = document.getElementById('cat-btn-outcall-static');
      var catBtnShop = document.getElementById('cat-btn-shop-static');
      if (catBtnOutcall) catBtnOutcall.addEventListener('click', function () { setCategory('outcall'); });
      if (catBtnShop) catBtnShop.addEventListener('click', function () { setCategory('shop'); });

      toggleBtn.addEventListener('click', function () {
        var open = kwPanel.classList.contains('is-collapsed');
        kwPanel.classList.toggle('is-collapsed', !open);
        toggleBtn.textContent = open ? '키워드 보기' : '키워드 숨기기';
        toggleBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
      toggleBtn.addEventListener('mouseenter', function () {
        kwPanel.classList.remove('is-collapsed');
        toggleBtn.textContent = '키워드 숨기기';
        toggleBtn.setAttribute('aria-expanded', 'true');
      });
      if (keywordAnchorEl) {
        keywordAnchorEl.addEventListener('mouseleave', function () {
          kwPanel.classList.add('is-collapsed');
          toggleBtn.textContent = '키워드 보기';
          toggleBtn.setAttribute('aria-expanded', 'false');
        });
      }
      Array.prototype.forEach.call(document.querySelectorAll('.chip'), function (el) {
        el.addEventListener('click', function () {
          var v = (el.textContent || '');
          v = v.replace('출장마사지', ' 출장마사지');
          if (categoryMode === 'shop') {
            v = v.replace('출장마사지', ' 마사지').replace('출장안마', ' 마사지');
          }
          input.value = v;
          handleSearch();
        });
      });

      regionSelect.innerHTML = '<option value="">전체</option>';
      (regionData.regions || []).forEach(function (r) {
        var opt = document.createElement('option');
        opt.value = r.name;
        opt.textContent = r.name;
        regionSelect.appendChild(opt);
      });
      if (PRESET_REGION) {
        regionSelect.value = PRESET_REGION;
        handleRegionChange();
      }
      if (PRESET_CITY && citySelect.querySelector('option[value="' + PRESET_CITY + '"]')) {
        citySelect.value = PRESET_CITY;
        handleCityChange();
      }
      if (!input.value) syncSearchFromSelects();
      handleSearch();
      isInitializing = false;
    })();
  </script>
</body>
</html>`;
}

function main() {
  const regions = readJson('korea-regions.json').regions || [];
  const hot = readJson('korea-hot-subdistricts.json').regions || [];
  const hotMap = new Map(hot.map((r) => [r.region, r.cities || []]));
  const regionsDataLiteral = JSON.stringify(regions);
  const hotDataLiteral = JSON.stringify(hot);

  // 시/구 이름이 전국에서 중복되는지 카운트 (중복이면 라벨에 지역을 붙임)
  const districtCounts = {};
  regions.forEach((r) => {
    (r.districts || []).forEach((d) => {
      districtCounts[d] = (districtCounts[d] || 0) + 1;
    });
  });

  // 지역/시·구 오버라이드(현재 비활성): 프로필 기반 자동 본문 우선
  const regionBodyOverrides = {};
  const cityBodyOverrides = {};

  function hashString(str) {
    // 간단한 해시(결정적 seed 용도)
    var s = String(str || '');
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      var t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(arr, seed) {
    var a = (arr || []).slice();
    var rng = mulberry32(seed >>> 0);
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function uniq(arr) {
    var s = new Set();
    var out = [];
    (arr || []).forEach(function (x) {
      var k = String(x || '');
      if (!k) return;
      if (s.has(k)) return;
      s.add(k);
      out.push(x);
    });
    return out;
  }

  function joinList(arr, maxLen) {
    var a = (arr || []).slice(0, maxLen).filter(Boolean);
    return a.join('·');
  }

  function ensureMinLength(text, minLen, seed, expandFn) {
    var t = text || '';
    var rng = mulberry32(seed >>> 0);
    var guard = 0;
    while (t.length < minLen && guard < 10) {
      var variant = expandFn(guard, rng);
      t += '\n\n' + variant;
      guard++;
    }
    return t;
  }

  var regionTraits = {
    서울: { summary: '교통과 상권이 촘촘하게 이어져 이동량이 많고, 일정이 길어질수록 근육이 먼저 뭉치기 쉬운 편입니다.' },
    부산: { summary: '바다 인접 생활권 특성 때문에 바람과 활동 동선이 겹치며, 하체와 허리 라인에 피로가 누적되기 쉽습니다.' },
    인천: { summary: '항만과 공항 인근 생활권 흐름이 있어 이동이 잦고, 휴식 리듬이 흔들릴 때 몸의 긴장이 쉽게 올라옵니다.' },
    대구: { summary: '도심 생활권 동선이 반복되는 날이 많아 어깨·등 라인의 뻐근함이 자주 느껴질 수 있습니다.' },
    광주: { summary: '도심과 생활권이 넓게 펼쳐져 하루 이동이 늘어나면 목·어깨 부담이 커지기 쉬운 지역입니다.' },
    대전: { summary: '과학도시 특성상 일정이 촘촘하게 이어지는 경우가 있어, 상체 고정 자세가 늘며 결림이 먼저 올라옵니다.' },
    울산: { summary: '산업지구 생활 리듬이 있어 근육 피로가 누적되기 쉬우며, 일정 후 회복 케어 니즈가 높습니다.' },
    경기: { summary: '수도권 생활권 특성상 출퇴근과 이동이 많아 하체와 허리 피로가 누적되기 쉽습니다.' },
    강원: { summary: '산과 바다가 함께 있는 지형 특성 때문에 걷는 일정이 늘면 발·종아리·허리에 긴장이 쌓이기 쉽습니다.' },
    충북: { summary: '내륙 생활권 특성으로 계절 변화에 따라 몸이 쉽게 굳고, 밤에 피로가 집중되는 편입니다.' },
    충남: { summary: '생활권이 넓어 이동이 잦고, 하루 활동이 끝난 뒤 몸이 바로 풀리지 않는 날이 생기기 쉽습니다.' },
    경북: { summary: '동해·내륙 흐름이 함께 있어 걷는 일정이 늘면 하체 피로와 등 결림이 동시에 올라올 수 있습니다.' },
    경남: { summary: '남해 생활권 동선이 길어지고 야외 일정이 많아지면 하체·허리 라인의 피로가 빠르게 누적됩니다.' },
    전북: { summary: '도심 생활 리듬이 이어지는 날이 많아 어깨·목 뻐근함과 등 라인 결림이 자주 나타납니다.' },
    전남: { summary: '바다와 자연 동선이 겹치는 날이 많아 활동량이 늘면 종아리·허리 부담이 커지기 쉽습니다.' },
    제주: { summary: '바다 바람과 계절 변화로 컨디션이 쉽게 흔들리며, 방문형 케어로 회복 흐름을 이어가려는 수요가 꾸준합니다.' },
  };

  function makeRegionBody(region) {
    var regionObj = regions.find(function (x) { return x.name === region; }) || {};
    var districts = regionObj.districts || [];
    var hotCities = hotMap.get(region) || [];
    var seed = hashString('region:' + region);
    var rng = mulberry32(seed);
    var trait = (regionTraits[region] && regionTraits[region].summary) || (region + ' 지역 특성상 이동과 활동이 늘면 방문형 케어 수요가 꾸준합니다.');

    var sampleDistricts = seededShuffle(districts, seed).slice(0, 8);
    var hotDistricts = seededShuffle(hotCities.map(function (c) { return c.district; }), seed).slice(0, 4);

    var subdistrictPool = uniq(
      hotCities
        .flatMap(function (c) { return (c.subdistricts || []).slice(0, 8); })
        .concat(
          hotCities
            .slice(0, 5)
            .flatMap(function (c) { return (c.subdistricts || []).slice(0, 6); })
        )
    );
    var topSubs = seededShuffle(subdistrictPool, seed).slice(0, 14);

    var introVariants = [
      '${region} 출장마사지 페이지는 일정 중 몸이 먼저 지치는 분들이 “방문형으로 편하게 회복”하기에 맞춘 안내입니다.',
      '${region} 지역에서 출장(방문) 케어를 찾는 이유는 대부분 이동 부담을 줄이고, 몸이 굳기 전에 컨디션을 정리하려는 목적입니다.',
      '${region} 방문형 마사지 안내를 찾는 분들은 활동량이 늘어난 시점에서 근육 긴장을 낮추고 다음 일정의 여유를 만들고 싶어 합니다.',
    ];

    var timeVariants = [
      '추천 케어 타이밍은 보통 저녁 일정이 마무리된 뒤, 숙소로 돌아와 바로 진행하는 방식입니다.',
      '주말/연휴처럼 하루 활동이 길어지는 날에는 저녁 8시 전후부터 예약이 몰리는 편입니다.',
      '하루 중 가장 피로가 쌓이는 시점을 기준으로 잡으면 같은 케어라도 체감 만족도가 달라질 수 있습니다.',
    ];

    var themeVariants = [
      '자주 느끼는 불편은 어깨·목 뻐근함, 허리·골반 당김, 종아리·발 저림처럼 “연결되는 근육”에서 동시에 올라오는 경우가 많습니다.',
      '이동과 활동이 늘면 등 라인 결림이 먼저 나타나고, 시간이 더 지나며 하체 피로가 같이 커지는 패턴이 흔합니다.',
      '수면 환경이 달라지거나 자세가 굳는 시기에는 몸이 쉽게 풀리지 않아 방문형 케어로 회복 루틴을 이어가려는 분들이 많습니다.',
    ];

    var checkVariants = [
      '예약 전에는 방문 가능 시간, 진행 환경(숙소 형태/공간), 위생 관련 안내를 먼저 확인해두면 케어가 훨씬 편안하게 이어집니다.',
      '진행 중 압력 강도, 특히 집중하고 싶은 부위를 미리 공유하면 같은 프로그램이라도 만족도가 높아질 수 있습니다.',
      '통증이 시작되는 시점이나 가장 불편한 구간을 간단히 메모해 두면 상담·진행이 더 정확해집니다.',
    ];

    var keywordVariants = [
      '검색 시에는 `출장마사지`, `방문마사지`, `홈타이`, `마사지예약` 같은 키워드를 자연스럽게 조합하면 원하는 결과에 더 가까워질 수 있습니다.',
      '“방문형 마사지 + 숙소 근처”, “출장 케어 + 피로 회복”처럼 의도를 같이 담으면 매칭이 더 잘 되는 편입니다.',
      '지역명을 함께 넣어 검색하면 같은 서비스라도 이동 동선이 더 잘 맞는 곳을 고르기 쉬워집니다.',
    ];

    var pick = function (arr) { return arr[Math.floor(rng() * arr.length)]; };

    var subsStr = joinList(topSubs, 10);
    var districtsStr = joinList(sampleDistricts, 8);
    var hotDistrictsStr = joinList(hotDistricts, 4);

    var paragraphs = [];
    paragraphs.push(
      pick(introVariants).replace(/\$\{region\}/g, region)
    );
    paragraphs.push(
      '${region} 지역의 특징은 활동 동선이 반복되며 근육 긴장이 누적되는 흐름입니다. 특히 ${districtsStr}처럼 생활권이 넓어지는 날에는 어깨와 하체가 동시에 뭉치기 쉬워 방문 케어의 효율이 좋아집니다.'.replace(/\$\{region\}/g, region).replace(/\$\{districtsStr\}/g, districtsStr)
    );
    paragraphs.push(
      '주요 키워드 동선으로는 ${hotDistrictsStr}를 중심으로, 생활권의 피로 양상이 크게 달라질 수 있습니다. 이 페이지에서는 인근 동/읍/면 키워드를 함께 확인해 원하는 흐름으로 검색해 보실 수 있습니다.'.replace(/\$\{hotDistrictsStr\}/g, hotDistrictsStr)
    );
    paragraphs.push(pick(themeVariants));
    paragraphs.push(
      pick(checkVariants)
    );
    paragraphs.push(
      '예를 들어 ${subsStr} 같은 동/읍/면 키워드가 연관될 때는 “어깨·목과 등 라인” 또는 “종아리·허리”처럼 동시에 뻐근해지는 경우가 많습니다. 자신의 불편 구간에 맞춰 집중 포인트를 정하면 케어가 더 효율적으로 느껴질 수 있습니다.'.replace(/\$\{subsStr\}/g, subsStr)
    );
    paragraphs.push(pick(keywordVariants));
    paragraphs.push(pick(timeVariants));
    paragraphs.push(
      '케어 후에는 물 섭취와 가벼운 휴식을 이어가면 근육이 안정적으로 자리 잡는 데 도움이 됩니다. 다음 날 일정이 빠듯하다면 무리하게 버티기보다 “회복을 먼저” 넣는 선택이 장기적으로 편안함을 만들 수 있습니다.'
    );
    paragraphs.push(
      '마지막으로, 이 페이지에서 제공하는 지역 안내는 단순한 정보가 아니라 ${region}에서 실제로 찾게 되는 출장(방문) 케어의 선택 기준을 정리한 것입니다. 지금의 불편을 줄이고, 다음 일정의 동선을 가볍게 만드는 방향으로 접근해 보세요.'.replace(/\$\{region\}/g, region)
    );

    var base = paragraphs.join('\n\n');
    return ensureMinLength(
      base,
      2000,
      seed,
      function (i) {
        var extraPool = seededShuffle(districts, seed + i).slice(0, 6);
        var extraSubs = seededShuffle(subdistrictPool, seed + i).slice(0, 6);
        var extraDistrictsStr = joinList(extraPool, 6);
        var extraSubsStr = joinList(extraSubs, 6);
        var extraTemplates = [
          '${region}에서 출장마사지 검색을 할 때는 이동 시간이 짧은 생활권을 먼저 고르면 만족도가 높아집니다. 예: ${extraDistrictsStr}.'.replace(/\$\{region\}/g, region).replace(/\$\{extraDistrictsStr\}/g, extraDistrictsStr),
          '${region}은 ${extraSubsStr}처럼 세부 동선 키워드가 함께 매칭될 때 체감이 좋아지는 편입니다. 동일한 케어라도 어디가 가장 불편한지에 따라 우선순위가 달라집니다.'.replace(/\$\{region\}/g, region).replace(/\$\{extraSubsStr\}/g, extraSubsStr),
          '방문형 마사지의 장점은 “시간을 절약하면서 회복 루틴을 유지”할 수 있다는 점입니다. ${region} 지역에서도 숙소로 돌아온 뒤 케어를 이어가면 다음 날 컨디션 변화를 더 쉽게 느끼는 분들이 많습니다.'.replace(/\$\{region\}/g, region),
          '특히 일정이 길어질수록 어깨·목이 먼저 굳고, 이후 하체 피로가 같이 올라오는 경우가 많습니다. ${region}에서는 이런 흐름을 염두에 두고 검색하면 선택이 더 편해집니다.'.replace(/\$\{region\}/g, region),
        ];
        return extraTemplates[Math.floor(rng() * extraTemplates.length)];
      }
    );
  }

  function makeCityBody(region, district, displayCityText, subs) {
    var seed = hashString('city:' + region + '|' + district);
    var rng = mulberry32(seed);
    var trait = (regionTraits[region] && regionTraits[region].summary) || '';

    var subList = (subs && subs.length) ? subs.slice() : [];
    if (!subList.length) {
      // 핫데이터가 비어있을 때는 같은 지역의 다른 도시 서브구를 일부 가져와 문장 품질을 유지
      var hotCities = hotMap.get(region) || [];
      subList = uniq(hotCities.flatMap(function (c) { return (c.subdistricts || []).slice(0, 6); })).slice(0, 10);
    }
    subList = uniq(subList);
    var topSubs = seededShuffle(subList, seed).slice(0, 12);
    var subsStr = joinList(topSubs, 10);

    var introVariants = [
      '${displayCityText} 출장마사지는 “여행 중에도 무리하지 않고 몸을 회복”하고 싶은 분들에게 맞춘 방문형 안내입니다.',
      '${displayCityText} 지역에서 출장(방문) 케어를 찾는 경우는 대체로 이동 부담이 커졌을 때입니다. 숙소 또는 이동 동선 가까운 곳에서 케어가 이어지도록 돕는 목적이 있습니다.',
      '이 페이지는 ${displayCityText}를 중심으로 출장마사지, 방문마사지, 홈타이 등 검색 의도에 맞춰 선택 기준을 정리했습니다.',
    ];

    var problemVariants = [
      '특히 ${subsStr} 같은 동선이 포함되는 경우, 특정 부위만 단순히 뭉친 것이 아니라 연결된 근육이 함께 긴장해 있는 패턴이 나타나기 쉽습니다. 그래서 “어디가 제일 불편한지”를 먼저 정리하는 것이 만족도를 좌우합니다.',
      '일상 이동량이 늘거나, 관광·업무 일정이 길어질수록 하체와 허리 라인이 먼저 무거워지고, 시간이 지나면 등·어깨 쪽 결림이 같이 올라올 수 있습니다. ${displayCityText}에서는 이런 흐름을 염두에 두고 케어를 선택하는 편이 좋습니다.',
      '수면 환경이 달라지거나 자세가 고정되는 날에는 몸이 쉽게 풀리지 않습니다. ${displayCityText}에서 방문형 마사지로 회복 루틴을 잡으면 다음 일정의 여유가 달라질 수 있습니다.',
    ];

    var checkTemplates = [
      '방문 전에는 압력 강도(부드럽게/적당히/집중), 특히 신경 쓰고 싶은 부위(어깨·목, 허리·골반, 종아리·발)를 미리 공유해 보세요. 같은 출장마사지라도 “우선순위”가 맞으면 체감이 더 좋아질 수 있습니다.',
      '케어가 진행되는 공간의 형태도 중요합니다. 호텔/리조트/펜션/원룸 등 환경에 따라 동선이 달라질 수 있으니, 예약 단계에서 진행 가능 시간과 안내 사항을 확인하면 편안하게 이어집니다.',
      '통증이 시작된 시점이나 가장 불편했던 순간을 간단히 정리해 두면 상담이 더 정확해집니다. ${displayCityText}에서도 이 부분을 준비하는 분들이 만족도가 높습니다.',
    ];

    var timeTemplates = [
      '추천 타이밍은 숙소로 돌아온 직후, 혹은 하루 활동이 마무리된 뒤입니다. 특히 저녁 일정이 길었던 날에는 20~22시 사이에 진행하면 몸이 더 안정적으로 정리되는 느낌을 기대할 수 있습니다.',
      '주말이나 연휴처럼 하루가 길어지는 날에는 “가장 피곤해지는 순간”을 기준으로 케어를 배치해 보세요. 미리 예약해 두면 일정 변동에도 유연하게 대응할 수 있습니다.',
      '업무 또는 일정이 촘촘한 ${displayCityText}에서는 “시간을 절약하는 방문형”이 효과적일 수 있습니다. 이동 시간을 줄이고 회복에 집중하면 다음 날 컨디션 변화를 쉽게 느끼는 분들이 많습니다.',
    ];

    var keywordTemplates = [
      'SEO 관점에서도 ${displayCityText} 출장마사지 검색은 “피로 회복”, “근육 이완”, “방문 케어”, “숙소 근처 마사지”처럼 의도가 담기면 더 정확해집니다. 필요하면 홈타이 키워드도 함께 조합해보세요.',
      '검색어를 짧게만 두기보다 ${displayCityText} + 출장(방문) + 마사지예약 같은 형태로 구성하면 매칭이 더 잘 되는 편입니다.',
      '‘어디가 가장 불편한지’ 한 가지를 함께 떠올리며 검색하면 같은 지역이라도 선택이 쉬워집니다. ${displayCityText} 방문형 마사지 선택 기준을 더 명확히 만들 수 있습니다.',
    ];

    var pick = function (arr) { return arr[Math.floor(rng() * arr.length)]; };

    var paragraphs = [];
    paragraphs.push(pick(introVariants).replace(/\$\{displayCityText\}/g, displayCityText));
    paragraphs.push(
      pick(problemVariants)
        .replace(/\$\{displayCityText\}/g, displayCityText)
        .replace(/\$\{subsStr\}/g, subsStr)
    );
    paragraphs.push(
      pick(checkTemplates)
        .replace(/\$\{displayCityText\}/g, displayCityText)
    );
    paragraphs.push(
      pick(timeTemplates)
        .replace(/\$\{displayCityText\}/g, displayCityText)
    );
    paragraphs.push(
      pick(keywordTemplates)
        .replace(/\$\{displayCityText\}/g, displayCityText)
    );
    paragraphs.push(
      '추가로 ${displayCityText}에서는 일정 특성에 따라 케어 우선순위를 바꾸는 것이 좋습니다. 예: 이동이 많은 날에는 하체(종아리·발)부터, 사진/관광처럼 상체 자세가 굳는 날에는 어깨·목부터 진행하면 전체 체감이 달라질 수 있습니다.'
        .replace(/\$\{displayCityText\}/g, displayCityText)
    );
    paragraphs.push(
      '케어 후에는 물을 충분히 섭취하고, 무리한 스트레칭보다 가벼운 움직임으로 근육이 안정적으로 자리 잡도록 도와주세요. 방문형 마사지의 장점은 숙소에서 휴식으로 자연스럽게 이어질 수 있다는 점입니다.'
    );
    paragraphs.push(
      '마지막으로, 이 문구는 ${displayCityText}에서 출장마사지/방문형 마사지/홈타이 등을 찾는 분들이 “무엇을 기준으로 선택해야 하는지”를 한 번에 정리할 수 있도록 구성했습니다. 지금의 불편을 줄이고 다음 일정의 동선을 가볍게 만드는 방향으로 접근해 보세요.'
        .replace(/\$\{displayCityText\}/g, displayCityText)
    );

    var base = paragraphs.join('\n\n');
    return ensureMinLength(
      base,
      2000,
      seed,
      function (i, rng2) {
        var extraSubs = seededShuffle(topSubs, seed + i + 1).slice(0, 8);
        var extraSubsStr = joinList(extraSubs, 8);
        var extraTemplates = [
          '특히 ${displayCityText}에서는 ${extraSubsStr}처럼 인근 동선 키워드가 겹칠 때 케어 효율이 좋아질 수 있습니다. 같은 지역에서도 불편 부위가 다르면 진행 우선순위를 달리하는 것이 중요합니다.'
            .replace(/\$\{displayCityText\}/g, displayCityText)
            .replace(/\$\{extraSubsStr\}/g, extraSubsStr),
          '출장(방문) 케어를 고민할 때는 “이동 없이 회복”을 우선순위로 두면 선택이 더 쉬워집니다. ${displayCityText}는 일정이 바쁘거나 이동이 잦은 경우가 많아 방문형의 장점이 크게 느껴질 수 있습니다.'
            .replace(/\$\{displayCityText\}/g, displayCityText),
          '마사지예약을 할 때는 압력 강도와 집중 부위를 먼저 정리해 두세요. ${displayCityText}에서는 이 준비가 곧 만족도로 이어지는 경우가 많습니다.'
            .replace(/\$\{displayCityText\}/g, displayCityText),
          '케어 후에는 숙소에서 가벼운 휴식과 수분 섭취로 회복 흐름을 이어가면 다음 날 컨디션이 더 안정적으로 유지될 수 있습니다.'
        ];
        var idx = Math.floor(rng2() * extraTemplates.length);
        return extraTemplates[idx] || extraTemplates[0];
      }
    );
  }

  /** 강원 수동 원고 → korea-regions-seo-profiles.md 기반 HTML → 수동 오버라이드 → 템플릿 */
  function resolveRegionBody(region) {
    if (region === '인천' && incheonSeoBodies.regionHtml) {
      return { bodyHtml: incheonSeoBodies.regionHtml, bodyText: '' };
    }
    if (region === '대구' && daeguSeoBodies.regionHtml) {
      return { bodyHtml: daeguSeoBodies.regionHtml, bodyText: '' };
    }
    if (region === '대전' && daejeonSeoBodies.regionHtml) {
      return { bodyHtml: daejeonSeoBodies.regionHtml, bodyText: '' };
    }
    if (region === '광주' && gwangjuSeoBodies.regionHtml) {
      return { bodyHtml: gwangjuSeoBodies.regionHtml, bodyText: '' };
    }
    if (region === '울산' && ulsanSeoBodies.regionHtml) {
      return { bodyHtml: ulsanSeoBodies.regionHtml, bodyText: '' };
    }
    if (region === '충북' && chungbukSeoBodies.regionHtml) {
      return { bodyHtml: chungbukSeoBodies.regionHtml, bodyText: '' };
    }
    if (region === '충남' && chungnamSeoBodies.regionHtml) {
      return { bodyHtml: chungnamSeoBodies.regionHtml, bodyText: '' };
    }
    if (region === '경북' && gyeongbukSeoBodies.regionHtml) {
      return { bodyHtml: gyeongbukSeoBodies.regionHtml, bodyText: '' };
    }
    if (region === '경남' && gyeongnamSeoBodies.regionHtml) {
      return { bodyHtml: gyeongnamSeoBodies.regionHtml, bodyText: '' };
    }
    if (region === '전북' && jeonbukSeoBodies.regionHtml) {
      return { bodyHtml: jeonbukSeoBodies.regionHtml, bodyText: '' };
    }
    if (region === '전남' && jeonnamSeoBodies.regionHtml) {
      return { bodyHtml: jeonnamSeoBodies.regionHtml, bodyText: '' };
    }
    if (region === '제주' && jejuSeoBodies.regionHtml) {
      return { bodyHtml: jejuSeoBodies.regionHtml, bodyText: '' };
    }
    if (region === '세종' && sejongSeoBodies.regionHtml) {
      return { bodyHtml: sejongSeoBodies.regionHtml, bodyText: '' };
    }
    if (region === '경기' && gyeonggiSeoBodies.regionHtml) {
      return { bodyHtml: gyeonggiSeoBodies.regionHtml, bodyText: '' };
    }
    if (region === '서울' && seoulSeoBodies.regionHtml) {
      return { bodyHtml: seoulSeoBodies.regionHtml, bodyText: '' };
    }
    if (region === '부산' && busanSeoBodies.regionHtml) {
      return { bodyHtml: busanSeoBodies.regionHtml, bodyText: '' };
    }
    if (region === '강원' && gangwonSeoBodies.regionHtml) {
      return { bodyHtml: gangwonSeoBodies.regionHtml, bodyText: '' };
    }
    const profileHtml = buildProfileBodyHtml(region, '', region);
    if (profileHtml) return { bodyHtml: profileHtml, bodyText: '' };
    if (regionBodyOverrides[region]) return { bodyHtml: null, bodyText: regionBodyOverrides[region] };
    return { bodyHtml: null, bodyText: makeRegionBody(region) };
  }

  function resolveCityBody(region, district, displayCityText, subs) {
    if (region === '인천' && incheonSeoBodies.cityHtml && incheonSeoBodies.cityHtml[district]) {
      return { bodyHtml: incheonSeoBodies.cityHtml[district], bodyText: '' };
    }
    if (region === '대구' && daeguSeoBodies.cityHtml && daeguSeoBodies.cityHtml[district]) {
      return { bodyHtml: daeguSeoBodies.cityHtml[district], bodyText: '' };
    }
    if (region === '대전' && daejeonSeoBodies.cityHtml && daejeonSeoBodies.cityHtml[district]) {
      return { bodyHtml: daejeonSeoBodies.cityHtml[district], bodyText: '' };
    }
    if (region === '광주' && gwangjuSeoBodies.cityHtml && gwangjuSeoBodies.cityHtml[district]) {
      return { bodyHtml: gwangjuSeoBodies.cityHtml[district], bodyText: '' };
    }
    if (region === '울산' && ulsanSeoBodies.cityHtml && ulsanSeoBodies.cityHtml[district]) {
      return { bodyHtml: ulsanSeoBodies.cityHtml[district], bodyText: '' };
    }
    if (region === '충북' && chungbukSeoBodies.cityHtml && chungbukSeoBodies.cityHtml[district]) {
      return { bodyHtml: chungbukSeoBodies.cityHtml[district], bodyText: '' };
    }
    if (region === '충남' && chungnamSeoBodies.cityHtml && chungnamSeoBodies.cityHtml[district]) {
      return { bodyHtml: chungnamSeoBodies.cityHtml[district], bodyText: '' };
    }
    if (region === '경북' && gyeongbukSeoBodies.cityHtml && gyeongbukSeoBodies.cityHtml[district]) {
      return { bodyHtml: gyeongbukSeoBodies.cityHtml[district], bodyText: '' };
    }
    if (region === '경남' && gyeongnamSeoBodies.cityHtml && gyeongnamSeoBodies.cityHtml[district]) {
      return { bodyHtml: gyeongnamSeoBodies.cityHtml[district], bodyText: '' };
    }
    if (region === '전북' && jeonbukSeoBodies.cityHtml && jeonbukSeoBodies.cityHtml[district]) {
      return { bodyHtml: jeonbukSeoBodies.cityHtml[district], bodyText: '' };
    }
    if (region === '전남' && jeonnamSeoBodies.cityHtml && jeonnamSeoBodies.cityHtml[district]) {
      return { bodyHtml: jeonnamSeoBodies.cityHtml[district], bodyText: '' };
    }
    if (region === '제주' && jejuSeoBodies.cityHtml && jejuSeoBodies.cityHtml[district]) {
      return { bodyHtml: jejuSeoBodies.cityHtml[district], bodyText: '' };
    }
    if (region === '경기' && gyeonggiSeoBodies.cityHtml && gyeonggiSeoBodies.cityHtml[district]) {
      return { bodyHtml: gyeonggiSeoBodies.cityHtml[district], bodyText: '' };
    }
    if (region === '서울' && seoulSeoBodies.cityHtml && seoulSeoBodies.cityHtml[district]) {
      return { bodyHtml: seoulSeoBodies.cityHtml[district], bodyText: '' };
    }
    if (region === '부산' && busanSeoBodies.cityHtml && busanSeoBodies.cityHtml[district]) {
      return { bodyHtml: busanSeoBodies.cityHtml[district], bodyText: '' };
    }
    if (region === '강원' && gangwonSeoBodies.cityHtml && gangwonSeoBodies.cityHtml[district]) {
      return { bodyHtml: gangwonSeoBodies.cityHtml[district], bodyText: '' };
    }
    const profileHtml = buildProfileBodyHtml(region, district, displayCityText);
    if (profileHtml) return { bodyHtml: profileHtml, bodyText: '' };
    var key = region + '|' + district;
    if (cityBodyOverrides[key]) return { bodyHtml: null, bodyText: cityBodyOverrides[key] };
    return { bodyHtml: null, bodyText: makeCityBody(region, district, displayCityText, subs) };
  }

  function districtLabel(region, district) {
    const cnt = districtCounts[district] || 0;
    if (cnt > 1) return region + district + '출장마사지';
    return district + '출장마사지';
  }

  function pickAllDistricts(region, selectedCity) {
    const regionObj = regions.find((x) => x.name === region);
    const districts = (regionObj && regionObj.districts) ? regionObj.districts : [];
    if (!districts.length) return [];
    if (!selectedCity) return districts;
    return [selectedCity].concat(districts.filter((d) => d !== selectedCity));
  }

  /** title: 맨 앞에 페이지 핵심 키워드만 고정 — `{지역|시구} 출장마사지 | 여신 홈타이 힐링업체` */
  const SEO_TITLE_SUFFIX = '여신 홈타이 힐링업체';

  function seoRegionTitle(region) {
    const kw = `${region} 출장마사지`;
    return `${kw} | ${SEO_TITLE_SUFFIX}`;
  }

  function seoRegionDescription(region) {
    const descs = [
      `${region} 출장마사지·홈타이·출장안마를 찾는 분들을 위한 시·구 바로가기와 동·읍·면 안내입니다. 잘하는 곳·많이 찾는 힐링 정보를 빠르게 확인하세요.`,
      `${region} 지역에서 방문·홈타이 출장을 고를 때 참고할 검색어와 연관 표현을 모았습니다. 실력·만족도 높은 케어를 찾는 분께 도움이 됩니다.`,
      `${region} 인기 출장마사지, 힐링 홈타이, 출장안마를 지역별로 정리했습니다. 동·읍·면까지 맞춰 내 주변에 맞게 찾아보세요.`,
      `${region} 출장 마사지 안내와 시·구별 페이지입니다. 손님들이 많이 찾는 인기 힐링·방문 케어를 비교해 보세요.`,
      `${region} 지역 1등급 힐링·프리미엄 출장을 찾을 때 참고할 바로가기입니다. 후기·재방문 많은 업체 탐색에 활용하세요.`,
    ];
    return descs[hashString(`desc:${region}`) % descs.length];
  }

  function seoRegionHeading(region) {
    return `${region} 출장마사지 | 프리미엄 홈타이 추천`;
  }

  function seoRegionIntro(region) {
    const t = [
      `${region}에서 출장·홈타이를 찾을 때 손님들이 많이 쓰는 인기 표현과 시·구 바로가기를 모았습니다. 잘하는 곳·후기 많은 힐링을 빠르게 비교해 보세요.`,
      `${region} 지역 인기 출장마사지, 힐링 홈타이 검색에 맞춰 동·읍·면과 연관 표현을 한곳에 정리했습니다. 방문 만족도 높은 케어를 고르는 데 참고하세요.`,
      `${region} 출장마사지·출장안마를 고를 때 실력·인기 많은 업체를 찾는 분들을 위한 안내입니다. 지역별로 내 동네에 맞게 찾아보세요.`,
      `${region}에서 믿고 찾는 힐링 출장, 1등급 케어를 고를 때 쓰는 안내와 바로가기입니다. 많이 찾는 인기 코스·방문형 정보를 확인하세요.`,
    ];
    return t[hashString(`intro:${region}`) % t.length];
  }

  /** 시·구: 맨 앞 키워드 = `{displayCityText} 출장마사지` (중복 시구는 "서울 중구 출장마사지" 등) */
  function seoCityTitle(region, district, displayCityText) {
    const kw = `${displayCityText} 출장마사지`;
    return `${kw} | ${SEO_TITLE_SUFFIX}`;
  }

  function seoCityDescription(region, district, displayCityText) {
    const key = `${region}|${district}`;
    const descs = [
      `${displayCityText} 출장마사지·홈타이·출장안마를 찾을 때 참고할 동·읍·면 안내입니다. 잘하는 곳·후기 많은 힐링을 비교해 보세요.`,
      `${displayCityText} 지역에서 손님들이 많이 찾는 방문 마사지, 힐링 홈타이 안내를 모았습니다. 실력·만족도 높은 케어 선택에 참고하세요.`,
      `${region} ${district} 인기 출장·홈타이와 인근 바로가기입니다. 많이 찾는 힐링·재방문 많은 업체 탐색에 활용하세요.`,
      `${displayCityText} 출장 마사지 안내와 인기 힐링, 1등급 케어 표현을 확인하세요. 방문 만족 높은 곳을 고르는 데 도움이 됩니다.`,
      `${displayCityText} 프리미엄 출장안마·홈타이를 찾는 분들을 위한 시·구 맞춤 안내입니다. 실력파·인기 많은 힐링을 검색해 보세요.`,
    ];
    return descs[hashString(`desc:${key}`) % descs.length];
  }

  function seoCityHeading(region, district, displayCityText) {
    return `${displayCityText} 출장마사지 | 프리미엄 홈타이 추천`;
  }

  function seoCityIntro(region, district, displayCityText) {
    const key = `${region}|${district}`;
    const t = [
      `${displayCityText}에서 출장·홈타이를 찾을 때 손님들이 많이 쓰는 인기 표현과 동·읍·면 안내를 모았습니다. 잘하는 곳·후기 많은 힐링을 빠르게 비교해 보세요.`,
      `${displayCityText} 지역 인기 출장마사지, 힐링 방문 검색에 맞춰 연관 표현과 바로가기를 정리했습니다. 실력·만족도 높은 케어를 고르는 데 참고하세요.`,
      `${displayCityText} 출장안마·홈타이를 고를 때 많이 찾는 검색어와 인근 시·구 링크입니다. 인기 많은 힐링·재방문 많은 업체를 찾을 때 활용하세요.`,
      `${region} ${district}에서 믿고 찾는 힐링 출장, 1등급 케어 안내와 동네 검색 표현을 한곳에 담았습니다. 방문 만족 높은 곳을 찾는 분께 도움이 됩니다.`,
    ];
    return t[hashString(`intro:${key}`) % t.length];
  }

  ensureDir(outDir);
  shopCardHtml.clearCache();
  const shopCardData = shopCardHtml.loadShopCardData();
  const shopsPayload = shopCardHtml.loadShopsData();
  const shopsArr = Array.isArray(shopsPayload.shops) ? shopsPayload.shops : [];
  const allMerged = shopCardHtml.buildAllShopCards(shopCardData, shopsArr);
  const outcallList = shopCardHtml.getListForCategory(allMerged, 'outcall');

  function representativeOgImage(region, district) {
    const filtered = shopCardHtml.filterShopListForPage(outcallList, {
      categoryMode: 'outcall',
      selectedRegion: region || '',
      selectedCity: district || '',
      selectedSub: '',
      tokens: [],
    });
    const first = filtered && filtered.length ? filtered[0] : null;
    if (!first) return 'https://outcall.kr/images/연동마사지_프라이빗.jpg';
    const rawSrc = shopCardHtml.cardImageSrc(first, shopsArr);
    const normalized = shopCardHtml.normalizeImageSrcForPage(rawSrc, '').replace(/^\.?\//, '');
    if (!normalized) return 'https://outcall.kr/images/연동마사지_프라이빗.jpg';
    return `https://outcall.kr/${encodeURI(normalized)}`;
  }

  regions.forEach((regionObj) => {
    const region = regionObj.name;
    const districts = regionObj.districts || [];
    const hotCities = hotMap.get(region) || [];

    const allDistrictsForRegion = pickAllDistricts(region, '');
    const regionLinks = allDistrictsForRegion
      .map((d) => `<a href="${escHtml(pageFileName(region, d))}">${escHtml(districtLabel(region, d))}</a>`)
      .join('');

    const regionSubs = hotCities.flatMap((c) => (c.subdistricts || []).slice(0, 6));
    const regionChipsRaw = [
      `${region}출장마사지`,
      `${region}홈타이`,
      `${region}출장안마`,
      ...regionSubs.map((s) => `${s}출장마사지`),
    ];
    const regionChips = [...new Set(regionChipsRaw)]
      .map((k) => `<span class="chip">${escHtml(k)}</span>`)
      .join('');

    const regionBody = resolveRegionBody(region);
    const regionHtml = buildLayout({
      title: seoRegionTitle(region),
      description: seoRegionDescription(region),
      heading: seoRegionHeading(region),
      intro: seoRegionIntro(region),
      linksHtml: regionLinks || `<a href="../index.html">메인에서 전체 검색</a>`,
      chipsHtml: regionChips,
      bodyText: regionBody.bodyText,
      bodyHtml: regionBody.bodyHtml,
      regionValue: region,
      districtValue: '',
      searchKeywordPrefix: region,
      regionsDataLiteral,
      hotDataLiteral,
      ogImageUrl: representativeOgImage(region, ''),
      shopGridHtml: shopCardHtml.renderStaticShopGrid({
        region,
        district: '',
        categoryMode: 'outcall',
      }),
    });
    fs.writeFileSync(pagePath(region, ''), regionHtml, 'utf8');

    districts.forEach((district) => {
      const match = hotCities.find(
        (c) => normalizeDistrictName(c.district) === normalizeDistrictName(district)
      );
      const subs = (match && match.subdistricts) || [];

      // 바로가기: 맨 앞에 광역(지역) 정적 페이지 → 이후 시/구만 노출 (동/읍/면 제거, 중복 시 지역 prefix)
      const allDistrictsForCity = pickAllDistricts(region, district);
      const regionQuickLink = `<a href="${escHtml(pageFileName(region, ''))}">${escHtml(region + '출장마사지')}</a>`;
      const cityLinks =
        regionQuickLink +
        allDistrictsForCity
          .map((d) => `<a href="${escHtml(pageFileName(region, d))}">${escHtml(districtLabel(region, d))}</a>`)
          .join('');

      const cnt = districtCounts[district] || 0;
      const displayCityText = cnt > 1 ? `${region} ${district}` : `${district}`;
      const mainDistanceChip = cnt > 1 ? `${region}${district}출장마사지` : `${district}출장마사지`;

      const chipsRaw = [
        mainDistanceChip,
        `${district}홈타이`,
        `${district}출장안마`,
        ...subs.map((s) => `${s}출장마사지`),
      ];
      const chips = [...new Set(chipsRaw)]
        .map((k) => `<span class="chip">${escHtml(k)}</span>`)
        .join('');

      const cityBody = resolveCityBody(region, district, displayCityText, subs);
      const cityHtml = buildLayout({
        title: seoCityTitle(region, district, displayCityText),
        description: seoCityDescription(region, district, displayCityText),
        heading: seoCityHeading(region, district, displayCityText),
        intro: seoCityIntro(region, district, displayCityText),
        linksHtml:
          cityLinks || `<a href="../index.html">메인 검색으로 이동</a>`,
        chipsHtml: chips,
        bodyText: cityBody.bodyText,
        bodyHtml: cityBody.bodyHtml,
        regionValue: region,
        districtValue: district,
        searchKeywordPrefix: displayCityText,
        regionsDataLiteral,
        hotDataLiteral,
        ogImageUrl: representativeOgImage(region, district),
        shopGridHtml: shopCardHtml.renderStaticShopGrid({
          region,
          district,
          categoryMode: 'outcall',
        }),
      });

      fs.writeFileSync(pagePath(region, district), cityHtml, 'utf8');
    });
  });

  console.log(`Generated static pages in: ${outDir}`);
}

main();
