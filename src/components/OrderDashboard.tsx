"use client";

import { useState } from "react";
import { getDrinkIcon } from "@/lib/drinks";

interface Drink {
  id: string;
  personName: string;
  drinkName: string;
  notes: string | null;
}

interface OrderDashboardProps {
  drinks: Drink[];
  label: string;
  stallName: string | null;
  isOrganizer: boolean;
  onDelete: (drinkId: string) => void;
}

export default function OrderDashboard({
  drinks,
  label,
  stallName,
  isOrganizer,
  onDelete,
}: OrderDashboardProps) {
  const [copied, setCopied] = useState(false);

  const grouped = drinks.reduce(
    (acc, drink) => {
      if (!acc[drink.drinkName]) acc[drink.drinkName] = [];
      acc[drink.drinkName].push(drink);
      return acc;
    },
    {} as Record<string, Drink[]>
  );

  const sortedDrinks = Object.entries(grouped).sort(
    (a, b) => b[1].length - a[1].length
  );

  const uniquePeople = new Set(drinks.map((d) => d.personName)).size;

  function buildSummaryText() {
    const lines: string[] = [`${label}${stallName ? ` @ ${stallName}` : ""}`];
    lines.push(`${drinks.length} drinks, ${uniquePeople} people`);
    lines.push("---");
    for (const [drinkName, orders] of sortedDrinks) {
      lines.push(`${drinkName} x${orders.length}`);
      for (const order of orders) {
        const note = order.notes ? ` (${order.notes})` : "";
        lines.push(`  - ${order.personName}${note}`);
      }
    }
    return lines.join("\n");
  }

  async function handleCopy() {
    const text = buildSummaryText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (drinks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-3xl mb-3 opacity-30">&#128203;</div>
        <p className="text-[#5C4033] font-medium text-sm">No orders yet</p>
        <p className="text-[#8B7355] text-xs mt-1">
          Share the link and wait for orders
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#4A3425]">{drinks.length}</p>
          <p className="text-[10px] font-medium text-[#8B7355] uppercase tracking-wider mt-0.5">
            Drinks
          </p>
        </div>
        <div className="text-center border-x border-gray-100">
          <p className="text-2xl font-bold text-[#4A3425]">{uniquePeople}</p>
          <p className="text-[10px] font-medium text-[#8B7355] uppercase tracking-wider mt-0.5">
            People
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#4A3425]">{sortedDrinks.length}</p>
          <p className="text-[10px] font-medium text-[#8B7355] uppercase tracking-wider mt-0.5">
            Types
          </p>
        </div>
      </div>

      {/* Order to Stall */}
      <div className="bg-[#6B4C35] rounded-2xl p-5 text-white">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#C8A87C] mb-4">
          Order to Stall
        </h3>
        <div className="space-y-3">
          {sortedDrinks.map(([drinkName, orders]) => (
            <div key={drinkName} className="flex justify-between items-center">
              <span className="text-sm font-medium text-white/90">
                <span className="mr-1.5">{getDrinkIcon(drinkName)}</span>
                {drinkName}
              </span>
              <span className="text-sm font-bold text-[#C8A87C]">
                x{orders.length}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 mt-4 pt-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-white/70">Total</span>
          <span className="text-lg font-bold text-white">
            {drinks.length} cups
          </span>
        </div>
      </div>

      {/* Copy Button */}
      <button onClick={handleCopy} className="btn-primary">
        {copied ? "Copied to Clipboard!" : "Copy Order Summary"}
      </button>

      {/* Details */}
      <div>
        <h3 className="section-label">Breakdown</h3>
        <div className="space-y-2 mt-3">
          {sortedDrinks.map(([drinkName, orders]) => (
            <div key={drinkName} className="bg-[#FAFAF8] rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#4A3425]">
                  <span className="mr-1.5">{getDrinkIcon(drinkName)}</span>
                  {drinkName}
                </span>
                <span className="text-xs font-bold text-[#8B7355] bg-[#EDE5DC] px-2 py-0.5 rounded-full">
                  x{orders.length}
                </span>
              </div>
              <div className="space-y-1.5 pl-6">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <span className="text-xs text-[#5C4033]">
                      {order.personName}
                      {order.notes && (
                        <span className="text-[#8B7355]"> &middot; {order.notes}</span>
                      )}
                    </span>
                    {isOrganizer && (
                      <button
                        onClick={() => onDelete(order.id)}
                        className="text-[10px] text-red-400 hover:text-red-600 font-medium transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Person */}
      <div>
        <h3 className="section-label">By Person</h3>
        <div className="space-y-2 mt-3">
          {Object.entries(
            drinks.reduce(
              (acc, d) => {
                if (!acc[d.personName]) acc[d.personName] = [];
                acc[d.personName].push(d);
                return acc;
              },
              {} as Record<string, Drink[]>
            )
          ).map(([person, orders]) => (
            <div key={person} className="bg-[#FAFAF8] rounded-xl p-3.5">
              <p className="text-sm font-semibold text-[#4A3425]">{person}</p>
              <div className="mt-1.5 space-y-0.5">
                {orders.map((o) => (
                  <p key={o.id} className="text-xs text-[#5C4033]">
                    <span className="mr-1">{getDrinkIcon(o.drinkName)}</span>
                    {o.drinkName}
                    {o.notes && (
                      <span className="text-[#8B7355]"> &middot; {o.notes}</span>
                    )}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
