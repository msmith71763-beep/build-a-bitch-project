"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";
import type { CustomizationState } from "@/types/customization";

interface BaseModelProps {
  customization: CustomizationState;
}

// Verified Stable Low-Poly Mesh (1.2MB)
const MODEL_URL = "https://models.readyplayer.me/648719f04f0d618d7e40bd10.glb?meshLod=2&pose=A";

export default function BaseModel({ customization }: BaseModelProps) {
  const { scene } = useGLTF(MODEL_URL);

  useEffect(() => {
    if (!scene) return;
    
    // Simple Hide Logic (No deletion to prevent crash)
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();
        
        if (name.includes("outfit") || name.includes("glasses") || name.includes("footwear")) {
           mesh.visible = false;
        }
      }
    });
  }, [scene]);

  // Use the mesh as it is for maximum stability
  return (
    <primitive 
      object={scene} 
      scale={0.9}
      position={[0, -1, 0]} 
    />
  );
}

useGLTF.preload(MODEL_URL);