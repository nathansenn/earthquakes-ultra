/**
 * Emits schema.org BreadcrumbList structured data for a page's navigation
 * trail. Render it anywhere in a server component alongside the visible
 * breadcrumb; pass items in order from root to current page. Omit `path`
 * on the final (current) item — its URL is optional per Google's spec.
 */
export type Crumb = { name: string; path?: string };

const BASE = (process.env.NEXT_PUBLIC_BASE_URL || "https://quakeglobe.com").replace(/\/$/, "");

export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.path ? { item: `${BASE}${it.path}` } : {}),
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
