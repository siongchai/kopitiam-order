"use client";

import { useState } from "react";
import {
  DRINK_BASES,
  MILK_OPTIONS,
  SWEETNESS_OPTIONS,
  TEMPERATURE_OPTIONS,
  buildDrinkName,
  DrinkBase,
  MilkOption,
  SweetnessOption,
  TemperatureOption,
} from "@/lib/drinks";

interface DrinkBuilderProps {
  orderId: string;
  onDrinkAdded: () => void;
  onSuccess?: () => void;
  disabled?: boolean;
}

export default function DrinkBuilder({
  orderId,
  onDrinkAdded,
  onSuccess,
  disabled,
}: DrinkBuilderProps) {
  const [personName, setPersonName] = useState("");
  const [base, setBase] = useState<DrinkBase>("kopi");
  const [milkType, setMilkType] = useState<MilkOption>("condensed");
  const [sweetness, setSweetness] = useState<SweetnessOption>("normal");
  const [temperature, setTemperature] = useState<TemperatureOption>("hot");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const baseInfo = DRINK_BASES.find((b) => b.id === base)!;
  const previewName = buildDrinkName({
    base,
    milkType: baseInfo.hasMilkOption ? milkType : null,
    sweetness,
    temperature,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/drinks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personName: personName.trim() || "Anonymous",
          base,
          milkType: baseInfo.hasMilkOption ? milkType : null,
          sweetness,
          temperature,
          notes: notes.trim() || null,
        }),
      });

      if (res.ok) {
        setNotes("");
        setShowSuccess(true);
        onDrinkAdded();
        setTimeout(() => {
          setShowSuccess(false);
          onSuccess?.();
        }, 1000);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="section-label">
          Name <span className="text-gray-400 normal-case font-normal tracking-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder="e.g. Ah Beng"
          className="input-field"
          disabled={disabled}
        />
      </div>

      {/* Drink Base */}
      <div>
        <label className="section-label">Drink</label>
        <div className="grid grid-cols-3 gap-2">
          {DRINK_BASES.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBase(b.id)}
              disabled={disabled}
              className={`flex flex-col items-center py-4 px-2 rounded-2xl border-2 transition-all active:scale-95 ${
                base === b.id
                  ? "bg-[#8B5E3C] text-white border-[#8B5E3C] shadow-lg shadow-[#8B5E3C]/20"
                  : "bg-white text-[#5C4033] border-gray-100 hover:border-[#C8A87C]"
              }`}
            >
              <span className="text-2xl mb-1">{b.icon}</span>
              <span className="text-xs font-semibold">{b.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Milk */}
      {baseInfo.hasMilkOption && (
        <div>
          <label className="section-label">Milk</label>
          <div className="flex flex-wrap gap-2">
            {MILK_OPTIONS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMilkType(m.id)}
                disabled={disabled}
                className={`chip ${
                  milkType === m.id ? "chip-active" : "chip-inactive"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sweetness */}
      <div>
        <label className="section-label">Sweetness</label>
        <div className="flex flex-wrap gap-2">
          {SWEETNESS_OPTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSweetness(s.id)}
              disabled={disabled}
              className={`chip ${
                sweetness === s.id ? "chip-active" : "chip-inactive"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Temperature */}
      <div>
        <label className="section-label">Temperature</label>
        <div className="flex gap-2">
          {TEMPERATURE_OPTIONS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemperature(t.id)}
              disabled={disabled}
              className={`chip ${
                temperature === t.id ? "chip-active" : "chip-inactive"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="section-label">
          Notes <span className="text-gray-400 normal-case font-normal tracking-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Extra hot, less ice"
          className="input-field"
          disabled={disabled}
        />
      </div>

      {/* Preview */}
      <div className="bg-[#F5F0EB] rounded-2xl p-4 text-center">
        <p className="text-[11px] text-[#8B7355] uppercase tracking-wider font-medium mb-1">
          Your Order
        </p>
        <p className="font-bold text-[#4A3425] text-xl">{previewName}</p>
      </div>

      {/* Submit */}
      <button type="submit" disabled={disabled || submitting} className="btn-primary">
        {showSuccess ? "Added!" : submitting ? "Adding..." : "Add to Order"}
      </button>
    </form>
  );
}
