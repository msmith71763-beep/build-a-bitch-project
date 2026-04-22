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

function SkinMaterial({ color }: { color: THREE.Color }) {
  return (
    <meshPhysicalMaterial 
      color={color} 
      roughness={0.45} 
      metalness={0.02} 
      reflectivity={0.5}
      clearcoat={0.1}
      clearcoatRoughness={0.2}
    />
  );
}

function Torso({ scale, color }: { scale: [number, number, number]; color: THREE.Color }) {
  return (
    <group position={[0, 0.6, 0]} scale={scale}>
      {/* Upper Torso */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.3, 0.4, 16, 32]} />
        <SkinMaterial color={color} />
      </mesh>
      {/* Lower Torso/Hips */}
      <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.34, 32, 32]} />
        <SkinMaterial color={color} />
      </mesh>
    </group>
  );
}

function Chest({ size, nippleType, skinColor, torsoWeight, clothingType }: { size: number; nippleType: string; skinColor: THREE.Color; torsoWeight: number; clothingType: string; }) {
  const normalizedSize = size / 15;
  const chestScale = 0.16 + (normalizedSize * 0.18);
  const zOffset = 0.22 + (normalizedSize * 0.1);
  const yOffset = 0.78;
  const xOffset = 0.14 + (torsoWeight - 1) * 0.12;
  const hasTop = clothingType !== "none";

  return (
    <group>
      {/* Left Breast */}
      <mesh position={[-xOffset, yOffset, zOffset]} scale={[1, 0.9, 1.1]} castShadow receiveShadow>
        <sphereGeometry args={[chestScale, 32, 32]} />
        <SkinMaterial color={skinColor} />
        {!hasTop && (
          <mesh position={[0, 0, chestScale - 0.005]} scale={[1, 1, 0.2]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.7)} roughness={0.6} />
          </mesh>
        )}
      </mesh>
      {/* Right Breast */}
      <mesh position={[xOffset, yOffset, zOffset]} scale={[1, 0.9, 1.1]} castShadow receiveShadow>
        <sphereGeometry args={[chestScale, 32, 32]} />
        <SkinMaterial color={skinColor} />
        {!hasTop && (
          <mesh position={[0, 0, chestScale - 0.005]} scale={[1, 1, 0.2]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.7)} roughness={0.6} />
          </mesh>
        )}
      </mesh>
    </group>
  );
}

function Genitalia({ type, skinColor, clothingType }: { type: string; skinColor: THREE.Color; clothingType: string; }) {
  if (clothingType !== "none") return null;
  const innerColor = skinColor.clone().multiplyScalar(0.75).add(new THREE.Color(0.12, 0, 0.06));
  const scaleMap: Record<string, [number, number, number]> = {
    type_1: [0.04, 0.12, 0.03], type_2: [0.08, 0.18, 0.06], type_3: [0.03, 0.10, 0.05],
    type_4: [0.05, 0.15, 0.02], type_5: [0.06, 0.12, 0.08], type_6: [0.09, 0.11, 0.05],
  };
  const currentScale = scaleMap[type] || scaleMap.type_1;
  return (
    <group position={[0, 0.22, 0.32]} rotation={[-0.25, 0, 0]}>
      <mesh castShadow receiveShadow scale={currentScale}><sphereGeometry args={[1, 32, 32]} /><SkinMaterial color={skinColor} /></mesh>
      <mesh position={[0, 0, 0.01]} scale={[currentScale[0] * 0.45, currentScale[1] * 0.75, 0.01]}><sphereGeometry args={[1, 16, 16]} /><meshStandardMaterial color={innerColor} roughness={0.3} /></mesh>
    </group>
  );
}

function PubicHair({ style, clothingType, torsoScale, hairColor }: { style: string; clothingType: string; torsoScale: [number, number, number]; hairColor: string; }) {
  if (style === "shaved" || clothingType !== "none") return null;
  return (
    <group position={[0, 0.32, 0.35]} scale={[torsoScale[0] * 0.8, 1, 1]} rotation={[-0.15, 0, 0]}>
       <mesh><planeGeometry args={[0.35, 0.22]} /><meshStandardMaterial color={hairColor} transparent opacity={0.85} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

function Head({ eyeColor, skinColor }: { eyeColor: string; skinColor: THREE.Color }) {
  const colorMap: Record<string, string> = { brown: "#5C3317", blue: "#4A90D9", green: "#2d5a27", hazel: "#8B7355", gray: "#9E9E9E" };
  return (
    <group position={[0, 1.55, 0]}>
      <mesh scale={[0.85, 1, 0.9]} castShadow receiveShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <SkinMaterial color={skinColor} />
      </mesh>
      <mesh position={[-0.09, 0.04, 0.26]} scale={[0.85, 0.85, 0.5]}><sphereGeometry args={[0.04, 16, 16]} /><meshStandardMaterial color={colorMap[eyeColor]} roughness={0.2} metalness={0.8} /></mesh>
      <mesh position={[0.09, 0.04, 0.26]} scale={[0.85, 0.85, 0.5]}><sphereGeometry args={[0.04, 16, 16]} /><meshStandardMaterial color={colorMap[eyeColor]} roughness={0.2} metalness={0.8} /></mesh>
    </group>
  );
}

function Legs({ skinColor }: { skinColor: THREE.Color }) {
  return (
    <group position={[0, -0.55, 0]}>
      <mesh position={[-0.18, 0, 0]} rotation={[0, 0, 0.05]} castShadow receiveShadow><capsuleGeometry args={[0.12, 0.7, 16, 32]} /><SkinMaterial color={skinColor} /></mesh>
      <mesh position={[0.18, 0, 0]} rotation={[0, 0, -0.05]} castShadow receiveShadow><capsuleGeometry args={[0.12, 0.7, 16, 32]} /><SkinMaterial color={skinColor} /></mesh>
    </group>
  );
}

export default function BaseModel({ customization }: BaseModelProps) {
  const groupRef = useRef<Group>(null);
  const skinColor = useMemo(() => getSkinColor(customization.ethnicity.preset, customization.ethnicity.skinTone), [customization.ethnicity.preset, customization.ethnicity.skinTone]);
  const hairColorValue = HAIR_COLORS[customization.hair.color] || HAIR_COLORS.black;
  const heightScale = 0.88 + (customization.body.height / 100) * 0.25;
  const weightScale = 0.9 + (customization.body.weight / 100) * 0.45;
  const torsoScale: [number, number, number] = [weightScale, 1, 0.95];

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
       groupRef.current.rotation.y += 0.004;
       groupRef.current.scale.setScalar(heightScale + Math.sin(t * 0.8) * 0.002);
    }
  });

  return (
    <group ref={groupRef} scale={[heightScale, heightScale, heightScale]} position={[0, -0.2, 0]}>
      <Head eyeColor={customization.eyes.color} skinColor={skinColor} />
      <Torso scale={torsoScale} color={skinColor} />
      <Chest size={customization.chest.size} nippleType={customization.chest.nippleType} skinColor={skinColor} torsoWeight={weightScale} clothingType={customization.clothing.type} />
      <Genitalia type={customization.anatomy.vaginaType} skinColor={skinColor} clothingType={customization.clothing.type} />
      <PubicHair style={customization.anatomy.pubicHair} clothingType={customization.clothing.type} torsoScale={torsoScale} hairColor={hairColorValue} />
      <Legs skinColor={skinColor} />
    </group>
  );
}
