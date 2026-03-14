// Map from color name → tailwind classes
export const colorMap: Record<string, { text: string; bg: string }> = {
  orange:  { text: "text-orange-600 dark:text-orange-400",   bg: "bg-orange-500/20" },
  blue:    { text: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-500/20" },
  violet:  { text: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-500/20" },
  rose:    { text: "text-rose-600 dark:text-rose-400",       bg: "bg-rose-500/20" },
  sky:     { text: "text-sky-600 dark:text-sky-400",         bg: "bg-sky-500/20" },
  pink:    { text: "text-pink-600 dark:text-pink-400",       bg: "bg-pink-500/20" },
  slate:   { text: "text-slate-600 dark:text-slate-400",     bg: "bg-slate-500/20" },
  indigo:  { text: "text-indigo-600 dark:text-indigo-400",   bg: "bg-indigo-500/20" },
  cyan:    { text: "text-cyan-600 dark:text-cyan-400",       bg: "bg-cyan-500/20" },
  fuchsia: { text: "text-fuchsia-600 dark:text-fuchsia-400", bg: "bg-fuchsia-500/20" },
  amber:   { text: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-500/20" },
  red:     { text: "text-red-600 dark:text-red-400",         bg: "bg-red-500/20" },
  purple:  { text: "text-purple-600 dark:text-purple-400",   bg: "bg-purple-500/20" },
  gray:    { text: "text-gray-600 dark:text-gray-400",       bg: "bg-gray-500/20" },
  emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/20" },
  green:   { text: "text-green-600 dark:text-green-400",     bg: "bg-green-500/20" },
};

export const availableColors = Object.keys(colorMap);

export function getColorClasses(cor: string | null): { text: string; bg: string } {
  return colorMap[cor ?? "gray"] ?? colorMap.gray;
}

// Available icons for the picker
export const availableIcons = [
  "Utensils", "Car", "Home", "Heart", "GraduationCap", "Gamepad2",
  "Monitor", "Banknote", "Users", "Phone", "Megaphone", "FileText",
  "Receipt", "Briefcase", "ShoppingBag", "Zap", "Wifi", "Package",
  "CreditCard", "Repeat", "Calendar", "Coins", "Target", "Gift",
  "Music", "Camera", "Plane", "Coffee", "Droplets", "Shirt",
  "Baby", "Dog", "Dumbbell", "Wrench", "Palette", "BookOpen",
] as const;
