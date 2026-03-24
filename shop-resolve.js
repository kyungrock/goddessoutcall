/**
 * shop-card-data.js(카드) ↔ shops.json(상세) 연결
 * - 카드 id(숫자)와 shops id(문자열)가 달라서, 전화번호 → 지역+이름 순으로 매칭
 */
(function () {
  function findShopByCard(card, shopsArr) {
    if (!card || !shopsArr || !shopsArr.length) return null;
    if (card.phone) {
      const byPhone = shopsArr.find(function (s) { return s.phone === card.phone; });
      if (byPhone) return byPhone;
    }
    var region = (card.region || '').trim();
    var name = (card.name || '').trim();
    return (
      shopsArr.find(function (s) {
        return (s.region || '').trim() === region && (s.name || '').trim() === name;
      }) || null
    );
  }

  /** 카드에 images/ 경로가 있으면 우선 (로컬 이미지), 없으면 상세 이미지 */
  function resolveImage(card, shop) {
    var c = card && card.image;
    if (c && (/^images\//i.test(c) || /^\.\/images\//i.test(c))) return c;
    var s = shop && shop.image;
    if (s && !/^https?:\/\//i.test(String(s))) return s;
    return c || s || '';
  }

  window.shopResolve = {
    findShopByCard: findShopByCard,
    resolveImage: resolveImage,
  };
})();
