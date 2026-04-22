"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import type { Group } from "three";
import type { CustomizationState } from "@/types/customization";

interface BaseModelProps {
  customization: CustomizationState;
}

const SKIN_PRESETS: Record<string, string> = {
  caucasian: "#f2d1c9", african: "#3d2b1f", east_asian: "#f3e5ab", south_asian: "#a67b5b", latin: "#c68642",
};

const HAIR_COLORS: Record<string, string> = {
  black: "#050505", blonde: "#d4af37", red: "#8b0000", brown: "#3b2316",
};

function getSkinColor(preset: string, toneValue: number) {
  const baseColor = new THREE.Color(SKIN_PRESETS[preset] || SKIN_PRESETS.caucasian);
  const adjustment = (toneValue - 50) / 200;
  baseColor.multiplyScalar(1 + adjustment);
  return baseColor;
}

function SkinMaterial({ color }: { color: THREE.Color }) {
  return (
    <meshPhysicalMaterial 
      color={color}
      roughness={0.4}
      metalness={0.02}
      reflectivity={0.3}
      clearcoat={0.6}
      clearcoatRoughness={0.3}
      sheen={0.5}
      sheenRoughness={0.5}
      sheenColor="#fff"
    />
  );
}

function Torso({ scale, color }: { scale: [number, number, number]; color: THREE.Color }) {
  return (
    <group position={[0, 0.45, 0]} scale={scale}>
      <mesh position={[0, 0.35, 0]} rotation={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.2, 0.5, 32]} />
        <SkinMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.55, 0]} scale={[1.2, 0.4, 0.8]} castShadow receiveShadow>
        <sphereGeometry args={[0.22, 32, 16]} />
        <SkinMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.1, 0]} scale={[0.9, 0.6, 0.7]} castShadow receiveShadow>
        <sphereGeometry args={[0.25, 32, 16]} />
        <SkinMaterial color={color} />
      </mesh>
      <mesh position={[0, -0.15, 0]} scale={[1.3, 0.8, 0.95]} castShadow receiveShadow>
        <sphereGeometry args={[0.33, 32, 16]} />
        <SkinMaterial color={color} />
      </mesh>
    </group>
  );
}

function Chest({ size, skinColor, torsoWeight, clothingType }: { size: number; skinColor: THREE.Color; torsoWeight: number; clothingType: string; }) {
  const normalizedSize = size / 15;
  const chestScale = 0.14 + (normalizedSize * 0.19);
  const zOffset = 0.18 + (normalizedSize * 0.14);
  const yOffset = 0.84;
  const xOffset = 0.13 + (torsoWeight - 1) * 0.12;
  const hasTop = clothingType !== "none";

  return (
    <group>
      <mesh position={[-xOffset, yOffset, zOffset]} scale={[1, 1.2, 0.85]} castShadow receiveShadow>
        <sphereGeometry args={[chestScale, 32, 32]} />
        <SkinMaterial color={skinColor} />
      </mesh>
      <mesh position={[xOffset, yOffset, zOffset]} scale={[1, 1.2, 0.85]} castShadow receiveShadow>
        <sphereGeometry args={[chestScale, 32, 32]} />
        <SkinMaterial color={skinColor} />
      </mesh>
    </group>
  );
}

function Head({ eyeColor, skinColor }: { eyeColor: string; skinColor: THREE.Color }) {
  const colorMap: Record<string, string> = { brown: "#4b2316", blue: "#1e90ff", green: "#2e8b57", hazel: "#8b7355", gray: "#708090" };
  return (
    <group position={[0, 1.5, 0.05]}>
      <mesh scale={[0.82, 1.1, 0.9]} castShadow receiveShadow>
        <sphereGeometry args={[0.26, 32, 32]} />
        <SkinMaterial color={skinColor} />
      </mesh>
      <mesh position={[0, -0.15, 0.02]} scale={[0.7, 0.5, 0.6]} rotation={[0.4, 0, 0]}>
         <sphereGeometry args={[0.18, 16, 16]} />
         <SkinMaterial color={skinColor} />
      </mesh>
    </group>
  );
}

function Legs({ skinColor }: { skinColor: THREE.Color }) {
  return (
    <group position={[0, 0.25, 0]}>
      <mesh position={[-0.16, -0.15, 0]} rotation={[0, 0, 0.06]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.09, 0.65, 16]} />
        <SkinMaterial color={skinColor} />
      </mesh>
      <mesh position={[0.16, -0.15, 0]} rotation={[0, 0, -0.06]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.09, 0.65, 16]} />
        <SkinMaterial color={skinColor} />
      </mesh>
      <mesh position={[-0.17, -0.85, 0]} rotation={[0, 0, 0.02]} castShadow receiveShadow>
        <cylinderGeometry args={[0.09, 0.06, 0.7, 16]} />
        <SkinMaterial color={skinColor} />
      </mesh>
      <mesh position={[0.17, -0.85, 0]} rotation={[0, 0, -0.02]} castShadow receiveShadow>
        <cylinderGeometry args={[0.09, 0.06, 0.7, 16]} />
        <SkinMaterial color={skinColor} />
      </mesh>
    </group>
  );
}

function Arms({ skinColor }: { skinColor: THREE.Color }) {
  return (
    <group position={[0, 1.05, 0]}>
      <mesh position={[-0.45, -0.2, 0]} rotation={[0, 0, 0.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.05, 0.45, 12]} />
        <SkinMaterial color={skinColor} />
      </mesh>
      <mesh position={[0.45, -0.2, 0]} rotation={[0, 0, -0.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.05, 0.45, 12]} />
        <SkinMaterial color={skinColor} />
      </mesh>
      <mesh position={[-0.55, -0.65, 0]} rotation={[0, 0, 0.1]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.04, 0.45, 12]} />
        <SkinMaterial color={skinColor} />
      </mesh>
      <mesh position={[0.55, -0.65, 0]} rotation={[0, 0, -0.1]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.04, 0.45, 12]} />
        <SkinMaterial color={skinColor} />
      </mesh>
    </group>
  );
}

export default function BaseModel({ customization }: BaseModelProps) {
  const skinColor = useMemo(() => {
     const base = SKIN_PRESETS[customization.ethnicity.preset] || SKIN_PRESETS.caucasian;
     const color = new THREE.Color(base);
     const adjustment = (customization.ethnicity.skinTone - 50) / 200;
     color.multiplyScalar(1 + adjustment);
     return color;
  }, [customization.ethnicity.preset, customization.ethnicity.skinTone]);

  const heightScale = 0.95 + (customization.body.height / 100) * 0.2;
  const weightScale = 0.85 + (customization.body.weight / 100) * 0.5;

  return (
    <group scale={[heightScale, heightScale, heightScale]} position={[0, -0.4, 0]}>
      <Head eyeColor={customization.eyes.color} skinColor={skinColor} />
      <Arms skinColor={skinColor} />
      <Torso scale={[weightScale, 1, 1]} color={skinColor} />
      <Chest size={customization.chest.size} skinColor={skinColor} torsoWeight={weightScale} clothingType={customization.clothing.type} />
      <Legs skinColor={skinColor} />
    </group>
  );
}
