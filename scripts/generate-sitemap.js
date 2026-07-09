const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://satis.cc';

function itemClassToSlug(itemClass) {
  return itemClass
    .replace(/^Desc_/, '')
    .replace(/_C$/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getSelectableItems() {
  const dataPath = path.join(process.cwd(), 'en-US.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const classes = data.flatMap((entry) => (Array.isArray(entry.Classes) ? entry.Classes : []));

  return classes.filter(
    (item) => item.ClassName?.startsWith('Desc_') && item.mDisplayName && item.mDisplayName.trim()
  );
}

function renderUrl(loc, changefreq, priority, lastmod) {
  return [
    '<url>',
    `<loc>${escapeXml(loc)}</loc>`,
    `<lastmod>${lastmod}</lastmod>`,
    `<changefreq>${changefreq}</changefreq>`,
    `<priority>${priority}</priority>`,
    '</url>',
  ].join('\n');
}

function generateSitemap() {
  const lastmod = new Date().toISOString();
  const urls = [
    renderUrl(SITE_URL, 'weekly', '1', lastmod),
    renderUrl(`${SITE_URL}/calc`, 'weekly', '0.9', lastmod),
    ...getSelectableItems().map((item) =>
      renderUrl(`${SITE_URL}/calc/${itemClassToSlug(item.ClassName)}`, 'monthly', '0.7', lastmod)
    ),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

fs.mkdirSync(path.join(process.cwd(), 'public'), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), generateSitemap(), 'utf8');
