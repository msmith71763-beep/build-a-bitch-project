"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function BaseModel({ onLoaded }: { onLoaded?: () => void }) {
  useEffect(() => {
    if (onLoaded) onLoaded();
  }, [onLoaded]);

  return (
    <mesh position={[0, 1, 0]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="violet" />
    </mesh>
  );
}