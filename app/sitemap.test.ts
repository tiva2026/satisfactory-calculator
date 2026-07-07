const readFileSyncMock = jest.fn();

jest.mock('fs', () => ({
  readFileSync: (...args: unknown[]) => readFileSyncMock(...args),
}));

describe('sitemap', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    readFileSyncMock.mockReset();
    readFileSyncMock.mockReturnValue(
      JSON.stringify([
        {
          Classes: [
            { ClassName: 'Desc_IronIngot_C', mDisplayName: 'Iron Ingot' },
            { ClassName: 'Recipe_IngotIron_C', mDisplayName: 'Iron Ingot' },
            { ClassName: 'Desc_IronPlate_C', mDisplayName: 'Iron Plate' },
          ],
        },
      ])
    );
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    jest.resetModules();
  });

  test('includes the static routes and the generated item routes', async () => {
    const { default: sitemap } = await import('./sitemap');

    const routes = sitemap();
    expect(routes).toHaveLength(4);
    expect(routes.map((route) => route.url)).toEqual([
      'https://example.com',
      'https://example.com/calc',
      'https://example.com/calc/iron-ingot',
      'https://example.com/calc/iron-plate',
    ]);
  });
});
