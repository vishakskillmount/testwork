"use client";

import { useEffect, useRef, useState } from "react";

type YoutubePlayerApi = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  isMuted: () => boolean;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  getIframe?: () => HTMLIFrameElement;
  destroy: () => void;
};

type YoutubeNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
      };
    },
  ) => YoutubePlayerApi;
  PlayerState: {
    PLAYING: number;
    PAUSED: number;
    ENDED: number;
  };
};

declare global {
  interface Window {
    YT?: YoutubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const PLAYING = 1;

export function useYoutubePlayer(videoId: string | null) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YoutubePlayerApi | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!videoId) {
      return;
    }

    let cancelled = false;
    setReady(false);

    loadYoutubeApi()
      .then(() => {
        if (cancelled || !hostRef.current || !window.YT) {
          return;
        }

        playerRef.current?.destroy();
        hostRef.current.replaceChildren();
        const mount = document.createElement("div");
        mount.style.width = "100%";
        mount.style.height = "100%";
        hostRef.current.appendChild(mount);

        playerRef.current = new window.YT.Player(mount, {
          videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            controls: 0,
            disablekb: 1,
            iv_load_policy: 3,
            fs: 1,
          },
          events: {
            onReady: () => {
              if (cancelled) {
                return;
              }
              const iframe = playerRef.current?.getIframe?.();
              if (iframe) {
                iframe.setAttribute("allowfullscreen", "true");
                iframe.setAttribute(
                  "allow",
                  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen",
                );
                iframe.style.width = "100%";
                iframe.style.height = "100%";
              }
              playerRef.current?.setVolume(80);
              playerRef.current?.playVideo();
              setReady(true);
              syncFromPlayer();
            },
            onStateChange: (event) => {
              setPlaying(event.data === PLAYING);
              syncFromPlayer();
            },
          },
        });
      })
      .catch(() => {
        setReady(false);
      });

    const timer = window.setInterval(() => {
      if (!cancelled) {
        syncFromPlayer();
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [videoId]);

  const syncFromPlayer = () => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    try {
      setCurrentTime(player.getCurrentTime() || 0);
      setDuration(player.getDuration() || 0);
      setMuted(player.isMuted());
      setVolumeState(player.getVolume());
      setPlaying(player.getPlayerState() === PLAYING);
    } catch {
      // Player methods throw before the iframe is fully ready.
    }
  };

  return {
    hostRef,
    ready,
    playing,
    muted,
    volume,
    currentTime,
    duration,
    togglePlay: () => {
      if (playing) {
        playerRef.current?.pauseVideo();
      } else {
        playerRef.current?.playVideo();
      }
    },
    seek: (seconds: number) => {
      playerRef.current?.seekTo(seconds, true);
      setCurrentTime(seconds);
    },
    toggleMute: () => {
      if (playerRef.current?.isMuted()) {
        playerRef.current.unMute();
        setMuted(false);
      } else {
        playerRef.current?.mute();
        setMuted(true);
      }
    },
    setVolume: (value: number) => {
      playerRef.current?.setVolume(value);
      setVolumeState(value);
      if (value > 0) {
        playerRef.current?.unMute();
        setMuted(false);
      }
    },
  };
}

function loadYoutubeApi(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById("youtube-iframe-api");
    window.onYouTubeIframeAPIReady = () => resolve();

    if (existing) {
      return;
    }

    const script = document.createElement("script");
    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => reject(new Error("Could not load the YouTube player."));
    document.body.appendChild(script);
  });
}
