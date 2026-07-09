import fs from 'fs';
import path from 'path';
import { describe, expect, it } from '@jest/globals';

const publicDir = path.join(process.cwd(), 'public');

describe('static seo files', () => {
  it('serves a static robots.txt that points to the sitemap', () => {
    const robotsTxt = fs.readFileSync(path.join(publicDir, 'robots.txt'), 'utf-8');

    expect(robotsTxt.trim()).toBe(`User-Agent: *
Allow: /

Sitemap: https://satis.cc/sitemap.xml`);
  });

  it('serves a static sitemap.xml with satis.cc urls', () => {
    const sitemapXml = fs.readFileSync(path.join(publicDir, 'sitemap.xml'), 'utf-8');

    expect(sitemapXml).toContain('<loc>https://satis.cc</loc>');
    expect(sitemapXml).toContain('<loc>https://satis.cc/calc/cement</loc>');
    expect(sitemapXml).toContain('<loc>https://satis.cc/calc/hazmat-filter</loc>');
    expect(sitemapXml).toContain('<loc>https://satis.cc/calc/rebar-explosive</loc>');
    expect(sitemapXml).not.toContain('<loc>https://satis.cc/calc</loc>');
    expect(sitemapXml).not.toContain('<loc>https://satis.cc/calc/concrete</loc>');
    expect(sitemapXml).not.toContain('<loc>https://satis.cc/calc/iodine-infused-filter</loc>');
    expect(sitemapXml).not.toContain('<loc>https://satis.cc/calc/rebar_explosive</loc>');
    expect(sitemapXml).not.toContain('vercel.app');
    expect(sitemapXml).not.toContain('satisfactory-calc');
  });
});
