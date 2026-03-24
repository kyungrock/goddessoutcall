const fs = require('fs');
const path = require('path');
const shopCardHtml = require('./shop-card-html.js');

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'static-pages');
const REGIONS_DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'korea-regions.json'), 'utf8'));
const DISTRICT_DUP_COUNT = (() => {
  const map = new Map();
  const rows = Array.isArray(REGIONS_DATA.regions) ? REGIONS_DATA.regions : [];
  rows.forEach((r) => {
    const districts = Array.isArray(r.districts) ? r.districts : [];
    districts.forEach((d) => {
      const key = String(d || '').trim();
      if (!key) return;
      map.set(key, (map.get(key) || 0) + 1);
    });
  });
  return map;
})();

function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function safeText(value, fallback = '') {
  const v = String(value ?? '').trim();
  return v || fallback;
}

function firstNonEmpty(...vals) {
  for (const v of vals) {
    if (v == null) continue;
    if (typeof v === 'string') {
      if (v.trim()) return v;
      continue;
    }
    return v;
  }
  return '';
}

function mergeArray(a, b) {
  const arr = []
    .concat(Array.isArray(a) ? a : [])
    .concat(Array.isArray(b) ? b : []);
  const seen = new Set();
  const out = [];
  arr.forEach((x) => {
    const k = typeof x === 'string' ? x.trim() : JSON.stringify(x || {});
    if (!k || seen.has(k)) return;
    seen.add(k);
    out.push(x);
  });
  return out;
}

function pageFileName(region, district) {
  const r = String(region || '').trim();
  const d = String(district || '').trim();
  if (d) return `${r}--${d}.html`;
  return `${r}.html`;
}

function districtLinkLabel(regionName, districtName) {
  const region = String(regionName || '').trim();
  const district = String(districtName || '').trim();
  if (!district) return `${region}출장마사지`;
  const dup = DISTRICT_DUP_COUNT.get(district) || 0;
  return dup > 1 ? `${region}${district}출장마사지` : `${district}출장마사지`;
}

function buildQuickLinksHtml(shop) {
  const regionRows = Array.isArray(REGIONS_DATA.regions) ? REGIONS_DATA.regions : [];
  const validRegionNames = regionRows.map((r) => String(r.name || '').trim()).filter(Boolean);
  const aliasMap = {
    서울특별시: '서울',
    부산광역시: '부산',
    대구광역시: '대구',
    인천광역시: '인천',
    광주광역시: '광주',
    대전광역시: '대전',
    울산광역시: '울산',
    세종특별자치시: '세종',
    경기도: '경기',
    강원도: '강원',
    충청북도: '충북',
    충청남도: '충남',
    전라북도: '전북',
    전북특별자치도: '전북',
    전라남도: '전남',
    경상북도: '경북',
    경상남도: '경남',
    제주도: '제주',
    제주특별자치도: '제주',
  };
  const blobRaw = [
    safeText(shop && shop.region, ''),
    safeText(shop && shop.district, ''),
    safeText(shop && shop.dong, ''),
    safeText(shop && shop.address, ''),
    safeText(shop && shop.detailAddress, ''),
    safeText(shop && shop.description, ''),
  ]
    .join(' ')
    .replace(/\s+/g, ' ');
  const blob = Object.keys(aliasMap).reduce(
    (acc, longName) => acc.replaceAll(longName, aliasMap[longName]),
    blobRaw
  );
  const targets = validRegionNames.filter((name) => blob.includes(name));
  if (shop && validRegionNames.includes(String(shop.region || '').trim()) && !targets.includes(String(shop.region || '').trim())) {
    targets.unshift(String(shop.region || '').trim());
  }
  const finalTargets = targets.length ? targets.slice(0, 4) : ['서울', '경기', '인천'];
  return finalTargets
    .map((regionName) => {
      const row = regionRows.find((r) => String(r.name || '').trim() === regionName);
      const districts = row && Array.isArray(row.districts) ? row.districts : [];
      const regionLink = `<a href="${escHtml(pageFileName(regionName, ''))}">${escHtml(regionName)}출장마사지</a>`;
      const districtLinks = districts
        .map((d) => `<a href="${escHtml(pageFileName(regionName, d))}">${escHtml(districtLinkLabel(regionName, d))}</a>`)
        .join('');
      return `<section class="quick-link-group"><h3>${escHtml(regionName)} 바로가기</h3><div class="quick-link-list">${regionLink}${districtLinks}</div></section>`;
    })
    .join('');
}

function findBestShopDetail(base, shopsArr) {
  const id = String(base.id || '');
  const phone = String(base.phone || '').trim();
  const name = String(base.name || '').trim();
  const region = String(base.region || '').trim();
  const district = String(base.district || '').trim();

  let matched = null;
  if (id) {
    matched = shopsArr.find((s) => String(s.id) === id) || null;
  }
  if (!matched && phone) {
    matched = shopsArr.find((s) => String(s.phone || '').trim() === phone) || null;
  }
  if (!matched && name && region) {
    matched =
      shopsArr.find(
        (s) =>
          String(s.name || '').trim() === name &&
          String(s.region || '').trim() === region &&
          (!district || String(s.district || '').trim() === district)
      ) || null;
  }
  return matched;
}

function enrichShop(base, detail) {
  const merged = { ...base, ...(detail || {}) };
  merged.id = firstNonEmpty(base.id, detail && detail.id);
  merged.name = firstNonEmpty(detail && detail.name, base.name, '업체');
  merged.region = firstNonEmpty(detail && detail.region, base.region);
  merged.district = firstNonEmpty(detail && detail.district, base.district);
  merged.dong = firstNonEmpty(base.dong, detail && detail.dong);
  merged.address = firstNonEmpty(detail && detail.address, base.address);
  merged.detailAddress = firstNonEmpty(detail && detail.detailAddress, base.detailAddress);
  merged.phone = firstNonEmpty(detail && detail.phone, base.phone);
  merged.operatingHours = firstNonEmpty(detail && detail.operatingHours, base.operatingHours);
  merged.price = firstNonEmpty(detail && detail.price, base.price);
  merged.description = firstNonEmpty(detail && detail.description, base.description);
  merged.image = firstNonEmpty(base.image, detail && detail.image);
  merged.alt = firstNonEmpty(base.alt, detail && detail.name, base.name);
  merged.services = mergeArray(detail && detail.services, base.services);
  merged.tags = mergeArray(base.tags, detail && detail.tags);
  merged.courses = Array.isArray(detail && detail.courses) ? detail.courses : [];
  merged.reviews = mergeArray(base.reviews, detail && detail.reviews);
  merged.rating = firstNonEmpty(detail && detail.rating, base.rating, '-');
  merged.reviewCount = firstNonEmpty(detail && detail.reviewCount, base.reviewCount, merged.reviews.length || 0);
  return merged;
}

function htmlForShop(shop) {
  const id = String(shop.id);
  const title = `${safeText(shop.region)} ${safeText(shop.district)} ${safeText(shop.name)} 출장마사지 | 업체 상세`;
  const desc = safeText(
    shop.description,
    `${safeText(shop.region)} ${safeText(shop.district)} ${safeText(shop.name)} 업체 상세 페이지입니다.`
  ).slice(0, 150);
  const location = [shop.region, shop.district, shop.dong].filter(Boolean).join(' · ');
  const address = safeText(shop.address, '');
  const addressDetail = safeText(shop.detailAddress, '');
  const fullAddress = [address, addressDetail].filter(Boolean).join(' · ');
  const phoneRaw = safeText(shop.phone, '');
  const phoneDial = phoneRaw.replace(/[^0-9+]/g, '');
  const img = shop.image || '';
  const services = Array.isArray(shop.services) ? shop.services : [];
  const tags = Array.isArray(shop.tags) ? shop.tags : [];
  const staffInfo = safeText(shop.staffInfo, '');
  const reviews = Array.isArray(shop.reviews) ? shop.reviews : [];
  const courses = Array.isArray(shop.courses) ? shop.courses : [];
  const shopFile = shopCardHtml.shopDetailFileName(id);
  const quickLinksHtml = buildQuickLinksHtml(shop);

  const serviceHtml = services.length
    ? services.map((x) => `<span class="tag">${escHtml(x)}</span>`).join('')
    : '<span class="tag">상담 후 안내</span>';

  const courseHtml = courses.length
    ? courses
        .map((c) => {
          const items = Array.isArray(c.items) ? c.items : [];
          const head = `<div class="course-head"><span>코스</span><span>시간</span><span>요금</span></div>`;
          const itemRows = items
            .map(
              (it) =>
                `<div class="course-row">
                  <span class="course-name">${escHtml(it.name || '코스')}</span>
                  <span class="course-time">${escHtml(it.duration || '시간 상담')}</span>
                  <span class="course-price">${escHtml(it.price || '가격 상담')}</span>
                  ${it.description ? `<div class="course-desc">${escHtml(it.description)}</div>` : ''}
                </div>`
            )
            .join('');
          return `<div class="box"><h3>${escHtml(c.category || '프로그램')}</h3>${head}${itemRows}</div>`;
        })
        .join('')
    : '<div class="box"><h3>프로그램</h3><div class="row">상담 후 맞춤 안내</div></div>';

  const reviewHtml = reviews.length
    ? reviews
        .slice(0, 8)
        .map((r) => {
          const author = r.author || r.name || '이용자';
          return `<div class="review"><div class="meta">${escHtml(author)} · ★ ${escHtml(
            r.rating ?? '-'
          )} · ${escHtml(r.date || '')}</div><div>${escHtml(r.review || r.comment || '')}</div></div>`;
        })
        .join('')
    : '<div class="review"><div class="meta">리뷰</div><div>등록된 리뷰가 없습니다.</div></div>';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(title)}</title>
  <meta name="description" content="${escHtml(desc)}" />
  <meta name="google-site-verification" content="XFm21TyCnCjA4dHXag5jR63WrpmMh6DUPGM9lY4-Et8" />
  <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
  <meta name="theme-color" content="#020617" />
  <link rel="canonical" href="https://outcall.kr/static-pages/${escHtml(shopFile)}" />
  <meta property="og:locale" content="ko_KR" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="여신 출장마사지 전국 검색" />
  <meta property="og:title" content="${escHtml(title)}" />
  <meta property="og:description" content="${escHtml(desc)}" />
  <meta property="og:url" content="https://outcall.kr/static-pages/${escHtml(shopFile)}" />
  <meta property="og:image" content="https://outcall.kr/${escHtml(shopCardHtml.normalizeImageSrcForPage(img, ''))}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escHtml(title)}" />
  <meta name="twitter:description" content="${escHtml(desc)}" />
  <meta name="twitter:image" content="https://outcall.kr/${escHtml(shopCardHtml.normalizeImageSrcForPage(img, ''))}" />
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: shop.name || '업체',
    telephone: phoneRaw || undefined,
    address: fullAddress || undefined,
    areaServed: location || undefined,
    openingHours: shop.operatingHours || undefined,
    priceRange: shop.price || undefined,
    image: img ? `https://outcall.kr/${shopCardHtml.normalizeImageSrcForPage(img, '')}` : undefined,
    url: `https://outcall.kr/static-pages/${shopFile}`,
    description: safeText(shop.description, ''),
    aggregateRating: shop.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: String(shop.rating),
          reviewCount: String(shop.reviewCount || reviews.length || 0),
        }
      : undefined,
  })}</script>
  <style>
    :root{--text:#e5e7eb;--soft:#9ca3af;--line:#1f2933}
    *{box-sizing:border-box} body{margin:0;background:#020617;color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Pretendard",system-ui,sans-serif}
    .page{max-width:940px;margin:0 auto;padding:20px 14px 96px}
    .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
    .back{font-size:12px;color:var(--soft);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:4px 10px}
    .card{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:rgba(15,23,42,.9)}
    .hero{width:100%;aspect-ratio:16/8;background:#0f172a}
    .hero img{width:100%;height:100%;object-fit:cover;display:block}
    .inner{padding:14px}
    h1{margin:0 0 6px;font-size:22px} .loc{font-size:13px;color:var(--soft);margin-bottom:8px}
    .meta{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}.pill{font-size:11px;border:1px solid #334155;border-radius:999px;padding:3px 8px;color:var(--soft)}
    .summary{font-size:13px;line-height:1.75;color:var(--soft)}
    .info-grid{display:grid;grid-template-columns:110px 1fr;gap:6px 10px;margin-top:12px}
    .info-grid .k{font-size:12px;color:#94a3b8}
    .info-grid .v{font-size:12px;color:#d1d5db;line-height:1.55}
    h2{margin:16px 0 8px;font-size:15px}
    .tags{display:flex;flex-wrap:wrap;gap:6px}.tag{font-size:10px;border:1px solid #334155;border-radius:999px;padding:2px 8px;color:var(--soft)}
    .box{border:1px solid #334155;border-radius:12px;padding:12px;margin-bottom:10px;background:rgba(2,6,23,.45)}
    .box h3{margin:0 0 8px;font-size:13px;color:#c7d2fe}
    .course-head{display:grid;grid-template-columns:1fr 90px 110px;gap:8px;font-size:11px;color:#94a3b8;padding:0 6px 6px}
    .course-row{display:grid;grid-template-columns:1fr 90px 110px;gap:8px;align-items:center;padding:10px 8px;border:1px solid rgba(71,85,105,.7);border-radius:10px;background:rgba(15,23,42,.55);margin-bottom:8px}
    .course-name{font-size:13px;font-weight:700;color:#e5e7eb}
    .course-time{font-size:12px;color:#93c5fd;white-space:nowrap}
    .course-price{font-size:18px;font-weight:900;color:#fef08a;letter-spacing:.2px;text-align:right;white-space:nowrap}
    .course-desc{grid-column:1 / -1;margin-top:2px;font-size:12px;line-height:1.55;color:var(--soft)}
    .review{border:1px solid #334155;border-radius:10px;padding:10px;margin-bottom:8px;font-size:12px;line-height:1.6;color:var(--soft)}
    .review .meta{margin:0 0 4px;font-size:11px}
    .quick-links-wrap{margin-top:16px;padding:12px;border:1px solid #334155;border-radius:12px;background:rgba(2,6,23,.45)}
    .quick-links-wrap h2{margin:0 0 10px}
    .quick-link-group{margin-bottom:10px}
    .quick-link-group:last-child{margin-bottom:0}
    .quick-link-group h3{margin:0 0 8px;font-size:12px;color:#93c5fd}
    .quick-link-list{display:flex;flex-wrap:wrap;gap:6px}
    .quick-link-list a{font-size:11px;color:#dbeafe;border:1px solid #334155;border-radius:999px;padding:4px 9px;text-decoration:none;background:rgba(15,23,42,.55)}
    .quick-link-list a:hover{border-color:#60a5fa;color:#fff}
    .chip-section{order:5}
    .program-section{order:3}
    .staff-section{order:4}
    .desc-section{order:6}
    .review-section{order:7}
    .staff-card{
      border:1px solid rgba(56,189,248,.35);
      background:linear-gradient(135deg, rgba(56,189,248,.12), rgba(30,41,59,.5));
      border-radius:12px;
      padding:12px;
    }
    .staff-card .label{
      font-size:11px;
      color:#7dd3fc;
      margin-bottom:6px;
      font-weight:700;
      letter-spacing:.2px;
    }
    .staff-card .text{
      font-size:13px;
      line-height:1.7;
      color:#dbeafe;
    }
    .floating-call{
      position:fixed;left:50%;transform:translateX(-50%);bottom:14px;z-index:50;
      width:min(920px,calc(100% - 20px));
    }
    .floating-call a{
      display:flex;align-items:center;justify-content:center;height:52px;
      border-radius:12px;text-decoration:none;background:#22c55e;color:#022c22;
      font-size:18px;font-weight:900;border:1px solid rgba(34,197,94,.45);
      box-shadow:0 12px 30px rgba(2,6,23,.45);
    }
    @media (max-width: 820px){
      .page{padding-bottom:108px}
      .chip-section{order:6}
      .program-section{order:4}
      .staff-section{order:5}
      .desc-section{order:7}
      .review-section{order:8}
      .floating-call a{height:50px;font-size:17px}
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="top">
      <div>업체 상세</div>
      <a class="back" href="../index.html">메인으로</a>
    </div>
    <article class="card">
      <div class="hero">${img ? `<img src="${escHtml(shopCardHtml.normalizeImageSrcForPage(img, '../'))}" alt="${escHtml(shop.alt || shop.name || '')}" loading="eager" />` : ''}</div>
      <div class="inner">
        <h1>${escHtml(shop.name || '업체')}</h1>
        <div class="loc">${escHtml(location || shop.address || '')}</div>
        <div class="meta">
          <span class="pill">★ ${escHtml(shop.rating ?? '-')}</span>
          <span class="pill">리뷰 ${escHtml(shop.reviewCount ?? 0)}개</span>
          <span class="pill">${escHtml(safeText(shop.operatingHours, '운영시간 상담'))}</span>
          <span class="pill">${escHtml(safeText(shop.phone, '전화 상담'))}</span>
          <span class="pill">${escHtml(safeText(shop.price, '가격 상담'))}</span>
        </div>
        <div class="info-grid">
          <div class="k">전화번호</div><div class="v">${escHtml(safeText(shop.phone, '상담 후 안내'))}</div>
          <div class="k">운영시간</div><div class="v">${escHtml(safeText(shop.operatingHours, '상담 후 안내'))}</div>
          <div class="k">주소</div><div class="v">${escHtml(safeText(address, '상담 후 안내'))}</div>
          <div class="k">위치</div><div class="v">${escHtml(safeText(addressDetail || location, '상담 후 안내'))}</div>
          <div class="k">가격</div><div class="v">${escHtml(safeText(shop.price, '상담 후 안내'))}</div>
        </div>
        <div class="program-section">
          <h2>프로그램</h2>
          ${courseHtml}
        </div>
        <div class="staff-section">
          <h2>관리사 정보</h2>
          <div class="staff-card">
            <div class="label">STAFF INFO</div>
            <div class="text">${escHtml(staffInfo || '관리사 정보는 전화 상담 시 상세 안내됩니다.')}</div>
          </div>
        </div>
        <div class="desc-section">
          <h2>업체 설명</h2>
          <div class="summary">${escHtml(safeText(shop.description, '상세 소개는 전화 상담으로 안내드립니다.'))}</div>
        </div>
        <div class="chip-section">
          <h2>서비스</h2>
          <div class="tags">${serviceHtml}</div>
          ${tags.length ? `<h2>태그</h2><div class="tags">${tags.map((t) => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>` : ''}
        </div>
        <div class="review-section">
          <h2>이용 후기</h2>
          ${reviewHtml}
        </div>
        <section class="quick-links-wrap">
          <h2>바로가기 링크</h2>
          ${quickLinksHtml}
        </section>
      </div>
    </article>
    ${
      phoneDial
        ? `<div class="floating-call"><a href="tel:${escHtml(phoneDial)}">전화하기</a></div>`
        : ''
    }
  </div>
</body>
</html>`;
}

function main() {
  shopCardHtml.clearCache();
  const { allMerged, shops } = (() => {
    const card = shopCardHtml.loadShopCardData();
    const shops = shopCardHtml.loadShopsData().shops || [];
    return { allMerged: shopCardHtml.buildAllShopCards(card, shops), shops };
  })();

  fs.mkdirSync(OUT_DIR, { recursive: true });
  allMerged.forEach((shop) => {
    const detail = findBestShopDetail(shop, shops);
    const enriched = enrichShop(shop, detail);
    const filename = shopCardHtml.shopDetailFileName(enriched.id);
    fs.writeFileSync(path.join(OUT_DIR, filename), htmlForShop(enriched), 'utf8');
  });
  console.log(`Generated static detail pages: ${allMerged.length}`);
}

main();
