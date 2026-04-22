"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { CustomizationState } from "@/types/customization";

interface BaseModelProps {
  customization: CustomizationState;
}

// 2.8MB Professional Realistic Base Mesh (Stable)
const MODEL_URL = "https://raw.githubusercontent.com/PacktPublishing/Hands-On-Game-Animation-Programming/master/AllChapters/Assets/Woman.gltf";

const SKIN_PRESETS: Record<string, string> = {
  caucasian: "#f2cfc0",
  african: "#3d2b1f",
  east_asian: "#f3e0b5",
  south_asian: "#a67b5b",
  latin: "#c68642",
};

const HAIR_COLORS: Record<string, string> = {
  black: "#090909",
  blonde: "#e6c073",
  red: "#9a3324",
  brown: "#4b3221",
};

export default function BaseModel({ customization }: BaseModelProps) {
  const { scene } = useGLTF(MODEL_URL);
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  // 1. COLORS & SCALING
  const skinColor = useMemo(() => {
     const base = SKIN_PRESETS[customization.ethnicity.preset] || SKIN_PRESETS.caucasian;
     const col = new THREE.Color(base);
     const adj = (customization.ethnicity.skinTone - 50) / 150;
     col.multiplyScalar(1 + adj);
     return col;
  }, [customization.ethnicity.preset, customization.ethnicity.skinTone]);

  const hairColorHex = HAIR_COLORS[customization.hair.color] || HAIR_COLORS.black;

  // 2. SETUP MODEL
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        // Hide Clothes & Accessories
        if (name.includes("glasses") || name.includes("outfit") || name.includes("top") || name.includes("bottom")) {
           mesh.visible = false;
           return;
        }

        // Body Mesh Identification
        if (name.includes("woman") || name.includes("body")) {
           (bodyRef as any).current = mesh;
        }

        mesh.material = new THREE.MeshStandardMaterial({
          color: skinColor,
          roughness: 0.6,
          metalness: 0
        });

        if (mesh.geometry) mesh.geometry.computeVertexNormals();
        mesh.visible = true;
      }
    });
  }, [scene, skinColor]);

  // 3. FRAME UPDATES (Responsive Sliders)
  useFrame(() => {
     if (!groupRef.current) return;
     
     // Hips/Weight Scaling
     const w = customization.body.weight / 100;
     const h = customization.body.height / 100;
     const scaleXZ = 0.8 + w * 0.7; // Exaggerated Hips fix
     const scaleY = 0.9 + h * 0.2;
     
     groupRef.current.scale.set(scaleXZ, scaleY, scaleXZ);
     
     // Rotation animation
     groupRef.current.rotation.y += 0.005;
  });

  return (
    <group ref={groupRef} position={[0, -0.05, 0]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);