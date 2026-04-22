"use client";

import { useCallback } from "react";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export default function Slider({ label, value, min, max, step, onChange }: SliderProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end px-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
          {label}
        </label>
        <span className="text-[11px] text-violet-400 font-mono tracking-widest">{value}%</span>
      </div>
      <div className="relative group">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-[6px] bg-zinc-800 rounded-full appearance-none cursor-pointer touch-manipulation
            accent-violet-500
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:bg-violet-500
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-zinc-950
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(139,92,246,0.3)]
            [&::-webkit-slider-thumb]:transition-all
            hover:bg-zinc-700 transition-colors"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-[6px] bg-violet-600 rounded-full pointer-events-none opacity-50"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
