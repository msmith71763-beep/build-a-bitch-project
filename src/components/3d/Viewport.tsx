"use client";

import { Canvas } from "@react-three/fiber";
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  PerspectiveCamera,
  Float,
  PresentationControls
} from "@react-three/drei";
import BaseModel from "./BaseModel";
import type { CustomizationState } from "@/types/customization";

interface ViewportProps {
  customization: CustomizationState;
}

export default function Viewport({ customization }: ViewportProps) {
  return (
    <div className="w-full h-full bg-[#050505]">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={35} />
        
        {/* Cinematic Lighting */}
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 5, 15]} />
        
        <ambientLight intensity={0.2} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={2} 
          castShadow 
        />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#4b0082" />
        <directionalLight position={[0, 5, 5]} intensity={0.5} />

        <PresentationControls
          global
          config={{ mass: 2, tension: 500 }}
          snap={{ mass: 4, tension: 1500 }}
          rotation={[0, 0.3, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
        >
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
             <BaseModel customization={customization} />
          </Float>
        </PresentationControls>

        <ContactShadows
          position={[0, -1.4, 0]}
          opacity={0.75}
          scale={10}
          blur={3}
          far={4}
        />

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
