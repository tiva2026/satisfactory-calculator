jest.mock('./calc/[itemSlug]/calculator-client', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) =>
    ({ type: 'mock-calculator-client', props } as any),
}));

jest.mock('@/src/lib/calculator-page-data', () => ({
  loadCalculatorPageData: () => ({
    items: [
      { ClassName: 'Desc_IronIngot_C', mDisplayName: 'Iron Ingot' },
      { ClassName: 'Desc_CopperIngot_C', mDisplayName: 'Copper Ingot' },
      { ClassName: 'Desc_Concrete_C', mDisplayName: 'Concrete' },
    ],
    recipesData: {},
    itemNamesData: {},
  }),
  getFeaturedCalculatorItems: () => ([
    { ClassName: 'Desc_IronIngot_C', mDisplayName: 'Iron Ingot' },
    { ClassName: 'Desc_CopperIngot_C', mDisplayName: 'Copper Ingot' },
    { ClassName: 'Desc_Concrete_C', mDisplayName: 'Concrete' },
  ]),
}));

describe('HomePage', () => {
  test('renders the standalone calculator dashboard on the root route', async () => {
    const { default: HomePage } = await import('./page');

    const element = HomePage() as any;

    expect(element.props.mode).toBe('home');
    expect(element.props.featuredItems).toHaveLength(3);
    expect(element.props.featuredItems.map((item: { mDisplayName: string }) => item.mDisplayName)).toEqual([
      'Iron Ingot',
      'Copper Ingot',
      'Concrete',
    ]);
  });
});
