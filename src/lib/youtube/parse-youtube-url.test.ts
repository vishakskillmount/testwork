import { describe, expect, it } from "vitest";

import { parseYoutubeVideo } from "./parse-youtube-url";

describe("parseYoutubeVideo", () => {
  it("reads watch, short, live, and embed links", () => {
    expect(parseYoutubeVideo("https://www.youtube.com/watch?v=dQw4w9WgXcQ")?.videoId).toBe(
      "dQw4w9WgXcQ",
    );
    expect(parseYoutubeVideo("https://youtu.be/dQw4w9WgXcQ")?.videoId).toBe("dQw4w9WgXcQ");
    expect(parseYoutubeVideo("https://www.youtube.com/live/dQw4w9WgXcQ")?.isLiveUrl).toBe(true);
    expect(parseYoutubeVideo("https://www.youtube.com/embed/dQw4w9WgXcQ")?.videoId).toBe(
      "dQw4w9WgXcQ",
    );
    expect(parseYoutubeVideo("dQw4w9WgXcQ")?.videoId).toBe("dQw4w9WgXcQ");
  });

  it("rejects a non-YouTube URL", () => {
    expect(parseYoutubeVideo("https://vimeo.com/123")).toBeNull();
    expect(parseYoutubeVideo("")).toBeNull();
  });
});
