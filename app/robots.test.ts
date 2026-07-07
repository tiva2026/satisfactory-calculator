import { describe, expect, it } from '@jest/globals';

describe('robots', () => {
  it('exposes the sitemap and allows crawling', async () => {
    const { default: robots } = await import('./robots');

    expect(robots()).toEqual({
      rules: [
        {
          userAgent: '*',
          allow: '/',
        },
      ],
      sitemap: 'https://satis.cc/sitemap.xml',
      host: 'https://satis.cc',
    });
  });
});
