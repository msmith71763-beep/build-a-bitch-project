"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { 
  Environment, 
  ContactShadows, 
  PerspectiveCamera,
  OrbitControls,
  BakeShadows,
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
          Building Realistic Mesh
        </p>
      </div>
    </Html>
  );
}

export default function Viewport({ customization }: ViewportProps) {
  return (
    <div className="w-full h-full bg-[#050507]">
      <Canvas 
        shadows 
        dpr={[1, 2]} // 4K Resolution support enabled
        gl={{ 
          antialias: true, // Smoothing enabled
          powerPreference: 'high-performance',
          alpha: false
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 1.5, 4.5]} fov={30} />
        
        <color attach="background" args={["#050507"]} />
        <fog attach="fog" args={["#050507", 5, 20]} />

        <ambientLight intensity={1.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <directionalLight position={[-5, 5, 5]} intensity={1} />

        <Suspense fallback={<Loader />}>
          <BaseModel customization={customization} />
          
          <OrbitControls 
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.05}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            target={[0, 0.8, 0]}
            makeDefault
          />
          
          <ContactShadows 
            position={[0, -0.4, 0]} 
            opacity={0.7} 
            scale={12} 
            blur={2} 
            far={1} 
          />
          
          <Environment preset="studio" />
        </Suspense>
        
        <BakeShadows />
      </Canvas>
    </div>
  );
}