"use client";

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import BaseModel from "./BaseModel";

export default function Viewport() {
  return (
    <div className="w-full h-full bg-[#0a0a0c]">
      <Canvas dpr={1}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <color attach="background" args={["#0a0a0c"]} />
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} />
        
        <BaseModel />
        <OrbitControls />
      </Canvas>
    </div>
  );
}