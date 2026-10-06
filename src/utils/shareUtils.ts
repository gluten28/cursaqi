/**
 * Social Sharing and URL Utilities for CUrsaQi
 */

export interface ShareOptions {
  title: string;
  text?: string;
  url: string;
}

/**
 * Builds the canonical full URL for a course or the home page
 */
export function getFullShareUrl(courseId?: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://cursaqi.com";
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  if (courseId) {
    return `${origin}${path}?course=${encodeURIComponent(courseId)}`;
  }
  return `${origin}${path}`;
}

/**
 * Generates direct share URLs for popular social networks
 */
export function getSocialShareLinks(options: ShareOptions) {
  const encodedUrl = encodeURIComponent(options.url);
  const shareMessage = options.text 
    ? `${options.title} - ${options.text}` 
    : options.title;
  const encodedText = encodeURIComponent(shareMessage);

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage + "\n" + options.url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}&hashtags=CUrsaQi,Educacao,Cursos`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    email: `mailto:?subject=${encodeURIComponent(options.title)}&body=${encodeURIComponent(shareMessage + "\n\nAcesse aqui: " + options.url)}`
  };
}

/**
 * Copies a link to clipboard with modern API and legacy fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("navigator.clipboard failed, attempting fallback:", err);
  }

  // Fallback for older browsers or non-HTTPS local dev
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Fallback clipboard copy failed:", err);
    return false;
  }
}

/**
 * Triggers native Web Share API if supported on device (mobile browsers)
 */
export async function triggerNativeShare(options: ShareOptions): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: options.title,
        text: options.text || options.title,
        url: options.url
      });
      return true;
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("Web Share API error:", err);
      }
      return false;
    }
  }
  return false;
}
