import * as fs from 'fs';
import * as path from 'path';
import type { MetadataRoute } from 'next';
import { slugify } from '@/src/utils/slugify';

/**
 * Next.js 14 动态 Sitemap 生成
 * 自动包含所有物品页面，供 Google 爬取
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://satis.cc';

  // 静态页面
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/calc`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // 动态物品页面
  let itemRoutes: MetadataRoute.Sitemap = [];

  try {
    const filePath = path.join(process.cwd(), 'en-US.json');
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const dataArray = JSON.parse(jsonData);

    // 扁平化所有 Classes
    const allClasses: any[] = [];
    dataArray.forEach((nativeClass: any) => {
      if (nativeClass.Classes && Array.isArray(nativeClass.Classes)) {
        allClasses.push(...nativeClass.Classes);
      }
    });

    // 只包含真正可计算的物品页，避免 recipe / building 页面进入 sitemap
    const items = allClasses.filter(
      (item) => item.ClassName?.startsWith('Desc_') && item.mDisplayName && item.mDisplayName.trim()
    );

    itemRoutes = items.map((item: any) => ({
      url: `${baseUrl}/calc/${slugify(item.mDisplayName)}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Sitemap: Error reading en-US.json', error);
  }

  return [...staticRoutes, ...itemRoutes];
}
