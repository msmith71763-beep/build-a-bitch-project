"use client";

import React, { useState, useMemo, useRef, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

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
      {/* Head */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.26, 64, 64]} />
        <primitive object={skinMat} />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.08, 1.58, 0.22]}>
        <sphereGeometry args={[0.035, 32, 32]} />
        <meshStandardMaterial color={customization.eyes.color} />
      </mesh>
      <mesh position={[0.08, 1.58, 0.22]}>
        <sphereGeometry args={[0.035, 32, 32]} />
        <meshStandardMaterial color={customization.eyes.color} />
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
        </mesh>
        <mesh position={[0.15 * wScale, 0.8, 0.22 + (customization.chest.size/15)*0.1]} castShadow>
          <sphereGeometry args={[0.12 + (customization.chest.size/15)*0.15, 64, 64]} />
          <primitive object={skinMat} />
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

  if (!mounted) return <div style={{ background: 'black', height: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Initializing...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#050507', color: 'white', fontFamily: 'sans-serif' }}>
      {/* 3D Viewport */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas shadows dpr={1}>
          <PerspectiveCamera makeDefault position={[0, 1.2, 4.2]} fov={30} />
          <ambientLight intensity={1} />
          <spotLight position={[5, 10, 5]} intensity={2} castShadow />
          <Character customization={cust} />
          <OrbitControls enablePan={false} target={[0, 0.8, 0]} minDistance={2} maxDistance={6} />
          <ContactShadows position={[0, -0.4, 0]} opacity={0.4} scale={10} blur={2} />
        </Canvas>

        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, pointerEvents: 'none' }}>
          <h1 style={{ fontSize: '10px', fontWeight: '900', color: '#7c3aed', letterSpacing: '0.4em', textTransform: 'uppercase' }}>Ultimate Stable Build 20.0</h1>
          <h2 style={{ fontSize: '20px', fontWeight: '300', textTransform: 'uppercase' }}>BUILD-A-BITCH.COM</h2>
        </div>
      </div>

      {/* Control Sidebar */}
      <div style={{ width: '350px', background: '#09090b', padding: '20px', borderLeft: '1px solid #27272a', overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px' }}>
          {['body', 'chest', 'eyes', 'hair', 'ethnicity'].map(id => (
            <button key={id} onClick={() => setCat(id)} style={{ padding: '10px 20px', background: cat === id ? '#7c3aed' : '#27272a', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              {id.toUpperCase()}
            </button>
          ))}
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '20px', borderLeft: '4px solid #7c3aed', paddingLeft: '10px' }}>{cat}</h3>
        
        {cat === 'body' && ['height', 'weight', 'muscle'].map(f => (
          <div key={f} style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', marginBottom: '8px' }}><span>{f.toUpperCase()}</span><span>{(cust.body as any)[f]}</span></div>
            <input type="range" min="0" max="100" value={(cust.body as any)[f]} onChange={e => update(f, parseInt(e.target.value))} style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer' }} />
          </div>
        ))}

        {cat === 'chest' && (
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', marginBottom: '8px' }}><span>BREAST SIZE</span><span>{cust.chest.size}</span></div>
            <input type="range" min="1" max="15" value={cust.chest.size} onChange={e => update("size", parseInt(e.target.value))} style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer' }} />
          </div>
        )}

        {(cat === 'hair' || cat === 'eyes' || cat === 'ethnicity') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {Object.keys(cat === 'hair' ? HAIR_COLORS : cat === 'eyes' ? EYE_COLORS : SKIN_PRESETS).map(key => (
              <button key={key} onClick={() => update(cat === 'ethnicity' ? "preset" : "color", key)} style={{ padding: '15px', background: ((cust as any)[cat].color === key || (cust as any)[cat].preset === key) ? '#7c3aed' : '#18181b', border: '1px solid #27272a', color: 'white', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '8px' }}>
                {key}
              </button>
            ))}
          </div>
        )}

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #27272a' }}>
           <button onClick={() => setCust(DEFAULT_STATE)} style={{ width: '100%', padding: '15px', background: '#18181b', border: '1px solid #27272a', color: '#52525b', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>RESET CHARACTER</button>
        </div>
      </div>
    </div>
  );
}