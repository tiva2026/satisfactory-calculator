import { itemClassToSlug } from '@/src/utils/slugify';
import CalculatorClient from './calculator-client';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadCalculatorPageData, type CalculatorItem } from '@/src/lib/calculator-page-data';

function findSelectableItemBySlug(dataArray: CalculatorItem[], itemSlug: string): CalculatorItem | undefined {
  return dataArray.find((item) => itemClassToSlug(item.ClassName) === itemSlug);
}

// Generate static params - pre-render all item pages from the JSON database
export async function generateStaticParams() {
  try {
    const items = loadCalculatorPageData().items;

    return items.map((item) => ({
      itemSlug: itemClassToSlug(item.ClassName!),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Dynamically generate SEO metadata
export async function generateMetadata({
  params
}: {
  params: Promise<{ itemSlug: string }>
}): Promise<Metadata> {
  try {
    const { itemSlug } = await params;
    const item = findSelectableItemBySlug(loadCalculatorPageData().items, itemSlug);
    const itemName = item?.mDisplayName || itemSlug;
    
    return {
      title: `${itemName} Production Calculator | Satisfactory`,
      description: `Calculate optimal production chains for ${itemName} in Satisfactory. Mobile-first production tree calculator with resource planning.`,
      keywords: `${itemName}, Satisfactory, Production Calculator, ${itemName} recipe`,
      alternates: {
        canonical: `/calc/${itemSlug}`,
      },
    };
  } catch (error) {
    return {
      title: 'Satisfactory Production Calculator',
      description: 'Calculate optimal production chains in Satisfactory',
    };
  }
}

// Server component - loads data and passes it to the client
export default async function CalcItemPage({
  params
}: {
  params: Promise<{ itemSlug: string }>
}) {
  const { itemSlug } = await params;
  const { items, recipesData, itemNamesData } = loadCalculatorPageData();

  const selectedItem = findSelectableItemBySlug(items, itemSlug);

  if (!selectedItem) {
    notFound();
  }
  
  return (
    <CalculatorClient
      itemDb={{ items }}
      initialItemSlug={itemSlug}
      recipesData={recipesData}
      itemNamesData={itemNamesData}
      mode="detail"
    />
  );
}
