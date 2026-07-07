/**
 * @jest-environment jsdom
 */

import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

var pushMock = jest.fn();
var mockCalculateFullProductionTree = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock('@/src/lib/production-calculator', () => ({
  calculateFullProductionTree: (...args: unknown[]) => mockCalculateFullProductionTree(...args),
}));

const fakeResult = {
  rootNode: {
    itemClass: 'Desc_IronIngot_C',
    itemName: 'Iron Ingot',
    targetRate: 10,
    recipe: {
      producedIn: ['SmelterMk1'],
      ingredients: [],
      products: [{ ItemClass: 'Desc_IronIngot_C', Amount: 1 }],
      duration: 2,
    },
    buildingCount: 1,
    actualRate: 10,
    children: [],
    depth: 0,
  },
  totalBuildings: {
    SmelterMk1: 1,
  },
  rawResources: {
    Desc_OreIron_C: {
      itemName: 'Iron Ore',
      totalRate: 10,
      isRawResource: true,
    },
  },
  allResources: {
    Desc_OreIron_C: {
      itemName: 'Iron Ore',
      totalRate: 10,
      isRawResource: true,
    },
  },
  totalPower: 4,
};

const loadCalculatorClient = async () => (await import('./calculator-client')).default;

describe('CalculatorClient', () => {
  const items = [
    { ClassName: 'Desc_IronIngot_C', mDisplayName: 'Iron Ingot' },
    { ClassName: 'Desc_IronPlate_C', mDisplayName: 'Iron Plate' },
  ];

  const recipesData = {
    Recipe_IngotIron_C: {
      className: 'Recipe_IngotIron_C',
      displayName: 'Iron Ingot',
      ingredients: [],
      products: [{ ItemClass: 'Desc_IronIngot_C', Amount: 1 }],
      duration: 2,
      producedIn: ['SmelterMk1'],
    },
  };

  const itemNamesData = {
    Desc_IronIngot_C: 'Iron Ingot',
    Desc_IronPlate_C: 'Iron Plate',
  };

  beforeEach(() => {
    pushMock.mockClear();
    mockCalculateFullProductionTree.mockReset().mockReturnValue(fakeResult);
  });

  test('auto-selects the initial slug and triggers calculation with the class-based route', async () => {
    const CalculatorClient = await loadCalculatorClient();

    render(
      <CalculatorClient
        itemDb={{ items }}
        initialItemSlug="iron-ingot"
        recipesData={recipesData}
        itemNamesData={itemNamesData}
      />
    );

    await waitFor(() => {
      expect(mockCalculateFullProductionTree).toHaveBeenCalledWith(
        'Desc_IronIngot_C',
        10,
        expect.any(Map),
        expect.any(Map)
      );
    });

    expect(screen.queryByText('Desc_IronIngot_C')).toBeNull();
    expect(within(screen.getByTestId('selected-item')).getByText('Iron Ingot')).toBeTruthy();
    expect(screen.queryByText('Advertisement')).toBeNull();
    expect(screen.queryByText(/Google AdSense/i)).toBeNull();
  });

  test('pushes the item class slug when a search result is selected', async () => {
    const CalculatorClient = await loadCalculatorClient();

    render(
      <CalculatorClient
        itemDb={{ items }}
        initialItemSlug="iron-ingot"
        recipesData={recipesData}
        itemNamesData={itemNamesData}
      />
    );

    fireEvent.change(screen.getByLabelText('Search Item'), {
      target: { value: 'Plate' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Iron Plate/ }));

    expect(pushMock).toHaveBeenCalledWith('/calc/iron-plate');
  });

  test('rejects invalid quantities without calling the calculator', async () => {
    const CalculatorClient = await loadCalculatorClient();
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => undefined);

    render(
      <CalculatorClient
        itemDb={{ items }}
        initialItemSlug="iron-ingot"
        recipesData={recipesData}
        itemNamesData={itemNamesData}
      />
    );

    const callsBefore = mockCalculateFullProductionTree.mock.calls.length;

    fireEvent.change(screen.getByLabelText('Target Rate'), {
      target: { value: '0' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));

    expect(alertMock).toHaveBeenCalledWith('Please enter a valid quantity');
    expect(mockCalculateFullProductionTree.mock.calls.length).toBe(callsBefore);

    alertMock.mockRestore();
  });

  test('renders summary cards before the production pipeline and strips Mk1 from building names', async () => {
    const CalculatorClient = await loadCalculatorClient();

    render(
      <CalculatorClient
        itemDb={{ items }}
        initialItemSlug="iron-ingot"
        recipesData={recipesData}
        itemNamesData={itemNamesData}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('calculation-result')).toBeTruthy();
    });

    const result = screen.getByTestId('calculation-result');
    const orderedCards = Array.from(
      result.querySelectorAll(
        '[data-testid="raw-resources"], [data-testid="buildings-summary"], [data-testid="total-power"], [data-testid="production-pipeline"]'
      )
    ).map((node) => (node as HTMLElement).dataset.testid);

    expect(orderedCards).toEqual([
      'raw-resources',
      'buildings-summary',
      'total-power',
      'production-pipeline',
    ]);
    expect(screen.getByText('Smelter')).toBeTruthy();
    expect(screen.queryByText('SmelterMk1')).toBeNull();
  });
});
