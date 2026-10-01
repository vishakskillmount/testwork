const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;

export type ParsedYoutubeVideo = {
  videoId: string;
  watchUrl: string;
  embedUrl: string;
  isLiveUrl: boolean;
};

export function parseYoutubeVideo(input: string): ParsedYoutubeVideo | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  if (YOUTUBE_ID.test(trimmed)) {
    return toParsed(trimmed, false);
  }

  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname.split("/").filter(Boolean);
    const isLiveUrl = path[0] === "live" || url.searchParams.get("live") === "1";

    if (host === "youtu.be") {
      const videoId = path[0]?.split("?")[0];
      return isYoutubeId(videoId) ? toParsed(videoId, isLiveUrl) : null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      const fromQuery = url.searchParams.get("v");
      if (isYoutubeId(fromQuery)) {
        return toParsed(fromQuery, isLiveUrl);
      }

      if (
        (path[0] === "live" ||
          path[0] === "embed" ||
          path[0] === "shorts" ||
          path[0] === "v") &&
        isYoutubeId(path[1])
      ) {
        return toParsed(path[1], path[0] === "live");
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function youtubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    controls: "0",
    disablekb: "1",
    iv_load_policy: "3",
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function toParsed(videoId: string, isLiveUrl: boolean): ParsedYoutubeVideo {
  return {
    videoId,
    watchUrl: youtubeWatchUrl(videoId),
    embedUrl: youtubeEmbedUrl(videoId),
    isLiveUrl,
  };
}

function isYoutubeId(value: string | null | undefined): value is string {
  return Boolean(value && YOUTUBE_ID.test(value));
}
