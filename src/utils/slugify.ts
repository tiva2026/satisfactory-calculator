/**
 * Slug 转换工具
 * 用于将物品类名转换为 URL 友好的 slug
 */

/**
 * 将物品类名转换为 slug
 * 例如: "Desc_IronIngot_C" -> "iron-ingot"
 * 
 * @param itemClass 物品类名 (如 "Desc_IronIngot_C")
 * @returns URL 友好的 slug
 */
export function itemClassToSlug(itemClass: string): string {
  // 移除前缀 "Desc_" 和后缀 "_C"
  let slug = itemClass.replace(/^Desc_/, '').replace(/_C$/, '');
  
  // 将驼峰命名转换为连字符分隔
  // 例如: "IronIngot" -> "iron-ingot"
  slug = slug
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
  
  return slug;
}

/**
 * 将 slug 转换回物品类名
 * 例如: "iron-ingot" -> "Desc_IronIngot_C"
 * 
 * @param slug URL slug
 * @returns 物品类名
 */
export function slugToItemClass(slug: string): string {
  // 将连字符分隔转换为驼峰命名
  // 例如: "iron-ingot" -> "IronIngot"
  const camelCase = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  // 添加前缀和后缀
  return `Desc_${camelCase}_C`;
}

/**
 * 验证 slug 格式是否有效
 * 
 * @param slug URL slug
 * @returns 是否有效
 */
export function isValidSlug(slug: string): boolean {
  // slug 应该只包含小写字母、数字和连字符
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

/**
 * 通用 slugify 函数 - 将任意文本转换为 slug
 *
 * @param text 任意文本
 * @returns URL 友好的 slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
