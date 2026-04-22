"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  PerspectiveCamera,
  OrbitControls,
  Html,
  ContactShadows,
} from "@react-three/drei";
import BaseModel from "./BaseModel";
import type { CustomizationState } from "@/types/customization";

interface ViewportProps {
  customization: CustomizationState;
  onModelLoaded?: () => void;
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4 w-64">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-violet-400 uppercase tracking-[0.3em] font-black text-center">
          Loading Model…
        </p>
      </div>
    </Html>
  );
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={1.8} />
      <spotLight
        position={[2, 5, 4]}
        intensity={3.5}
        angle={0.5}
        penumbra={0.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
      />
      <directionalLight
        position={[-3, 6, 2]}
        intensity={2.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0005}
      />
    </>
  );
}

export default function Viewport({ customization, onModelLoaded }: ViewportProps) {
  return (
    <div className="w-full h-full bg-[#050507]">
      <Canvas
        dpr={1}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
          toneMapping: 4,
          toneMappingExposure: 1.1,
        }}
        shadows
      >
        <PerspectiveCamera makeDefault position={[0, 1.2, 3.2]} fov={32} near={0.1} far={100} />

        <color attach="background" args={["#0a0a0f"]} />
        <fog attach="fog" args={["#0a0a0f", 6, 14]} />

        <SceneLighting />

        <Suspense fallback={<Loader />}>
          <BaseModel customization={customization} onLoaded={onModelLoaded} />

          <ContactShadows
            position={[0, -0.05, 0]}
            opacity={0.5}
            scale={4}
            blur={2.5}
            far={3}
            color="#000020"
          />

          <OrbitControls
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            target={[0, 1, 0]}
            minDistance={1.5}
            maxDistance={6}
            minPolarAngle={Math.PI * 0.15}
            maxPolarAngle={Math.PI * 0.85}
            makeDefault
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
