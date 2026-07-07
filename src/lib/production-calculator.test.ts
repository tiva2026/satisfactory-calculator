/**
 * 生产树计算器单元测试
 * 测试多层级生产链聚合逻辑
 */

import {
  parseRecipeItems,
  parseRecipe,
  calculateProductionTree,
  aggregateResources,
  aggregateBuildings,
  calculateFullProductionTree,
  findRecipeForItem,
  formatProductionTree,
  formatAggregatedResources,
  formatBuildingStats,
  isRawResource,
  type Recipe,
  type ParsedRecipe,
  type RecipeItem,
} from './production-calculator';

// ============================================================================
// 测试数据 (Test Data)
// ============================================================================

/**
 * 模拟Satisfactory游戏中的配方数据
 */
const mockRecipes: Recipe[] = [
  // 铁锭 (Iron Ingot) - 从铁矿石冶炼
  {
    ClassName: 'Recipe_IngotIron_C',
    mDisplayName: 'Iron Ingot',
    mIngredients: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/RawResources/OreIron/Desc_OreIron.Desc_OreIron_C'\",Amount=1))",
    mProduct: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronIngot/Desc_IronIngot.Desc_IronIngot_C'\",Amount=1))",
    mManufactoringDuration: '2.000000',
    mProducedIn: "(\"/Game/FactoryGame/Buildable/Factory/SmelterMk1/Build_SmelterMk1.Build_SmelterMk1_C\")",
  },
  // 铁板 (Iron Plate) - 从铁锭制造
  {
    ClassName: 'Recipe_IronPlate_C',
    mDisplayName: 'Iron Plate',
    mIngredients: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronIngot/Desc_IronIngot.Desc_IronIngot_C'\",Amount=3))",
    mProduct: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronPlate/Desc_IronPlate.Desc_IronPlate_C'\",Amount=2))",
    mManufactoringDuration: '6.000000',
    mProducedIn: "(\"/Game/FactoryGame/Buildable/Factory/ConstructorMk1/Build_ConstructorMk1.Build_ConstructorMk1_C\")",
  },
  // 铁棒 (Iron Rod) - 从铁锭制造
  {
    ClassName: 'Recipe_IronRod_C',
    mDisplayName: 'Iron Rod',
    mIngredients: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronIngot/Desc_IronIngot.Desc_IronIngot_C'\",Amount=1))",
    mProduct: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronRod/Desc_IronRod.Desc_IronRod_C'\",Amount=1))",
    mManufactoringDuration: '4.000000',
    mProducedIn: "(\"/Game/FactoryGame/Buildable/Factory/ConstructorMk1/Build_ConstructorMk1.Build_ConstructorMk1_C\")",
  },
  // 螺丝 (Screw) - 从铁棒制造
  {
    ClassName: 'Recipe_Screw_C',
    mDisplayName: 'Screw',
    mIngredients: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronRod/Desc_IronRod.Desc_IronRod_C'\",Amount=1))",
    mProduct: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronScrew/Desc_IronScrew.Desc_IronScrew_C'\",Amount=4))",
    mManufactoringDuration: '6.000000',
    mProducedIn: "(\"/Game/FactoryGame/Buildable/Factory/ConstructorMk1/Build_ConstructorMk1.Build_ConstructorMk1_C\")",
  },
  // 强化铁板 (Reinforced Iron Plate) - 从铁板和螺丝组装
  {
    ClassName: 'Recipe_IronPlateReinforced_C',
    mDisplayName: 'Reinforced Iron Plate',
    mIngredients: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronPlate/Desc_IronPlate.Desc_IronPlate_C'\",Amount=6),(ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronScrew/Desc_IronScrew.Desc_IronScrew_C'\",Amount=12))",
    mProduct: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronPlateReinforced/Desc_IronPlateReinforced.Desc_IronPlateReinforced_C'\",Amount=1))",
    mManufactoringDuration: '12.000000',
    mProducedIn: "(\"/Game/FactoryGame/Buildable/Factory/AssemblerMk1/Build_AssemblerMk1.Build_AssemblerMk1_C\")",
  },
];

// 物品名称映射
const mockItemNames = new Map<string, string>([
  ['Desc_OreIron_C', 'Iron Ore'],
  ['Desc_IronIngot_C', 'Iron Ingot'],
  ['Desc_IronPlate_C', 'Iron Plate'],
  ['Desc_IronRod_C', 'Iron Rod'],
  ['Desc_IronScrew_C', 'Screw'],
  ['Desc_IronPlateReinforced_C', 'Reinforced Iron Plate'],
]);

// ============================================================================
// 单元测试 (Unit Tests)
// ============================================================================

describe('parseRecipeItems', () => {
  test('应该正确解析单个物品', () => {
    const input = "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/RawResources/OreIron/Desc_OreIron.Desc_OreIron_C'\",Amount=1))";
    const result = parseRecipeItems(input);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ItemClass: 'Desc_OreIron_C',
      Amount: 1,
    });
  });

  test('应该正确解析多个物品', () => {
    const input = "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronPlate/Desc_IronPlate.Desc_IronPlate_C'\",Amount=6),(ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronScrew/Desc_IronScrew.Desc_IronScrew_C'\",Amount=12))";
    const result = parseRecipeItems(input);
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      ItemClass: 'Desc_IronPlate_C',
      Amount: 6,
    });
    expect(result[1]).toEqual({
      ItemClass: 'Desc_IronScrew_C',
      Amount: 12,
    });
  });

  test('应该处理空字符串', () => {
    expect(parseRecipeItems('')).toEqual([]);
    expect(parseRecipeItems('""')).toEqual([]);
    expect(parseRecipeItems('()')).toEqual([]);
  });
});

describe('parseRecipe', () => {
  test('应该正确解析配方', () => {
    const recipe = mockRecipes[1]; // Iron Plate
    const result = parseRecipe(recipe);
    
    expect(result.className).toBe('Recipe_IronPlate_C');
    expect(result.displayName).toBe('Iron Plate');
    expect(result.duration).toBe(6);
    expect(result.ingredients).toHaveLength(1);
    expect(result.products).toHaveLength(1);
    expect(result.ingredients[0]).toEqual({
      ItemClass: 'Desc_IronIngot_C',
      Amount: 3,
    });
    expect(result.products[0]).toEqual({
      ItemClass: 'Desc_IronPlate_C',
      Amount: 2,
    });
  });
});

describe('isRawResource', () => {
  test('应该识别原始矿石', () => {
    expect(isRawResource('Desc_OreIron_C')).toBe(true);
    expect(isRawResource('Desc_OreCopper_C')).toBe(true);
    expect(isRawResource('Desc_Water_C')).toBe(true);
  });

  test('应该不将加工物品识别为原始资源', () => {
    expect(isRawResource('Desc_IronIngot_C')).toBe(false);
    expect(isRawResource('Desc_IronPlate_C')).toBe(false);
  });
});

describe('calculateProductionTree - 单层生产链', () => {
  let recipesMap: Map<string, ParsedRecipe>;

  beforeEach(() => {
    recipesMap = new Map();
    mockRecipes.forEach(recipe => {
      const parsed = parseRecipe(recipe);
      recipesMap.set(parsed.className, parsed);
    });
  });

  test('应该正确计算铁锭生产（1层：矿石 -> 铁锭）', () => {
    // 目标: 生产 30 铁锭/分钟
    // 配方: 1 铁矿石 -> 1 铁锭，耗时 2 秒
    // 生产速率: 1 / 2秒 * 60 = 30 铁锭/分钟/熔炉
    // 需要建筑: 30 / 30 = 1 熔炉
    
    const result = calculateProductionTree(
      'Desc_IronIngot_C',
      30,
      recipesMap,
      mockItemNames
    );

    expect(result).not.toBeNull();
    expect(result!.itemName).toBe('Iron Ingot');
    expect(result!.targetRate).toBe(30);
    expect(result!.buildingCount).toBeCloseTo(1, 2);
    expect(result!.actualRate).toBeCloseTo(30, 2);
    
    // 应该有1个子节点（铁矿石）
    expect(result!.children).toHaveLength(1);
    expect(result!.children[0].itemClass).toBe('Desc_OreIron_C');
    expect(result!.children[0].targetRate).toBeCloseTo(30, 2);
  });

  test('应该正确计算铁板生产（2层：矿石 -> 铁锭 -> 铁板）', () => {
    // 目标: 生产 20 铁板/分钟
    // 配方: 3 铁锭 -> 2 铁板，耗时 6 秒
    // 生产速率: 2 / 6秒 * 60 = 20 铁板/分钟/构造机
    // 需要建筑: 20 / 20 = 1 构造机
    // 需要铁锭: 3 / 6秒 * 60 * 1 = 30 铁锭/分钟
    
    const result = calculateProductionTree(
      'Desc_IronPlate_C',
      20,
      recipesMap,
      mockItemNames
    );

    expect(result).not.toBeNull();
    expect(result!.itemName).toBe('Iron Plate');
    expect(result!.targetRate).toBe(20);
    expect(result!.buildingCount).toBeCloseTo(1, 2);
    
    // 检查铁锭需求
    expect(result!.children).toHaveLength(1);
    const ironIngotNode = result!.children[0];
    expect(ironIngotNode.itemClass).toBe('Desc_IronIngot_C');
    expect(ironIngotNode.targetRate).toBeCloseTo(30, 2);
    
    // 检查铁矿石需求
    expect(ironIngotNode.children).toHaveLength(1);
    expect(ironIngotNode.children[0].itemClass).toBe('Desc_OreIron_C');
    expect(ironIngotNode.children[0].targetRate).toBeCloseTo(30, 2);
  });
});

describe('calculateProductionTree - 多层复杂生产链', () => {
  let recipesMap: Map<string, ParsedRecipe>;

  beforeEach(() => {
    recipesMap = new Map();
    mockRecipes.forEach(recipe => {
      const parsed = parseRecipe(recipe);
      recipesMap.set(parsed.className, parsed);
    });
  });

  test('应该正确计算强化铁板生产（4层复杂生产链）', () => {
    // 强化铁板配方: 6 铁板 + 12 螺丝 -> 1 强化铁板，耗时 12 秒
    // 目标: 生产 5 强化铁板/分钟
    // 生产速率: 1 / 12秒 * 60 = 5 强化铁板/分钟/组装机
    // 需要建筑: 5 / 5 = 1 组装机
    
    const result = calculateProductionTree(
      'Desc_IronPlateReinforced_C',
      5,
      recipesMap,
      mockItemNames
    );

    expect(result).not.toBeNull();
    expect(result!.itemName).toBe('Reinforced Iron Plate');
    expect(result!.targetRate).toBe(5);
    expect(result!.buildingCount).toBeCloseTo(1, 2);
    
    // 应该有2个子节点：铁板和螺丝
    expect(result!.children).toHaveLength(2);
    
    // 检查铁板需求: 6 / 12秒 * 60 * 1 = 30 铁板/分钟
    const ironPlateNode = result!.children.find(c => c.itemClass === 'Desc_IronPlate_C');
    expect(ironPlateNode).toBeDefined();
    expect(ironPlateNode!.targetRate).toBeCloseTo(30, 2);
    
    // 检查螺丝需求: 12 / 12秒 * 60 * 1 = 60 螺丝/分钟
    const screwNode = result!.children.find(c => c.itemClass === 'Desc_IronScrew_C');
    expect(screwNode).toBeDefined();
    expect(screwNode!.targetRate).toBeCloseTo(60, 2);
    
    // 螺丝来自铁棒: 4螺丝 / 6秒 = 40螺丝/分钟/构造机
    // 需要: 60 / 40 = 1.5 构造机
    expect(screwNode!.buildingCount).toBeCloseTo(1.5, 2);
    
    // 螺丝需要铁棒: 1 / 6秒 * 60 * 1.5 = 15 铁棒/分钟
    const ironRodNode = screwNode!.children[0];
    expect(ironRodNode.itemClass).toBe('Desc_IronRod_C');
    expect(ironRodNode.targetRate).toBeCloseTo(15, 2);
  });
});

describe('aggregateResources', () => {
  let recipesMap: Map<string, ParsedRecipe>;

  beforeEach(() => {
    recipesMap = new Map();
    mockRecipes.forEach(recipe => {
      const parsed = parseRecipe(recipe);
      recipesMap.set(parsed.className, parsed);
    });
  });

  test('应该正确聚合所有资源需求', () => {
    const tree = calculateProductionTree(
      'Desc_IronPlateReinforced_C',
      5,
      recipesMap,
      mockItemNames
    );

    expect(tree).not.toBeNull();
    
    const aggregated = aggregateResources(tree!, {}, mockItemNames);
    
    // 应该包含所有中间产物
    expect(aggregated['Desc_IronPlateReinforced_C']).toBeDefined();
    expect(aggregated['Desc_IronPlate_C']).toBeDefined();
    expect(aggregated['Desc_IronScrew_C']).toBeDefined();
    expect(aggregated['Desc_IronRod_C']).toBeDefined();
    expect(aggregated['Desc_IronIngot_C']).toBeDefined();
    expect(aggregated['Desc_OreIron_C']).toBeDefined();
    
    // 检查原始资源标记
    expect(aggregated['Desc_OreIron_C'].isRawResource).toBe(true);
    expect(aggregated['Desc_IronIngot_C'].isRawResource).toBe(false);
  });

  test('应该正确累加重复出现的资源', () => {
    // 强化铁板需要铁锭来自两个来源：铁板链和螺丝链
    const tree = calculateProductionTree(
      'Desc_IronPlateReinforced_C',
      5,
      recipesMap,
      mockItemNames
    );

    const aggregated = aggregateResources(tree!, {}, mockItemNames);
    
    // 铁锭需求 = 铁板需求 + 螺丝链的需求
    // 铁板: 30铁板/分钟 需要 30*3/2 = 45 铁锭/分钟
    // 螺丝链: 15铁棒/分钟 需要 15 铁锭/分钟
    // 总计: 45 + 15 = 60 铁锭/分钟
    expect(aggregated['Desc_IronIngot_C'].totalRate).toBeCloseTo(60, 1);
    
    // 铁矿石需求应该等于铁锭需求（1:1）
    expect(aggregated['Desc_OreIron_C'].totalRate).toBeCloseTo(60, 1);
  });
});

describe('aggregateBuildings', () => {
  let recipesMap: Map<string, ParsedRecipe>;

  beforeEach(() => {
    recipesMap = new Map();
    mockRecipes.forEach(recipe => {
      const parsed = parseRecipe(recipe);
      recipesMap.set(parsed.className, parsed);
    });
  });

  test('应该正确统计所有建筑需求', () => {
    const tree = calculateProductionTree(
      'Desc_IronPlateReinforced_C',
      5,
      recipesMap,
      mockItemNames
    );

    expect(tree).not.toBeNull();
    
    const buildings = aggregateBuildings(tree!);
    
    // 应该包含: 组装机、构造机、熔炉
    expect(buildings['AssemblerMk1']).toBeDefined();
    expect(buildings['ConstructorMk1']).toBeDefined();
    expect(buildings['SmelterMk1']).toBeDefined();
    
    // 验证数量（大致）
    expect(buildings['AssemblerMk1']).toBeCloseTo(1, 1); // 1个组装机
    expect(buildings['ConstructorMk1']).toBeCloseTo(4, 1); // 1.5 + 1.5 + 1 构造机
    expect(buildings['SmelterMk1']).toBeCloseTo(2, 1); // 2 个熔炉
  });
});

describe('calculateFullProductionTree', () => {
  let recipesMap: Map<string, ParsedRecipe>;

  beforeEach(() => {
    recipesMap = new Map();
    mockRecipes.forEach(recipe => {
      const parsed = parseRecipe(recipe);
      recipesMap.set(parsed.className, parsed);
    });
  });

  test('应该返回完整的生产树结果', () => {
    const result = calculateFullProductionTree(
      'Desc_IronPlateReinforced_C',
      5,
      recipesMap,
      mockItemNames
    );

    expect(result).not.toBeNull();
    expect(result!.rootNode).toBeDefined();
    expect(result!.totalBuildings).toBeDefined();
    expect(result!.rawResources).toBeDefined();
    expect(result!.allResources).toBeDefined();
    expect(result!.totalPower).toBeGreaterThan(0);
    
    // 验证原始资源只包含矿石
    const rawResourceKeys = Object.keys(result!.rawResources);
    expect(rawResourceKeys).toHaveLength(1);
    expect(rawResourceKeys[0]).toBe('Desc_OreIron_C');
  });

  test('应该正确计算总功耗', () => {
    const result = calculateFullProductionTree(
      'Desc_IronPlateReinforced_C',
      5,
      recipesMap,
      mockItemNames
    );

    expect(result).not.toBeNull();
    expect(result!.totalPower).toBeGreaterThan(0);
    
    // 功耗应该是所有建筑功耗的总和：2 熔炉 + 4 构造机 + 1 组装机 = 39 MW
    expect(result!.totalPower).toBeCloseTo(39, 1);
  });
});

describe('recipe selection and formatting helpers', () => {
  test('findRecipeForItem prefers standard recipes and falls back when needed', () => {
    const standardRecipe = parseRecipe({
      ClassName: 'Recipe_IngotIron_C',
      mDisplayName: 'Iron Ingot',
      mIngredients: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/RawResources/OreIron/Desc_OreIron.Desc_OreIron_C'\",Amount=1))",
      mProduct: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronIngot/Desc_IronIngot.Desc_IronIngot_C'\",Amount=1))",
      mManufactoringDuration: '2.000000',
      mProducedIn: "(\"/Game/FactoryGame/Buildable/Factory/SmelterMk1/Build_SmelterMk1.Build_SmelterMk1_C\")",
    });

    const fallbackOnlyRecipe = parseRecipe({
      ClassName: 'Recipe_Alternate_IronIngot_C',
      mDisplayName: 'Alternate: Iron Ingot',
      mIngredients: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/RawResources/OreIron/Desc_OreIron.Desc_OreIron_C'\",Amount=1))",
      mProduct: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/IronIngot/Desc_IronIngot.Desc_IronIngot_C'\",Amount=1))",
      mManufactoringDuration: '1.000000',
      mProducedIn: "(\"/Game/FactoryGame/Buildable/Factory/ConstructorMk1/Build_ConstructorMk1.Build_ConstructorMk1_C\")",
    });

    const fallbackMap = new Map<string, ParsedRecipe>([
      [fallbackOnlyRecipe.className, fallbackOnlyRecipe],
    ]);

    const standardMap = new Map<string, ParsedRecipe>([
      [fallbackOnlyRecipe.className, fallbackOnlyRecipe],
      [standardRecipe.className, standardRecipe],
    ]);

    expect(findRecipeForItem('Desc_IronIngot_C', standardMap)).toBe(standardRecipe);
    expect(findRecipeForItem('Desc_IronIngot_C', fallbackMap)).toBe(fallbackOnlyRecipe);
    expect(findRecipeForItem('Desc_Missing_C', standardMap)).toBeNull();
  });

  test('format helpers render deterministic text output', () => {
    const tree = calculateProductionTree('Desc_IronPlate_C', 20, new Map([
      [mockRecipes[0].ClassName, parseRecipe(mockRecipes[0])],
      [mockRecipes[1].ClassName, parseRecipe(mockRecipes[1])],
    ]), mockItemNames);

    expect(tree).not.toBeNull();
    expect(formatProductionTree(tree!)).toContain('Iron Plate (20.00/min)');
    expect(formatProductionTree(tree!)).toContain('Iron Ingot');

    expect(formatAggregatedResources({
      Desc_IronIngot_C: { itemName: 'Iron Ingot', totalRate: 30, isRawResource: false },
      Desc_OreIron_C: { itemName: 'Iron Ore', totalRate: 30, isRawResource: true },
    })).toBe('[中间产物] Iron Ingot: 30.00/min\n[原始资源] Iron Ore: 30.00/min');

    expect(formatBuildingStats({
      ConstructorMk1: 2,
      SmelterMk1: 1.5,
    })).toBe('ConstructorMk1: 2.00\nSmelterMk1: 1.50');
  });
});

// ============================================================================
// 集成测试 (Integration Tests)
// ============================================================================

describe('集成测试: 真实场景', () => {
  let recipesMap: Map<string, ParsedRecipe>;

  beforeEach(() => {
    recipesMap = new Map();
    mockRecipes.forEach(recipe => {
      const parsed = parseRecipe(recipe);
      recipesMap.set(parsed.className, parsed);
    });
  });

  test('场景: 建造一个每分钟生产10个强化铁板的工厂', () => {
    const result = calculateFullProductionTree(
      'Desc_IronPlateReinforced_C',
      10, // 10个/分钟
      recipesMap,
      mockItemNames
    );

    expect(result).not.toBeNull();
    
    // 打印生产树（用于调试）
    console.log('\n=== 生产树 ===');
    console.log(`目标: 10 强化铁板/分钟\n`);
    
    // 验证核心数据
    expect(result!.rootNode.targetRate).toBe(10);
    expect(result!.rawResources['Desc_OreIron_C']).toBeDefined();
    
    // 铁矿石需求应该是铁锭需求的总和
    const ironOreRate = result!.rawResources['Desc_OreIron_C'].totalRate;
    console.log(`\n原始资源需求:`);
    console.log(`- 铁矿石: ${ironOreRate.toFixed(2)}/分钟`);
    
    console.log(`\n建筑需求:`);
    Object.entries(result!.totalBuildings).forEach(([building, count]) => {
      console.log(`- ${building}: ${count.toFixed(2)}`);
    });
    
    console.log(`\n总功耗: ${result!.totalPower.toFixed(2)} MW`);
    
    // 验证数量合理性
    expect(ironOreRate).toBeGreaterThan(100); // 至少需要100+铁矿石/分钟
    expect(result!.totalPower).toBeGreaterThan(50); // 至少50MW功耗
  });
});
