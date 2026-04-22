"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/ui/Sidebar";
import { DEFAULT_CUSTOMIZATION } from "@/types/customization";
import type { CustomizationState } from "@/types/customization";

const Viewport = dynamic(() => import("@/components/3d/Viewport"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-[#050505]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Waking up the Engine...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [customization, setCustomization] = useState<CustomizationState>(DEFAULT_CUSTOMIZATION);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050505] text-white">
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Viewport customization={customization} />

        {/* Overlay title */}
        <div className="absolute top-6 left-6 pointer-events-none select-none">
          <h1 className="text-2xl font-black text-white/90 tracking-tighter italic">
            BUILD-A-BITCH<span className="text-violet-500">.COM</span>
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-medium mt-1">
            Engine v2.0 • Ultra Realism Alpha
          </p>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar customization={customization} onChange={setCustomization} />
    </div>
  );
}
