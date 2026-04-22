"use client";

import { useState, useCallback } from "react";
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
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold italic text-violet-400">
          Loading Engine…
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [customization, setCustomization] = useState<CustomizationState>(DEFAULT_CUSTOMIZATION);
  const [modelLoaded, setModelLoaded] = useState(false);

  const handleChange = useCallback((next: CustomizationState) => {
    setCustomization(next);
  }, []);

  const handleModelLoaded = useCallback(() => {
    console.log("[Home] Model fully loaded and initialized");
    setModelLoaded(true);
  }, []);

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#0a0a0c] text-white font-sans">
      {/* Loading overlay — stays visible until model is ready */}
      {!modelLoaded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0c]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-violet-400 uppercase tracking-[0.3em] font-bold">
              Loading 3D Model…
            </p>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
              Please wait — this may take a moment
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 relative min-w-0">
        <Viewport customization={customization} onModelLoaded={handleModelLoaded} />

        <div className="absolute top-4 left-4 md:top-8 md:left-10 z-20 pointer-events-none">
          <div className="flex flex-col gap-1">
            <h1 className="text-[8px] md:text-[9px] font-black text-white/30 tracking-[0.4em] uppercase">
              Elite Build v11.1 (Stable Local Mesh)
            </h1>
            <h2 className="text-sm md:text-lg font-light text-white tracking-[0.15em] uppercase">
              BUILD-A-BITCH<span className="text-violet-500 font-bold">.COM</span>
            </h2>
          </div>
        </div>
      </div>

      <Sidebar customization={customization} onChange={handleChange} />
    </div>
  );
}