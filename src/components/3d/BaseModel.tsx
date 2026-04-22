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

function getSkinColor(preset: string, toneValue: number) {
  const baseColor = new THREE.Color(SKIN_PRESETS[preset] || SKIN_PRESETS.caucasian);
  const adjustment = (toneValue - 50) / 200;
  baseColor.multiplyScalar(1 + adjustment);
  return baseColor;
}

function ProSkinMaterial({ color }: { color: THREE.Color }) {
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

function SculptedShape({ points, color, scale = [1, 1, 1] }: { points: THREE.Vector2[], color: THREE.Color, scale?: [number, number, number] }) {
  const geometry = useMemo(() => new THREE.LatheGeometry(points, 32), [points]);
  return (
    <mesh geometry={geometry} scale={scale} castShadow receiveShadow>
      <ProSkinMaterial color={color} />
    </mesh>
  );
}

function Torso({ scale, color }: { scale: [number, number, number]; color: THREE.Color }) {
  const torsoPoints = useMemo(() => [
    new THREE.Vector2(0.18, 0),    // Bottom
    new THREE.Vector2(0.32, 0.2),  // Hips
    new THREE.Vector2(0.22, 0.5),  // Waist
    new THREE.Vector2(0.28, 0.8),  // Chest
    new THREE.Vector2(0.25, 0.95), // Neck
    new THREE.Vector2(0, 1.0)      
  ], []);

  return (
    <group position={[0, 0.45, 0]} scale={scale}>
       <SculptedShape points={torsoPoints} color={color} />
    </group>
  );
}

function Chest({ size, skinColor, torsoWeight, clothingType }: { size: number; skinColor: THREE.Color; torsoWeight: number; clothingType: string; }) {
  const normalizedSize = size / 15;
  const chestScale = 0.15 + (normalizedSize * 0.2);
  const zOffset = 0.18 + (normalizedSize * 0.15);
  const yOffset = 1.0;
  const xOffset = 0.14 + (torsoWeight - 1) * 0.1;

  return (
    <group position={[0, 0.1, 0]}>
      <mesh position={[-xOffset, yOffset, zOffset]} scale={[1, 1.3, 0.9]} castShadow receiveShadow>
        <sphereGeometry args={[chestScale, 32, 32]} />
        <ProSkinMaterial color={skinColor} />
      </mesh>
      <mesh position={[xOffset, yOffset, zOffset]} scale={[1, 1.3, 0.9]} castShadow receiveShadow>
        <sphereGeometry args={[chestScale, 32, 32]} />
        <ProSkinMaterial color={skinColor} />
      </mesh>
    </group>
  );
}

function Head({ eyeColor, skinColor }: { eyeColor: string; skinColor: THREE.Color }) {
  const headPoints = useMemo(() => [
    new THREE.Vector2(0.1, 0),    // Chin
    new THREE.Vector2(0.24, 0.2), // Cheeks
    new THREE.Vector2(0.22, 0.5), // Temples
    new THREE.Vector2(0.18, 0.6), // Forehead
    new THREE.Vector2(0, 0.65)    
  ], []);

  return (
    <group position={[0, 1.5, 0.05]}>
       <SculptedShape points={headPoints} color={skinColor} />
    </group>
  );
}

function Limb({ color, type }: { color: THREE.Color, type: 'leg' | 'arm' }) {
  const points = useMemo(() => type === 'leg' ? [
    new THREE.Vector2(0.08, 0),   
    new THREE.Vector2(0.12, 0.3),  
    new THREE.Vector2(0.1, 0.45),  
    new THREE.Vector2(0.18, 0.8),  
    new THREE.Vector2(0, 0.85)     
  ] : [
    new THREE.Vector2(0.04, 0),   
    new THREE.Vector2(0.07, 0.3),  
    new THREE.Vector2(0.06, 0.45), 
    new THREE.Vector2(0.08, 0.8),  
    new THREE.Vector2(0, 0.85)     
  ], [type]);

  return <SculptedShape points={points} color={color} />;
}

export default function BaseModel({ customization }: BaseModelProps) {
  const skinColor = useMemo(() => {
     const base = SKIN_PRESETS[customization.ethnicity.preset] || SKIN_PRESETS.caucasian;
     const color = new THREE.Color(base);
     const adjustment = (customization.ethnicity.skinTone - 50) / 200;
     color.multiplyScalar(1 + adjustment);
     return color;
  }, [customization.ethnicity.preset, customization.ethnicity.skinTone]);

  const heightScale = 0.95 + (customization.body.height / 100) * 0.25;
  const weightScale = 0.85 + (customization.body.weight / 100) * 0.55;

  return (
    <group scale={[heightScale, heightScale, heightScale]} position={[0, -0.6, 0]}>
      <Head eyeColor={customization.eyes.color} skinColor={skinColor} />
      <group position={[-0.4, 1.45, 0]} rotation={[0, 0, 0.25]}><Limb color={skinColor} type="arm" /></group>
      <group position={[0.4, 1.45, 0]} rotation={[0, 0, -0.25]}><Limb color={skinColor} type="arm" /></group>
      <Torso scale={[weightScale, 1.1, 1]} color={skinColor} />
      <Chest size={customization.chest.size} skinColor={skinColor} torsoWeight={weightScale} clothingType={customization.clothing.type} />
      <group position={[-0.18, 0.5, 0]} rotation={[0, 0, 0.05]} scale={[1, -1, 1]}><Limb color={skinColor} type="leg" /></group>
      <group position={[0.18, 0.5, 0]} rotation={[0, 0, -0.05]} scale={[1, -1, 1]}><Limb color={skinColor} type="leg" /></group>
    </group>
  );
}
