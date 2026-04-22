"use client";

import { Canvas } from "@react-three/fiber";
import { 
  Environment, 
  ContactShadows, 
  PerspectiveCamera,
  PresentationControls,
  Stage,
  BakeShadows
} from "@react-three/drei";
import BaseModel from "./BaseModel";
import type { CustomizationState } from "@/types/customization";

interface ViewportProps {
  customization: CustomizationState;
}

export default function Viewport({ customization }: ViewportProps) {
  return (
    <div className="w-full h-full bg-[#0a0a0c]">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={30} />
        
        <color attach="background" args={["#0a0a0c"]} />
        <fog attach="fog" args={["#0a0a0c", 5, 20]} />

        <PresentationControls
          global
          config={{ mass: 2, tension: 500 }}
          snap={{ mass: 4, tension: 1500 }}
          rotation={[0, 0.3, 0]}
          polar={[-Math.PI / 6, Math.PI / 6]}
          azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
        >
          <Stage 
            intensity={0.5} 
            environment="night" 
            shadows={{ type: 'contact', opacity: 0.4, blur: 3 }} 
            adjustCamera={false}
          >
             <BaseModel customization={customization} />
          </Stage>
        </PresentationControls>

        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.6}
          scale={12}
          blur={2.5}
          far={5}
        />
        
        <BakeShadows />
      </Canvas>
    </div>
  );
}
