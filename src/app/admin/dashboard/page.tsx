"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  label: string;
  stallName: string | null;
  createdAt: string;
  closedAt: string | null;
  _count: { drinks: number };
}

type FilterStatus = "all" | "open" | "closed";

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  async function fetchOrders() {
    setLoading(true);
    const params = filter !== "all" ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/orders${params}`);
    if (res.status === 401) {
      router.push("/admin");
      return;
    }
    if (res.ok) {
      setOrders(await res.json());
    }
    setLoading(false);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  const totalDrinks = orders.reduce((sum, o) => sum + o._count.drinks, 0);
  const openCount = orders.filter((o) => !o.closedAt).length;

  return (
    <main className="min-h-screen pb-10 max-w-2xl mx-auto px-5 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#4A3425]">Admin Dashboard</h1>
          <p className="text-sm text-[#8B7355]">All orders</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary !text-xs">
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-[#4A3425]">{orders.length}</p>
          <p className="text-[10px] font-medium text-[#8B7355] uppercase tracking-wider mt-0.5">
            Orders
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-[#4A3425]">{totalDrinks}</p>
          <p className="text-[10px] font-medium text-[#8B7355] uppercase tracking-wider mt-0.5">
            Drinks
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{openCount}</p>
          <p className="text-[10px] font-medium text-[#8B7355] uppercase tracking-wider mt-0.5">
            Active
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(["all", "open", "closed"] as FilterStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`chip ${filter === s ? "chip-active" : "chip-inactive"}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-[#F5F0EB] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[#F5F0EB] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-[#8B7355]">No orders found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
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
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    {new Date(order.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    <span className="mx-1.5 text-gray-300">|</span>
                    {order._count.drinks} drink
                    {order._count.drinks !== 1 ? "s" : ""}
                    {order.stallName && (
                      <>
                        <span className="mx-1.5 text-gray-300">|</span>
                        {order.stallName}
                      </>
                    )}
                  </p>
                </div>
                <span
                  className={`chip shrink-0 ml-3 ${
                    order.closedAt
                      ? "bg-gray-100 text-gray-500"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {order.closedAt ? "Closed" : "Active"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
