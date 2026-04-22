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

export default function BaseModel({ customization }: BaseModelProps) {
  const groupRef = useRef<Group>(null);
  
  const skinColor = useMemo(() => getSkinColor(customization.ethnicity.preset, customization.ethnicity.skinTone), [customization.ethnicity.preset, customization.ethnicity.skinTone]);
  const hairColorValue = HAIR_COLORS[customization.hair.color] || HAIR_COLORS.black;
  const heightScale = 0.85 + (customization.body.height / 100) * 0.3;
  const weightScale = 0.85 + (customization.body.weight / 100) * 0.4;
  const torsoScale: [number, number, number] = [weightScale, 1, 1];

  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: skinColor,
    roughness: 0.35, 
    metalness: 0.05,
    clearcoat: 0.1,
    sheen: 0.4,
    sheenColor: new THREE.Color("#ffcfc5")
  }), [skinColor]);

  const hairMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: hairColorValue,
    roughness: 0.8
  }), [hairColorValue]);

  const chestSize = customization.chest.size / 15;
  const chestScale = 0.15 + (chestSize * 0.15);
  const zOffset = 0.2 + (chestSize * 0.12);
  const xOffset = 0.15 + (weightScale - 1) * 0.1;

  const genitaliaScales: Record<string, [number, number, number]> = {
    type_1: [0.04, 0.12, 0.03], type_2: [0.07, 0.16, 0.05], type_3: [0.03, 0.10, 0.05],
    type_4: [0.05, 0.15, 0.02], type_5: [0.05, 0.12, 0.07], type_6: [0.08, 0.11, 0.04],
  };
  const currentGenScale = genitaliaScales[customization.anatomy.vaginaType] || genitaliaScales.type_1;

  useFrame((state) => {
     if (!groupRef.current) return;
     const time = state.clock.getElapsedTime();
     
     if (customization.animation.pose === "idle") {
        groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
        groupRef.current.position.y = -0.25 + Math.sin(time * 1.5) * 0.01;
     } else if (customization.animation.pose === "pose_2") {
        groupRef.current.rotation.y = 0.2;
     }
  });

  return (
    <group ref={groupRef} scale={[heightScale, heightScale, heightScale]} position={[0, -0.25, 0]}>
      <group position={[0, 1.55, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.28, 32, 32]} />
          <primitive object={skinMat} />
        </mesh>
        <mesh position={[-0.09, 0.04, 0.24]} scale={[0.8, 0.8, 0.5]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color={customization.eyes.color} />
        </mesh>
        <mesh position={[0.09, 0.04, 0.24]} scale={[0.8, 0.8, 0.5]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color={customization.eyes.color} />
        </mesh>
      </group>

      <group position={[0, 1.7, -0.02]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.28 + (customization.hair.volume/100)*0.2, 0.15 + (customization.hair.length/100)*0.5, 8, 32]} />
          <primitive object={hairMat} />
        </mesh>
      </group>

      <mesh position={[0, 0.6, 0]} scale={torsoScale} castShadow receiveShadow>
        <capsuleGeometry args={[0.35, 0.8, 8, 32]} />
        <primitive object={skinMat} />
      </mesh>

      <group>
        <mesh position={[-xOffset, 0.75, zOffset]} castShadow receiveShadow>
          <sphereGeometry args={[chestScale, 32, 32]} />
          <primitive object={skinMat} />
          {customization.clothing.type === "none" && (
            <mesh position={[0, 0, chestScale - 0.01]} scale={[1, 1, 0.5]}>
              <sphereGeometry args={[0.02, 16, 16]} />
              <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.7)} />
            </mesh>
          )}
        </mesh>
        <mesh position={[xOffset, 0.75, zOffset]} castShadow receiveShadow>
          <sphereGeometry args={[chestScale, 32, 32]} />
          <primitive object={skinMat} />
          {customization.clothing.type === "none" && (
            <mesh position={[0, 0, chestScale - 0.01]} scale={[1, 1, 0.5]}>
              <sphereGeometry args={[0.02, 16, 16]} />
              <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.7)} />
            </mesh>
          )}
        </mesh>
      </group>

      {customization.clothing.type === "none" && (
        <group position={[0, 0.22, 0.32]} rotation={[-0.2, 0, 0]}>
          <mesh castShadow receiveShadow scale={currentGenScale}>
            <sphereGeometry args={[1, 32, 32]} />
            <primitive object={skinMat} />
          </mesh>
        </group>
      )}

      {customization.clothing.type === "none" && customization.anatomy.pubicHair !== "shaved" && (
        <mesh position={[0, 0.28, 0.34]} scale={[torsoScale[0], 1, 1]} rotation={[-0.1, 0, 0]}>
           <planeGeometry args={[0.3, 0.2]} />
           <meshStandardMaterial color={hairColorValue} transparent opacity={0.8} />
        </mesh>
      )}

      <group position={[0, -0.55, 0]}>
        <mesh position={[-0.14, 0, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.1, 0.6, 8, 24]} />
          <primitive object={skinMat} />
        </mesh>
        <mesh position={[0.14, 0, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.1, 0.6, 8, 24]} />
          <primitive object={skinMat} />
        </mesh>
      </group>
    </group>
  );
}