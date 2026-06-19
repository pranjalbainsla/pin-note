import type { Pin } from "@/types";

function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }

    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

function normalizeYouTubeThumbnail(url: string, videoId: string): string {
  if (url.includes("/hqdefault.") || url.includes("/default.")) {
    return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
  }

  return url;
}

function firstTwoSentences(text: string): string {
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)/g);
  if (!sentences?.length) {
    return text.trim();
  }

  return sentences.slice(0, 2).join("").trim();
}

export function getPinLink(pin: Pin): string | null {
  return pin.source_url;
}

export function getPinThumbnail(pin: Pin): string | null {
  const videoId =
    pin.source_type === "youtube" && pin.source_url
      ? extractYouTubeVideoId(pin.source_url)
      : null;

  if (pin.thumbnail_url) {
    if (videoId) {
      return normalizeYouTubeThumbnail(pin.thumbnail_url, videoId);
    }

    return pin.thumbnail_url;
  }

  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
  }

  return null;
}

export function getPinDescription(pin: Pin): string | null {
  if (pin.description?.trim()) {
    return pin.description.trim();
  }

  if (pin.summary?.trim()) {
    return firstTwoSentences(pin.summary);
  }

  return null;
}

export function getPinAuthor(pin: Pin): string | null {
  return pin.author?.trim() || null;
}
