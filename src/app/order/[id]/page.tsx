"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DrinkBuilder from "@/components/DrinkBuilder";
import OrderSummary from "@/components/OrderSummary";
import OrderDashboard from "@/components/OrderDashboard";
import ShareQR from "@/components/ShareQR";

interface GroupOrder {
  id: string;
  label: string;
  stallName: string | null;
  closedAt: string | null;
  isOrganizer: boolean;
  drinks: Array<{
    id: string;
    personName: string;
    drinkName: string;
    notes: string | null;
  }>;
}

type Tab = "order" | "dashboard";

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<GroupOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareMsg, setShareMsg] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [showQR, setShowQR] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const fetchOrder = useCallback(async () => {
    const res = await fetch(`/api/orders/${id}`);
    if (res.ok) {
      setOrder(await res.json());
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 3000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  async function handleToggleClose() {
    if (!order) return;
    const closing = !order.closedAt;
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ closed: closing }),
    });
    if (res.ok) {
      if (closing) {
        router.push("/");
      } else {
        fetchOrder();
      }
    }
  }

  async function handleDelete(drinkId: string) {
    await fetch(`/api/orders/${id}/drinks?drinkId=${drinkId}`, {
      method: "DELETE",
    });
    fetchOrder();
  }

  function handleShare() {
    setShowShareMenu((v) => !v);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setShareMsg("Copied!");
    setShowShareMenu(false);
    setTimeout(() => setShareMsg(""), 2000);
  }

  function handleShareWhatsApp() {
    const url = window.location.href;
    const text = `Join my kopitiam order: ${order?.label ?? ""}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    setShowShareMenu(false);
  }

  function handleShareTelegram() {
    const url = window.location.href;
    const text = `Join my kopitiam order: ${order?.label ?? ""}`;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      "_blank"
    );
    setShowShareMenu(false);
  }

  function handleShareSMS() {
    const url = window.location.href;
    const text = `Join my kopitiam order: ${order?.label ?? ""} ${url}`;
    window.open(`sms:?body=${encodeURIComponent(text)}`, "_self");
    setShowShareMenu(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EDE5DC]" />
          <div className="w-20 h-2.5 rounded bg-[#F5F0EB]" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-base font-semibold text-[#4A3425]">Order not found</p>
          <p className="text-sm text-[#8B7355] mt-1">This link may have expired</p>
          <Link href="/" className="btn-secondary inline-block mt-4">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const isClosed = !!order.closedAt;

  return (
    <main className="min-h-screen pb-10 max-w-lg mx-auto px-5 pt-5">
      {/* Nav */}
      <Link
        href="/"
        className="inline-flex items-center text-xs font-medium text-[#8B7355] hover:text-[#4A3425] transition-colors mb-4"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#4A3425] truncate">
              {order.label}
            </h1>
            {order.stallName && (
              <p className="text-sm text-[#8B7355] mt-0.5">{order.stallName}</p>
            )}
          </div>
          <span
            className={`chip shrink-0 ${
              isClosed ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {isClosed ? "Closed" : "Active"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <button onClick={handleShare} className="btn-secondary !py-1.5 !px-3 !text-xs">
            {shareMsg || "Share"}
          </button>
          <button onClick={() => setShowQR((v) => !v)} className="btn-secondary !py-1.5 !px-3 !text-xs">
            QR Code
          </button>
          {order.isOrganizer && (
            <button
              onClick={handleToggleClose}
              className={`chip ${
                isClosed
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              {isClosed ? "Reopen" : "Close Order"}
            </button>
          )}
        </div>
      </div>

      {/* Share Menu */}
      {showShareMenu && (
        <div className="card-elevated p-4 mb-4">
          <p className="section-label">Share via</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={handleShareWhatsApp}
              className="py-2.5 bg-[#25D366] hover:bg-[#1fb855] text-white rounded-xl text-sm font-medium transition-all active:scale-95"
            >
              WhatsApp
            </button>
            <button
              onClick={handleShareTelegram}
              className="py-2.5 bg-[#0088cc] hover:bg-[#006fa3] text-white rounded-xl text-sm font-medium transition-all active:scale-95"
            >
              Telegram
            </button>
            <button
              onClick={handleShareSMS}
              className="py-2.5 bg-[#8B7355] hover:bg-[#6B5940] text-white rounded-xl text-sm font-medium transition-all active:scale-95"
            >
              SMS
            </button>
            <button
              onClick={handleCopyLink}
              className="py-2.5 bg-[#8B5E3C] hover:bg-[#7A5234] text-white rounded-xl text-sm font-medium transition-all active:scale-95"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}

      {/* QR Code */}
      {showQR && <ShareQR orderId={id} />}

      {/* Tabs */}
      <div className="flex mb-5 bg-[#F5F0EB] rounded-xl p-1">
        <button
          onClick={() => setTab("dashboard")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            tab === "dashboard"
              ? "bg-white text-[#4A3425] shadow-sm"
              : "text-[#8B7355]"
          }`}
        >
          Summary{order.drinks.length > 0 ? ` (${order.drinks.length})` : ""}
        </button>
        <button
          onClick={() => setTab("order")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            tab === "order"
              ? "bg-white text-[#4A3425] shadow-sm"
              : "text-[#8B7355]"
          }`}
        >
          Add Drink
        </button>
      </div>

      {/* Content */}
      {tab === "order" && (
        <div className="space-y-5">
          {!isClosed && (
            <div className="card-elevated p-5">
              <DrinkBuilder
                orderId={id}
                onDrinkAdded={fetchOrder}
                onSuccess={() => setTab("dashboard")}
                disabled={isClosed}
              />
            </div>
          )}

          {isClosed && (
            <div className="card p-4 text-center border-red-100">
              <p className="text-sm text-red-600 font-medium">
                This order has been closed
              </p>
            </div>
          )}

          <div className="card p-5">
            <OrderSummary
              drinks={order.drinks}
              isOrganizer={order.isOrganizer}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      {tab === "dashboard" && (
        <div className="card-elevated p-5">
          <OrderDashboard
            drinks={order.drinks}
            label={order.label}
            stallName={order.stallName}
            isOrganizer={order.isOrganizer}
            onDelete={handleDelete}
          />
        </div>
      )}
    </main>
  );
}
