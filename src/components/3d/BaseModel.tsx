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

function Torso({ scale, color }: { scale: [number, number, number]; color: THREE.Color }) {
  return (
    <mesh position={[0, 0.6, 0]} scale={scale} castShadow receiveShadow>
      <capsuleGeometry args={[0.35, 0.8, 8, 32]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.05} />
    </mesh>
  );
}

function Chest({ size, nippleType, skinColor, torsoWeight, clothingType }: { size: number; nippleType: string; skinColor: THREE.Color; torsoWeight: number; clothingType: string; }) {
  const normalizedSize = size / 15;
  const chestScale = 0.15 + (normalizedSize * 0.15);
  const zOffset = 0.2 + (normalizedSize * 0.12);
  const yOffset = 0.75;
  const xOffset = 0.15 + (torsoWeight - 1) * 0.1;
  const hasTop = clothingType !== "none";

  return (
    <group>
      <mesh position={[-xOffset, yOffset, zOffset]} castShadow receiveShadow>
        <sphereGeometry args={[chestScale, 32, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.4} />
        {!hasTop && (
          <mesh position={[0, 0, chestScale - 0.01]} scale={[1, 1, 0.5]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.7)} />
          </mesh>
        )}
      </mesh>
      <mesh position={[xOffset, yOffset, zOffset]} castShadow receiveShadow>
        <sphereGeometry args={[chestScale, 32, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.4} />
        {!hasTop && (
          <mesh position={[0, 0, chestScale - 0.01]} scale={[1, 1, 0.5]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.7)} />
          </mesh>
        )}
      </mesh>
    </group>
  );
}

function Genitalia({ type, skinColor, clothingType }: { type: string; skinColor: THREE.Color; clothingType: string; }) {
  if (clothingType !== "none") return null;
  const innerColor = skinColor.clone().multiplyScalar(0.8).add(new THREE.Color(0.1, 0, 0.05));
  const scaleMap: Record<string, [number, number, number]> = {
    type_1: [0.04, 0.12, 0.03], type_2: [0.07, 0.16, 0.05], type_3: [0.03, 0.10, 0.05],
    type_4: [0.05, 0.15, 0.02], type_5: [0.05, 0.12, 0.07], type_6: [0.08, 0.11, 0.04],
  };
  const currentScale = scaleMap[type] || scaleMap.type_1;
  return (
    <group position={[0, 0.22, 0.32]} rotation={[-0.2, 0, 0]}>
      <mesh castShadow receiveShadow scale={currentScale}><sphereGeometry args={[1, 32, 32]} /><meshStandardMaterial color={skinColor} roughness={0.4} /></mesh>
      <mesh position={[0, 0, 0.01]} scale={[currentScale[0] * 0.4, currentScale[1] * 0.7, 0.01]}><sphereGeometry args={[1, 16, 16]} /><meshStandardMaterial color={innerColor} roughness={0.3} /></mesh>
    </group>
  );
}

function PubicHair({ style, clothingType, torsoScale, hairColor }: { style: string; clothingType: string; torsoScale: [number, number, number]; hairColor: string; }) {
  if (style === "shaved" || clothingType !== "none") return null;
  return (
    <group position={[0, 0.28, 0.34]} scale={[torsoScale[0], 1, 1]} rotation={[-0.1, 0, 0]}>
       <mesh><planeGeometry args={[0.3, 0.2]} /><meshStandardMaterial color={hairColor} transparent opacity={0.8} /></mesh>
    </group>
  );
}

function Head({ eyeColor, skinColor }: { eyeColor: string; skinColor: THREE.Color }) {
  const colorMap: Record<string, string> = { brown: "#5C3317", blue: "#4A90D9", green: "#2d5a27", hazel: "#8B7355", gray: "#9E9E9E" };
  return (
    <group position={[0, 1.55, 0]}>
      <mesh castShadow receiveShadow><sphereGeometry args={[0.28, 32, 32]} /><meshStandardMaterial color={skinColor} roughness={0.4} /></mesh>
      <mesh position={[-0.09, 0.04, 0.24]} scale={[0.8, 0.8, 0.5]}><sphereGeometry args={[0.04, 16, 16]} /><meshStandardMaterial color={colorMap[eyeColor]} /></mesh>
      <mesh position={[0.09, 0.04, 0.24]} scale={[0.8, 0.8, 0.5]}><sphereGeometry args={[0.04, 16, 16]} /><meshStandardMaterial color={colorMap[eyeColor]} /></mesh>
    </group>
  );
}

function HairMesh({ style, length, volume, hairColor }: { style: string; length: number; volume: number; hairColor: string; }) {
  const scaleY = 0.15 + (length / 100) * 0.5;
  const scaleXZ = 0.28 + (volume / 100) * 0.2;
  return (
    <group position={[0, 1.7, -0.02]}>
      <mesh castShadow><capsuleGeometry args={[scaleXZ, scaleY, 8, 32]} /><meshStandardMaterial color={hairColor} roughness={0.8} /></mesh>
    </group>
  );
}

function Legs({ skinColor }: { skinColor: THREE.Color }) {
  return (
    <group position={[0, -0.55, 0]}>
      <mesh position={[-0.14, 0, 0]} castShadow receiveShadow><capsuleGeometry args={[0.1, 0.6, 8, 24]} /><meshStandardMaterial color={skinColor} /></mesh>
      <mesh position={[0.14, 0, 0]} castShadow receiveShadow><capsuleGeometry args={[0.1, 0.6, 8, 24]} /><meshStandardMaterial color={skinColor} /></mesh>
    </group>
  );
}

export default function BaseModel({ customization }: BaseModelProps) {
  const groupRef = useRef<Group>(null);
  const skinColor = useMemo(() => getSkinColor(customization.ethnicity.preset, customization.ethnicity.skinTone), [customization.ethnicity.preset, customization.ethnicity.skinTone]);
  const hairColorValue = HAIR_COLORS[customization.hair.color] || HAIR_COLORS.black;
  const heightScale = 0.85 + (customization.body.height / 100) * 0.3;
  const weightScale = 0.85 + (customization.body.weight / 100) * 0.4; // Wide hips
  const torsoScale: [number, number, number] = [weightScale, 1, 1];

  useFrame((_, delta) => { if (groupRef.current) groupRef.current.rotation.y += delta * 0.1; });

  return (
    <group ref={groupRef} scale={[heightScale, heightScale, heightScale]} position={[0, -0.25, 0]}>
      <Head eyeColor={customization.eyes.color} skinColor={skinColor} />
      <HairMesh style={customization.hair.style} length={customization.hair.length} volume={customization.hair.volume} hairColor={hairColorValue} />
      <Torso scale={torsoScale} color={skinColor} />
      <Chest size={customization.chest.size} nippleType={customization.chest.nippleType} skinColor={skinColor} torsoWeight={weightScale} clothingType={customization.clothing.type} />
      <Genitalia type={customization.anatomy.vaginaType} skinColor={skinColor} clothingType={customization.clothing.type} />
      <PubicHair style={customization.anatomy.pubicHair} clothingType={customization.clothing.type} torsoScale={torsoScale} hairColor={hairColorValue} />
      <Legs skinColor={skinColor} />
    </group>
  );
}
