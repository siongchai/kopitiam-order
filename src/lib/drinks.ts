export const DRINK_BASES = [
  { id: "kopi", label: "Kopi", icon: "☕", hasMilkOption: true },
  { id: "teh", label: "Teh", icon: "🍵", hasMilkOption: true },
  { id: "yuan-yang", label: "Yuan Yang", icon: "☕", hasMilkOption: true },
] as const;

export const MILK_OPTIONS = [
  { id: "condensed", label: "Condensed Milk (default)", suffix: "" },
  { id: "evaporated", label: "Evaporated Milk", suffix: "-C" },
  { id: "none", label: "No Milk (Black)", suffix: "-O" },
] as const;

export const SWEETNESS_OPTIONS = [
  { id: "normal", label: "Normal", suffix: "" },
  { id: "siu-dai", label: "Less Sweet (Siu Dai)", suffix: "Siu Dai" },
  { id: "kosong", label: "No Sugar (Kosong)", suffix: "Kosong" },
  { id: "gao", label: "Extra Thick (Gao)", suffix: "Gao" },
  { id: "di-lo", label: "Extra Thick No Water (Di Lo)", suffix: "Di Lo" },
  { id: "po", label: "Diluted (Po)", suffix: "Po" },
] as const;

export const TEMPERATURE_OPTIONS = [
  { id: "hot", label: "Hot", suffix: "" },
  { id: "iced", label: "Iced (Peng)", suffix: "Peng" },
] as const;

export type DrinkBase = (typeof DRINK_BASES)[number]["id"];
export type MilkOption = (typeof MILK_OPTIONS)[number]["id"];
export type SweetnessOption = (typeof SWEETNESS_OPTIONS)[number]["id"];
export type TemperatureOption = (typeof TEMPERATURE_OPTIONS)[number]["id"];

export interface DrinkSelection {
  base: DrinkBase;
  milkType: MilkOption | null;
  sweetness: SweetnessOption;
  temperature: TemperatureOption;
}

export function getDrinkIcon(drinkName: string): string {
  const lower = drinkName.toLowerCase();
  const match = DRINK_BASES.find((b) => lower.startsWith(b.label.toLowerCase()));
  return match?.icon ?? "☕";
}

export function buildDrinkName(selection: DrinkSelection): string {
  const baseInfo = DRINK_BASES.find((b) => b.id === selection.base);
  if (!baseInfo) return "Unknown Drink";

  let name = baseInfo.label;

  if (baseInfo.hasMilkOption && selection.milkType) {
    const milk = MILK_OPTIONS.find((m) => m.id === selection.milkType);
    if (milk && milk.suffix) {
      name += milk.suffix;
    }
  }

  const sweetness = SWEETNESS_OPTIONS.find((s) => s.id === selection.sweetness);
  if (sweetness && sweetness.suffix) {
    name += " " + sweetness.suffix;
  }

  const temp = TEMPERATURE_OPTIONS.find((t) => t.id === selection.temperature);
  if (temp && temp.suffix) {
    name += " " + temp.suffix;
  }

  return name.trim();
}
