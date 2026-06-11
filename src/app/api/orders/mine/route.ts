import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const organizerIds: string[] = [];

  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.startsWith("organizer_")) {
      organizerIds.push(cookie.value);
    }
  });

  if (organizerIds.length === 0) {
    return NextResponse.json([]);
  }

  const orders = await prisma.groupOrder.findMany({
    where: { organizerId: { in: organizerIds } },
    include: { _count: { select: { drinks: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
