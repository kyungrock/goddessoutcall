const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const BASE_URL = 'https://outcall.kr';
const STATIC_DIR = path.join(ROOT, 'static-pages');
const TODAY = new Date().toISOString().slice(0, 10);

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSitemap() {
  const urls = [];
  urls.push(`${BASE_URL}/`);

  const staticFiles = fs
    .readdirSync(STATIC_DIR)
    .filter((f) => f.toLowerCase().endsWith('.html'))
    .sort((a, b) => a.localeCompare(b, 'ko'));

  staticFiles.forEach((f) => {
    urls.push(`${BASE_URL}/static-pages/${encodeURI(f)}`);
  });

  const body = urls
    .map((u) => {
      return [
        '  <url>',
        `    <loc>${xmlEscape(u)}</loc>`,
        `    <lastmod>${TODAY}</lastmod>`,
        '    <changefreq>daily</changefreq>',
        '    <priority>0.8</priority>',
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    '</urlset>',
    '',
  ].join('\n');
}

function buildRobots() {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    'Sitemap: https://outcall.kr/sitemap.xml',
    '',
  ].join('\n');
}

function main() {
  const sitemapXml = buildSitemap();
  const robotsTxt = buildRobots();
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapXml, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robotsTxt, 'utf8');
  console.log('Generated sitemap.xml and robots.txt');
}

main();
