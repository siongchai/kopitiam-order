import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const adminId = getAdminFromRequest(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status === "open") {
    where.closedAt = null;
  } else if (status === "closed") {
    where.closedAt = { not: null };
  }

  const orders = await prisma.groupOrder.findMany({
    where,
    include: { _count: { select: { drinks: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
