"use client";

import { useGLTF, useAnimations } from "@react-three/drei";
import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import type { Group } from "three";
import type { CustomizationState } from "@/types/customization";

interface BaseModelProps {
  customization: CustomizationState;
}

// 2.8MB Stable Realistic Base Mesh
const MODEL_URL = "https://raw.githubusercontent.com/PacktPublishing/Hands-On-Game-Animation-Programming/master/AllChapters/Assets/Woman.gltf";

const SKIN_PRESETS: Record<string, string> = {
  caucasian: "#f2d1c9", african: "#3d2b1f", east_asian: "#f3e5ab", south_asian: "#a67b5b", latin: "#c68642",
};

export default function BaseModel({ customization }: BaseModelProps) {
  const { scene, animations } = useGLTF(MODEL_URL);
  const group = useRef<Group>(null);
  const { actions } = useAnimations(animations, group);

  // 1. ULTRA-LIGHT MATERIAL (No Physical effects to stop crash)
  const skinColor = useMemo(() => {
     const base = SKIN_PRESETS[customization.ethnicity.preset] || SKIN_PRESETS.caucasian;
     const color = new THREE.Color(base);
     const adjustment = (customization.ethnicity.skinTone - 50) / 200;
     color.multiplyScalar(1 + adjustment);
     return color;
  }, [customization.ethnicity.preset, customization.ethnicity.skinTone]);

  // Use basic StandardMaterial - much safer for mobile
  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.8, // Matte finish is easier on GPU
    metalness: 0,
  }), [skinColor]);

  // 2. APPLY TO MESH (No Shadows)
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        // Hide Accessories
        if (name.includes("glasses") || name.includes("outfit") || name.includes("top") || name.includes("bottom")) {
           mesh.visible = false;
           return;
        }

        mesh.material = skinMat;
        mesh.castShadow = false; // Turn off shadows to stop crash
        mesh.receiveShadow = false;
        mesh.visible = true;
      }
    });
  }, [scene, skinMat]);

  // 3. ANIMATION (Simple Idle only for stability)
  useEffect(() => {
    if (actions && actions["Idle"]) {
      // Only play Idle to keep it simple
      actions["Idle"].reset().fadeIn(0.5).play();
    }
  }, [actions]);

  // 4. ANATOMICAL SCALING
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