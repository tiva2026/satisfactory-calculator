import type { Metadata } from 'next';

var readFileSyncMock = jest.fn();
var notFoundMock = jest.fn(() => {
  throw new Error('NOT_FOUND');
});

jest.mock('fs', () => ({
  readFileSync: (...args: unknown[]) => readFileSyncMock(...args),
}));

jest.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

jest.mock('./calculator-client', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) =>
    ({ type: 'mock-calculator-client', props } as any),
}));

const loadPageModule = async () => import('./page');

describe('calc item page', () => {
  const itemDatabase = JSON.stringify([
    {
      Classes: [
        { ClassName: 'Desc_IronIngot_C', mDisplayName: 'Iron Ingot' },
        { ClassName: 'Recipe_IngotIron_C', mDisplayName: 'Iron Ingot' },
        { ClassName: 'Desc_IronPlate_C', mDisplayName: 'Iron Plate' },
        { ClassName: 'Build_SmelterMk1_C', mDisplayName: 'Smelter Mk.1' },
      ],
    },
  ]);

  beforeEach(() => {
    jest.clearAllMocks();
    readFileSyncMock.mockImplementation(() => itemDatabase);
  });

  test('generateStaticParams only emits selectable Desc_ item routes', async () => {
    const { generateStaticParams } = await loadPageModule();

    const params = await generateStaticParams();

    expect(params).toEqual([
      { itemSlug: 'iron-ingot' },
      { itemSlug: 'iron-plate' },
    ]);
  });

  test('generateMetadata uses the item display name for route metadata', async () => {
    const { generateMetadata } = await loadPageModule();

    const metadata = (await generateMetadata({
      params: Promise.resolve({ itemSlug: 'iron-ingot' }),
    })) as Metadata;

    expect(metadata.title).toBe('Iron Ingot Production Calculator | Satisfactory');
    expect(metadata.description).toContain('Iron Ingot');
  });

  test('CalcItemPage passes the slug to CalculatorClient for valid item routes', async () => {
    const { default: CalcItemPage } = await loadPageModule();

    const element = await CalcItemPage({
      params: Promise.resolve({ itemSlug: 'iron-ingot' }),
    });

    expect(element.props.initialItemSlug).toBe('iron-ingot');
    expect(element.props.itemDb.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ClassName: 'Desc_IronIngot_C' }),
      ])
    );
  });

  test('CalcItemPage returns not found for invalid slugs', async () => {
    const { default: CalcItemPage } = await loadPageModule();

    await expect(
      CalcItemPage({
        params: Promise.resolve({ itemSlug: 'missing-item' }),
      })
    ).rejects.toThrow('NOT_FOUND');
  });
});
