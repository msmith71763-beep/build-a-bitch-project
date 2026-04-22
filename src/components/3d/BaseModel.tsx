"use client";

import { useGLTF, useAnimations } from "@react-three/drei";
import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import type { Group } from "three";
import type { CustomizationState } from "@/types/customization";

interface BaseModelProps {
  customization: CustomizationState;
}

// 10.7MB Professional Scanned Human Mesh (Tran Thi Ngoc Tham)
const MODEL_URL = "https://raw.githubusercontent.com/hmthanh/3d-human-model/main/TranThiNgocTham.glb";

const SKIN_PRESETS: Record<string, string> = {
  caucasian: "#f2d1c9", 
  african: "#3d2b1f", 
  east_asian: "#f3e5ab", 
  south_asian: "#a67b5b", 
  latin: "#c68642",
};

export default function BaseModel({ customization }: BaseModelProps) {
  const { scene, animations } = useGLTF(MODEL_URL);
  const group = useRef<Group>(null);
  const { actions } = useAnimations(animations, group);

  const skinColor = useMemo(() => {
     const base = SKIN_PRESETS[customization.ethnicity.preset] || SKIN_PRESETS.caucasian;
     const color = new THREE.Color(base);
     const adjustment = (customization.ethnicity.skinTone - 50) / 200;
     color.multiplyScalar(1 + adjustment);
     return color;
  }, [customization.ethnicity.preset, customization.ethnicity.skinTone]);

  // Hyper-Realistic Skin Shader Setup
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        
        // Ensure we preserve textures if they exist, but enhance with physical properties
        if (mesh.material) {
          const oldMat = mesh.material as THREE.MeshStandardMaterial;
          
          mesh.material = new THREE.MeshPhysicalMaterial({
            map: oldMat.map,
            normalMap: oldMat.normalMap,
            roughnessMap: oldMat.roughnessMap,
            color: skinColor,
            roughness: 0.4,
            metalness: 0.0,
            reflectivity: 0.5,
            clearcoat: 0.3,
            clearcoatRoughness: 0.2,
            sheen: 0.8,
            sheenColor: new THREE.Color("#ffdbd1"),
            transmission: 0.02,
            thickness: 0.5,
          });
        }
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene, skinColor]);

  // Advanced Customization: Hair & Eyes
  useEffect(() => {
     scene.traverse((child) => {
       const name = child.name.toLowerCase();
       if (name.includes("hair")) {
         const mesh = child as THREE.Mesh;
         if (mesh.material) {
            (mesh.material as THREE.MeshPhysicalMaterial).color = new THREE.Color(customization.hair.color);
         }
       }
       if (name.includes("eye") || name.includes("iris")) {
         const mesh = child as THREE.Mesh;
          if (mesh.material) {
            (mesh.material as THREE.MeshPhysicalMaterial).color = new THREE.Color(customization.eyes.color);
         }
       }
     });
  }, [scene, customization.hair.color, customization.eyes.color]);

  // Animation Engine
  useEffect(() => {
    if (actions) {
      const animationName = customization.animation.pose || "idle";
      const action = actions[animationName] || Object.values(actions)[0];
      
      if (action) {
        // Stop all other actions
        Object.values(actions).forEach(a => {
          if (a && a !== action) a.fadeOut(0.5);
        });
        action.reset().fadeIn(0.5).play();
      }
    }
  }, [actions, customization.animation.pose]);

  // Anatomical Scaling (Body Types)
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