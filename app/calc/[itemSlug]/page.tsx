import * as fs from 'fs';
import * as path from 'path';
import { itemClassToSlug, slugToItemClass } from '@/src/utils/slugify';
import CalculatorClient from './calculator-client';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { realRecipes } from '@/src/data/real-recipes';
import { parseRecipe } from '@/src/lib/production-calculator';
import type { ParsedRecipe } from '@/src/lib/production-calculator';

type GameItem = {
  ClassName?: string;
  mDisplayName?: string;
};

function flattenClasses(dataArray: any[]): GameItem[] {
  const allClasses: GameItem[] = [];
  dataArray.forEach((nativeClass: any) => {
    if (nativeClass.Classes && Array.isArray(nativeClass.Classes)) {
      allClasses.push(...nativeClass.Classes);
    }
  });

  return allClasses;
}

function getSelectableItems(dataArray: any[]): GameItem[] {
  return flattenClasses(dataArray).filter(
    (item) => item.ClassName?.startsWith('Desc_') && item.mDisplayName && item.mDisplayName.trim()
  );
}

function findSelectableItemBySlug(dataArray: any[], itemSlug: string): GameItem | undefined {
  const itemClassName = slugToItemClass(itemSlug);
  return getSelectableItems(dataArray).find((item) => item.ClassName === itemClassName);
}

// Generate static params - pre-render all item pages from the JSON database
export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), 'en-US.json');
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const dataArray = JSON.parse(jsonData);

    const items = getSelectableItems(dataArray);

    return items.map((item: GameItem) => ({
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
    const filePath = path.join(process.cwd(), 'en-US.json');
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const dataArray = JSON.parse(jsonData);

    const item = findSelectableItemBySlug(dataArray, itemSlug);
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
  let items: any[] = [];
  
  try {
    // Read the English database and flatten it
    const enFilePath = path.join(process.cwd(), 'en-US.json');
    const enData = fs.readFileSync(enFilePath, 'utf-8');
    const dataArray = JSON.parse(enData);

    items = getSelectableItems(dataArray);
  } catch (error) {
    console.error('Error loading data:', error);
  }

  const selectedItem = items.find((item) => item.ClassName === slugToItemClass(itemSlug));

  if (!selectedItem) {
    notFound();
  }
  
  // Prepare recipe data - using real recipes
  const recipesMap = new Map<string, ParsedRecipe>();
  realRecipes.forEach(recipe => {
    const parsed = parseRecipe(recipe);
    recipesMap.set(parsed.className, parsed);
  });
  
  // Convert Map to a serializable object
  const recipesData: { [key: string]: ParsedRecipe } = {};
  recipesMap.forEach((value, key) => {
    recipesData[key] = value;
  });
  
  // Build item name map from the item database
  const itemNamesData: { [key: string]: string } = {};
  items.forEach(item => {
    if (item.ClassName && item.mDisplayName) {
      itemNamesData[item.ClassName] = item.mDisplayName;
    }
  });
  
  return (
    <CalculatorClient
      itemDb={{ items }}
      initialItemSlug={itemSlug}
      recipesData={recipesData}
      itemNamesData={itemNamesData}
    />
  );
}
