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
  const [collapsed, setCollapsed] = useState(false);

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

  function handleReset() {
    onChange({ ...DEFAULT_CUSTOMIZATION });
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

  function getSelectedOption(): string {
    if (activeCategory === "anatomy") return "";
    const key = getOptionKey();
    return key ? catState[key] : "";
  }

  return (
    <div
      className={`flex flex-col h-full bg-zinc-900/95 backdrop-blur-xl border-l border-zinc-800 transition-all duration-300 ${
        collapsed ? "w-16" : "w-80"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        {!collapsed && <h2 className="text-sm font-bold text-white uppercase tracking-widest">Customize</h2>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
          {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <div className={`flex ${collapsed ? "flex-col" : "flex-row"} overflow-x-auto gap-1 p-2 border-b border-zinc-800 scrollbar-hide`}>
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon];
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); if (collapsed) setCollapsed(false); }}
              className={`flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-xs font-medium transition-all min-w-[40px] ${
                isActive ? "bg-violet-600/20 text-violet-400 border border-violet-500/30" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              } ${collapsed ? "w-full" : "flex-1"}`}
              title={cat.label}
            >
              {Icon && <Icon size={14} />}
              {!collapsed && <span className="truncate text-[9px]">{cat.label}</span>}
            </button>
          );
        })}
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
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

          {category.options.length > 0 && (
            <OptionGroup
              label={activeCategory === "anatomy" ? "Vagina & Hair" : category.label}
              options={category.options}
              selected={getSelectedOption()}
              onChange={handleOptionChange}
            />
          )}
          
          {activeCategory === "anatomy" && (
            <div className="mt-2 text-[10px] text-zinc-500 space-y-1">
              <p>Current Vagina: <span className="text-violet-400">{customization.anatomy.vaginaType}</span></p>
              <p>Current Hair: <span className="text-violet-400">{customization.anatomy.pubicHair}</span></p>
            </div>
          )}
        </div>
      )}

      {!collapsed && (
        <div className="p-4 border-t border-zinc-800">
          <button onClick={handleReset} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-medium transition-all">
            <RotateCcw size={12} />
            Reset All
          </button>
        </div>
      )}
    </div>
  );
}
