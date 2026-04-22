"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { 
  Environment, 
  ContactShadows, 
  PerspectiveCamera,
  PresentationControls,
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
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-[10px] text-violet-400 uppercase tracking-[0.4em] font-black text-center">
          Loading High-Resolution Mesh
        </p>
        <p className="text-[9px] text-zinc-600 uppercase tracking-widest text-center">
          This may take a moment on mobile devices
        </p>
      </div>
    </Html>
  );
}

export default function Viewport({ customization }: ViewportProps) {
  return (
    <div className="w-full h-full bg-[#0a0a0c]">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={25} />
        
        <color attach="background" args={["#0a0a0c"]} />
        <fog attach="fog" args={["#0a0a0c", 5, 20]} />

        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

        <Suspense fallback={<Loader />}>
          <PresentationControls
            global
            rotation={[0, 0.2, 0]}
            polar={[-Math.PI / 10, Math.PI / 10]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
            snap={true}
          >
            <group position={[0, -1, 0]}>
              <BaseModel customization={customization} />
            </group>
          </PresentationControls>
          
          <ContactShadows
            position={[0, -1.01, 0]}
            opacity={0.8}
            scale={10}
            blur={2}
            far={2}
          />
          
          <Environment preset="studio" />
        </Suspense>
        
        <BakeShadows />
      </Canvas>
    </div>
  );
}