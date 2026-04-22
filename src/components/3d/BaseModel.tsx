"use client";

import { useGLTF, useAnimations } from "@react-three/drei";
import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import type { Group } from "three";
import type { CustomizationState } from "@/types/customization";

interface BaseModelProps {
  customization: CustomizationState;
}

const MODEL_URL = "https://raw.githubusercontent.com/hmthanh/3d-human-model/main/TranThiNgocTham.glb";
const ANIMATIONS_URL = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/woman/model.gltf";

const SKIN_PRESETS: Record<string, string> = {
  caucasian: "#f2d1c9", 
  african: "#3d2b1f", 
  east_asian: "#f3e5ab", 
  south_asian: "#a67b5b", 
  latin: "#c68642",
};

export default function BaseModel({ customization }: BaseModelProps) {
  // 1. Loading with lower priority for animations to prevent initial spike
  const { scene } = useGLTF(MODEL_URL);
  const { animations: externalAnims } = useGLTF(ANIMATIONS_URL);
  
  const group = useRef<Group>(null);
  const { actions } = useAnimations(externalAnims, group);

  // 2. Stable Materials (Switching to Standard for Mobile Stability)
  const materials = useMemo(() => ({
    skin: new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0 }),
    hair: new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0 }),
    eyes: new THREE.MeshStandardMaterial({ roughness: 0.2, metalness: 0.5 })
  }), []);

  // 3. One-time Setup: Node Hiding and Material Assignment
  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        // 🛑 AGGRESSIVE REMOVAL OF UNWANTED NODES
        if (
          name.includes("glasses") || 
          name.includes("reindeer") || 
          name.includes("outfit") || 
          name.includes("top") || 
          name.includes("bottom") || 
          name.includes("foot") || 
          name.includes("shoe") || 
          name.includes("mask") ||
          name.includes("hat")
        ) {
          mesh.visible = false;
          mesh.removeFromParent(); // Delete from scene to save GPU memory
          return;
        }

        // Assign Stable Materials
        if (name.includes("body") || name.includes("head") || name.includes("skin") || name.includes("hand")) {
          mesh.material = materials.skin;
          mesh.visible = true;
        } else if (name.includes("hair")) {
          mesh.material = materials.hair;
          mesh.visible = true;
        } else if (name.includes("eye") || name.includes("iris")) {
          mesh.material = materials.eyes;
          mesh.visible = true;
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    // Force clear old materials from memory
    return () => {
       scene.traverse(child => {
         if ((child as THREE.Mesh).isMesh) {
           (child as THREE.Mesh).geometry.dispose();
         }
       });
    };
  }, [scene, materials]);

  // 4. Reactive Updates (Silky Smooth)
  useEffect(() => {
    const base = SKIN_PRESETS[customization.ethnicity.preset] || SKIN_PRESETS.caucasian;
    const color = new THREE.Color(base);
    const adjustment = (customization.ethnicity.skinTone - 50) / 200;
    color.multiplyScalar(1 + adjustment);
    materials.skin.color.copy(color);
  }, [customization.ethnicity.preset, customization.ethnicity.skinTone, materials.skin]);

  useEffect(() => {
    materials.hair.color.set(customization.hair.color);
  }, [customization.hair.color, materials.hair]);

  useEffect(() => {
    materials.eyes.color.set(customization.eyes.color);
  }, [customization.eyes.color, materials.eyes]);

  // 5. Animation Control
  useEffect(() => {
    if (actions) {
      const poseMap: Record<string, string> = {
        idle: "idle",
        catwalk: "walk",
        pose_1: "sexy_pose",
        pose_2: "hands_on_hips",
        dance: "dance"
      };

      const target = poseMap[customization.animation.pose] || "idle";
      const action = actions[target] || Object.values(actions)[0];

      if (action) {
        Object.values(actions).forEach(a => a?.fadeOut(0.5));
        action.reset().fadeIn(0.5).play();
      }
    }
  }, [actions, customization.animation.pose]);

  // 6. Scaling
  const heightScale = 0.9 + (customization.body.height / 100) * 0.2;
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
useGLTF.preload(ANIMATIONS_URL);