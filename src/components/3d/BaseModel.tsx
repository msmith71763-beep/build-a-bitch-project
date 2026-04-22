"use client";

import { useGLTF, useAnimations } from "@react-three/drei";
import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import type { Group } from "three";
import type { CustomizationState } from "@/types/customization";

interface BaseModelProps {
  customization: CustomizationState;
}

// Professional High-Poly Human Mesh
const MODEL_URL = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/woman/model.gltf";

const SKIN_PRESETS: Record<string, string> = {
  caucasian: "#f2d1c9", african: "#3d2b1f", east_asian: "#f3e5ab", south_asian: "#a67b5b", latin: "#c68642",
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

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: skinColor,
          roughness: 0.5,
          clearcoat: 0.4,
          clearcoatRoughness: 0.2,
          sheen: 1,
          sheenColor: "#ffffff",
        });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene, skinColor]);

  useEffect(() => {
    if (actions && actions["idle"]) {
      actions["idle"].fadeIn(0.5).play();
    }
  }, [actions]);

  const heightScale = 0.95 + (customization.body.height / 100) * 0.15;
  const weightScale = 0.9 + (customization.body.weight / 100) * 0.3;

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
