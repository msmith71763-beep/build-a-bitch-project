"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/ui/Sidebar";
import { DEFAULT_CUSTOMIZATION } from "@/types/customization";
import type { CustomizationState } from "@/types/customization";

const Viewport = dynamic(() => import("@/components/3d/Viewport"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-[#0a0a0c] text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold italic text-violet-400">Initializing High-Detail Engine...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [customization, setCustomization] = useState<CustomizationState>(DEFAULT_CUSTOMIZATION);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0c] text-white font-sans">
      <div className="flex-1 relative">
        <Viewport customization={customization} />
        
        <div className="absolute top-10 left-12 z-20 pointer-events-none">
          <div className="flex flex-col gap-1">
            <h1 className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">
               Engine Phase 5.3 (High-Detail Realism)
            </h1>
            <h2 className="text-xl font-light text-white tracking-[0.1em] uppercase">
               BUILD-A-BITCH<span className="text-violet-500 font-bold">.COM</span>
            </h2>
          </div>
        </div>
      </div>

      <Sidebar customization={customization} onChange={setCustomization} />
    </div>
  );
}