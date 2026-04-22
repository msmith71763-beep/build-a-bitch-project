"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { CustomizationState } from "@/types/customization";

interface BaseModelProps {
  customization: CustomizationState;
}

// Realistic Scanned Human Mesh (10.7MB Rigged GLB)
const MODEL_URL = "https://raw.githubusercontent.com/hmthanh/3d-human-model/main/TranThiNgocTham.glb";

const SKIN_PRESETS: Record<string, string> = {
  caucasian: "#f2d1c9", african: "#3d2b1f", east_asian: "#f3e5ab", south_asian: "#a67b5b", latin: "#c68642",
};

export default function BaseModel({ customization }: BaseModelProps) {
  const { scene } = useGLTF(MODEL_URL);

  const skinColor = useMemo(() => {
     const base = SKIN_PRESETS[customization.ethnicity.preset] || SKIN_PRESETS.caucasian;
     const color = new THREE.Color(base);
     const adjustment = (customization.ethnicity.skinTone - 50) / 200;
     color.multiplyScalar(1 + adjustment);
     return color;
  }, [customization.ethnicity.preset, customization.ethnicity.skinTone]);

  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: skinColor,
          roughness: 0.4,
          clearcoat: 0.5,
          clearcoatRoughness: 0.2,
          sheen: 1,
          sheenColor: "#ffffff",
          metalness: 0.0,
        });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene, skinColor]);

  const heightScale = 0.95 + (customization.body.height / 100) * 0.15;
  const weightScale = 0.9 + (customization.body.weight / 100) * 0.25;

  return (
    <primitive 
      object={scene} 
      scale={[weightScale, heightScale, weightScale]} 
      position={[0, -1.2, 0]} 
    />
  );
}

useGLTF.preload(MODEL_URL);
