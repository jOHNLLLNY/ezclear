export type CategoryItem = {
  slug: string;
  label: string;
  icon: string; // Ionicons closest match
};

export type CategoryGroup = {
  group: 'renovation' | 'outdoor' | 'maintenance' | 'special';
  label: string;
  items: ReadonlyArray<CategoryItem>;
};

// Fixed groups and items (closest Ionicons icon names)
export const CATEGORY_GROUPS: ReadonlyArray<CategoryGroup> = [
  {
    group: 'renovation',
    label: 'Renovation',
    items: [
      { slug: 'drywall-installation', label: 'services.drywall-installation', icon: 'albums-outline' },
      { slug: 'insulation', label: 'services.insulation', icon: 'home-outline' },
      { slug: 'plastering', label: 'services.plastering', icon: 'color-wand-outline' },
      { slug: 'painting', label: 'services.painting', icon: 'brush-outline' },
      { slug: 'flooring', label: 'services.flooring', icon: 'layers-outline' },
      { slug: 'tiling', label: 'services.tiling', icon: 'square-outline' },
      { slug: 'demolition', label: 'services.demolition', icon: 'hammer-outline' },
      { slug: 'kitchen-renovation', label: 'services.kitchen-renovation', icon: 'restaurant-outline' },
      { slug: 'bathroom-renovation', label: 'services.bathroom-renovation', icon: 'water-outline' },
      { slug: 'basement-finishing', label: 'services.basement-finishing', icon: 'home-outline' },
      { slug: 'electrical', label: 'services.electrical', icon: 'flash-outline' },
      { slug: 'plumbing', label: 'services.plumbing', icon: 'water-outline' },
      { slug: 'window-installation', label: 'services.window-installation', icon: 'square-outline' },
      { slug: 'carpentry', label: 'services.carpentry', icon: 'construct-outline' },
    ],
  },
  {
    group: 'outdoor',
    label: 'Outdoor Services',
    items: [
      { slug: 'snow-removal', label: 'services.snow-removal', icon: 'snow-outline' },
      { slug: 'lawn-mowing', label: 'services.lawn-mowing', icon: 'cut-outline' },
      { slug: 'leaf-cleanup', label: 'services.leaf-cleanup', icon: 'leaf-outline' },
      { slug: 'gutter-cleaning', label: 'services.gutter-cleaning', icon: 'water-outline' },
      { slug: 'fence-repair', label: 'services.fence-repair', icon: 'trail-sign-outline' },
      { slug: 'power-washing', label: 'services.power-washing', icon: 'color-wand-outline' },
      { slug: 'tree-trimming', label: 'services.tree-trimming', icon: 'leaf-outline' },
      { slug: 'gardening', label: 'services.gardening', icon: 'leaf-outline' },
      { slug: 'deck-staining', label: 'services.deck-staining', icon: 'color-palette-outline' },
      { slug: 'roof-cleaning', label: 'services.roof-cleaning', icon: 'home-outline' },
      { slug: 'driveway-sealing', label: 'services.driveway-sealing', icon: 'shield-outline' },
      { slug: 'junk-removal', label: 'services.junk-removal', icon: 'trash-outline' },
    ],
  },
  {
    group: 'maintenance',
    label: 'Maintenance',
    items: [
      { slug: 'handyman', label: 'services.handyman', icon: 'construct-outline' },
      { slug: 'appliance-installation', label: 'services.appliance-installation', icon: 'power-outline' },
      { slug: 'filter-change', label: 'services.filter-change', icon: 'filter-outline' },
      { slug: 'minor-fixes', label: 'services.minor-fixes', icon: 'construct-outline' },
      { slug: 'seasonal-maintenance', label: 'services.seasonal-maintenance', icon: 'calendar-outline' },
    ],
  },
  {
    group: 'special',
    label: 'Special',
    items: [
      { slug: 'landscaping', label: 'services.landscaping', icon: 'image-outline' },
      { slug: 'ice-control', label: 'services.ice-control', icon: 'snow-outline' }, // replaced ice-cream with snow
    ],
  },
] as const;

// Flat list for Home services row
export const SERVICES_FLAT = CATEGORY_GROUPS.flatMap((g) =>
  g.items.map((i) => ({ ...i, group: g.group }))
) as ReadonlyArray<
  CategoryItem & { group: CategoryGroup['group'] }
>;

