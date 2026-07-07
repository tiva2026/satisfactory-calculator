/**
 * Satisfactory Production Tree Calculator
 * 核心递归计算引擎 - 处理多层级生产链聚合
 */

// ============================================================================
// 类型定义 (Type Definitions)
// ============================================================================

/**
 * 配方中的物品（原料或产物）
 */
export interface RecipeItem {
  ItemClass: string;  // 物品类名，如 "Desc_IronIngot_C"
  Amount: number;     // 数量
}

/**
 * 游戏配方数据结构
 */
export interface Recipe {
  ClassName: string;              // 配方类名，如 "Recipe_IronPlate_C"
  mDisplayName: string;           // 显示名称
  mIngredients: string;           // 原料字符串 "((ItemClass=...,Amount=3))"
  mProduct: string;               // 产物字符串 "((ItemClass=...,Amount=2))"
  mManufactoringDuration: string; // 制造时间（秒）
  mProducedIn: string;            // 生产建筑
}

/**
 * 解析后的配方数据
 */
export interface ParsedRecipe {
  className: string;
  displayName: string;
  ingredients: RecipeItem[];
  products: RecipeItem[];
  duration: number;          // 制造时间（秒）
  producedIn: string[];      // 生产建筑列表
}

/**
 * 生产节点 - 表示生产树中的一个节点
 */
export interface ProductionNode {
  itemClass: string;         // 物品类名
  itemName: string;          // 物品显示名称
  targetRate: number;        // 目标生产速率（件/分钟）
  recipe: ParsedRecipe;      // 使用的配方
  buildingCount: number;     // 需要的建筑数量
  actualRate: number;        // 实际生产速率（件/分钟）
  children: ProductionNode[]; // 子节点（原料生产链）
  depth: number;             // 树深度（用于调试）
}

/**
 * 聚合的资源需求
 */
export interface AggregatedResources {
  [itemClass: string]: {
    itemName: string;
    totalRate: number;        // 总需求速率（件/分钟）
    isRawResource: boolean;   // 是否为原始资源（矿石、水等）
  };
}

/**
 * 生产树计算结果
 */
export interface ProductionTreeResult {
  rootNode: ProductionNode;
  totalBuildings: {
    [buildingType: string]: number; // 各类建筑的总数
  };
  rawResources: AggregatedResources; // 原始资源需求
  allResources: AggregatedResources; // 所有中间产物需求
  totalPower: number;                // 总功耗（MW）
}

// ============================================================================
// 工具函数 (Utility Functions)
// ============================================================================

/**
 * 解析Satisfactory的配方字符串格式
 * 输入: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/...Desc_IronIngot.Desc_IronIngot_C'\",Amount=3))"
 * 输出: [{ ItemClass: "Desc_IronIngot_C", Amount: 3 }]
 */
export function parseRecipeItems(itemString: string): RecipeItem[] {
  if (!itemString || itemString === '""' || itemString === '()') {
    return [];
  }

  const items: RecipeItem[] = [];
  
  // 匹配所有的 ItemClass 和 Amount 对
  const itemRegex = /ItemClass="[^"]*\/([^/'"]+)\.([^/'"]+)'",Amount=(\d+)/g;
  let match;
  
  while ((match = itemRegex.exec(itemString)) !== null) {
    items.push({
      ItemClass: match[2], // 取类名，如 "Desc_IronIngot_C"
      Amount: parseInt(match[3], 10)
    });
  }
  
  return items;
}

/**
 * 解析配方数据
 */
export function parseRecipe(recipe: Recipe): ParsedRecipe {
  const ingredients = parseRecipeItems(recipe.mIngredients);
  const products = parseRecipeItems(recipe.mProduct);
  const duration = parseFloat(recipe.mManufactoringDuration);
  
  // 解析生产建筑
  const producedInMatch = recipe.mProducedIn.match(/Build_(\w+)\.Build_\1_C/g) || [];
  const producedIn = producedInMatch.map(m => {
    const match = m.match(/Build_(\w+)\./);
    return match ? match[1] : '';
  }).filter(Boolean);

  return {
    className: recipe.ClassName,
    displayName: recipe.mDisplayName,
    ingredients,
    products,
    duration,
    producedIn
  };
}

/**
 * 判断配方是否应被排除在标准生产链之外
 * 排除规则：
 * 1. 备用配方（Recipe_Alternate_ 前缀或 "Alternate:" 显示名）
 * 2. Unpackage 配方（会导致打包/解包循环）
 * 3. 产物为原始资源的配方（矿石转换，会导致矿石间循环）
 * 4. 建筑物配方（在 BuildGun 中生产，不是工厂生产链的一部分）
 */
function isExcludedRecipe(recipe: ParsedRecipe): boolean {
  // 排除备用配方
  if (recipe.className.startsWith('Recipe_Alternate_') ||
      recipe.displayName.startsWith('Alternate:')) {
    return true;
  }

  // 排除 Unpackage 配方（解包会导致循环）
  if (recipe.className.startsWith('Recipe_Unpackage') ||
      recipe.displayName.startsWith('Unpackage')) {
    return true;
  }

  // 排除所有产物为原始资源的配方（包括 Converter 矿石转换配方）
  // 原始资源应该直接由矿机/采集器提供，不应通过配方生产
  const producesRawResource = recipe.products.some(p => isRawResource(p.ItemClass));
  if (producesRawResource) {
    return true;
  }

  // 排除建筑物配方（仅在 BuildGun 中生产，不属于工厂生产链）
  const isOnlyBuildGun = recipe.producedIn.length > 0 &&
    recipe.producedIn.every(b => b === 'BuildGun' || b === '');
  if (isOnlyBuildGun) {
    return true;
  }

  return false;
}

/**
 * 从所有配方中查找生产指定物品的配方
 * 优先选择标准配方（非备用、非解包、非矿石转换），避免循环依赖
 */
export function findRecipeForItem(
  itemClass: string,
  recipes: Map<string, ParsedRecipe>
): ParsedRecipe | null {
  let fallbackRecipe: ParsedRecipe | null = null;

  for (const recipe of recipes.values()) {
    // 检查产物中是否包含目标物品
    if (recipe.products.some(p => p.ItemClass === itemClass)) {
      if (!isExcludedRecipe(recipe)) {
        // 立即返回第一个找到的标准配方
        return recipe;
      }
      // 被排除的配方作为最后后备（仅当完全没有标准配方时使用）
      if (!fallbackRecipe) {
        fallbackRecipe = recipe;
      }
    }
  }

  return fallbackRecipe;
}

/**
 * 判断是否为原始资源（矿石、原油、水等）
 */
export function isRawResource(itemClass: string): boolean {
  const rawResourcePatterns = [
    /^Desc_Ore/,           // 矿石: OreIron, OreCopper, etc.
    /^Desc_Raw/,           // 原始资源
    /^Desc_Water/,         // 水
    /^Desc_LiquidOil/,     // 原油
    /^Desc_NitrogenGas/,   // 氮气
  ];
  
  return rawResourcePatterns.some(pattern => pattern.test(itemClass));
}

// ============================================================================
// 核心递归计算函数 (Core Recursive Calculation)
// ============================================================================

/**
 * 计算生产树 - 递归计算多层级生产链
 *
 * @param itemClass 目标物品类名
 * @param targetRate 目标生产速率（件/分钟）
 * @param recipes 所有配方的Map
 * @param itemNames 物品名称映射
 * @param depth 当前递归深度（用于调试和防止无限递归）
 * @param maxDepth 最大递归深度
 * @param visitedItems 当前递归路径上已访问的物品集合（用于检测循环依赖）
 * @returns 生产节点
 */
export function calculateProductionTree(
  itemClass: string,
  targetRate: number,
  recipes: Map<string, ParsedRecipe>,
  itemNames: Map<string, string>,
  depth: number = 0,
  maxDepth: number = 20,
  visitedItems: Set<string> = new Set()
): ProductionNode | null {
  
  // 防止无限递归（深度保护）
  if (depth > maxDepth) {
    console.warn(`达到最大递归深度 ${maxDepth}，物品: ${itemClass}`);
    return null;
  }

  // 检测循环依赖：如果当前物品已在祖先路径中出现，则作为叶子节点截断
  if (visitedItems.has(itemClass)) {
    console.warn(`检测到循环依赖，截断递归: ${itemClass}（路径: ${Array.from(visitedItems).join(' → ')} → ${itemClass}）`);
    // 将循环节点作为"无配方"叶子节点返回，避免无限膨胀
    return {
      itemClass,
      itemName: itemNames.get(itemClass) || itemClass,
      targetRate,
      recipe: {
        className: '',
        displayName: '(Cycle Break)',
        ingredients: [],
        products: [{ ItemClass: itemClass, Amount: 1 }],
        duration: 0,
        producedIn: []
      },
      buildingCount: 0,
      actualRate: targetRate,
      children: [],
      depth
    };
  }

  // 原始资源直接作为叶子节点返回，不查找配方（避免 Converter 矿石转换配方引发循环）
  if (isRawResource(itemClass)) {
    return {
      itemClass,
      itemName: itemNames.get(itemClass) || itemClass,
      targetRate,
      recipe: {
        className: '',
        displayName: 'Raw Resource',
        ingredients: [],
        products: [{ ItemClass: itemClass, Amount: 1 }],
        duration: 0,
        producedIn: ['Miner/Extractor']
      },
      buildingCount: 0,
      actualRate: targetRate,
      children: [],
      depth
    };
  }

  // 查找生产该物品的配方（仅对非原始资源执行）
  const recipe = findRecipeForItem(itemClass, recipes);
  
  if (!recipe) {
    console.warn(`未找到生产 ${itemClass} 的配方`);
    return null;
  }

  // 计算产物信息
  const productInfo = recipe.products.find(p => p.ItemClass === itemClass);
  if (!productInfo) {
    console.warn(`配方 ${recipe.className} 不生产 ${itemClass}`);
    return null;
  }

  // 计算生产速率：产物数量 / 制造时间（秒） * 60（转换为分钟）
  const productionRatePerBuilding = (productInfo.Amount / recipe.duration) * 60;
  
  // 计算需要的建筑数量
  const buildingCount = targetRate / productionRatePerBuilding;
  
  // 实际生产速率（可能因为建筑数量四舍五入而略有不同）
  const actualRate = buildingCount * productionRatePerBuilding;

  // 将当前物品加入访问路径，递归完成后移除（回溯）
  const nextVisited = new Set(visitedItems);
  nextVisited.add(itemClass);

  // 递归计算所有原料的生产链
  const children: ProductionNode[] = [];
  
  for (const ingredient of recipe.ingredients) {
    // 计算该原料的需求速率
    const ingredientRatePerBuilding = (ingredient.Amount / recipe.duration) * 60;
    const totalIngredientRate = ingredientRatePerBuilding * buildingCount;
    
    // 递归计算原料的生产树（传入更新后的访问路径）
    const childNode = calculateProductionTree(
      ingredient.ItemClass,
      totalIngredientRate,
      recipes,
      itemNames,
      depth + 1,
      maxDepth,
      nextVisited
    );
    
    if (childNode) {
      children.push(childNode);
    }
  }

  return {
    itemClass,
    itemName: itemNames.get(itemClass) || recipe.displayName,
    targetRate,
    recipe,
    buildingCount,
    actualRate,
    children,
    depth
  };
}

/**
 * 聚合生产树中的所有资源需求
 * 遍历整个树结构，累加同类资源的需求
 * 
 * @param node 生产节点
 * @param aggregated 聚合结果（会被修改）
 * @param itemNames 物品名称映射
 */
export function aggregateResources(
  node: ProductionNode,
  aggregated: AggregatedResources = {},
  itemNames: Map<string, string>
): AggregatedResources {
  
  // 累加当前节点的资源需求
  if (!aggregated[node.itemClass]) {
    aggregated[node.itemClass] = {
      itemName: node.itemName,
      totalRate: 0,
      isRawResource: isRawResource(node.itemClass)
    };
  }
  
  aggregated[node.itemClass].totalRate += node.targetRate;
  
  // 递归处理所有子节点
  for (const child of node.children) {
    aggregateResources(child, aggregated, itemNames);
  }
  
  return aggregated;
}

/**
 * 统计所有建筑需求
 * 
 * @param node 生产节点
 * @param buildings 建筑统计（会被修改）
 */
export function aggregateBuildings(
  node: ProductionNode,
  buildings: { [buildingType: string]: number } = {}
): { [buildingType: string]: number } {
  
  // 累加当前节点的建筑需求
  for (const buildingType of node.recipe.producedIn) {
    if (buildingType && buildingType !== 'Miner/Extractor') {
      buildings[buildingType] = (buildings[buildingType] || 0) + node.buildingCount;
    }
  }
  
  // 递归处理所有子节点
  for (const child of node.children) {
    aggregateBuildings(child, buildings);
  }
  
  return buildings;
}

/**
 * 计算完整的生产树并返回所有统计信息
 * 
 * @param itemClass 目标物品类名
 * @param targetRate 目标生产速率（件/分钟）
 * @param recipes 所有配方的Map
 * @param itemNames 物品名称映射
 * @returns 完整的生产树计算结果
 */
export function calculateFullProductionTree(
  itemClass: string,
  targetRate: number,
  recipes: Map<string, ParsedRecipe>,
  itemNames: Map<string, string>
): ProductionTreeResult | null {
  
  // 计算生产树
  const rootNode = calculateProductionTree(itemClass, targetRate, recipes, itemNames);
  
  if (!rootNode) {
    return null;
  }
  
  // 聚合所有资源需求
  const allResources = aggregateResources(rootNode, {}, itemNames);
  
  // 提取原始资源
  const rawResources: AggregatedResources = {};
  for (const [key, value] of Object.entries(allResources)) {
    if (value.isRawResource) {
      rawResources[key] = value;
    }
  }
  
  // 统计建筑需求
  const totalBuildings = aggregateBuildings(rootNode);
  
  // 计算总功耗（这里需要建筑功耗数据，暂时简化处理）
  const totalPower = Object.entries(totalBuildings).reduce((sum, [building, count]) => {
    // 简化的功耗估算（实际应该从建筑数据中读取）
    const powerConsumption: { [key: string]: number } = {
      'SmelterMk1': 4,
      'ConstructorMk1': 4,
      'AssemblerMk1': 15,
      'FoundryMk1': 16,
      'Manufacturer': 55,
      'Refinery': 30,
      'Packager': 10,
      'Blender': 75,
    };
    return sum + (powerConsumption[building] || 10) * count;
  }, 0);
  
  return {
    rootNode,
    totalBuildings,
    rawResources,
    allResources,
    totalPower
  };
}

// ============================================================================
// 格式化输出函数 (Formatting Functions)
// ============================================================================

/**
 * 将生产树格式化为文本（用于调试）
 */
export function formatProductionTree(node: ProductionNode, indent: string = ''): string {
  const lines: string[] = [];
  
  const rate = node.targetRate.toFixed(2);
  const buildings = node.buildingCount.toFixed(2);
  
  lines.push(
    `${indent}${node.itemName} (${rate}/min) - ${buildings} × ${node.recipe.producedIn[0] || 'N/A'}`
  );
  
  for (const child of node.children) {
    lines.push(formatProductionTree(child, indent + '  '));
  }
  
  return lines.join('\n');
}

/**
 * 格式化聚合资源列表
 */
export function formatAggregatedResources(resources: AggregatedResources): string {
  const lines: string[] = [];
  
  const sorted = Object.entries(resources).sort((a, b) => 
    a[1].itemName.localeCompare(b[1].itemName)
  );
  
  for (const [itemClass, info] of sorted) {
    const rate = info.totalRate.toFixed(2);
    const type = info.isRawResource ? '[原始资源]' : '[中间产物]';
    lines.push(`${type} ${info.itemName}: ${rate}/min`);
  }
  
  return lines.join('\n');
}

/**
 * 格式化建筑统计
 */
export function formatBuildingStats(buildings: { [buildingType: string]: number }): string {
  const lines: string[] = [];
  
  const sorted = Object.entries(buildings).sort((a, b) => a[0].localeCompare(b[0]));
  
  for (const [buildingType, count] of sorted) {
    lines.push(`${buildingType}: ${count.toFixed(2)}`);
  }
  
  return lines.join('\n');
}
