const readFileSyncMock = jest.fn();

jest.mock('fs', () => ({
  readFileSync: (...args: unknown[]) => readFileSyncMock(...args),
}));

describe('sitemap', () => {
  beforeEach(() => {
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
    jest.resetModules();
  });

  test('includes the static routes and the generated item routes', async () => {
    const { default: sitemap } = await import('./sitemap');

    const routes = sitemap();
    expect(routes).toHaveLength(4);
    expect(routes.map((route) => route.url)).toEqual([
      'https://satis.cc',
      'https://satis.cc/calc',
      'https://satis.cc/calc/iron-ingot',
      'https://satis.cc/calc/iron-plate',
    ]);
  });
});
