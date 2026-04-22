"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { CustomizationState } from "@/types/customization";

interface BaseModelProps {
  customization: CustomizationState;
}

const MODEL_URL =
  "https://raw.githubusercontent.com/hmthanh/3d-human-model/main/TranThiNgocTham.glb";

const REMOVE_KEYWORDS = ["glasses", "outfit", "top", "bottom", "footwear"];

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

const EYE_COLORS: Record<string, string> = {
  brown: "#5c3317",
  blue: "#4a90d9",
  green: "#2d5a27",
  hazel: "#8b7355",
  gray: "#9e9e9e",
};

interface PoseConfig {
  leftArmRotZ: number;
  rightArmRotZ: number;
  leftArmRotX: number;
  rightArmRotX: number;
  leftLegRotX: number;
  rightLegRotX: number;
  torsoRotY: number;
  torsoRotX: number;
  headRotY: number;
  sway?: boolean;
}

const POSES: Record<string, PoseConfig> = {
  idle: { leftArmRotZ: 0.15, rightArmRotZ: -0.15, leftArmRotX: 0, rightArmRotX: 0, leftLegRotX: 0, rightLegRotX: 0, torsoRotY: 0, torsoRotX: 0, headRotY: 0, sway: true },
  catwalk: { leftArmRotZ: 0.3, rightArmRotZ: -0.3, leftArmRotX: -0.2, rightArmRotX: 0.2, leftLegRotX: 0.15, rightLegRotX: -0.15, torsoRotY: 0.1, torsoRotX: 0, headRotY: 0.05, sway: true },
  pose_1: { leftArmRotZ: 0.8, rightArmRotZ: -0.3, leftArmRotX: -0.5, rightArmRotX: 0.1, leftLegRotX: 0, rightLegRotX: 0.2, torsoRotY: 0.15, torsoRotX: -0.05, headRotY: -0.2 },
  pose_2: { leftArmRotZ: 0.6, rightArmRotZ: -0.6, leftArmRotX: -0.8, rightArmRotX: -0.8, leftLegRotX: 0, rightLegRotX: 0, torsoRotY: 0, torsoRotX: 0, headRotY: 0 },
  dance: { leftArmRotZ: 0.5, rightArmRotZ: -0.5, leftArmRotX: -0.4, rightArmRotX: -0.4, leftLegRotX: 0.1, rightLegRotX: -0.1, torsoRotY: 0, torsoRotX: 0, headRotY: 0, sway: true },
};

function getSkinColor(preset: string, skinTone: number): THREE.Color {
  const base = SKIN_PRESETS[preset] || SKIN_PRESETS.caucasian;
  const col = new THREE.Color(base);
  const adj = (skinTone - 50) / 150;
  col.multiplyScalar(1 + adj);
  return col;
}

function optimizeModel(
  root: THREE.Object3D,
  skinMat: THREE.MeshPhysicalMaterial,
  hairMat: THREE.MeshStandardMaterial
): void {
  const toRemove: THREE.Object3D[] = [];

  root.traverse((child) => {
    const nameLower = child.name.toLowerCase();

    if (REMOVE_KEYWORDS.some((kw) => nameLower.includes(kw))) {
      toRemove.push(child);
      return;
    }

    if (!(child instanceof THREE.Mesh)) return;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of materials) {
      if (mat && mat instanceof THREE.Material) {
        const stdMat = mat as THREE.MeshStandardMaterial;
        const texProps = ["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap", "emissiveMap", "bumpMap", "displacementMap", "alphaMap"] as const;
        for (const prop of texProps) {
          const tex = (stdMat as unknown as Record<string, unknown>)[prop];
          if (tex instanceof THREE.Texture) {
            tex.dispose();
          }
        }
        mat.dispose();
      }
    }

    const isHair = nameLower.includes("hair");
    child.material = isHair ? hairMat : skinMat;

    if (child.geometry) {
      child.geometry.computeVertexNormals();
    }

    child.castShadow = true;
    child.receiveShadow = true;
  });

  for (const obj of toRemove) {
    obj.removeFromParent();
  }
}

export default function BaseModel({ customization }: BaseModelProps) {
  const { scene } = useGLTF(MODEL_URL);
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  const custRef = useRef(customization);
  custRef.current = customization;

  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    roughness: 0.35,
    metalness: 0,
    clearcoat: 0.2,
    sheen: 0.5,
    sheenColor: new THREE.Color("#ffcfc5"),
    side: THREE.DoubleSide,
  }), []);

  const hairMat = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.7,
    metalness: 0.05,
    side: THREE.DoubleSide,
  }), []);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    optimizeModel(clone, skinMat, hairMat);
    return clone;
  }, [scene, skinMat, hairMat]);

  useEffect(() => {
    return () => {
      skinMat.dispose();
      hairMat.dispose();
    };
  }, [skinMat, hairMat]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;
    const cust = custRef.current;

    if (!groupRef.current) return;

    const w = cust.body.weight / 100;
    const scaleXZ = 0.85 + w * 0.3;
    const h = cust.body.height / 100;
    const scaleY = 0.9 + h * 0.2;
    groupRef.current.scale.set(scaleXZ, scaleY, scaleXZ);

    const skinColor = getSkinColor(cust.ethnicity.preset, cust.ethnicity.skinTone);
    skinMat.color.copy(skinColor);

    const hairColorHex = HAIR_COLORS[cust.hair.color] || HAIR_COLORS.black;
    hairMat.color.set(hairColorHex);

    const pose = POSES[cust.animation.pose] || POSES.idle;
    const swayR = pose.sway ? Math.sin(t * 0.8) * 0.02 : 0;
    const lerpSpeed = 3 * delta;

    groupRef.current.rotation.y += (pose.torsoRotY + swayR - groupRef.current.rotation.y) * lerpSpeed;

    if (pose.sway) {
      const swayY = Math.sin(t * 1.2) * 0.015;
      groupRef.current.position.y = -0.05 + Math.sin(t * 2.4) * 0.005 + swayY;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.05, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);