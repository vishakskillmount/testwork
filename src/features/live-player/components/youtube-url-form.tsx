"use client";

import { FormEvent, useState } from "react";

type YoutubeUrlFormProps = {
  onSubmit: (url: string) => void;
  error: string | null;
};

export function YoutubeUrlForm({ onSubmit, error }: YoutubeUrlFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(url);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
    >
      <p className="text-xs font-semibold tracking-[0.28em] text-amber-200/90 uppercase">
        Live stage
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Paste a YouTube link</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-300">
        Drop a live or regular YouTube URL. The stream plays on this site in a
        cinema-style player.
      </p>

      <label htmlFor="youtube-url" className="mt-8 block text-sm font-medium text-zinc-200">
        YouTube link
      </label>
      <input
        id="youtube-url"
        type="url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://www.youtube.com/live/..."
        className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-amber-300/70"
        autoComplete="off"
        required
      />

      {error ? (
        <p role="status" className="mt-3 text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="mt-6 w-full rounded-2xl bg-amber-300 px-5 py-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
      >
        Play on this site
      </button>
    </form>
  );
}
