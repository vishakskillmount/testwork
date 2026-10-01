"use client";

import Link from "next/link";
import { useState } from "react";

import {
  parseYoutubeVideo,
  type ParsedYoutubeVideo,
} from "@/lib/youtube/parse-youtube-url";
import { YoutubeLiveStage } from "../components/youtube-live-stage";
import { YoutubeUrlForm } from "../components/youtube-url-form";

export function LivePlayerPage() {
  const [video, setVideo] = useState<ParsedYoutubeVideo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (url: string) => {
    const parsed = parseYoutubeVideo(url);
    if (!parsed) {
      setError("Paste a valid YouTube or YouTube Live link.");
      setVideo(null);
      return;
    }

    setError(null);
    setVideo(parsed);
  };

  if (video) {
    return (
      <div className="relative min-h-dvh bg-zinc-950">
        <Link
          href="/"
          className="absolute top-5 left-5 z-30 text-sm font-semibold text-white/80 hover:text-white"
        >
          ← Home
        </Link>
        <YoutubeLiveStage video={video} onChangeStream={() => setVideo(null)} />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-zinc-950 px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#3f3f46,_transparent_55%)]" />
      <Link
        href="/"
        className="absolute top-6 left-6 z-10 text-sm font-semibold text-white/70 hover:text-white"
      >
        ← Home
      </Link>
      <YoutubeUrlForm onSubmit={handleSubmit} error={error} />
    </div>
  );
}
