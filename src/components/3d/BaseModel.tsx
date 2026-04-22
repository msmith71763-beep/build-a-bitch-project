"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import type { CustomizationState } from "@/types/customization";

interface BaseModelProps {
  customization: CustomizationState;
}

const SKIN_PRESETS: Record<string, string> = {
  caucasian: "#f5d0c5", african: "#3d2b1f", east_asian: "#f3e5ab", south_asian: "#a67b5b", latin: "#c68642",
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

function HumanSkin({ color }: { color: THREE.Color }) {
  return (
    <meshStandardMaterial 
      color={color}
      roughness={0.8} // Matte finish (not a balloon)
      metalness={0.05}
      envMapIntensity={0.5}
    />
  );
}

function Torso({ scale, color }: { scale: [number, number, number]; color: THREE.Color }) {
  return (
    <group position={[0, 0.45, 0]} scale={scale}>
      {/* Main Body - Combined into a more unified shape */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.26, 0.5, 20, 32]} />
        <HumanSkin color={color} />
      </mesh>
      {/* Hips - Widened and fused to torso */}
      <mesh position={[0, -0.05, 0]} scale={[1.25, 0.8, 0.9]} castShadow receiveShadow>
        <sphereGeometry args={[0.34, 32, 32]} />
        <HumanSkin color={color} />
      </mesh>
    </group>
  );
}

function Chest({ size, skinColor, torsoWeight, clothingType }: { size: number; skinColor: THREE.Color; torsoWeight: number; clothingType: string; }) {
  const normalizedSize = size / 15;
  const chestScale = 0.15 + (normalizedSize * 0.2);
  const zOffset = 0.18 + (normalizedSize * 0.12);
  const yOffset = 0.78;
  const xOffset = 0.13 + (torsoWeight - 1) * 0.1;
  const hasTop = clothingType !== "none";

  return (
    <group>
      {/* Tear-drop shape breasts (tapered) */}
      <mesh position={[-xOffset, yOffset, zOffset]} scale={[1, 1.2, 0.8]} castShadow receiveShadow>
        <sphereGeometry args={[chestScale, 32, 32]} />
        <HumanSkin color={skinColor} />
        {!hasTop && (
          <mesh position={[0, 0, chestScale - 0.01]} scale={[1, 1, 0.1]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.6)} roughness={0.9} />
          </mesh>
        )}
      </mesh>
      <mesh position={[xOffset, yOffset, zOffset]} scale={[1, 1.2, 0.8]} castShadow receiveShadow>
        <sphereGeometry args={[chestScale, 32, 32]} />
        <HumanSkin color={skinColor} />
        {!hasTop && (
          <mesh position={[0, 0, chestScale - 0.01]} scale={[1, 1, 0.1]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.6)} roughness={0.9} />
          </mesh>
        )}
      </mesh>
    </group>
  );
}

function Genitalia({ type, skinColor, clothingType }: { type: string; skinColor: THREE.Color; clothingType: string; }) {
  if (clothingType !== "none") return null;
  const innerColor = skinColor.clone().multiplyScalar(0.7).add(new THREE.Color(0.1, 0, 0.05));
  const scaleMap: Record<string, [number, number, number]> = {
    type_1: [0.04, 0.13, 0.03], type_2: [0.08, 0.18, 0.06], type_3: [0.03, 0.11, 0.05],
    type_4: [0.05, 0.15, 0.02], type_5: [0.06, 0.13, 0.08], type_6: [0.09, 0.12, 0.05],
  };
  const currentScale = scaleMap[type] || scaleMap.type_1;
  return (
    <group position={[0, 0.38, 0.32]} rotation={[-0.2, 0, 0]}>
      <mesh castShadow receiveShadow scale={currentScale}><sphereGeometry args={[1, 32, 32]} /><HumanSkin color={skinColor} /></mesh>
      <mesh position={[0, 0, 0.005]} scale={[currentScale[0] * 0.5, currentScale[1] * 0.8, 0.01]}><sphereGeometry args={[1, 16, 16]} /><meshStandardMaterial color={innerColor} roughness={0.5} /></mesh>
    </group>
  );
}

function PubicHair({ clothingType, torsoScale, hairColor }: { clothingType: string; torsoScale: [number, number, number]; hairColor: string; }) {
  if (clothingType !== "none") return null;
  return (
    <group position={[0, 0.42, 0.34]} scale={[torsoScale[0] * 0.8, 1, 1]} rotation={[-0.1, 0, 0]}>
       {/* Procedural Cluster instead of a rectangle */}
       <mesh><circleGeometry args={[0.2, 32]} /><meshStandardMaterial color={hairColor} transparent opacity={0.6} /></mesh>
       <mesh position={[0, 0.05, 0.01]}><circleGeometry args={[0.15, 32]} /><meshStandardMaterial color={hairColor} transparent opacity={0.4} /></mesh>
    </group>
  );
}

function Head({ eyeColor, skinColor }: { eyeColor: string; skinColor: THREE.Color }) {
  const colorMap: Record<string, string> = { brown: "#4b2316", blue: "#1e90ff", green: "#2e8b57", hazel: "#8b7355", gray: "#708090" };
  return (
    <group position={[0, 1.45, 0]}>
      {/* More realistic head shape */}
      <mesh scale={[0.85, 1.1, 0.9]} castShadow receiveShadow>
        <sphereGeometry args={[0.28, 32, 32]} />
        <HumanSkin color={skinColor} />
      </mesh>
      {/* Jawline fusion */}
      <mesh position={[0, -0.12, 0.05]} scale={[0.7, 0.4, 0.6]} rotation={[0.4, 0, 0]}>
         <sphereGeometry args={[0.2, 16, 16]} />
         <HumanSkin color={skinColor} />
      </mesh>
      {/* Realistic eyes */}
      <group position={[0, 0.05, 0.25]}>
         <mesh position={[-0.09, 0, 0]} scale={[1, 1, 0.1]}><sphereGeometry args={[0.04, 16, 16]} /><meshStandardMaterial color={colorMap[eyeColor]} roughness={0} metalness={0.9} /></mesh>
         <mesh position={[0.09, 0, 0]} scale={[1, 1, 0.1]}><sphereGeometry args={[0.04, 16, 16]} /><meshStandardMaterial color={colorMap[eyeColor]} roughness={0} metalness={0.9} /></mesh>
      </group>
    </group>
  );
}

function Legs({ skinColor }: { skinColor: THREE.Color }) {
  return (
    <group position={[0, 0.25, 0]}> 
      {/* Fused to hips - moved UP */}
      <mesh position={[-0.16, -0.1, 0]} rotation={[0, 0, 0.05]} castShadow receiveShadow><capsuleGeometry args={[0.13, 0.7, 16, 32]} /><HumanSkin color={skinColor} /></mesh>
      <mesh position={[0.16, -0.1, 0]} rotation={[0, 0, -0.05]} castShadow receiveShadow><capsuleGeometry args={[0.13, 0.7, 16, 32]} /><HumanSkin color={skinColor} /></mesh>
      {/* Lower Legs */}
      <mesh position={[-0.16, -0.8, 0]} rotation={[0, 0, 0.02]} castShadow receiveShadow><capsuleGeometry args={[0.09, 0.6, 12, 24]} /><HumanSkin color={skinColor} /></mesh>
      <mesh position={[0.16, -0.8, 0]} rotation={[0, 0, -0.02]} castShadow receiveShadow><capsuleGeometry args={[0.09, 0.6, 12, 24]} /><HumanSkin color={HumanSkin} /></mesh>
    </group>
  );
}

export default function BaseModel({ customization }: BaseModelProps) {
  const groupRef = useRef<Group>(null);
  const skinColor = useMemo(() => {
     const base = SKIN_PRESETS[customization.ethnicity.preset] || SKIN_PRESETS.caucasian;
     const color = new THREE.Color(base);
     const adjustment = (customization.ethnicity.skinTone - 50) / 200;
     color.multiplyScalar(1 + adjustment);
     return color;
  }, [customization.ethnicity.preset, customization.ethnicity.skinTone]);

  const hairColorValue = HAIR_COLORS[customization.hair.color] || HAIR_COLORS.black;
  const heightScale = 0.9 + (customization.body.height / 100) * 0.2;
  const weightScale = 0.8 + (customization.body.weight / 100) * 0.6;

  return (
    <group scale={[heightScale, heightScale, heightScale]} position={[0, -0.4, 0]}>
      <Head eyeColor={customization.eyes.color} skinColor={skinColor} />
      <Torso scale={[weightScale, 1, 1]} color={skinColor} />
      <Chest size={customization.chest.size} skinColor={skinColor} torsoWeight={weightScale} clothingType={customization.clothing.type} />
      <Genitalia type={customization.anatomy.vaginaType} skinColor={skinColor} clothingType={customization.clothing.type} />
      <PubicHair clothingType={customization.clothing.type} torsoScale={[weightScale, 1, 1]} hairColor={hairColorValue} />
      <Legs skinColor={skinColor} />
    </group>
  );
}
