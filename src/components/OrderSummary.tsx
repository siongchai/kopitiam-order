"use client";

import { getDrinkIcon } from "@/lib/drinks";

interface Drink {
  id: string;
  personName: string;
  drinkName: string;
  notes: string | null;
}

interface OrderSummaryProps {
  drinks: Drink[];
  isOrganizer: boolean;
  onDelete: (drinkId: string) => void;
}

export default function OrderSummary({
  drinks,
  isOrganizer,
  onDelete,
}: OrderSummaryProps) {
  if (drinks.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-3xl mb-3 opacity-30">&#9749;</div>
        <p className="text-[#5C4033] font-medium text-sm">No orders yet</p>
        <p className="text-[#8B7355] text-xs mt-1">
          Be the first to add a drink
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="section-label">Recent ({drinks.length})</h3>
      <div className="space-y-2 mt-3">
        {drinks.map((drink) => (
          <div
            key={drink.id}
            className="flex items-center gap-3 p-3 bg-[#FAFAF8] rounded-xl"
          >
            <span className="text-lg shrink-0">{getDrinkIcon(drink.drinkName)}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[#4A3425] text-sm truncate">
                {drink.drinkName}
              </p>
              <p className="text-xs text-[#8B7355] mt-0.5 truncate">
                {drink.personName}
                {drink.notes && <span> &middot; {drink.notes}</span>}
              </p>
            </div>
            {isOrganizer && (
              <button
                onClick={() => onDelete(drink.id)}
                className="text-xs text-red-400 hover:text-red-600 font-medium shrink-0 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
