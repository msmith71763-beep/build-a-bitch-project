"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import BaseModel from "./BaseModel";
import type { CustomizationState } from "@/types/customization";

interface ViewportProps {
  customization: CustomizationState;
}

export default function Viewport({ customization }: ViewportProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0.5, 4], fov: 40 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#10101a"]} />

        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.6} color="#8b9dc3" />
        <pointLight position={[0, 2, 2]} intensity={0.5} color="#ffd6e0" />

        <BaseModel customization={customization} />

        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.6}
          scale={10}
          blur={2}
          far={4.5}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={1.5}
          maxDistance={8}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          target={[0, 0, 0]}
          makeDefault
        />

        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
