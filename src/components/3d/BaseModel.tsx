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
  black: "#090909", blonde: "#e6c073", red: "#9a3324", brown: "#4b3221",
};

function getSkinColor(preset: string, toneValue: number) {
  const baseColor = new THREE.Color(SKIN_PRESETS[preset] || SKIN_PRESETS.caucasian);
  const adjustment = (toneValue - 50) / 200;
  baseColor.multiplyScalar(1 + adjustment);
  return baseColor;
}

function HighEndSkin({ color }: { color: THREE.Color }) {
  return (
    <meshPhysicalMaterial 
      color={color}
      roughness={0.4}
      metalness={0.05}
      reflectivity={0.2}
      clearcoat={0.3}
      clearcoatRoughness={0.25}
      thickness={1}
    />
  );
}

function Torso({ scale, color }: { scale: [number, number, number]; color: THREE.Color }) {
  return (
    <group position={[0, 0.6, 0]} scale={scale}>
      {/* Ribcage area */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.26, 0.45, 12, 32]} />
        <HighEndSkin color={color} />
      </mesh>
      {/* Waist/Hips area - more sculpted */}
      <mesh position={[0, -0.15, 0]} scale={[1.1, 0.8, 0.9]} castShadow receiveShadow>
        <sphereGeometry args={[0.32, 32, 32]} />
        <HighEndSkin color={color} />
      </mesh>
    </group>
  );
}

function Chest({ size, nippleType, skinColor, torsoWeight, clothingType }: { size: number; nippleType: string; skinColor: THREE.Color; torsoWeight: number; clothingType: string; }) {
  const normalizedSize = size / 15;
  const chestScale = 0.16 + (normalizedSize * 0.18);
  const zOffset = 0.20 + (normalizedSize * 0.12);
  const yOffset = 0.82;
  const xOffset = 0.13 + (torsoWeight - 1) * 0.1;
  const hasTop = clothingType !== "none";

  return (
    <group>
      <mesh position={[-xOffset, yOffset, zOffset]} scale={[1, 0.85, 1.15]} castShadow receiveShadow>
        <sphereGeometry args={[chestScale, 32, 32]} />
        <HighEndSkin color={skinColor} />
        {!hasTop && (
          <mesh position={[0, 0, chestScale - 0.005]} scale={[1, 1, 0.15]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.6)} />
          </mesh>
        )}
      </mesh>
      <mesh position={[xOffset, yOffset, zOffset]} scale={[1, 0.85, 1.15]} castShadow receiveShadow>
        <sphereGeometry args={[chestScale, 32, 32]} />
        <HighEndSkin color={skinColor} />
        {!hasTop && (
          <mesh position={[0, 0, chestScale - 0.005]} scale={[1, 1, 0.15]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.6)} />
          </mesh>
        )}
      </mesh>
    </group>
  );
}

function Genitalia({ type, skinColor, clothingType }: { type: string; skinColor: THREE.Color; clothingType: string; }) {
  if (clothingType !== "none") return null;
  const innerColor = skinColor.clone().multiplyScalar(0.7).add(new THREE.Color(0.15, 0, 0.05));
  const scaleMap: Record<string, [number, number, number]> = {
    type_1: [0.035, 0.11, 0.03], type_2: [0.07, 0.17, 0.05], type_3: [0.025, 0.10, 0.04],
    type_4: [0.04, 0.14, 0.02], type_5: [0.05, 0.12, 0.07], type_6: [0.08, 0.10, 0.04],
  };
  const currentScale = scaleMap[type] || scaleMap.type_1;
  return (
    <group position={[0, 0.22, 0.32]} rotation={[-0.3, 0, 0]}>
      <mesh castShadow receiveShadow scale={currentScale}><sphereGeometry args={[1, 32, 32]} /><HighEndSkin color={skinColor} /></mesh>
      <mesh position={[0, 0, 0.005]} scale={[currentScale[0] * 0.4, currentScale[1] * 0.7, 0.01]}><sphereGeometry args={[1, 16, 16]} /><meshStandardMaterial color={innerColor} roughness={0.3} /></mesh>
    </group>
  );
}

function PubicHair({ style, clothingType, torsoScale, hairColor }: { style: string; clothingType: string; torsoScale: [number, number, number]; hairColor: string; }) {
  if (style === "shaved" || clothingType !== "none") return null;
  return (
    <group position={[0, 0.35, 0.34]} scale={[torsoScale[0] * 0.7, 1, 1]} rotation={[-0.2, 0, 0]}>
       <mesh><planeGeometry args={[0.3, 0.2]} /><meshStandardMaterial color={hairColor} transparent opacity={0.7} depthWrite={false} /></mesh>
    </group>
  );
}

function Head({ eyeColor, skinColor }: { eyeColor: string; skinColor: THREE.Color }) {
  const colorMap: Record<string, string> = { brown: "#5C3317", blue: "#4A90D9", green: "#2d5a27", hazel: "#8B7355", gray: "#9E9E9E" };
  return (
    <group position={[0, 1.55, 0]}>
      <mesh scale={[0.82, 1, 0.88]} castShadow receiveShadow>
        <sphereGeometry args={[0.29, 32, 32]} />
        <HighEndSkin color={skinColor} />
      </mesh>
      <group position={[0, 0.05, 0.25]}>
         <mesh position={[-0.09, 0, 0]} scale={[0.9, 0.9, 0.1]}><sphereGeometry args={[0.045, 16, 16]} /><meshStandardMaterial color={colorMap[eyeColor]} roughness={0} metalness={1} /></mesh>
         <mesh position={[0.09, 0, 0]} scale={[0.9, 0.9, 0.1]}><sphereGeometry args={[0.045, 16, 16]} /><meshStandardMaterial color={colorMap[eyeColor]} roughness={0} metalness={1} /></mesh>
      </group>
    </group>
  );
}

function Legs({ skinColor }: { skinColor: THREE.Color }) {
  return (
    <group position={[0, -0.5, 0]}>
      <mesh position={[-0.17, 0, 0]} rotation={[0, 0, 0.04]} castShadow receiveShadow><capsuleGeometry args={[0.11, 0.75, 16, 32]} /><HighEndSkin color={skinColor} /></mesh>
      <mesh position={[0.17, 0, 0]} rotation={[0, 0, -0.04]} castShadow receiveShadow><capsuleGeometry args={[0.11, 0.75, 16, 32]} /><HighEndSkin color={skinColor} /></mesh>
    </group>
  );
}

function Arms({ skinColor }: { skinColor: THREE.Color }) {
  return (
    <group position={[0, 0.9, 0]}>
      <mesh position={[-0.42, 0, 0]} rotation={[0, 0, 0.1]} castShadow receiveShadow><capsuleGeometry args={[0.06, 0.6, 12, 24]} /><HighEndSkin color={skinColor} /></mesh>
      <mesh position={[0.42, 0, 0]} rotation={[0, 0, -0.1]} castShadow receiveShadow><capsuleGeometry args={[0.06, 0.6, 12, 24]} /><HighEndSkin color={skinColor} /></mesh>
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

  const hairColorValue = HAIR_COLORS[customization.hair.color] || HAIR_COLORS.black;
  const heightScale = 0.9 + (customization.body.height / 100) * 0.2;
  const weightScale = 0.85 + (customization.body.weight / 100) * 0.55;
  const torsoScale: [number, number, number] = [weightScale, 1, 0.9];

  return (
    <group scale={[heightScale, heightScale, heightScale]} position={[0, -0.3, 0]}>
      <Head eyeColor={customization.eyes.color} skinColor={skinColor} />
      <Arms skinColor={skinColor} />
      <Torso scale={torsoScale} color={skinColor} />
      <Chest size={customization.chest.size} nippleType={customization.chest.nippleType} skinColor={skinColor} torsoWeight={weightScale} clothingType={customization.clothing.type} />
      <Genitalia type={customization.anatomy.vaginaType} skinColor={skinColor} clothingType={customization.clothing.type} />
      <PubicHair style={customization.anatomy.pubicHair} clothingType={customization.clothing.type} torsoScale={torsoScale} hairColor={hairColorValue} />
      <Legs skinColor={skinColor} />
    </group>
  );
}
