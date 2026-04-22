"use client";

import React, { useState, useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, BakeShadows } from "@react-three/drei";
import * as THREE from "three";
import { User, Heart, Eye, Scissors, Globe, Play, Shirt, Sparkles, RotateCcw } from "lucide-react";

// --- TYPES ---
interface CustomizationState {
  body: { height: number; weight: number; muscle: number };
  chest: { size: number; nippleType: string };
  eyes: { color: string };
  hair: { length: number; volume: number; color: string };
  ethnicity: { preset: string; skinTone: number };
  anatomy: { vaginaType: string; pubicHair: string };
  animation: { pose: string };
}

const DEFAULT_STATE: CustomizationState = {
  body: { height: 50, weight: 85, muscle: 50 },
  chest: { size: 9, nippleType: "type_1" },
  eyes: { color: "green" },
  hair: { length: 60, volume: 50, color: "red" },
  ethnicity: { preset: "caucasian", skinTone: 50 },
  anatomy: { vaginaType: "type_2", pubicHair: "natural" },
  animation: { pose: "idle" }
};

const SKIN_PRESETS: Record<string, string> = {
  caucasian: "#f5d0c5", african: "#3d2b1f", east_asian: "#f3e0b5", south_asian: "#a67b5b", latin: "#c68642"
};

const HAIR_COLORS: Record<string, string> = {
  black: "#090909", blonde: "#e6c073", red: "#9a3324", brown: "#4b3221"
};

// --- 3D COMPONENTS ---
function BaseModel({ customization }: { customization: CustomizationState }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const skinColor = useMemo(() => {
    const base = new THREE.Color(SKIN_PRESETS[customization.ethnicity.preset] || SKIN_PRESETS.caucasian);
    const adj = (customization.ethnicity.skinTone - 50) / 200;
    base.multiplyScalar(1 + adj);
    return base;
  }, [customization.ethnicity.preset, customization.ethnicity.skinTone]);

  const hairColor = HAIR_COLORS[customization.hair.color] || HAIR_COLORS.black;
  const hScale = 0.85 + (customization.body.height / 100) * 0.3;
  const wScale = 0.8 + (customization.body.weight / 100) * 0.6; // High Detail Hips
  
  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: skinColor,
    roughness: 0.35,
    clearcoat: 0.1,
    sheen: 0.5,
    sheenColor: new THREE.Color("#ffcfc5"),
    name: "BodySkin"
  }), [skinColor]);

  useFrame((state) => {
    if (groupRef.current) {
      if (customization.animation.pose === "idle") {
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      }
    }
  });

  return (
    <group ref={groupRef} scale={[hScale, hScale, hScale]} position={[0, -0.4, 0]}>
      {/* Head - Ultra Smooth */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.26, 64, 64]} />
        <primitive object={skinMat} />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.08, 1.58, 0.22]}>
        <sphereGeometry args={[0.035, 32, 32]} />
        <meshStandardMaterial color={customization.eyes.color} roughness={0.1} />
      </mesh>
      <mesh position={[0.08, 1.58, 0.22]}>
        <sphereGeometry args={[0.035, 32, 32]} />
        <meshStandardMaterial color={customization.eyes.color} roughness={0.1} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.68, -0.05]} castShadow>
        <capsuleGeometry args={[0.28 + (customization.hair.volume/100)*0.1, 0.1 + (customization.hair.length/100)*0.6, 16, 64]} />
        <meshStandardMaterial color={hairColor} roughness={0.8} />
      </mesh>

      {/* Torso & Hips */}
      <mesh position={[0, 0.6, 0]} scale={[wScale, 1, 0.95]} castShadow receiveShadow>
        <capsuleGeometry args={[0.34, 0.8, 16, 64]} />
        <primitive object={skinMat} />
      </mesh>

      {/* Chest */}
      <group>
        <mesh position={[-0.15 * wScale, 0.8, 0.22 + (customization.chest.size/15)*0.1]} castShadow>
          <sphereGeometry args={[0.12 + (customization.chest.size/15)*0.15, 64, 64]} />
          <primitive object={skinMat} />
          <mesh position={[0, 0, 0.12 + (customization.chest.size/15)*0.15 - 0.01]} scale={[1, 1, 0.5]}>
             <sphereGeometry args={[0.015, 16, 16]} />
             <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.75)} />
          </mesh>
        </mesh>
        <mesh position={[0.15 * wScale, 0.8, 0.22 + (customization.chest.size/15)*0.1]} castShadow>
          <sphereGeometry args={[0.12 + (customization.chest.size/15)*0.15, 64, 64]} />
          <primitive object={skinMat} />
          <mesh position={[0, 0, 0.12 + (customization.chest.size/15)*0.15 - 0.01]} scale={[1, 1, 0.5]}>
             <sphereGeometry args={[0.015, 16, 16]} />
             <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.75)} />
          </mesh>
        </mesh>
      </group>

      {/* Anatomy - Vagina */}
      <mesh position={[0, 0.22, 0.32]} rotation={[-0.2, 0, 0]} scale={[0.05, 0.14, 0.04]}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={skinMat} />
      </mesh>

      {/* Legs */}
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

// --- UI COMPONENTS ---
export default function Home() {
  const [cust, setCust] = useState(DEFAULT_STATE);
  const [cat, setCat] = useState("body");

  const update = (field: string, val: any) => {
    setCust(prev => ({
      ...prev,
      [cat]: { ...(prev as any)[cat], [field]: val }
    }));
  };

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#050507] text-white font-sans">
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[0, 1.2, 4.2]} fov={30} />
          <color attach="background" args={["#050507"]} />
          <ambientLight intensity={0.5} />
          <spotLight position={[5, 10, 5]} intensity={1.5} castShadow />
          <pointLight position={[-5, 5, 5]} intensity={1} />
          
          <Suspense fallback={null}>
            <BaseModel customization={cust} />
            <OrbitControls enablePan={false} target={[0, 0.8, 0]} minDistance={2} maxDistance={6} />
            <ContactShadows position={[0, -0.4, 0]} opacity={0.4} scale={10} blur={2} />
            <Environment preset="studio" />
          </Suspense>
          <BakeShadows />
        </Canvas>

        {/* Header Overlay */}
        <div className="absolute top-6 left-8 z-10 pointer-events-none">
          <h1 className="text-[10px] font-black text-violet-500 tracking-[0.4em] uppercase mb-1">Final Master Build 14.0</h1>
          <h2 className="text-2xl font-light text-white tracking-[0.1em] uppercase">BUILD-A-BITCH<span className="font-bold text-violet-500">.COM</span></h2>
          <p className="text-[9px] text-zinc-500 uppercase mt-2">Stability Mode: Procedural Ultra-Smooth Engine</p>
        </div>
      </div>

      {/* Control Sidebar */}
      <div className="w-[380px] h-full bg-zinc-950 border-l border-white/5 flex flex-col p-8 z-20 overflow-y-auto">
        <div className="flex gap-4 mb-10 overflow-x-auto pb-4 border-b border-white/5 no-scrollbar">
          {[
            { id: "body", icon: User }, { id: "chest", icon: Heart }, { id: "eyes", icon: Eye }, 
            { id: "hair", icon: Scissors }, { id: "ethnicity", icon: Globe }, { id: "anatomy", icon: Sparkles }
          ].map(item => (
            <button key={item.id} onClick={() => setCat(item.id)} className={`p-3 rounded-lg transition-all ${cat === item.id ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20" : "text-zinc-600 hover:text-white"}`}>
              <item.icon size={20} />
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-8">
           <h3 className="text-xl font-bold uppercase tracking-widest text-white border-l-4 border-violet-600 pl-4">{cat}</h3>
           
           {/* Dynamic Sliders */}
           {cat === "body" && (
             <div className="space-y-6">
                {["height", "weight", "muscle"].map(f => (
                  <div key={f} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500"><span>{f}</span><span>{(cust.body as any)[f]}</span></div>
                    <input type="range" min="0" max="100" value={(cust.body as any)[f]} onChange={e => update(f, parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-600" />
                  </div>
                ))}
             </div>
           )}

           {cat === "chest" && (
              <div className="space-y-6">
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500"><span>Cup Size</span><span>{cust.chest.size}</span></div>
                    <input type="range" min="1" max="15" value={cust.chest.size} onChange={e => update("size", parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-600" />
                 </div>
              </div>
           )}

           {cat === "hair" && (
              <div className="grid grid-cols-2 gap-3">
                 {["black", "blonde", "red", "brown"].map(c => (
                   <button key={c} onClick={() => update("color", c)} className={`py-4 rounded-xl text-[10px] font-black uppercase border transition-all ${cust.hair.color === c ? "bg-violet-600 border-violet-400 text-white" : "bg-zinc-900 border-white/5 text-zinc-600 hover:border-white/20"}`}>
                     {c}
                   </button>
                 ))}
              </div>
           )}

           {cat === "eyes" && (
              <div className="grid grid-cols-2 gap-3">
                 {["brown", "blue", "green", "hazel"].map(c => (
                   <button key={c} onClick={() => update("color", c)} className={`py-4 rounded-xl text-[10px] font-black uppercase border transition-all ${cust.eyes.color === c ? "bg-violet-600 border-violet-400 text-white" : "bg-zinc-900 border-white/5 text-zinc-600 hover:border-white/20"}`}>
                     {c}
                   </button>
                 ))}
              </div>
           )}

           {cat === "ethnicity" && (
              <div className="grid grid-cols-2 gap-3">
                 {["caucasian", "african", "east_asian", "south_asian", "latin"].map(p => (
                   <button key={p} onClick={() => update("preset", p)} className={`py-4 rounded-xl text-[10px] font-black uppercase border transition-all ${cust.ethnicity.preset === p ? "bg-violet-600 border-violet-400 text-white" : "bg-zinc-900 border-white/5 text-zinc-600 hover:border-white/20"}`}>
                     {p.replace('_', ' ')}
                   </button>
                 ))}
              </div>
           )}
        </div>

        <div className="mt-auto pt-8 border-t border-white/5 flex gap-4">
           <button onClick={() => setCust(DEFAULT_STATE)} className="flex-1 py-4 bg-zinc-900 rounded-xl text-[10px] font-black uppercase text-zinc-600 hover:text-white transition-colors">Reset</button>
           <button className="flex-1 py-4 bg-violet-600 rounded-xl text-[10px] font-black uppercase text-white shadow-lg shadow-violet-900/20">Finalize</button>
        </div>
      </div>
    </div>
  );
}