'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { itemClassToSlug, slugToItemClass } from '@/src/utils/slugify';
import { calculateFullProductionTree } from '@/src/lib/production-calculator';
import type { CalculatorItem } from '@/src/lib/calculator-page-data';
import type { ParsedRecipe, ProductionTreeResult, ProductionNode, RecipeItem } from '@/src/lib/production-calculator';

/**
 * Client Component - Interactive Production Calculator
 * Mobile-First Interactive Calculator Client Component
 */

interface CalculatorClientProps {
  itemDb: {
    items: CalculatorItem[];
    recipes?: any[];
  };
  initialItemSlug?: string;
  recipesData: { [key: string]: ParsedRecipe };
  itemNamesData: { [key: string]: string };
  mode?: 'home' | 'detail';
  featuredItems?: CalculatorItem[];
}

// Remove old mock data definitions; use types imported from production-calculator

const formatBuildingName = (buildingName: string) =>
  buildingName
    .replace(/^Build_/, '')
    .replace(/_C$/, '')
    .replace(/Mk\d+$/, '');

export default function CalculatorClient({
  itemDb,
  initialItemSlug,
  recipesData,
  itemNamesData,
  mode = 'detail',
  featuredItems = []
}: CalculatorClientProps) {
  const router = useRouter();
  const isHomePage = mode === 'home';
  
  // ========== State Management ==========
  const [selectedItem, setSelectedItem] = useState<CalculatorItem | null>(null);
  const [quantity, setQuantity] = useState<string>('10');
  const [searchQuery, setSearchQuery] = useState('');
  const [calculationResult, setCalculationResult] = useState<ProductionTreeResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Convert recipe data back to Map
  const recipesMap = useMemo(() => {
    const map = new Map<string, ParsedRecipe>();
    Object.entries(recipesData).forEach(([key, value]) => {
      map.set(key, value);
    });
    return map;
  }, [recipesData]);
  
  // Convert item name data back to Map
  const itemNamesMap = useMemo(() => {
    const map = new Map<string, string>();
    Object.entries(itemNamesData).forEach(([key, value]) => {
      map.set(key, value);
    });
    return map;
  }, [itemNamesData]);

  // Trigger calculation function
  const triggerCalculation = useCallback((item: CalculatorItem, rate: number) => {
    setIsCalculating(true);
    
    try {
      // Invoke the calculation engine
      const result = calculateFullProductionTree(
        item.ClassName,
        rate,
        recipesMap,
        itemNamesMap
      );
      
      if (result) {
        console.log('Calculation successful:', item.mDisplayName, rate, '/min');
        setCalculationResult(result);
      } else {
        console.warn(`Unable to calculate production tree for "${item.mDisplayName}"`);
        setCalculationResult(null);
      }
    } catch (error) {
      console.error('Calculation error:', error);
      setCalculationResult(null);
    } finally {
      setIsCalculating(false);
    }
  }, [recipesMap, itemNamesMap]);

  // Set initial item based on slug on component mount and auto-calculate
  useEffect(() => {
    if (initialItemSlug && itemDb.items) {
      const initialItemClass = slugToItemClass(initialItemSlug);
      const foundItem = itemDb.items.find((item) => item.ClassName === initialItemClass);
      if (foundItem) {
        setSelectedItem(foundItem);
        // Auto-trigger calculation
        triggerCalculation(foundItem, 10);
      }
    }
  }, [initialItemSlug, itemDb.items, triggerCalculation]);

  // Filter item list - only show items with a mDisplayName
  const filteredItems = useMemo(() => {
    if (!itemDb.items) return [];
    
    // Only include items that have a mDisplayName
    const validItems = itemDb.items.filter(item => item.mDisplayName && item.mDisplayName.trim());
    
    if (!searchQuery) return validItems.slice(0, 50); // 限制初始显示数量
    
    const query = searchQuery.toLowerCase();
    return validItems.filter(item =>
      item.mDisplayName.toLowerCase().includes(query) ||
      item.ClassName.toLowerCase().includes(query)
    );
  }, [itemDb.items, searchQuery]);

  // Handle item selection and update URL
  const handleItemSelect = (item: CalculatorItem) => {
    setSelectedItem(item);
    const slug = itemClassToSlug(item.ClassName);
    router.push(`/calc/${slug}`);
  };

  // Execute calculation
  const handleCalculate = () => {
    if (!selectedItem || !quantity) return;
    
    const rate = parseFloat(quantity);
    if (isNaN(rate) || rate <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    triggerCalculation(selectedItem, rate);
  };

  // ========== Render Functions ==========

  // Recursively render production node cards - full-width vertical stack, no left indent
  const renderProductionNode = (node: ProductionNode, isRoot: boolean = false, depth: number = 0) => {
    const hasChildren = node.children.length > 0;
    const buildingName = node.recipe.producedIn[0]
      ? formatBuildingName(node.recipe.producedIn[0])
      : 'N/A';
    const isRawResource = node.children.length === 0;

    // Depth color mapping
    const depthColors: { border: string; badge: string; badgeText: string }[] = [
      { border: 'border-blue-500',   badge: 'bg-blue-500',   badgeText: 'text-white' },
      { border: 'border-indigo-400', badge: 'bg-indigo-400', badgeText: 'text-white' },
      { border: 'border-violet-400', badge: 'bg-violet-400', badgeText: 'text-white' },
      { border: 'border-purple-400', badge: 'bg-purple-400', badgeText: 'text-white' },
      { border: 'border-pink-400',   badge: 'bg-pink-400',   badgeText: 'text-white' },
    ];
    const colorScheme = depthColors[Math.min(depth, depthColors.length - 1)];

    return (
      // Key fix: w-full full-width, flex flex-col items-center, never add any ml-X / pl-X
      <div key={`${node.itemClass}-${node.depth}-${depth}`} className="w-full flex flex-col items-center">

        {/* Depth tier badge */}
        <div className="w-full flex justify-start mb-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colorScheme.badge} ${colorScheme.badgeText}`}>
            {isRoot ? '🏭 Root' : isRawResource ? '⛏ Raw' : `Tier ${depth}`}
          </span>
        </div>

        {/* Main production node card - strict w-full, no horizontal overflow allowed */}
        <div
          className={`
            w-full bg-white rounded-lg shadow-md border-2 p-3
            ${isRawResource ? 'bg-amber-50 border-amber-300' : colorScheme.border}
          `}
        >
          {/* Card header - building info */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
            <div className="flex-1 min-w-0 mr-2">
              <h3 className={`font-bold text-sm truncate ${isRoot ? 'text-blue-600' : 'text-gray-800'}`}>
                {node.itemName}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {isRawResource ? '⛏ Raw Resource' : buildingName}
              </p>
            </div>
            {!isRawResource && node.buildingCount > 0 && (
              <div className={`flex-shrink-0 ${colorScheme.badge} ${colorScheme.badgeText} px-2 py-0.5 rounded-full text-xs font-semibold`}>
                ×{node.buildingCount.toFixed(2)}
              </div>
            )}
          </div>

          {/* Card body - inputs/outputs: strict grid grid-cols-2 gap-2 w-full, prevent any overlap */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {/* Left column - input ingredients */}
            <div className="min-w-0">
              <div className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">
                ↓ Inputs
              </div>
              {node.recipe.ingredients.length > 0 ? (
                <div className="space-y-1">
                  {node.recipe.ingredients.map((ingredient: RecipeItem, idx: number) => {
                    const rate = node.buildingCount > 0
                      ? (ingredient.Amount / node.recipe.duration) * 60 * node.buildingCount
                      : 0;
                    const ingredientNode = node.children.find(c => c.itemClass === ingredient.ItemClass);
                    const itemName = ingredientNode?.itemName || ingredient.ItemClass;

                    return (
                      <div key={idx} className="bg-red-50 rounded p-1.5 border border-red-200 min-w-0">
                        <div className="text-xs font-medium text-gray-700 truncate leading-tight">{itemName}</div>
                        <div className="text-xs font-bold text-red-600 mt-0.5 whitespace-nowrap">
                          {rate.toFixed(1)}/min
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">None</div>
              )}
            </div>

            {/* Right column - output products */}
            <div className="min-w-0">
              <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                ↑ Outputs
              </div>
              <div className="space-y-1">
                {node.recipe.products.map((product: RecipeItem, idx: number) => {
                  const rate = node.buildingCount > 0
                    ? (product.Amount / node.recipe.duration) * 60 * node.buildingCount
                    : node.targetRate;

                  return (
                    <div key={idx} className="bg-green-50 rounded p-1.5 border border-green-200 min-w-0">
                      <div className="text-xs font-medium text-gray-700 truncate leading-tight">{node.itemName}</div>
                      <div className="text-xs font-bold text-green-600 mt-0.5 whitespace-nowrap">
                        {rate.toFixed(1)}/min
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Child node area: vertical arrows + full-width child cards, never use ml-X / pl-X */}
        {hasChildren && (
          <>
            {/* Vertical connector arrow */}
            <div className="flex flex-col items-center my-1" aria-hidden="true">
              <div className="w-px h-3 bg-gray-300"></div>
              <span className="text-gray-400 text-base leading-none">↓</span>
              <div className="w-px h-1 bg-gray-300"></div>
            </div>

            {/* Child node container: w-full flex flex-col items-center, no indentation */}
            <div className="w-full flex flex-col items-center gap-0">
              {node.children.map((child: ProductionNode, idx: number) => (
                <React.Fragment key={`${child.itemClass}-${depth}-${idx}`}>
                  {/* Separator arrow between multiple child nodes */}
                  {idx > 0 && (
                    <div className="flex flex-col items-center my-1" aria-hidden="true">
                      <div className="w-px h-2 bg-gray-200"></div>
                      <span className="text-gray-300 text-sm leading-none">↓</span>
                    </div>
                  )}
                  {/* Recursive render, depth+1, never add any horizontal offset */}
                  <div className="w-full">
                    {renderProductionNode(child, false, depth + 1)}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Page container - Mobile First, strict width constraint to prevent horizontal overflow */}
      <div className="w-full max-w-md mx-auto px-4 overflow-hidden">
        {/* Top header bar */}
        <div className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
          <h1 className="text-xl font-bold">Satisfactory Production Calculator</h1>
          <p className="text-xs text-blue-100 mt-1">Plan your factory. Optimize your production chain.</p>
        </div>

        {/* ========== Input Section ========== */}
        <div className="bg-white shadow-md p-4">
          <div className="space-y-4">
            {isHomePage && (
              <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Quick start
                </h2>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  Open the calculator or jump straight into a common starter item.
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Search any Satisfactory item, set a target rate, and see the exact buildings, raw resources, and power requirements.
                </p>

                {featuredItems.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {featuredItems.map((item) => {
                      const slug = itemClassToSlug(item.ClassName);

                      return (
                        <Link
                          key={item.ClassName}
                          href={`/calc/${slug}`}
                          className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                        >
                          <div className="text-sm font-semibold text-slate-900">
                            {item.mDisplayName}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Quick start item
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Calculation status indicator */}
            {isCalculating && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                <div className="text-sm font-bold text-blue-800 mb-1">
                  ⚙️ Calculating...
                </div>
                <div className="text-xs text-blue-700">
                  Computing production tree, please wait.
                </div>
              </div>
            )}
            
            {/* No result indicator */}
            {!isCalculating && selectedItem && !calculationResult && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3">
                <div className="text-sm font-bold text-amber-800 mb-1">
                  ℹ️ No Recipe Data
                </div>
                <div className="text-xs text-amber-700">
                  This item has no recipe data or is a building item.
                </div>
              </div>
            )}

            {/* Currently selected item */}
            {selectedItem && (
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200" data-testid="selected-item">
                <div className="text-sm text-blue-600 font-semibold mb-1">
                  Selected Item
                </div>
                <div className="text-lg font-bold text-blue-900">
                  {selectedItem.mDisplayName}
                </div>
              </div>
            )}

            {/* Search items */}
            <div>
              <label htmlFor="item-search" className="block text-sm font-semibold text-gray-700 mb-1">
                Search Item
              </label>
              <input
                id="item-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter item name..."
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Item selection list */}
            {searchQuery && (
              <div className="max-h-64 overflow-y-auto border-2 border-gray-200 rounded-lg">
                {filteredItems.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredItems.slice(0, 20).map((item) => (
                      <button
                        key={item.ClassName}
                        data-testid={`search-result-${item.ClassName}`}
                        onClick={() => {
                          handleItemSelect(item);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{item.mDisplayName}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No items found
                  </div>
                )}
              </div>
            )}

            {/* Target quantity input */}
            <div>
              <label htmlFor="quantity-input" className="block text-sm font-semibold text-gray-700 mb-1">
                Target Rate
              </label>
              <div className="relative">
                <input
                  id="quantity-input"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 pr-24 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                  items/min
                </div>
              </div>
            </div>

            {/* Calculate button */}
            <button
              onClick={handleCalculate}
              disabled={!selectedItem || !quantity || isCalculating}
              className={`
                w-full py-3 rounded-lg font-bold text-base transition-all
                ${!selectedItem || !quantity || isCalculating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg'
                }
              `}
            >
              {isCalculating ? 'Calculating...' : 'Calculate'}
            </button>
          </div>
        </div>

        {/* ========== Production Pipeline Section ========== */}
        {calculationResult && (
          <div className="py-4 space-y-4 w-full overflow-hidden" data-testid="calculation-result">
            {/* ========== Top Summary Grid ========== */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Raw resources required */}
                <div className="bg-white rounded-lg shadow-md p-4 border-2 border-amber-300" data-testid="raw-resources">
                  <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    Raw Resources Required
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {Object.entries(calculationResult.rawResources).map(([itemClass, info]) => (
                      <div key={itemClass} className="bg-amber-50 rounded p-3 border border-amber-200">
                        <div className="text-xs text-gray-600 truncate">{info.itemName}</div>
                        <div className="text-base font-bold text-amber-700 mt-1">
                          {info.totalRate.toFixed(2)}/min
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buildings required */}
                <div className="bg-white rounded-lg shadow-md p-4 border-2 border-purple-300" data-testid="buildings-summary">
                  <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Buildings Required
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {Object.entries(calculationResult.totalBuildings).map(([building, count]) => {
                      const displayName = formatBuildingName(building);
                      return (
                        <div key={building} className="bg-purple-50 rounded p-3 border border-purple-200">
                          <div className="text-xs text-gray-600 truncate">{displayName}</div>
                          <div className="text-base font-bold text-purple-700 mt-1">
                            ×{count.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Total power consumption */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-md p-4 text-white" data-testid="total-power">
                <h3 className="text-sm font-semibold mb-1 opacity-90">Total Power Consumption</h3>
                <div className="text-3xl font-bold">
                  {calculationResult.totalPower.toFixed(2)} <span className="text-xl">MW</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200" data-testid="production-pipeline">
              <h2 className="text-lg font-bold text-blue-900 mb-1">
                Production Pipeline
              </h2>
              <p className="text-xs text-blue-600">Top-to-bottom production chain</p>
            </div>

            {/* Recursively render production node tree - w-full overflow-hidden prevents horizontal overflow */}
            <div className="w-full overflow-hidden flex flex-col items-center gap-0">
              {renderProductionNode(calculationResult.rootNode, true, 0)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
