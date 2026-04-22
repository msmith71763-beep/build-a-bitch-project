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
  const { scene } = useGLTF(MODEL_URL);
  const { animations: externalAnims } = useGLTF(ANIMATIONS_URL);
  
  const group = useRef<Group>(null);
  const { actions, names } = useAnimations(externalAnims, group);

  const skinMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const hairMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const eyeMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        if (
          name.includes("outfit") || 
          name.includes("top") || 
          name.includes("bottom") || 
          name.includes("footwear") || 
          name.includes("shoes") || 
          name.includes("glasses") ||
          name.includes("mask") ||
          name.includes("hat") ||
          name.includes("glove") ||
          name.includes("reindeer")
        ) {
          mesh.visible = false;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          return;
        }

        const oldMat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
        
        const newMat = new THREE.MeshPhysicalMaterial({
          map: oldMat?.map || null,
          normalMap: oldMat?.normalMap || null,
          roughnessMap: oldMat?.roughnessMap || null,
          roughness: 0.5,
          metalness: 0.0,
          reflectivity: 0.5,
          clearcoat: 0.2,
          clearcoatRoughness: 0.3,
          sheen: 0.2,
          sheenColor: new THREE.Color("#ffdbd1"),
        });

        mesh.material = newMat;
        mesh.visible = true;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (name.includes("body") || name.includes("head") || name.includes("skin") || name.includes("hand")) {
          skinMaterialRef.current = newMat;
        } else if (name.includes("hair")) {
          hairMaterialRef.current = newMat;
        } else if (name.includes("eye") || name.includes("iris")) {
          eyeMaterialRef.current = newMat;
        }
      }
    });
  }, [scene]);

  useEffect(() => {
    if (skinMaterialRef.current) {
      const base = SKIN_PRESETS[customization.ethnicity.preset] || SKIN_PRESETS.caucasian;
      const color = new THREE.Color(base);
      const adjustment = (customization.ethnicity.skinTone - 50) / 200;
      color.multiplyScalar(1 + adjustment);
      skinMaterialRef.current.color.copy(color);
    }
  }, [customization.ethnicity.preset, customization.ethnicity.skinTone]);

  useEffect(() => {
    if (hairMaterialRef.current) {
      hairMaterialRef.current.color.set(customization.hair.color);
    }
  }, [customization.hair.color]);

  useEffect(() => {
    if (eyeMaterialRef.current) {
      eyeMaterialRef.current.color.set(customization.eyes.color);
    }
  }, [customization.eyes.color]);

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
      const action = actions[targetName] || actions[Object.keys(actions)[0]];

      if (action) {
        Object.values(actions).forEach(a => {
          if (a && a !== action) a.fadeOut(0.5);
        });
        action.reset().fadeIn(0.5).play();
      }
    }
  }, [actions, names, customization.animation.pose]);

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