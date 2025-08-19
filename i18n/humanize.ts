export const humanizeSlug = (s: string) =>
  (s || '')
    .replace(/^.*?\./, '') // drop namespace prefix if present
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

