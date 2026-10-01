"use client";

import { useEffect, useRef, useState } from "react";

import type { ParsedYoutubeVideo } from "@/lib/youtube/parse-youtube-url";
import { useYoutubePlayer } from "../hooks/use-youtube-player";

type YoutubeLiveStageProps = {
  video: ParsedYoutubeVideo;
  onChangeStream: () => void;
};

type VideoMeta = {
  title: string;
  author: string;
  thumbnail: string;
};

export function YoutubeLiveStage({ video, onChangeStream }: YoutubeLiveStageProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const player = useYoutubePlayer(video.videoId);
  const live = video.isLiveUrl || player.duration === 0;

  useEffect(() => {
    const syncFullscreen = () => {
      const current =
        document.fullscreenElement ??
        (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement;
      setFullscreen(current === frameRef.current);
    };

    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("webkitfullscreenchange", syncFullscreen);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(video.watchUrl)}`,
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { title?: string; author_name?: string; thumbnail_url?: string } | null) => {
        if (cancelled || !data) {
          return;
        }
        setMeta({
          title: data.title ?? "YouTube live",
          author: data.author_name ?? "",
          thumbnail: data.thumbnail_url ?? youtubeThumb(video.videoId),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setMeta({
            title: "YouTube live",
            author: "",
            thumbnail: youtubeThumb(video.videoId),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [video.videoId, video.watchUrl]);

  const progress = player.duration > 0 ? (player.currentTime / player.duration) * 100 : 100;

  const toggleFullscreen = async () => {
    const node = frameRef.current;
    if (!node) {
      return;
    }

    try {
      const current =
        document.fullscreenElement ??
        (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement;

      if (current) {
        const exit =
          document.exitFullscreen?.bind(document) ??
          (document as Document & { webkitExitFullscreen?: () => Promise<void> })
            .webkitExitFullscreen?.bind(document);
        await exit?.();
        return;
      }

      const request =
        node.requestFullscreen?.bind(node) ??
        (
          node as HTMLDivElement & {
            webkitRequestFullscreen?: () => Promise<void>;
          }
        ).webkitRequestFullscreen?.bind(node);
      await request?.();
    } catch {
      // Some browsers block fullscreen if the YouTube iframe still has focus.
    }
  };

  return (
    <section className="flex min-h-dvh flex-col bg-zinc-950 text-white">
      <div className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30 blur-2xl"
          style={{ backgroundImage: `url(${meta?.thumbnail ?? youtubeThumb(video.videoId)})` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/55 to-zinc-950" />

        <div className="relative z-10 w-full max-w-6xl">
          <div
            ref={frameRef}
            className={
              fullscreen
                ? "fixed inset-0 z-50 h-screen w-screen overflow-hidden rounded-none bg-black"
                : "overflow-hidden rounded-[28px] bg-black shadow-[0_40px_120px_rgba(0,0,0,0.65)]"
            }
          >
            <div className={fullscreen ? "relative h-full w-full bg-black" : "relative aspect-video bg-black"}>
              <div ref={player.hostRef} className="absolute inset-0 h-full w-full [&>iframe]:h-full [&>iframe]:w-full [&>div]:h-full [&>div]:w-full" />

              {!player.ready ? (
                <div className="absolute inset-0 grid place-items-center bg-zinc-900 text-sm text-zinc-400">
                  Loading player...
                </div>
              ) : null}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-7">
                <div className="mb-4 flex items-center gap-3">
                  {live ? (
                    <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
                      Live
                    </span>
                  ) : null}
                  <p className="truncate text-sm font-medium text-white/90">
                    {meta?.title ?? "Now playing"}
                  </p>
                </div>

                <input
                  type="range"
                  min={0}
                  max={Math.max(player.duration, 1)}
                  step={0.1}
                  value={live ? Math.max(player.duration, 1) : player.currentTime}
                  onChange={(event) => {
                    if (!live) {
                      player.seek(Number(event.target.value));
                    }
                  }}
                  disabled={live}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-amber-300"
                  style={{
                    background: `linear-gradient(to right, #fcd34d ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
                  }}
                  aria-label={live ? "Live progress" : "Seek"}
                />

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ControlButton onClick={player.togglePlay} label={player.playing ? "Pause" : "Play"}>
                      {player.playing ? "❚❚" : "▶"}
                    </ControlButton>
                    <ControlButton onClick={player.toggleMute} label={player.muted ? "Unmute" : "Mute"}>
                      {player.muted || player.volume === 0 ? "🔇" : "🔊"}
                    </ControlButton>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={player.muted ? 0 : player.volume}
                      onChange={(event) => player.setVolume(Number(event.target.value))}
                      className="hidden h-1 w-24 accent-amber-300 sm:block"
                      aria-label="Volume"
                    />
                    <p className="text-xs text-white/70">
                      {live ? "LIVE" : `${formatTime(player.currentTime)} / ${formatTime(player.duration)}`}
                    </p>
                  </div>

                  <ControlButton onClick={toggleFullscreen} label="Fullscreen">
                    {fullscreen ? "✕" : "⛶"}
                  </ControlButton>
                </div>
              </div>
            </div>
          </div>

          {!fullscreen ? (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onChangeStream}
                className="text-sm font-semibold text-white/70 hover:text-white"
              >
                Paste another link
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ControlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sm text-white hover:bg-white/20"
    >
      {children}
    </button>
  );
}

function youtubeThumb(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = String(total % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}
