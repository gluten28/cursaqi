/**
 * SEO & Dynamic Meta Tags Utility for CUrsaQi
 */

export interface SEOMetadata {
  title?: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  type?: string;
}

const DEFAULT_TITLE = "CUrsaQi | Cursos Online de Informática com Aldo Valige";
const DEFAULT_DESCRIPTION = "Plataforma de cursos online na área de Informática com o Formador Aldo Valige. Cursos gratuitos e à venda para quem quer aprender e saber das coisas na área de tecnologia.";
const DEFAULT_IMAGE = "https://ik.imagekit.io/mdsiwq57o/CursaQI/Logotipo.png";

/**
 * Updates document title and Open Graph / Twitter meta tags dynamically
 */
export function updateSEOTags(meta: SEOMetadata) {
  if (typeof document === "undefined") return;

  const title = meta.title ? `${meta.title} | CUrsaQi` : DEFAULT_TITLE;
  const description = meta.description || DEFAULT_DESCRIPTION;
  const imageUrl = meta.imageUrl || DEFAULT_IMAGE;
  const url = meta.url || (typeof window !== "undefined" ? window.location.href : "https://cursaqi.com");

  // Document title
  document.title = title;

  // Helper to update or create a meta tag
  const setMetaTag = (attribute: "name" | "property", key: string, content: string) => {
    let element = document.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attribute, key);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  };

  // Standard metadata
  setMetaTag("name", "description", description);

  // Open Graph (Facebook, WhatsApp, LinkedIn)
  setMetaTag("property", "og:title", title);
  setMetaTag("property", "og:description", description);
  setMetaTag("property", "og:image", imageUrl);
  setMetaTag("property", "og:url", url);
  setMetaTag("property", "og:type", meta.type || "website");
  setMetaTag("property", "og:site_name", "CUrsaQi");

  // Twitter Cards
  setMetaTag("name", "twitter:card", "summary_large_image");
  setMetaTag("name", "twitter:title", title);
  setMetaTag("name", "twitter:description", description);
  setMetaTag("name", "twitter:image", imageUrl);

  // Canonical Link
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", url);
}

/**
 * Resets SEO tags back to default homepage values
 */
export function resetDefaultSEO() {
  updateSEOTags({
    title: undefined,
    description: DEFAULT_DESCRIPTION,
    imageUrl: DEFAULT_IMAGE,
    url: typeof window !== "undefined" ? window.location.origin : "https://cursaqi.com"
  });
}
