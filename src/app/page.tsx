"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/ui/Sidebar";
import { DEFAULT_CUSTOMIZATION } from "@/types/customization";
import type { CustomizationState } from "@/types/customization";

const Viewport = dynamic(() => import("@/components/3d/Viewport"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-[#1a1a2e]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Loading 3D Viewport</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [customization, setCustomization] = useState<CustomizationState>(DEFAULT_CUSTOMIZATION);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black">
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Viewport customization={customization} />

        {/* Overlay title */}
        <div className="absolute top-6 left-6 pointer-events-none">
          <h1 className="text-xl font-bold text-white/80 tracking-widest uppercase">
            BUILD-A-BITCH.COM
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Drag to rotate • Scroll to zoom
          </p>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar customization={customization} onChange={setCustomization} />
    </div>
  );
}
