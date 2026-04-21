"use client";

import type { ButtonOption } from "@/types/customization";

interface OptionGroupProps {
  label: string;
  options: ButtonOption[];
  selected: string;
  onChange: (id: string) => void;
}

export default function OptionGroup({ label, options, selected, onChange }: OptionGroupProps) {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              selected === opt.id
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
