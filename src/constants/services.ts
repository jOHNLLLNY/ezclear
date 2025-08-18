export type Service = {
  slug: string
  label: string
  icon: string // Ionicons name
  shortDescription?: string
}

// Deprecated: use CATEGORY_GROUPS and SERVICES_FLAT from constants/categories.ts for canonical services
export const SERVICES: ReadonlyArray<Service> = [
  { slug: 'handyman', label: 'Handyman', icon: 'construct-outline' },
  { slug: 'snow-removal', label: 'Snow Removal', icon: 'snow-outline' },
  { slug: 'landscaping', label: 'Landscaping', icon: 'leaf-outline' },
  { slug: 'renovation', label: 'Renovation', icon: 'hammer-outline' },
  { slug: 'cleaning', label: 'Cleaning', icon: 'sparkles-outline' },
  { slug: 'plumbing', label: 'Plumbing', icon: 'water-outline' },
  { slug: 'electrical', label: 'Electrical', icon: 'flash-outline' },
];
