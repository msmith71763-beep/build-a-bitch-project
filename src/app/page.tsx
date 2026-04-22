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
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold italic text-violet-400">Loading High-Fidelity Mesh...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [customization, setCustomization] = useState<CustomizationState>(DEFAULT_CUSTOMIZATION);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0c] text-white font-sans">
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      <div className="flex-1 relative">
        <Viewport customization={customization} />

        <div className="absolute top-10 left-12 z-20 pointer-events-none">
          <div className="flex flex-col gap-1">
            <h1 className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">
              Production Phase 5.0
            </h1>
            <h2 className="text-xl font-light text-white tracking-[0.1em] uppercase">
               BUILD-A-BITCH<span className="text-violet-500 font-bold">.COM</span>
            </h2>
          </div>
        </div>

        <div className="absolute bottom-10 right-12 z-20 flex gap-4 pointer-events-none">
           <div className="px-6 py-2 bg-zinc-950/80 border border-white/5 rounded-full backdrop-blur-3xl shadow-2xl">
             <span className="text-[9px] text-violet-400/80 uppercase tracking-[0.4em] font-bold">Scanned Human Mesh Active</span>
           </div>
        </div>
      </div>

      <Sidebar customization={customization} onChange={setCustomization} />
    </div>
  );
}