"use client";

import React, { useState, useEffect } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ background: 'black', height: '100vh', color: 'white' }}>Loading...</div>;

  return (
    <div style={{ padding: '50px', background: '#0a0a0c', height: '100vh', color: 'white', textAlign: 'center' }}>
      <h1 style={{ color: '#7c3aed' }}>BUILD-A-BITCH.COM</h1>
      <p>System is Live. Phase 17.1 Initialized.</p>
      <div style={{ marginTop: '30px', border: '1px solid #7c3aed', padding: '20px' }}>
         If you can see this text, your phone is now connected to the server.
      </div>
    </div>
  );
}