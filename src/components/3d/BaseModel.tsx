"use client";

import { useGLTF, useAnimations } from "@react-three/drei";
import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import type { Group } from "three";
import type { CustomizationState } from "@/types/customization";

interface BaseModelProps {
  customization: CustomizationState;
}

// 10.7MB Professional Scanned Human Mesh
const MODEL_URL = "https://raw.githubusercontent.com/hmthanh/3d-human-model/main/TranThiNgocTham.glb";

// Mixamo/RPM Compatible Animations (External)
const ANIMATIONS_URL = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/woman/model.gltf";

const SKIN_PRESETS: Record<string, string> = {
  caucasian: "#f2d1c9", 
  african: "#3d2b1f", 
  east_asian: "#f3e5ab", 
  south_asian: "#a67b5b", 
  latin: "#c68642",
};

export default function BaseModel({ customization }: BaseModelProps) {
  const { scene } = useGLTF(MODEL_URL);
  const { animations: externalAnims } = useGLTF(ANIMATIONS_URL);
  const group = useRef<Group>(null);
  const { actions, names } = useAnimations(externalAnims, group);

  const skinColor = useMemo(() => {
     const base = SKIN_PRESETS[customization.ethnicity.preset] || SKIN_PRESETS.caucasian;
     const color = new THREE.Color(base);
     const adjustment = (customization.ethnicity.skinTone - 50) / 200;
     color.multiplyScalar(1 + adjustment);
     return color;
  }, [customization.ethnicity.preset, customization.ethnicity.skinTone]);

  // 1. CLEANUP: Remove clothes, glasses, and setup shaders
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        // Hide "Funky Glasses" and Clothes
        if (
          name.includes("outfit") || 
          name.includes("top") || 
          name.includes("bottom") || 
          name.includes("footwear") || 
          name.includes("shoes") || 
          name.includes("glasses") ||
          name.includes("mask")
        ) {
          mesh.visible = false;
        }

        // Apply Hyper-Realistic Skin Shader to Body/Head
        if (name.includes("body") || name.includes("head") || name.includes("skin")) {
          const oldMat = mesh.material as THREE.MeshStandardMaterial;
          mesh.material = new THREE.MeshPhysicalMaterial({
            map: oldMat.map,
            normalMap: oldMat.normalMap,
            roughnessMap: oldMat.roughnessMap,
            color: skinColor,
            roughness: 0.45,
            metalness: 0.0,
            reflectivity: 0.5,
            clearcoat: 0.2,
            clearcoatRoughness: 0.3,
            sheen: 0.5,
            sheenColor: new THREE.Color("#ffcfc5"),
            transmission: 0.05,
            thickness: 0.5,
          });
          mesh.visible = true; // Ensure body is visible
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene, skinColor]);

  // 2. FEATURE: Hair & Eye Customization
  useEffect(() => {
     scene.traverse((child) => {
       const name = child.name.toLowerCase();
       if (name.includes("hair")) {
         const mesh = child as THREE.Mesh;
         mesh.visible = true;
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

  // 3. FEATURE: Animation & Pose Control
  useEffect(() => {
    if (actions) {
      // Mapping user poses to available animations in the external file
      const poseMap: Record<string, string> = {
        idle: "idle",
        catwalk: "walk",
        pose_1: "sexy_pose",
        pose_2: "hands_on_hips",
        dance: "dance"
      };

      const animationToPlay = poseMap[customization.animation.pose] || "idle";
      
      // Stop current animations
      Object.values(actions).forEach(a => a?.fadeOut(0.5));
      
      // Play target animation (fallback to first available if name mismatch)
      const action = actions[animationToPlay] || actions[names[0]];
      if (action) {
        action.reset().fadeIn(0.5).play();
      }
    }
  }, [actions, names, customization.animation.pose]);

  // 4. FEATURE: Anatomical Scaling
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