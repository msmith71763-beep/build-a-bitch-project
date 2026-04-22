"use client";

import { useState, useCallback } from "react";
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
  Menu,
} from "lucide-react";
import Slider from "./Slider";
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
  const [isOpen, setIsOpen] = useState(false);

  const category = CATEGORIES.find((c) => c.id === activeCategory)!;

  const updateField = useCallback(
    (categoryId: string, field: string, value: unknown) => {
      onChange({
        ...customization,
        [categoryId]: {
          ...(customization[categoryId as keyof CustomizationState] as Record<string, unknown>),
          [field]: value,
        },
      });
    },
    [customization, onChange]
  );

  const handleSliderChange = useCallback(
    (field: string, value: number) => {
      updateField(activeCategory, field, value);
    },
    [activeCategory, updateField]
  );

  const handleOptionChange = useCallback(
    (value: string) => {
      if (value.startsWith("sep_")) return;

      if (activeCategory === "hair") {
        const colors = ["black", "blonde", "red", "brown"];
        if (colors.includes(value)) {
          updateField("hair", "color", value);
        } else {
          updateField("hair", "style", value);
        }
        return;
      }

      if (activeCategory === "anatomy") {
        if (value.startsWith("type_")) {
          updateField("anatomy", "vaginaType", value);
        } else {
          updateField("anatomy", "pubicHair", value);
        }
        return;
      }

      if (activeCategory === "clothing") {
        onChange({
          ...customization,
          clothing: {
            enabled: value !== "none",
            type: value,
          },
        });
        return;
      }

      const keyMap: Record<string, string> = {
        chest: "nippleType",
        eyes: "color",
        ethnicity: "preset",
        animation: "pose",
      };
      const key = keyMap[activeCategory];
      if (key) updateField(activeCategory, key, value);
    },
    [activeCategory, customization, onChange, updateField]
  );

  function getActiveLabel(): string {
    if (activeCategory === "hair") return customization.hair.color + " / " + customization.hair.style;
    if (activeCategory === "eyes") return customization.eyes.color;
    if (activeCategory === "ethnicity") return customization.ethnicity.preset;
    if (activeCategory === "chest") return customization.chest.nippleType;
    if (activeCategory === "anatomy") return customization.anatomy.vaginaType + " / " + customization.anatomy.pubicHair;
    if (activeCategory === "animation") return customization.animation.pose;
    if (activeCategory === "clothing") return customization.clothing.type;
    return "Selected";
  }

  function isOptionSelected(optId: string): boolean {
    if (activeCategory === "hair") {
      return customization.hair.color === optId || customization.hair.style === optId;
    }
    if (activeCategory === "anatomy") {
      return customization.anatomy.vaginaType === optId || customization.anatomy.pubicHair === optId;
    }
    if (activeCategory === "clothing") return customization.clothing.type === optId;

    const catState = customization[activeCategory as keyof CustomizationState] as Record<string, unknown>;
    const keyMap: Record<string, string> = {
      chest: "nippleType",
      eyes: "color",
      ethnicity: "preset",
      animation: "pose",
    };
    const key = keyMap[activeCategory];
    if (key) return catState[key] === optId;
    return false;
  }

  const catState = customization[activeCategory as keyof CustomizationState] as Record<string, unknown>;

  const sidebarContent = (
    <>
      {/* Category Tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2 border-b border-white/5 flex-shrink-0">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon];
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              title={cat.label}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-lg transition-colors min-w-[48px] touch-manipulation select-none ${
                isActive
                  ? "bg-violet-600/30 text-violet-400 border border-violet-500/50"
                  : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 border border-transparent"
              }`}
            >
              {Icon && <Icon size={18} />}
              <span className="text-[8px] font-bold uppercase tracking-wider">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="flex-1 space-y-5 overflow-y-auto pr-1 min-h-0">
        <div className="space-y-1">
          <h2 className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-black">Control Panel</h2>
          <h3 className="text-xl font-light text-white tracking-widest uppercase">{category.label}</h3>
        </div>

        {/* Sliders */}
        {category.sliders.length > 0 && (
          <div className="space-y-5">
            {category.sliders.map((slider) => (
              <Slider
                key={`${activeCategory}-${slider.id}`}
                label={slider.label}
                value={catState[slider.id] as number}
                min={slider.min}
                max={slider.max}
                step={slider.step}
                onChange={(v) => handleSliderChange(slider.id, v)}
              />
            ))}
          </div>
        )}

        {/* Options */}
        {category.options.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-center py-2.5 bg-zinc-900/60 rounded-lg border border-white/5">
              <p className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">Active Selection</p>
              <p className="text-xs text-violet-400 font-bold tracking-widest uppercase">
                {getActiveLabel().replace(/_/g, " ")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pb-6">
              {category.options.map((opt) => {
                if (opt.id.startsWith("sep_")) {
                  return (
                    <div
                      key={opt.id}
                      className="col-span-2 text-[9px] text-zinc-600 uppercase tracking-widest pt-3 pb-1 border-b border-white/5"
                    >
                      {opt.label}
                    </div>
                  );
                }

                const selected = isOptionSelected(opt.id);

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionChange(opt.id)}
                    className={`px-3 py-3.5 text-[10px] font-bold uppercase tracking-widest border rounded-lg transition-colors touch-manipulation active:scale-95 select-none ${
                      selected
                        ? "bg-violet-600 border-violet-400 text-white shadow-lg shadow-violet-900/40"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200"
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
      <div className="pt-4 mt-auto border-t border-white/10 flex gap-3 flex-shrink-0">
        <button
          onClick={() => onChange(DEFAULT_CUSTOMIZATION)}
          className="flex-1 px-4 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] rounded-xl transition-colors touch-manipulation"
        >
          Reset All
        </button>
        <button className="flex-1 px-4 py-3.5 bg-violet-600 hover:bg-violet-500 text-[10px] font-black text-white uppercase tracking-[0.15em] rounded-xl shadow-xl shadow-violet-900/20 transition-colors active:scale-95 touch-manipulation">
          Finalize
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 md:hidden p-3.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white touch-manipulation"
        aria-label={isOpen ? "Close panel" : "Open panel"}
      >
        {isOpen ? <ChevronLeft size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-[360px] h-full bg-zinc-950 border-l border-white/10 flex-col p-6 z-30">
        {sidebarContent}
      </div>

      {/* Mobile sidebar (slide-in) */}
      <div
        className={`fixed top-0 right-0 z-40 md:hidden w-[85vw] max-w-[380px] h-full bg-zinc-950 border-l border-white/10 flex flex-col p-5 pt-16 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
