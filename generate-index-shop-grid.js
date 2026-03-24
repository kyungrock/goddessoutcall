/**
 * index.html 의 #shop-card-grid 안에 업체 카드 정적 HTML 삽입 (소스보기 SEO)
 * 마크업 규칙: shop-card-html.js
 * 실행: node generate-index-shop-grid.js
 */
const fs = require('fs');
const path = require('path');
const shopCardHtml = require('./shop-card-html.js');

const INDEX = path.join(__dirname, 'index.html');

function main() {
  shopCardHtml.clearCache();
  const fragment = shopCardHtml.renderIndexShopGrid();
  const count = (fragment.match(/<article class="shop-card"/g) || []).length;

  const begin = '<!-- AUTO_SHOP_GRID_BEGIN -->';
  const end = '<!-- AUTO_SHOP_GRID_END -->';
  let html = fs.readFileSync(INDEX, 'utf8');
  const re = new RegExp(begin + '[\\s\\S]*?' + end, 'm');
  if (!re.test(html)) {
    console.error('index.html 에', begin, '…', end, ' 마커가 없습니다.');
    process.exit(1);
  }
  html = html.replace(re, `${begin}\n${fragment}\n${end}`);
  fs.writeFileSync(INDEX, html, 'utf8');
  console.log(`OK: index.html 업체 카드 ${count}건 (출장마사지 기준) 정적 삽입 완료.`);
}

main();
