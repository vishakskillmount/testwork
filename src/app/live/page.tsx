import type { Metadata } from "next";

import { LivePlayerPage } from "@/features/live-player/pages/live-player-page";

export const metadata: Metadata = {
  title: "Live Video Player",
};

export default function Page() {
  return <LivePlayerPage />;
}
