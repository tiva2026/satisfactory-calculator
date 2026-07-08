import type { Metadata } from 'next';
import CalculatorClient from './calc/[itemSlug]/calculator-client';
import { getFeaturedCalculatorItems, loadCalculatorPageData } from '@/src/lib/calculator-page-data';

export const metadata: Metadata = {
  title: 'Satisfactory Production Calculator | Factory Planner',
  description:
    'Plan production chains for Satisfactory from the homepage. Search items, start from common recipes, and calculate buildings, resources, and power.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  try {
    const { items, recipesData, itemNamesData } = loadCalculatorPageData();

    return (
      <CalculatorClient
        itemDb={{ items }}
        recipesData={recipesData}
        itemNamesData={itemNamesData}
        mode="home"
        featuredItems={getFeaturedCalculatorItems(items)}
      />
    );
  } catch (error) {
    console.error('Error loading home page data:', error);

    return (
      <CalculatorClient
        itemDb={{ items: [] }}
        recipesData={{}}
        itemNamesData={{}}
        mode="home"
        featuredItems={[]}
      />
    );
  }
}
