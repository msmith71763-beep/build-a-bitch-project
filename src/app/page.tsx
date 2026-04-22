"use client";

import React, { useState, useMemo, useRef, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { User, Heart, Eye, Scissors, Globe } from "lucide-react";

// --- TYPES ---
interface CustomizationState {
  body: { height: number; weight: number; muscle: number };
  chest: { size: number; nippleType: string };
  eyes: { color: string };
  hair: { length: number; volume: number; color: string };
  ethnicity: { preset: string; skinTone: number };
}

const DEFAULT_STATE: CustomizationState = {
  body: { height: 50, weight: 85, muscle: 50 },
  chest: { size: 9, nippleType: "type_1" },
  eyes: { color: "green" },
  hair: { length: 60, volume: 50, color: "red" },
  ethnicity: { preset: "caucasian", skinTone: 50 }
};

const SKIN_PRESETS: Record<string, string> = {
  caucasian: "#f5d0c5", african: "#3d2b1f", east_asian: "#f3e0b5", south_asian: "#a67b5b", latin: "#c68642"
};

const HAIR_COLORS: Record<string, string> = {
  black: "#090909", blonde: "#e6c073", red: "#9a3324", brown: "#4b3221"
};

const EYE_COLORS: Record<string, string> = {
  brown: "#5c3317", blue: "#4a90d9", green: "#2d5a27", hazel: "#8b7355"
};

// --- 3D MODEL COMPONENT ---
function Character({ customization }: { customization: CustomizationState }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const skinColor = useMemo(() => {
    const base = new THREE.Color(SKIN_PRESETS[customization.ethnicity.preset] || SKIN_PRESETS.caucasian);
    const adj = (customization.ethnicity.skinTone - 50) / 200;
    base.multiplyScalar(1 + adj);
    return base;
  }, [customization.ethnicity.preset, customization.ethnicity.skinTone]);

  const hairColor = HAIR_COLORS[customization.hair.color] || HAIR_COLORS.black;
  const hScale = 0.85 + (customization.body.height / 100) * 0.3;
  const wScale = 0.8 + (customization.body.weight / 100) * 0.6; 
  
  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: skinColor,
    roughness: 0.35,
    clearcoat: 0.1,
    sheen: 0.5,
    sheenColor: new THREE.Color("#ffcfc5")
  }), [skinColor]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={groupRef} scale={[hScale, hScale, hScale]} position={[0, -0.4, 0]}>
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.26, 64, 64]} />
        <primitive object={skinMat} />
      </mesh>
      <mesh position={[-0.08, 1.58, 0.22]}>
        <sphereGeometry args={[0.035, 32, 32]} />
        <meshStandardMaterial color={customization.eyes.color} />
      </mesh>
      <mesh position={[0.08, 1.58, 0.22]}>
        <sphereGeometry args={[0.035, 32, 32]} />
        <meshStandardMaterial color={customization.eyes.color} />
      </mesh>
      <mesh position={[0, 1.68, -0.05]} castShadow>
        <capsuleGeometry args={[0.28 + (customization.hair.volume/100)*0.1, 0.1 + (customization.hair.length/100)*0.6, 16, 64]} />
        <meshStandardMaterial color={hairColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.6, 0]} scale={[wScale, 1, 0.95]} castShadow receiveShadow>
        <capsuleGeometry args={[0.34, 0.8, 16, 64]} />
        <primitive object={skinMat} />
      </mesh>
      <group>
        <mesh position={[-0.15 * wScale, 0.8, 0.22 + (customization.chest.size/15)*0.1]} castShadow>
          <sphereGeometry args={[0.12 + (customization.chest.size/15)*0.15, 64, 64]} />
          <primitive object={skinMat} />
        </mesh>
        <mesh position={[0.15 * wScale, 0.8, 0.22 + (customization.chest.size/15)*0.1]} castShadow>
          <sphereGeometry args={[0.12 + (customization.chest.size/15)*0.15, 64, 64]} />
          <primitive object={skinMat} />
        </mesh>
      </group>
      <mesh position={[0, 0.22, 0.32]} rotation={[-0.2, 0, 0]} scale={[0.05, 0.14, 0.04]}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={skinMat} />
      </mesh>
      <mesh position={[-0.14 * wScale, -0.5, 0]} castShadow>
        <capsuleGeometry args={[0.11, 0.7, 16, 32]} />
        <primitive object={skinMat} />
      </mesh>
      <mesh position={[0.14 * wScale, -0.5, 0]} castShadow>
        <capsuleGeometry args={[0.11, 0.7, 16, 32]} />
        <primitive object={skinMat} />
      </mesh>
    </group>
  );
}

// --- MAIN PAGE ---
export default function Home() {
  const [cust, setCust] = useState<CustomizationState>(DEFAULT_STATE);
  const [cat, setCat] = useState("body");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const update = (field: string, val: any) => {
    setCust(prev => ({
      ...prev,
      [cat]: { ...(prev as any)[cat], [field]: val }
    }));
  };

  if (!mounted) return <div className="h-screen w-screen bg-black" />;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050507] text-white">
      <div className="flex-1 relative">
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 1.2, 4.2]} fov={30} />
          <ambientLight intensity={0.5} />
          <spotLight position={[5, 10, 5]} intensity={1.5} castShadow />
          <Suspense fallback={null}>
            <Character customization={cust} />
            <OrbitControls enablePan={false} target={[0, 0.8, 0]} minDistance={2} maxDistance={6} />
            <ContactShadows position={[0, -0.4, 0]} opacity={0.4} scale={10} blur={2} />
            <Environment preset="studio" />
          </Suspense>
        </Canvas>
        <div className="absolute top-8 left-10 z-10 pointer-events-none">
          <h1 className="text-[10px] font-black text-violet-500 tracking-[0.4em] uppercase">ULTRA STABLE BUILD 15.0</h1>
          <h2 className="text-xl font-light text-white tracking-[0.1em] uppercase">BUILD-A-BITCH<span className="font-bold text-violet-500">.COM</span></h2>
        </div>
      </div>
      <div className="w-[380px] h-full bg-zinc-950 border-l border-white/5 flex flex-col p-8 z-20">
        <div className="flex gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
          {[
            { id: "body", icon: User }, { id: "chest", icon: Heart }, { id: "eyes", icon: Eye }, 
            { id: "hair", icon: Scissors }, { id: "ethnicity", icon: Globe }
          ].map(item => (
            <button key={item.id} onClick={() => setCat(item.id)} className={`p-3 rounded-lg ${cat === item.id ? "bg-violet-600" : "text-zinc-600"}`}>
              <item.icon size={20} />
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-8">
           <h3 className="text-xl font-bold uppercase tracking-widest text-white">{cat}</h3>
           {cat === "body" && (
             <div className="space-y-6">
                {["height", "weight", "muscle"].map(f => (
                  <div key={f} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500"><span>{f}</span><span>{(cust.body as any)[f]}</span></div>
                    <input type="range" min="0" max="100" value={(cust.body as any)[f]} onChange={e => update(f, parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 accent-violet-600" />
                  </div>
                ))}
             </div>
           )}
           {cat === "chest" && (
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500"><span>Size</span><span>{cust.chest.size}</span></div>
                 <input type="range" min="1" max="15" value={cust.chest.size} onChange={e => update("size", parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 accent-violet-600" />
              </div>
           )}
           {(cat === "hair" || cat === "eyes" || cat === "ethnicity") && (
              <div className="grid grid-cols-2 gap-2">
                 {Object.keys(cat === "hair" ? HAIR_COLORS : cat === "eyes" ? EYE_COLORS : SKIN_PRESETS).map(key => (
                   <button key={key} onClick={() => update(cat === "ethnicity" ? "preset" : "color", key)} className={`py-4 rounded-lg text-[10px] font-black uppercase border ${((cust as any)[cat].color === key || (cust as any)[cat].preset === key) ? "bg-violet-600 border-violet-400" : "bg-zinc-900 border-white/5"}`}>
                     {key}
                   </button>
                 ))}
              </div>
           )}
        </div>
      </div>
    </div>
  );
}