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
  // 1. Load Model & Animations (Suspensful)
  const { scene } = useGLTF(MODEL_URL);
  const { animations: externalAnims } = useGLTF(ANIMATIONS_URL);
  
  const group = useRef<Group>(null);
  const { actions, names } = useAnimations(externalAnims, group);

  // 2. Computed Skin Color
  const skinColor = useMemo(() => {
     const base = SKIN_PRESETS[customization.ethnicity.preset] || SKIN_PRESETS.caucasian;
     const color = new THREE.Color(base);
     const adjustment = (customization.ethnicity.skinTone - 50) / 200;
     color.multiplyScalar(1 + adjustment);
     return color;
  }, [customization.ethnicity.preset, customization.ethnicity.skinTone]);

  // 3. One-time Cleanup & Texture Preservation
  // We hide unwanted nodes and prepare the base skin material
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        // Aggressive Hiding of Accessories/Clothes
        if (
          name.includes("outfit") || 
          name.includes("top") || 
          name.includes("bottom") || 
          name.includes("footwear") || 
          name.includes("shoes") || 
          name.includes("glasses") ||
          name.includes("mask") ||
          name.includes("hat") ||
          name.includes("glove")
        ) {
          mesh.visible = false;
          return; // Skip material update for hidden meshes
        }

        // Apply Hyper-Realistic Skin Shader to Body/Head/Skin nodes
        if (name.includes("body") || name.includes("head") || name.includes("skin") || name.includes("hand") || name.includes("foot")) {
          // Support for Multi-Material meshes
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          
          mesh.material = materials.map((m) => {
            const oldMat = m as THREE.MeshStandardMaterial;
            return new THREE.MeshPhysicalMaterial({
              map: oldMat.map,
              normalMap: oldMat.normalMap,
              roughnessMap: oldMat.roughnessMap,
              color: skinColor,
              roughness: 0.4,
              metalness: 0.0,
              reflectivity: 0.5,
              clearcoat: 0.2,
              clearcoatRoughness: 0.3,
              sheen: 0.6,
              sheenColor: new THREE.Color("#ffdbd1"),
              transmission: 0.01,
              thickness: 0.5,
            });
          })[0]; // For simplicity, take the first, but map handles the logic

          mesh.visible = true; // Ensure body is visible
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene, skinColor]);

  // 4. Feature: Real-time Hair & Eye Coloring
  useEffect(() => {
     scene.traverse((child) => {
       if (!(child as THREE.Mesh).isMesh) return;
       const mesh = child as THREE.Mesh;
       const name = child.name.toLowerCase();

       if (name.includes("hair")) {
         mesh.visible = true;
         const mat = mesh.material as THREE.MeshPhysicalMaterial;
         if (mat && mat.color) mat.color.set(customization.hair.color);
       }
       if (name.includes("eye") || name.includes("iris")) {
         mesh.visible = true;
         const mat = mesh.material as THREE.MeshPhysicalMaterial;
         if (mat && mat.color) mat.color.set(customization.eyes.color);
       }
     });
  }, [scene, customization.hair.color, customization.eyes.color]);

  // 5. Feature: Animation Engine
  useEffect(() => {
    if (actions && names.length > 0) {
      const poseMap: Record<string, string> = {
        idle: "idle",
        catwalk: "walk",
        pose_1: "sexy_pose",
        pose_2: "hands_on_hips",
        dance: "dance"
      };

      const targetName = poseMap[customization.animation.pose] || "idle";
      
      // Try to find the action by mapped name or fallback to direct name inclusion
      const action = actions[targetName] || 
                     Object.values(actions).find(a => a?.getClip().name.toLowerCase().includes(targetName)) ||
                     actions[names[0]];

      if (action) {
        // Fade out other actions
        Object.values(actions).forEach(a => {
          if (a && a !== action) a.fadeOut(0.5);
        });
        action.reset().fadeIn(0.5).play();
      }
    }
  }, [actions, names, customization.animation.pose]);

  // 6. Feature: Anatomical Scaling (Body Types)
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