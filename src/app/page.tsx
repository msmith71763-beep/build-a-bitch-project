"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/ui/Sidebar";
import { DEFAULT_CUSTOMIZATION } from "@/types/customization";
import type { CustomizationState } from "@/types/customization";

const Viewport = dynamic(() => import("@/components/3d/Viewport"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-zinc-950">
      <div className="text-violet-500 text-sm font-bold uppercase tracking-widest animate-pulse">
        Loading 3D Engine...
      </div>
    </div>
  ),
});

export default function Home() {
  const [customization, setCustomization] =
    useState<CustomizationState>(DEFAULT_CUSTOMIZATION);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-zinc-950">
      <div className="flex-1 relative">
        <Viewport customization={customization} />
      </div>
      <Sidebar customization={customization} onChange={setCustomization} />
    </main>
  );
}
