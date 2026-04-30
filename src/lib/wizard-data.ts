import type { StepConfig, WizardOption } from "./types";

export const FLOOR_TYPES: WizardOption[] = [
  { id: "lvp", label: "Vinyl Plank", sub: "Waterproof · pet-safe", icon: "◰" },
  { id: "hard", label: "Hardwood", sub: "Timeless · adds value", icon: "▤" },
  { id: "lam", label: "Laminate", sub: "Affordable · durable", icon: "▥" },
  { id: "carp", label: "Carpet", sub: "Soft · warm · quiet", icon: "◉" },
  { id: "tile", label: "Tile", sub: "Easy-clean · cool", icon: "◧" },
  { id: "help", label: "Not sure yet", sub: "Help me decide", icon: "?" },
];

export const ROOM_TYPES: WizardOption[] = [
  { id: "lr", label: "Living room", icon: "🛋" },
  { id: "kit", label: "Kitchen", icon: "🍳" },
  { id: "bd", label: "Bedroom(s)", icon: "🛏" },
  { id: "whole", label: "Whole home", icon: "🏠" },
];

export const SIZE_OPTS: WizardOption[] = [
  { id: "sm", label: "Under 500 sq ft", sub: "A single room", icon: "▪" },
  { id: "md", label: "500–1,000 sq ft", sub: "A few rooms", icon: "■" },
  { id: "lg", label: "1,000–2,000 sq ft", sub: "Most of the home", icon: "▣" },
  { id: "xl", label: "Over 2,000 sq ft", sub: "Whole house+", icon: "▦" },
];

export const TIMING: WizardOption[] = [
  { id: "asap", label: "As soon as possible", sub: "Within 2 weeks", icon: "⚡" },
  { id: "1mo", label: "Within a month", sub: "No rush", icon: "📅" },
  { id: "3mo", label: "1–3 months", sub: "Just planning", icon: "🗓" },
  { id: "browse", label: "Just browsing", sub: "Curious on cost", icon: "👀" },
];

export const STEPS: StepConfig[] = [
  { key: "floor", q: "What floor are you considering?", opts: FLOOR_TYPES },
  { key: "room", q: "Where are you installing?", opts: ROOM_TYPES },
  { key: "size", q: "How much space?", opts: SIZE_OPTS },
  { key: "timing", q: "When do you want it done?", opts: TIMING },
];
