"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import BaseModel from "./BaseModel";
import type { CustomizationState } from "@/types/customization";

export default function Viewport({ customization }: { customization: CustomizationState }) {
  return (
    <div className="w-full h-full bg-[#0a0a0c]">
      <Canvas dpr={1}>
        <PerspectiveCamera makeDefault position={[0, 1.2, 4]} />
        <color attach="background" args={["#0a0a0c"]} />
        <ambientLight intensity={1.5} />
        
        <Suspense fallback={null}>
          <BaseModel customization={customization} />
          <OrbitControls target={[0, 0.8, 0]} />
        </Suspense>
      </Canvas>
    </div>
  );
}