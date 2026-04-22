"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { 
  PerspectiveCamera,
  OrbitControls,
  Html
} from "@react-three/drei";
import BaseModel from "./BaseModel";
import type { CustomizationState } from "@/types/customization";

interface ViewportProps {
  customization: CustomizationState;
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4 w-64">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-violet-400 uppercase tracking-[0.3em] font-black text-center">
          Starting Stable Engine
        </p>
      </div>
    </Html>
  );
}

export default function Viewport({ customization }: ViewportProps) {
  return (
    <div className="w-full h-full bg-[#0a0a0c]">
      <Canvas 
        dpr={1} // Lock resolution to stop GPU crash
        gl={{ 
          antialias: false, // Turn off for stability
          powerPreference: 'high-performance' 
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 1.5, 4.5]} fov={30} />
        
        <color attach="background" args={["#0a0a0c"]} />

        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        <Suspense fallback={<Loader />}>
          <BaseModel customization={customization} />
          <OrbitControls 
            enablePan={false}
            target={[0, 0.8, 0]}
            makeDefault
          />
        </Suspense>
      </Canvas>
    </div>
  );
}