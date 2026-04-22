"use client";

import { useGLTF, useAnimations } from "@react-three/drei";
import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import type { Group } from "three";
import type { CustomizationState } from "@/types/customization";

interface BaseModelProps {
  customization: CustomizationState;
}

// 2.8MB Professional Realistic Base Mesh (Stable External Source)
const MODEL_URL = "https://raw.githubusercontent.com/PacktPublishing/Hands-On-Game-Animation-Programming/master/AllChapters/Assets/Woman.gltf";

const SKIN_PRESETS: Record<string, string> = {
  caucasian: "#f2d1c9", african: "#3d2b1f", east_asian: "#f3e5ab", south_asian: "#a67b5b", latin: "#c68642",
};

export default function BaseModel({ customization }: BaseModelProps) {
  const { scene, animations } = useGLTF(MODEL_URL);
  const group = useRef<Group>(null);
  const { actions } = useAnimations(animations, group);

  // 1. PHYSICAL SKIN MATERIAL
  const skinColor = useMemo(() => {
     const base = SKIN_PRESETS[customization.ethnicity.preset] || SKIN_PRESETS.caucasian;
     const color = new THREE.Color(base);
     const adjustment = (customization.ethnicity.skinTone - 50) / 200;
     color.multiplyScalar(1 + adjustment);
     return color;
  }, [customization.ethnicity.preset, customization.ethnicity.skinTone]);

  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: skinColor,
    roughness: 0.45,
    metalness: 0.05,
    clearcoat: 0.1,
    sheen: 0.3,
    sheenColor: new THREE.Color("#ffdbd1"),
  }), [skinColor]);

  // 2. APPLY TO MESH
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = skinMat;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        const name = mesh.name.toLowerCase();
        // Hide anything that isn't the body
        if (name.includes("glasses") || name.includes("outfit") || name.includes("top") || name.includes("bottom")) {
           mesh.visible = false;
        }
      }
    });
  }, [scene, skinMat]);

  // 3. ANIMATION ENGINE
  useEffect(() => {
    if (actions) {
      const poseMap: Record<string, string> = {
        idle: "Idle",
        catwalk: "Walking",
        pose_1: "Lean_Left",
        pose_2: "SitIdle",
        dance: "Jump"
      };

      const target = poseMap[customization.animation.pose] || "Idle";
      const action = actions[target] || Object.values(actions)[0];

      if (action) {
        Object.values(actions).forEach(a => a?.fadeOut(0.5));
        action.reset().fadeIn(0.5).play();
      }
    }
  }, [actions, customization.animation.pose]);

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