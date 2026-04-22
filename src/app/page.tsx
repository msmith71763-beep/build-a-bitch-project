"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/ui/Sidebar";
import { DEFAULT_CUSTOMIZATION } from "@/types/customization";
import type { CustomizationState } from "@/types/customization";

const Viewport = dynamic(() => import("@/components/3d/Viewport"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#0a0a0c] text-white flex items-center justify-center font-bold">Finalizing Build 13.0...</div>,
});

export default function Home() {
  const [customization, setCustomization] = useState<CustomizationState>({
     ...DEFAULT_CUSTOMIZATION,
     hair: { ...DEFAULT_CUSTOMIZATION.hair, color: "red" },
     eyes: { ...DEFAULT_CUSTOMIZATION.eyes, color: "green" },
     clothing: { ...DEFAULT_CUSTOMIZATION.clothing, type: "none" }
  });

  const handleChange = useCallback((next: CustomizationState) => {
    setCustomization(next);
  }, []);

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#0a0a0c] text-white">
      <div className="flex-1 relative min-w-0">
        <Viewport customization={customization} />
        
        <div className="absolute top-8 left-10 z-20 pointer-events-none">
          <div className="flex flex-col gap-1">
            <h1 className="text-[10px] font-black text-violet-400 tracking-[0.4em] uppercase">
               FINAL MASTER BUILD 13.0
            </h1>
            <h2 className="text-xl font-light text-white tracking-[0.15em] uppercase">
               BUILD-A-BITCH<span className="text-violet-500 font-bold">.COM</span>
            </h2>
            <p className="text-[9px] text-zinc-600 uppercase mt-1">● All Sliders & Realistic Mesh Verified</p>
          </div>
        </div>
      </div>

      <Sidebar customization={customization} onChange={handleChange} />
    </div>
  );
}