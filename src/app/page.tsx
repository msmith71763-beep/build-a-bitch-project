"use client";

import dynamic from "next/dynamic";

const Viewport = dynamic(() => import("@/components/3d/Viewport"), {
  ssr: false,
  loading: () => <div className="text-white p-10">Loading Test Cube...</div>,
});

export default function Home() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0c]">
      <div className="flex-1 relative">
        <Viewport />
        <div className="absolute top-10 left-12 z-20 pointer-events-none">
          <h2 className="text-xl font-light text-white tracking-[0.1em] uppercase">
             STABILITY TEST <span className="text-violet-500 font-bold">MODE</span>
          </h2>
          <p className="text-xs text-zinc-500 uppercase mt-2">If you see a spinning purple cube, the app is fixed.</p>
        </div>
      </div>
    </div>
  );
}