import fs from 'fs';
import path from 'path';
import { realRecipes } from '@/src/data/real-recipes';
import { parseRecipe, type ParsedRecipe } from '@/src/lib/production-calculator';

export interface CalculatorItem {
  ClassName: string;
  mDisplayName: string;
  mDescription?: string;
  [key: string]: any;
}

export interface CalculatorPageData {
  items: CalculatorItem[];
  recipesData: Record<string, ParsedRecipe>;
  itemNamesData: Record<string, string>;
}

const FEATURED_ITEM_NAMES = ['Iron Ingot', 'Copper Ingot', 'Concrete'];
let cachedPageData: CalculatorPageData | null = null;

export function flattenClasses(dataArray: any[]): CalculatorItem[] {
  const items: CalculatorItem[] = [];

  dataArray.forEach((nativeClass: any) => {
    if (nativeClass.Classes && Array.isArray(nativeClass.Classes)) {
      items.push(...nativeClass.Classes);
    }
  });

  return items;
}

export function getSelectableItems(dataArray: any[]): CalculatorItem[] {
  return flattenClasses(dataArray).filter(
    (item) => item.ClassName?.startsWith('Desc_') && item.mDisplayName && item.mDisplayName.trim()
  );
}

export function loadCalculatorPageData(): CalculatorPageData {
  if (cachedPageData) {
    return cachedPageData;
  }

  const enFilePath = path.join(process.cwd(), 'en-US.json');
  const enData = fs.readFileSync(enFilePath, 'utf-8');
  const dataArray = JSON.parse(enData);

  const items = getSelectableItems(dataArray);

  const recipesMap = new Map<string, ParsedRecipe>();
  realRecipes.forEach((recipe) => {
    const parsed = parseRecipe(recipe);
    recipesMap.set(parsed.className, parsed);
  });

  const recipesData: Record<string, ParsedRecipe> = {};
  recipesMap.forEach((value, key) => {
    recipesData[key] = value;
  });

  const itemNamesData: Record<string, string> = {};
  items.forEach((item) => {
    if (item.ClassName && item.mDisplayName) {
      itemNamesData[item.ClassName] = item.mDisplayName;
    }
  });

  cachedPageData = { items, recipesData, itemNamesData };
  return cachedPageData;
}

export function getFeaturedCalculatorItems(items: CalculatorItem[]): CalculatorItem[] {
  return FEATURED_ITEM_NAMES
    .map((name) => items.find((item) => item.mDisplayName === name))
    .filter((item): item is CalculatorItem => Boolean(item));
}
