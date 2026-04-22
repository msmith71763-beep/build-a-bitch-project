export interface SliderConfig {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface ButtonOption {
  id: string;
  label: string;
}

export interface CategoryConfig {
  id: string;
  label: string;
  icon: string;
  sliders: SliderConfig[];
  options: ButtonOption[];
}

export interface CustomizationState {
  body: {
    height: number;
    weight: number;
    muscle: number;
  };
  chest: {
    size: number;
    nippleType: string;
  };
  eyes: {
    size: number;
    spacing: number;
    color: string;
  };
  hair: {
    length: number;
    volume: number;
    style: string;
    color: string;
  };
  ethnicity: {
    preset: string;
    skinTone: number;
  };
  clothing: {
    enabled: boolean;
    type: string;
  };
  anatomy: {
    pubicHair: string;
    vaginaType: string;
  };
  animation: {
    pose: string;
  };
}

export const DEFAULT_CUSTOMIZATION: CustomizationState = {
  body: { height: 50, weight: 80, muscle: 50 },
  chest: { size: 8, nippleType: "type_1" },
  eyes: { size: 50, spacing: 50, color: "green" },
  hair: { length: 60, volume: 50, style: "long_wavy", color: "red" },
  ethnicity: { preset: "caucasian", skinTone: 50 },
  clothing: { enabled: false, type: "none" },
  anatomy: { pubicHair: "natural", vaginaType: "type_2" },
  animation: { pose: "idle" },
};

export const CATEGORIES: CategoryConfig[] = [
  {
    id: "body",
    label: "Body",
    icon: "User",
    sliders: [
      { id: "height", label: "Height", min: 0, max: 100, step: 1, defaultValue: 50 },
      { id: "weight", label: "Weight/Hips", min: 0, max: 100, step: 1, defaultValue: 50 },
      { id: "muscle", label: "Muscle", min: 0, max: 100, step: 1, defaultValue: 50 },
    ],
    options: [],
  },
  {
    id: "chest",
    label: "Chest",
    icon: "Heart",
    sliders: [
      { id: "size", label: "Size (1-15)", min: 1, max: 15, step: 1, defaultValue: 7 },
    ],
    options: [
      { id: "type_1", label: "Nipple Type 1" },
      { id: "type_2", label: "Nipple Type 2" },
      { id: "type_3", label: "Nipple Type 3" },
      { id: "type_4", label: "Nipple Type 4" },
    ],
  },
  {
    id: "eyes",
    label: "Eyes",
    icon: "Eye",
    sliders: [
      { id: "size", label: "Size", min: 0, max: 100, step: 1, defaultValue: 50 },
      { id: "spacing", label: "Spacing", min: 0, max: 100, step: 1, defaultValue: 50 },
    ],
    options: [
      { id: "brown", label: "Brown" },
      { id: "blue", label: "Blue" },
      { id: "green", label: "Green" },
      { id: "hazel", label: "Hazel" },
      { id: "gray", label: "Gray" },
    ],
  },
  {
    id: "hair",
    label: "Hair",
    icon: "Scissors",
    sliders: [
      { id: "length", label: "Length", min: 0, max: 100, step: 1, defaultValue: 50 },
      { id: "volume", label: "Volume", min: 0, max: 100, step: 1, defaultValue: 50 },
    ],
    options: [
      { id: "black", label: "Black Color" },
      { id: "blonde", label: "Blonde Color" },
      { id: "red", label: "Red Color" },
      { id: "brown", label: "Brown Color" },
      { id: "sep_h", label: "--- Styles ---" },
      { id: "long_straight", label: "Long Straight" },
      { id: "long_wavy", label: "Long Wavy" },
      { id: "bob", label: "Bob Cut" },
      { id: "pixie", label: "Pixie Cut" },
    ],
  },
  {
    id: "ethnicity",
    label: "Ethnicity",
    icon: "Globe",
    sliders: [
      { id: "skinTone", label: "Tone Adjust", min: 0, max: 100, step: 1, defaultValue: 50 },
    ],
    options: [
      { id: "caucasian", label: "Caucasian" },
      { id: "african", label: "African" },
      { id: "east_asian", label: "East Asian" },
      { id: "south_asian", label: "South Asian" },
      { id: "latin", label: "Latin" },
    ],
  },
  {
    id: "anatomy",
    label: "Anatomy",
    icon: "Sparkles",
    sliders: [],
    options: [
      { id: "type_1", label: "Vagina Type 1" },
      { id: "type_2", label: "Vagina Type 2" },
      { id: "type_3", label: "Vagina Type 3" },
      { id: "type_4", label: "Vagina Type 4" },
      { id: "type_5", label: "Vagina Type 5" },
      { id: "type_6", label: "Vagina Type 6" },
      { id: "sep_1", label: "--- Pubic Hair ---" },
      { id: "shaved", label: "Shaved" },
      { id: "natural", label: "Natural" },
      { id: "landing_strip", label: "Landing Strip" },
      { id: "triangle", label: "Triangle" },
      { id: "heart", label: "Heart" },
    ],
  },
  {
    id: "animation",
    label: "Pose",
    icon: "Play",
    sliders: [],
    options: [
      { id: "idle", label: "Idle Sway" },
      { id: "catwalk", label: "Catwalk" },
      { id: "pose_1", label: "Sexy Pose" },
      { id: "pose_2", label: "Hands on Hips" },
      { id: "dance", label: "Slow Dance" },
    ],
  },
  {
    id: "clothing",
    label: "Clothing",
    icon: "Shirt",
    sliders: [],
    options: [
      { id: "none", label: "None" },
      { id: "bikini", label: "Bikini" },
      { id: "lingerie", label: "Lingerie" },
      { id: "dress", label: "Summer Dress" },
    ],
  },
];
