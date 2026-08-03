// src/utils/videoUtils.ts

/**
 * Tipos de fornecedores suportados
 */
export type VideoProvider =
  | "wistia"
  | "youtube"
  | "vimeo"
  | "mp4"
  | "unknown";

export interface ParsedVideo {
  provider: VideoProvider;
  id: string;
}

/**
 * Extrai o Media ID da Wistia a partir de qualquer formato conhecido.
 */
export function extractWistiaId(input: string): string | null {
  if (!input) return null;

  const value = input.trim();

  // Caso já seja apenas o Media ID
  if (/^[a-zA-Z0-9]{10}$/.test(value)) {
    return value;
  }

  // Match embed/iframe/, embed/, medias/, or media-id=" followed by a 10-char alphanumeric Wistia ID
  let match = value.match(/(?:embed\/iframe\/|embed\/|medias\/|media-id=['"])([a-zA-Z0-9]{10})/);
  if (match) {
    return match[1];
  }

  return null;
}

/**
 * Detecta automaticamente o fornecedor do vídeo.
 */
export function detectVideoProvider(url: string): VideoProvider {
  if (!url) return "unknown";

  const value = url.toLowerCase();

  if (
    value.includes("wistia") ||
    /^[a-z0-9]{10}$/i.test(value)
  ) {
    return "wistia";
  }

  if (
    value.includes("youtube.com") ||
    value.includes("youtu.be")
  ) {
    return "youtube";
  }

  if (value.includes("vimeo.com")) {
    return "vimeo";
  }

  if (
    value.endsWith(".mp4") ||
    value.includes(".mp4?")
  ) {
    return "mp4";
  }

  return "unknown";
}

/**
 * Analisa automaticamente um vídeo.
 */
export function parseVideo(url: string): ParsedVideo {

  const provider = detectVideoProvider(url);

  switch (provider) {

    case "wistia":

      return {
        provider,
        id: extractWistiaId(url) || ""
      };

    case "youtube":

      return {
        provider,
        id: url
      };

    case "vimeo":

      return {
        provider,
        id: url
      };

    case "mp4":

      return {
        provider,
        id: url
      };

    default:

      return {
        provider: "unknown",
        id: url
      };
  }
}