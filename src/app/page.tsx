"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PastOrder {
  id: string;
  label: string;
  stallName: string | null;
  createdAt: string;
  closedAt: string | null;
  _count: { drinks: number };
}

export default function Home() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [stallName, setStallName] = useState("");
  const [creating, setCreating] = useState(false);
  const [quickCreating, setQuickCreating] = useState(false);
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([]);

  useEffect(() => {
    fetch("/api/orders/mine")
      .then((r) => r.json())
      .then(setPastOrders)
      .catch(() => {});
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || creating) return;

    setCreating(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim(), stallName: stallName.trim() }),
      });

      if (res.ok) {
        const order = await res.json();
        router.push(`/order/${order.id}`);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#8B5E3C] mb-5">
            <span className="text-2xl">&#9749;</span>
          </div>
          <h1 className="text-2xl font-bold text-[#4A3425] tracking-tight">
            Kopitiam Order
          </h1>
          <p className="text-[#8B7355] text-sm mt-1.5">
            Collect group orders in seconds
          </p>
        </div>

        {/* Create Form */}
        <form onSubmit={handleCreate} className="card-elevated p-6 space-y-5">
          <div>
            <label className="section-label">Order Name</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Office 3pm kopi run"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="section-label">
              Stall <span className="text-gray-400 normal-case font-normal tracking-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={stallName}
              onChange={(e) => setStallName(e.target.value)}
              placeholder="e.g. Uncle Lim's drinks stall"
              className="input-field"
            />
          </div>

          <button type="submit" disabled={creating || !label.trim()} className="btn-primary">
            {creating ? "Creating..." : "Start Order"}
          </button>
        </form>

        {/* Quick Order */}
        <div className="mt-4">
          <button
            onClick={async () => {
              if (quickCreating) return;
              setQuickCreating(true);
              try {
                const now = new Date();
                const quickLabel = `Quick Order ${now.toLocaleDateString("en-SG", { day: "numeric", month: "short" })} ${now.toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
                const res = await fetch("/api/orders", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ label: quickLabel, stallName: "" }),
                });
                if (res.ok) {
                  const order = await res.json();
                  router.push(`/order/${order.id}`);
                }
              } finally {
                setQuickCreating(false);
              }
            }}
            disabled={quickCreating}
            className="w-full py-4 bg-[#F5F0EB] text-[#6B4C35] font-semibold rounded-2xl hover:bg-[#EDE5DC] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {quickCreating ? "Creating..." : "⚡ Quick Order"}
          </button>
        </div>

        {/* Past Orders */}
        {pastOrders.length > 0 && (
          <div className="mt-10">
            <h2 className="section-label px-1">Your Orders</h2>
            <div className="space-y-2">
              {pastOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/order/${order.id}`}
                  className="block card p-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#4A3425] text-sm truncate">
                        {order.label}
                      </p>
                      <p className="text-xs text-[#8B7355] mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                        {" "}
                        {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        <span className="mx-1.5 text-gray-300">|</span>
                        {order._count.drinks} drink{order._count.drinks !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span
                      className={`chip shrink-0 ml-3 ${
                        order.closedAt ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {order.closedAt ? "Done" : "Active"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
