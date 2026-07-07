/**
 * 从 en-US.json 提取真实配方数据
 * Extract real recipe data from en-US.json
 */

const fs = require('fs');
const path = require('path');

// 读取 JSON 文件
const filePath = path.join(__dirname, '..', 'en-US.json');
const jsonData = fs.readFileSync(filePath, 'utf-8');
const data = JSON.parse(jsonData);

console.log('开始提取配方数据...');

// 提取所有配方
const recipes = [];
data.forEach((entry) => {
  if (entry.Classes && Array.isArray(entry.Classes)) {
    entry.Classes.forEach((item) => {
      // 只提取有 mIngredients 和 mProduct 的配方
      if (item.ClassName && item.ClassName.startsWith('Recipe_') && 
          item.mIngredients && item.mProduct &&
          item.mIngredients !== '' && item.mProduct !== '') {
        recipes.push({
          ClassName: item.ClassName,
          mDisplayName: item.mDisplayName || '',
          mIngredients: item.mIngredients,
          mProduct: item.mProduct,
          mManufactoringDuration: item.mManufactoringDuration || '1.000000',
          mProducedIn: item.mProducedIn || '',
        });
      }
    });
  }
});

console.log(`找到 ${recipes.length} 个配方`);

// 生成 TypeScript 文件内容
const tsContent = `/**
 * 真实配方数据 - 从 en-US.json 提取
 * Real recipe data extracted from en-US.json
 * 
 * 生成时间: ${new Date().toISOString()}
 * Total recipes: ${recipes.length}
 */

export interface Recipe {
  ClassName: string;
  mDisplayName: string;
  mIngredients: string;
  mProduct: string;
  mManufactoringDuration: string;
  mProducedIn: string;
}

export const realRecipes: Recipe[] = ${JSON.stringify(recipes, null, 2)};

// 导出配方数量统计
export const recipeStats = {
  total: ${recipes.length},
  extractedAt: '${new Date().toISOString()}',
};
`;

// 写入文件
const outputPath = path.join(__dirname, '..', 'src', 'data', 'real-recipes.ts');
fs.writeFileSync(outputPath, tsContent, 'utf-8');

console.log(`✅ 配方数据已导出到: ${outputPath}`);
console.log(`✅ 共导出 ${recipes.length} 个配方`);

// 显示一些示例配方
console.log('\n示例配方:');
recipes.slice(0, 5).forEach((recipe) => {
  console.log(`- ${recipe.mDisplayName} (${recipe.ClassName})`);
});
