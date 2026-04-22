"use client";

import { useGLTF, useAnimations } from "@react-three/drei";
import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import type { Group } from "three";
import type { CustomizationState } from "@/types/customization";

interface BaseModelProps {
  customization: CustomizationState;
}

// 10.7MB Professional Scanned Human Mesh - FORCE REFRESH v6
const MODEL_URL = "https://raw.githubusercontent.com/hmthanh/3d-human-model/main/TranThiNgocTham.glb?v=6";

const SKIN_PRESETS: Record<string, string> = {
  caucasian: "#f2d1c9", african: "#3d2b1f", east_asian: "#f3e5ab", south_asian: "#a67b5b", latin: "#c68642",
};

export default function BaseModel({ customization }: BaseModelProps) {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<Group>(null);

  // Stable Optimized Skin Material
  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    roughness: 0.4,
    metalness: 0,
    clearcoat: 0.1,
    sheen: 0.3,
    sheenColor: new THREE.Color("#ffdbd1"),
  }), []);

  const hairMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.8 }), []);

  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        // 🛑 AGGRESSIVE NODE CLEANUP (REMOVE CLOTHES/GLASSES)
        if (
          name.includes("outfit") || 
          name.includes("top") || 
          name.includes("bottom") || 
          name.includes("foot") || 
          name.includes("shoes") || 
          name.includes("glasses") ||
          name.includes("mask") ||
          name.includes("reindeer")
        ) {
          mesh.visible = false;
          mesh.removeFromParent();
          return;
        }

        // Assign High-Detail Materials
        if (name.includes("body") || name.includes("head") || name.includes("skin") || name.includes("hand")) {
          mesh.material = skinMat;
          mesh.visible = true;
        } else if (name.includes("hair")) {
          mesh.material = hairMat;
          mesh.visible = true;
        }
      }
    });
  }, [scene, skinMat, hairMat]);

  // SLIDER CONTROL: Instant 3D Updates
  useEffect(() => {
    const base = SKIN_PRESETS[customization.ethnicity.preset] || SKIN_PRESETS.caucasian;
    const color = new THREE.Color(base);
    const adjustment = (customization.ethnicity.skinTone - 50) / 200;
    color.multiplyScalar(1 + adjustment);
    skinMat.color.copy(color);
  }, [customization.ethnicity.preset, customization.ethnicity.skinTone, skinMat]);

  useEffect(() => {
    hairMat.color.set(customization.hair.color);
  }, [customization.hair.color, hairMat]);

  // ANATOMICAL SCALING
  const heightScale = 0.9 + (customization.body.height / 100) * 0.15;
  const weightScale = 0.85 + (customization.body.weight / 100) * 0.3;

  return (
    <group ref={group}>
      <primitive 
        object={scene} 
        scale={[weightScale, heightScale, weightScale]} 
        position={[0, -1, 0]} 
      />
    </group>
  );
}

useGLTF.preload(MODEL_URL);