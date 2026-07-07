/**
 * Mock配方数据 - 用于演示生产计算引擎
 * 基于 Satisfactory 游戏的真实配方数据
 */

import type { Recipe } from '../lib/production-calculator';

export const mockRecipes: Recipe[] = [
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
  // 铜锭 (Copper Ingot) - 从铜矿石冶炼
  {
    ClassName: 'Recipe_IngotCopper_C',
    mDisplayName: 'Copper Ingot',
    mIngredients: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/RawResources/OreCopper/Desc_OreCopper.Desc_OreCopper_C'\",Amount=1))",
    mProduct: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/CopperIngot/Desc_CopperIngot.Desc_CopperIngot_C'\",Amount=1))",
    mManufactoringDuration: '2.000000',
    mProducedIn: "(\"/Game/FactoryGame/Buildable/Factory/SmelterMk1/Build_SmelterMk1.Build_SmelterMk1_C\")",
  },
  // 电线 (Wire) - 从铜锭制造
  {
    ClassName: 'Recipe_Wire_C',
    mDisplayName: 'Wire',
    mIngredients: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/CopperIngot/Desc_CopperIngot.Desc_CopperIngot_C'\",Amount=1))",
    mProduct: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/Wire/Desc_Wire.Desc_Wire_C'\",Amount=2))",
    mManufactoringDuration: '4.000000',
    mProducedIn: "(\"/Game/FactoryGame/Buildable/Factory/ConstructorMk1/Build_ConstructorMk1.Build_ConstructorMk1_C\")",
  },
  // 电缆 (Cable) - 从电线制造
  {
    ClassName: 'Recipe_Cable_C',
    mDisplayName: 'Cable',
    mIngredients: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/Wire/Desc_Wire.Desc_Wire_C'\",Amount=2))",
    mProduct: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/Cable/Desc_Cable.Desc_Cable_C'\",Amount=1))",
    mManufactoringDuration: '2.000000',
    mProducedIn: "(\"/Game/FactoryGame/Buildable/Factory/ConstructorMk1/Build_ConstructorMk1.Build_ConstructorMk1_C\")",
  },
  // 混凝土 (Concrete) - 从石灰石制造
  {
    ClassName: 'Recipe_Concrete_C',
    mDisplayName: 'Concrete',
    mIngredients: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/RawResources/Stone/Desc_Stone.Desc_Stone_C'\",Amount=3))",
    mProduct: "((ItemClass=\"/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Resource/Parts/Cement/Desc_Cement.Desc_Cement_C'\",Amount=1))",
    mManufactoringDuration: '4.000000',
    mProducedIn: "(\"/Game/FactoryGame/Buildable/Factory/ConstructorMk1/Build_ConstructorMk1.Build_ConstructorMk1_C\")",
  },
];

// 物品名称映射 (ClassName -> Display Name)
export const mockItemNames = new Map<string, string>([
  ['Desc_OreIron_C', 'Iron Ore'],
  ['Desc_IronIngot_C', 'Iron Ingot'],
  ['Desc_IronPlate_C', 'Iron Plate'],
  ['Desc_IronRod_C', 'Iron Rod'],
  ['Desc_IronScrew_C', 'Screw'],
  ['Desc_IronPlateReinforced_C', 'Reinforced Iron Plate'],
  ['Desc_OreCopper_C', 'Copper Ore'],
  ['Desc_CopperIngot_C', 'Copper Ingot'],
  ['Desc_Wire_C', 'Wire'],
  ['Desc_Cable_C', 'Cable'],
  ['Desc_Stone_C', 'Limestone'],
  ['Desc_Cement_C', 'Concrete'],
]);

// 物品到ClassName的反向映射 (用于通过mDisplayName查找)
export const itemDisplayNameToClassName = new Map<string, string>([
  ['Iron Ore', 'Desc_OreIron_C'],
  ['Iron Ingot', 'Desc_IronIngot_C'],
  ['Iron Plate', 'Desc_IronPlate_C'],
  ['Iron Rod', 'Desc_IronRod_C'],
  ['Screw', 'Desc_IronScrew_C'],
  ['Reinforced Iron Plate', 'Desc_IronPlateReinforced_C'],
  ['Copper Ore', 'Desc_OreCopper_C'],
  ['Copper Ingot', 'Desc_CopperIngot_C'],
  ['Wire', 'Desc_Wire_C'],
  ['Cable', 'Desc_Cable_C'],
  ['Limestone', 'Desc_Stone_C'],
  ['Concrete', 'Desc_Cement_C'],
]);
