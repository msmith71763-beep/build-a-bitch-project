"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  User,
  Heart,
  Eye,
  Scissors,
  Globe,
  Shirt,
  Sparkles,
  Play,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import Slider from "./Slider";
import OptionGroup from "./OptionGroup";
import { CATEGORIES, DEFAULT_CUSTOMIZATION } from "@/types/customization";
import type { CustomizationState } from "@/types/customization";

const ICON_MAP: Record<string, LucideIcon> = {
  User,
  Heart,
  Eye,
  Scissors,
  Globe,
  Shirt,
  Sparkles,
  Play,
};

interface SidebarProps {
  customization: CustomizationState;
  onChange: (customization: CustomizationState) => void;
}

export default function Sidebar({ customization, onChange }: SidebarProps) {
  const [activeCategory, setActiveCategory] = useState("body");

  const category = CATEGORIES.find((c) => c.id === activeCategory)!;
  const catState = customization[activeCategory as keyof CustomizationState] as Record<string, any>;

  function updateField(field: string, value: any) {
    onChange({
      ...customization,
      [activeCategory]: {
        ...catState,
        [field]: value,
      },
    });
  }

  function handleOptionChange(value: string) {
    if (value.startsWith("sep_")) return;

    if (activeCategory === "anatomy") {
      if (value.startsWith("type_")) {
        updateField("vaginaType", value);
      } else {
        updateField("pubicHair", value);
      }
      return;
    }

    const key = getOptionKey();
    if (key) updateField(key, value);
  }

  function getOptionKey(): string | null {
    if (activeCategory === "chest") return "nippleType";
    if (activeCategory === "eyes") return "color";
    if (activeCategory === "hair") return "style";
    if (activeCategory === "ethnicity") return "preset";
    if (activeCategory === "clothing") return "type";
    if (activeCategory === "animation") return "pose";
    return null;
  }

  return (
    <div className="w-[400px] h-full bg-zinc-950/80 backdrop-blur-2xl border-l border-white/5 flex flex-col p-8 z-30">
      {/* Category Icons */}
      <div className="flex gap-4 mb-10 overflow-x-auto scrollbar-hide pb-2 border-b border-white/5">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon];
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-3 rounded-sm transition-all ${
                isActive ? "bg-violet-600/20 text-violet-400 border border-violet-500/50" : "text-zinc-600 hover:text-zinc-300"
              }`}
              title={cat.label}
            >
              {Icon && <Icon size={20} />}
            </button>
          );
        })}
      </div>

      <div className="flex-1 space-y-12">
        <div className="space-y-1">
          <h2 className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold">Category</h2>
          <h3 className="text-xl font-light text-white tracking-widest uppercase">{category.label}</h3>
        </div>

        {/* Sliders Area */}
        <div className="space-y-8">
          {category.sliders.map((slider) => (
            <Slider
              key={slider.id}
              label={slider.label}
              value={catState[slider.id]}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              onChange={(v) => updateField(slider.id, v)}
            />
          ))}
        </div>

        {/* Option Selectors Area */}
        {category.options.length > 0 && (
          <div className="space-y-6 pt-4">
             <div className="flex items-center justify-between">
                <button className="p-2 text-zinc-600 hover:text-violet-400 transition-colors"><ChevronLeft size={18} /></button>
                <div className="text-center">
                   <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Select Option</p>
                   <p className="text-sm text-white font-medium tracking-wider uppercase">
                      {category.options.find(o => o.id === (activeCategory === 'anatomy' ? customization.anatomy.vaginaType : catState[getOptionKey()!]))?.label || "None Selected"}
                   </p>
                </div>
                <button className="p-2 text-zinc-600 hover:text-violet-400 transition-colors"><ChevronRight size={18} /></button>
             </div>

             <div className="grid grid-cols-2 gap-2">
                {category.options.filter(o => !o.id.startsWith('sep_')).map((opt) => {
                  const isSelected = activeCategory === 'anatomy' 
                    ? (opt.id.startsWith('type_') ? customization.anatomy.vaginaType === opt.id : customization.anatomy.pubicHair === opt.id)
                    : catState[getOptionKey()!] === opt.id;
                  
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionChange(opt.id)}
                      className={`px-4 py-3 text-[10px] uppercase tracking-widest border transition-all ${
                        isSelected ? "bg-violet-600/10 border-violet-500 text-violet-400" : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:border-white/20"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
             </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-8 mt-auto border-t border-white/5 flex gap-4">
        <button 
          onClick={() => onChange(DEFAULT_CUSTOMIZATION)}
          className="flex-1 px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 uppercase tracking-[0.2em] transition-all"
        >
          Reset Defaults
        </button>
        <button className="flex-1 px-6 py-4 bg-violet-600 hover:bg-violet-500 text-[10px] text-white uppercase tracking-[0.2em] shadow-lg shadow-violet-900/20 transition-all">
          Finalize
        </button>
      </div>
    </div>
  );
}
