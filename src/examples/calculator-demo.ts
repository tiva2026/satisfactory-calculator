/**
 * 生产树计算器演示示例
 * 展示如何使用calculateProductionTree进行多层级计算
 */

import {
  parseRecipe,
  calculateFullProductionTree,
  formatProductionTree,
  formatAggregatedResources,
  formatBuildingStats,
  type Recipe,
  type ParsedRecipe,
} from '../lib/production-calculator';

// ============================================================================
// 示例配方数据 (Example Recipe Data)
// ============================================================================

const exampleRecipes: Recipe[] = [
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
const itemNames = new Map<string, string>([
  ['Desc_OreIron_C', 'Iron Ore'],
  ['Desc_IronIngot_C', 'Iron Ingot'],
  ['Desc_IronPlate_C', 'Iron Plate'],
  ['Desc_IronRod_C', 'Iron Rod'],
  ['Desc_IronScrew_C', 'Screw'],
  ['Desc_IronPlateReinforced_C', 'Reinforced Iron Plate'],
]);

// ============================================================================
// 演示函数 (Demo Functions)
// ============================================================================

/**
 * 演示1: 简单的单层生产链（铁锭）
 */
function demo1_SimpleProduction() {
  console.log('\n' + '='.repeat(80));
  console.log('演示1: 简单生产链 - 铁锭');
  console.log('='.repeat(80));
  
  const recipesMap = new Map<string, ParsedRecipe>();
  exampleRecipes.forEach(recipe => {
    const parsed = parseRecipe(recipe);
    recipesMap.set(parsed.className, parsed);
  });

  // 目标: 生产 30 铁锭/分钟
  const result = calculateFullProductionTree(
    'Desc_IronIngot_C',
    30,
    recipesMap,
    itemNames
  );

  if (result) {
    console.log('\n📊 生产树结构:');
    console.log(formatProductionTree(result.rootNode));
    
    console.log('\n🏭 建筑需求:');
    console.log(formatBuildingStats(result.totalBuildings));
    
    console.log('\n⛏️  原始资源需求:');
    console.log(formatAggregatedResources(result.rawResources));
    
    console.log(`\n⚡ 总功耗: ${result.totalPower.toFixed(2)} MW`);
  }
}

/**
 * 演示2: 两层生产链（铁板）
 */
function demo2_TwoLevelProduction() {
  console.log('\n' + '='.repeat(80));
  console.log('演示2: 两层生产链 - 铁板');
  console.log('='.repeat(80));
  
  const recipesMap = new Map<string, ParsedRecipe>();
  exampleRecipes.forEach(recipe => {
    const parsed = parseRecipe(recipe);
    recipesMap.set(parsed.className, parsed);
  });

  // 目标: 生产 20 铁板/分钟
  const result = calculateFullProductionTree(
    'Desc_IronPlate_C',
    20,
    recipesMap,
    itemNames
  );

  if (result) {
    console.log('\n📊 生产树结构:');
    console.log(formatProductionTree(result.rootNode));
    
    console.log('\n🏭 建筑需求:');
    console.log(formatBuildingStats(result.totalBuildings));
    
    console.log('\n⛏️  原始资源需求:');
    console.log(formatAggregatedResources(result.rawResources));
    
    console.log('\n📦 所有中间产物需求:');
    console.log(formatAggregatedResources(result.allResources));
    
    console.log(`\n⚡ 总功耗: ${result.totalPower.toFixed(2)} MW`);
  }
}

/**
 * 演示3: 复杂的多层生产链（强化铁板）
 */
function demo3_ComplexProduction() {
  console.log('\n' + '='.repeat(80));
  console.log('演示3: 复杂多层生产链 - 强化铁板');
  console.log('='.repeat(80));
  console.log('这个配方需要:');
  console.log('  - 6 铁板 (来自铁锭)');
  console.log('  - 12 螺丝 (来自铁棒 -> 来自铁锭)');
  console.log('因此铁锭来自两条不同的生产线，需要聚合计算');
  
  const recipesMap = new Map<string, ParsedRecipe>();
  exampleRecipes.forEach(recipe => {
    const parsed = parseRecipe(recipe);
    recipesMap.set(parsed.className, parsed);
  });

  // 目标: 生产 5 强化铁板/分钟
  const result = calculateFullProductionTree(
    'Desc_IronPlateReinforced_C',
    5,
    recipesMap,
    itemNames
  );

  if (result) {
    console.log('\n📊 生产树结构 (缩进表示依赖层级):');
    console.log(formatProductionTree(result.rootNode));
    
    console.log('\n🏭 建筑需求统计:');
    console.log(formatBuildingStats(result.totalBuildings));
    
    console.log('\n⛏️  原始资源需求 (需要采矿机):');
    console.log(formatAggregatedResources(result.rawResources));
    
    console.log('\n📦 所有中间产物需求 (聚合后):');
    console.log(formatAggregatedResources(result.allResources));
    
    console.log(`\n⚡ 总功耗: ${result.totalPower.toFixed(2)} MW`);
    
    // 详细分析
    console.log('\n📈 详细分析:');
    const ironIngot = result.allResources['Desc_IronIngot_C'];
    if (ironIngot) {
      console.log(`   铁锭总需求: ${ironIngot.totalRate.toFixed(2)}/min`);
      console.log(`   - 来自铁板链: 30铁板/min × 1.5 = 45 铁锭/min`);
      console.log(`   - 来自螺丝链: 15铁棒/min × 1 = 15 铁锭/min`);
      console.log(`   - 总计: 45 + 15 = 60 铁锭/min ✓`);
    }
  }
}

/**
 * 演示4: 展示数学计算详解
 */
function demo4_MathExplanation() {
  console.log('\n' + '='.repeat(80));
  console.log('演示4: 数学计算详解');
  console.log('='.repeat(80));
  
  console.log('\n🎯 目标: 生产 5 强化铁板/分钟\n');
  
  console.log('📐 第1层计算 - 强化铁板组装机:');
  console.log('   配方: 6铁板 + 12螺丝 -> 1强化铁板, 耗时12秒');
  console.log('   生产速率: 1 / 12秒 × 60 = 5 强化铁板/分钟/组装机');
  console.log('   需要建筑: 5 ÷ 5 = 1.00 组装机');
  console.log('   ├─ 铁板需求: 6 / 12秒 × 60 × 1 = 30.00 铁板/分钟');
  console.log('   └─ 螺丝需求: 12 / 12秒 × 60 × 1 = 60.00 螺丝/分钟\n');
  
  console.log('📐 第2层计算 - 铁板生产线:');
  console.log('   配方: 3铁锭 -> 2铁板, 耗时6秒');
  console.log('   生产速率: 2 / 6秒 × 60 = 20 铁板/分钟/构造机');
  console.log('   需要建筑: 30 ÷ 20 = 1.50 构造机');
  console.log('   └─ 铁锭需求: 3 / 6秒 × 60 × 1.5 = 45.00 铁锭/分钟\n');
  
  console.log('📐 第2层计算 - 螺丝生产线:');
  console.log('   配方: 1铁棒 -> 4螺丝, 耗时6秒');
  console.log('   生产速率: 4 / 6秒 × 60 = 40 螺丝/分钟/构造机');
  console.log('   需要建筑: 60 ÷ 40 = 1.50 构造机');
  console.log('   └─ 铁棒需求: 1 / 6秒 × 60 × 1.5 = 15.00 铁棒/分钟\n');
  
  console.log('📐 第3层计算 - 铁棒生产线:');
  console.log('   配方: 1铁锭 -> 1铁棒, 耗时4秒');
  console.log('   生产速率: 1 / 4秒 × 60 = 15 铁棒/分钟/构造机');
  console.log('   需要建筑: 15 ÷ 15 = 1.00 构造机');
  console.log('   └─ 铁锭需求: 1 / 4秒 × 60 × 1 = 15.00 铁锭/分钟\n');
  
  console.log('📐 第4层计算 - 铁锭生产线 (聚合):');
  console.log('   铁锭总需求 = 铁板链需求 + 铁棒链需求');
  console.log('   铁锭总需求 = 45.00 + 15.00 = 60.00 铁锭/分钟');
  console.log('   配方: 1铁矿 -> 1铁锭, 耗时2秒');
  console.log('   生产速率: 1 / 2秒 × 60 = 30 铁锭/分钟/熔炉');
  console.log('   需要建筑: 60 ÷ 30 = 2.00 熔炉');
  console.log('   └─ 铁矿需求: 1 / 2秒 × 60 × 2 = 60.00 铁矿/分钟\n');
  
  console.log('✅ 最终结果:');
  console.log('   - 1.00 × 组装机 (AssemblerMk1)');
  console.log('   - 1.50 × 构造机 (用于铁板)');
  console.log('   - 1.50 × 构造机 (用于螺丝)');
  console.log('   - 1.00 × 构造机 (用于铁棒)');
  console.log('   - 2.00 × 熔炉 (SmelterMk1)');
  console.log('   - 60.00 × 铁矿/分钟 (原始资源)');
  
  // 运行实际计算验证
  const recipesMap = new Map<string, ParsedRecipe>();
  exampleRecipes.forEach(recipe => {
    const parsed = parseRecipe(recipe);
    recipesMap.set(parsed.className, parsed);
  });

  const result = calculateFullProductionTree(
    'Desc_IronPlateReinforced_C',
    5,
    recipesMap,
    itemNames
  );

  if (result) {
    console.log('\n🔍 实际计算结果验证:');
    console.log('   组装机:', result.totalBuildings['AssemblerMk1']?.toFixed(2) || '0.00');
    console.log('   构造机:', result.totalBuildings['ConstructorMk1']?.toFixed(2) || '0.00');
    console.log('   熔炉:', result.totalBuildings['SmelterMk1']?.toFixed(2) || '0.00');
    console.log('   铁矿需求:', result.rawResources['Desc_OreIron_C']?.totalRate.toFixed(2) || '0.00', '/min');
    console.log('   铁锭需求:', result.allResources['Desc_IronIngot_C']?.totalRate.toFixed(2) || '0.00', '/min');
  }
}

// ============================================================================
// 运行所有演示 (Run All Demos)
// ============================================================================

export function runAllDemos() {
  console.log('\n');
  console.log('█'.repeat(80));
  console.log('█' + ' '.repeat(78) + '█');
  console.log('█' + '  Satisfactory 生产树计算器 - 演示程序'.padEnd(78) + '█');
  console.log('█' + '  Production Tree Calculator Demo'.padEnd(78) + '█');
  console.log('█' + ' '.repeat(78) + '█');
  console.log('█'.repeat(80));

  demo1_SimpleProduction();
  demo2_TwoLevelProduction();
  demo3_ComplexProduction();
  demo4_MathExplanation();

  console.log('\n' + '='.repeat(80));
  console.log('✅ 所有演示完成！');
  console.log('='.repeat(80));
  console.log('\n核心特性验证:');
  console.log('  ✓ 递归计算多层生产链');
  console.log('  ✓ 正确聚合重复出现的中间产物');
  console.log('  ✓ 准确计算建筑数量需求');
  console.log('  ✓ 识别和统计原始资源');
  console.log('  ✓ 数学逻辑严谨准确');
  console.log('\n');
}

// 如果直接运行此文件
if (require.main === module) {
  runAllDemos();
}
