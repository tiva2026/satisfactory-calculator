import * as fs from 'fs';
import * as path from 'path';
import { itemClassToSlug, slugToItemClass } from './slugify';

function loadGameItems(): Array<{ ClassName?: string; mDisplayName?: string }> {
  const filePath = path.join(process.cwd(), 'en-US.json');
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const dataArray = JSON.parse(jsonData);

  const items: Array<{ ClassName?: string; mDisplayName?: string }> = [];
  dataArray.forEach((nativeClass: any) => {
    if (nativeClass.Classes && Array.isArray(nativeClass.Classes)) {
      items.push(...nativeClass.Classes);
    }
  });

  return items.filter(
    (item) => item.ClassName?.startsWith('Desc_') && item.mDisplayName && item.mDisplayName.trim()
  );
}

describe('slugify route helpers', () => {
  test('itemClassToSlug and slugToItemClass round-trip a selectable item class', () => {
    expect(itemClassToSlug('Desc_IronIngot_C')).toBe('iron-ingot');
    expect(slugToItemClass('iron-ingot')).toBe('Desc_IronIngot_C');
  });

  test('all selectable item classes produce unique slugs', () => {
    const items = loadGameItems();
    const slugs = items.map((item) => itemClassToSlug(item.ClassName!));
    const uniqueSlugs = new Set(slugs);

    expect(uniqueSlugs.size).toBe(slugs.length);
    expect(slugs).toContain('iron-ingot');
    expect(slugs).toContain('iron-plate');
    expect(slugs).toContain('iron-plate-reinforced');
  });
});
