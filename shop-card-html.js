/**
 * 홈·정적 지역 페이지 공통: 업체 카드 HTML 생성 (소스보기 SEO)
 * - generate-index-shop-grid.js
 * - generate-static-pages.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname);

function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function findShopByCard(card, shopsArr) {
  if (!card || !shopsArr || !shopsArr.length) return null;
  if (card.phone) {
    const byPhone = shopsArr.find((x) => x.phone === card.phone);
    if (byPhone) return byPhone;
  }
  const region = (card.region || '').trim();
  const name = (card.name || '').trim();
  return (
    shopsArr.find(
      (x) => (x.region || '').trim() === region && (x.name || '').trim() === name
    ) || null
  );
}

function resolveImage(card, shop) {
  const c = card && card.image;
  if (c && (/^images\//i.test(c) || /^\.\/images\//i.test(c))) return c;
  const s = shop && shop.image;
  if (s && !/^https?:\/\//i.test(String(s))) return s;
  return c || s || '';
}

function cardImageSrc(item, shopsArr) {
  let shop = null;
  if (item._fromShopsJsonOnly) {
    shop = shopsArr.find((s) => String(s.id) === String(item.id));
  }
  if (!shop) shop = findShopByCard(item, shopsArr);
  return resolveImage(item, shop) || '';
}

/** static-pages/index 기준 이미지 경로 보정 */
function normalizeImageSrcForPage(src, prefix) {
  const p = prefix || '';
  const s = String(src || '');
  if (/^\.\/images\//i.test(s)) return p + s.slice(2);
  if (/^images\//i.test(s)) return p + s;
  return s;
}

function sortById(a, b) {
  return String(a.id).localeCompare(String(b.id), 'ko');
}

function buildAllShopCards(shopCardData, shopsArr) {
  const rawList = (shopCardData || []).slice();
  const usedShopIds = new Set();
  rawList.forEach((c) => {
    const sh = findShopByCard(c, shopsArr);
    if (sh && sh.id != null) usedShopIds.add(String(sh.id));
  });
  const shopOnlyRows = shopsArr
    .filter((s) => s && s.id != null && !usedShopIds.has(String(s.id)))
    .map((s) => ({
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
    }));

  const healingGroup = rawList.filter((s) => s.showHealingShop).sort(sortById);
  const normalGroup = rawList.filter((s) => !s.showHealingShop).sort(sortById);
  const shopOnlySorted = shopOnlyRows.sort(sortById);
  return [...healingGroup, ...normalGroup, ...shopOnlySorted];
}

function isOutcallItem(item) {
  const typeStr = (item.type || '').toString();
  if (/출장/i.test(typeStr)) return true;
  if (typeStr === '출장마사지') return true;
  const svcs = item.services || [];
  if (Array.isArray(svcs) && svcs.some((s) => /출장|홈타이|방문/i.test(String(s)))) return true;
  const blob = [item.name, item.description, item.greeting || ''].filter(Boolean).join(' ');
  if (/출장마사지|출장안마|홈타이|방문마사지/i.test(blob)) return true;
  return false;
}

function getListForCategory(all, categoryMode) {
  if (categoryMode === 'outcall') return all.filter(isOutcallItem);
  return all.filter((it) => !isOutcallItem(it));
}

function normalizeDistrictName(name) {
  return String(name || '')
    .replace(/\s+/g, '')
    .replace(/(시|군|구)$/, '');
}

function buildRegionMatchBlob(s) {
  const tags = Array.isArray(s.tags) ? s.tags.join(' ') : '';
  return [s.region, s.district, s.dong, s.address, s.detailAddress, s.description, tags]
    .filter(Boolean)
    .join(' ');
}

function itemMatchesSelectedRegion(s, selectedRegion) {
  if (!selectedRegion) return true;
  if (String(s.region || '').trim() === selectedRegion) return true;
  const blob = buildRegionMatchBlob(s);
  if (blob.indexOf(selectedRegion) !== -1) return true;
  return false;
}

function buildHay(s) {
  const tags = Array.isArray(s.tags) ? s.tags.join(' ') : '';
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

/**
 * generate-static-pages.js 인라인 handleSearch 와 동일 필터
 */
function filterShopListForPage(list, opts) {
  const categoryMode = opts.categoryMode || 'outcall';
  const selectedRegion = opts.selectedRegion || '';
  const selectedCity = opts.selectedCity || '';
  const selectedSub = opts.selectedSub || '';
  const tokens = (opts.tokens || []).map((t) => String(t).toLowerCase()).filter(Boolean);

  return list.filter((s) => {
    let ok = true;
    if (selectedRegion) ok = ok && itemMatchesSelectedRegion(s, selectedRegion);
    if (!(categoryMode === 'outcall' && selectedRegion)) {
      if (selectedCity) {
        ok = ok && normalizeDistrictName(s.district) === normalizeDistrictName(selectedCity);
      }
      if (selectedSub) ok = ok && String(s.dong || '').indexOf(selectedSub) !== -1;
    }
    if (tokens.length) {
      const hay = buildHay(s);
      ok = ok && tokens.every((t) => tokenMatchesHay(hay, t));
    }
    return ok;
  });
}

/**
 * @param {object} opts
 * @param {string} [opts.detailPrefix] '' = index, '../' = static-pages
 * @param {string} [opts.imagePrefix] '' = index, '../' = static-pages
 */
function buildCardArticleHtml(item, shopsArr, opts) {
  const detailPrefix = opts && opts.detailPrefix != null ? opts.detailPrefix : '';
  const imagePrefix = opts && opts.imagePrefix != null ? opts.imagePrefix : '';
  const id = String(item.id);
  const href = `${detailPrefix}shop-detail.html?id=${encodeURIComponent(id)}`;
  let src = cardImageSrc(item, shopsArr);
  src = normalizeImageSrcForPage(src, imagePrefix);
  const srcEsc = escAttr(src);
  const name = escHtml(item.name || '');
  const aria = escAttr((item.name || '업체') + ' 상세보기');
  const locationText = escHtml([item.region, item.district, item.dong].filter(Boolean).join(' '));
  const hoursText = escHtml(item.operatingHours || '상담 시 안내');
  const phoneText = escHtml(item.phone || '문의 시 안내');
  const priceText = escHtml(item.price || '가격 상담');
  const rating = escHtml((item.rating != null ? item.rating : '-').toString());
  const rc = item.reviewCount != null ? escHtml(String(item.reviewCount)) : escHtml('-');
  const greetRaw = String(item.greeting || item.description || '').trim();
  const greeting = escHtml(greetRaw.slice(0, 280) + (greetRaw.length > 280 ? '…' : ''));
  const tags = (item.services || [])
    .slice(0, 6)
    .map((svc) => `<span class="shop-card-tag">${escHtml(svc)}</span>`)
    .join('');
  const alt = escAttr(item.alt || item.name || '');

  return [
    `<article class="shop-card" data-id="${escAttr(id)}">`,
    `  <a href="${escAttr(href)}" aria-label="${aria}">`,
    '    <div class="shop-card-image">',
    `      <img src="${srcEsc}" alt="${alt}" loading="lazy" decoding="async" />`,
    '    </div>',
    '    <div class="shop-card-body">',
    '      <div class="shop-card-header">',
    `        <h2 class="shop-card-title">${name}</h2>`,
    `        <div class="shop-card-rating">★ ${rating} <span>(${rc})</span></div>`,
    '      </div>',
    '      <div class="shop-card-meta">',
    `        <span>📍 <span>${locationText}</span></span>`,
    `        <span>⏱ <span>${hoursText}</span></span>`,
    '      </div>',
    '      <div class="shop-card-price-row">',
    `        <span class="shop-card-price">${priceText}</span>`,
    `        <span class="shop-card-phone">${phoneText}</span>`,
    '      </div>',
    `      <p class="shop-card-greeting">${greeting}</p>`,
    `      <div class="shop-card-tags">${tags}</div>`,
    '      <div class="shop-card-footer">',
    '        <span class="shop-card-link">상세 보기 <span>↗</span></span>',
    '      </div>',
    '    </div>',
    '  </a>',
    '</article>',
  ].join('\n');
}

function loadShopCardData() {
  const code = fs.readFileSync(path.join(ROOT, 'shop-card-data.js'), 'utf8');
  const ctx = { window: {} };
  vm.runInNewContext(code, ctx);
  return ctx.window.shopCardData || [];
}

function loadShopsData() {
  let raw = fs.readFileSync(path.join(ROOT, 'shops.json'), 'utf8');
  raw = raw.replace(/^\s*window\.shopsData\s*=\s*/, '').replace(/;\s*$/, '');
  return JSON.parse(raw);
}

let _cache = null;
function getShopDataCached() {
  if (!_cache) {
    _cache = {
      shopCardData: loadShopCardData(),
      shopsData: loadShopsData(),
      allMerged: null,
    };
    _cache.allMerged = buildAllShopCards(_cache.shopCardData, _cache.shopsData.shops || []);
  }
  return _cache;
}

/**
 * @param {{ region: string, district?: string, categoryMode?: 'outcall'|'shop' }} pageOpts
 */
function renderStaticShopGrid(pageOpts) {
  const { allMerged, shopsData } = getShopDataCached();
  const shopsArr = shopsData.shops || [];
  const categoryMode = pageOpts.categoryMode || 'outcall';
  const list = getListForCategory(allMerged, categoryMode);
  const filtered = filterShopListForPage(list, {
    categoryMode,
    selectedRegion: pageOpts.region || '',
    selectedCity: pageOpts.district || '',
    selectedSub: '',
    tokens: [],
  });
  return filtered.map((item) =>
    buildCardArticleHtml(item, shopsArr, { detailPrefix: '../', imagePrefix: '../' })
  ).join('\n');
}

function renderIndexShopGrid() {
  const { allMerged, shopsData } = getShopDataCached();
  const shopsArr = shopsData.shops || [];
  const list = getListForCategory(allMerged, 'outcall');
  return list.map((item) => buildCardArticleHtml(item, shopsArr, { detailPrefix: '', imagePrefix: '' })).join('\n');
}

function clearCache() {
  _cache = null;
}

module.exports = {
  escHtml,
  escAttr,
  loadShopCardData,
  loadShopsData,
  buildAllShopCards,
  isOutcallItem,
  getListForCategory,
  filterShopListForPage,
  normalizeDistrictName,
  buildCardArticleHtml,
  renderStaticShopGrid,
  renderIndexShopGrid,
  clearCache,
  cardImageSrc,
  normalizeImageSrcForPage,
};
