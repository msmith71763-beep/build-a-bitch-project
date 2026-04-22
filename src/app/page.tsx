"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/ui/Sidebar";
import { DEFAULT_CUSTOMIZATION } from "@/types/customization";
import type { CustomizationState } from "@/types/customization";

const Viewport = dynamic(() => import("@/components/3d/Viewport"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-[#0a0a0c]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold">Initializing Creator</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [customization, setCustomization] = useState<CustomizationState>(DEFAULT_CUSTOMIZATION);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0c] text-white font-sans">
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Main UI */}
      <div className="flex-1 relative">
        <Viewport customization={customization} />

        {/* Top Header Overlay */}
        <div className="absolute top-8 left-10 z-20 pointer-events-none">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-light text-white/50 tracking-[0.2em] uppercase">
              Character Creation: <span className="text-violet-400 font-bold ml-1">BUILD-A-BITCH</span>
            </h1>
          </div>
        </div>

        {/* Footer Overlay */}
        <div className="absolute bottom-8 right-10 z-20 flex gap-4 pointer-events-none">
           <div className="px-6 py-2 bg-zinc-900/80 border border-zinc-800 rounded-sm backdrop-blur-md">
             <span className="text-[10px] text-zinc-500 uppercase tracking-widest">v3.5 Realism Engine</span>
           </div>
        </div>
      </div>

      {/* Professional Sidebar */}
      <Sidebar customization={customization} onChange={setCustomization} />
    </div>
  );
}
