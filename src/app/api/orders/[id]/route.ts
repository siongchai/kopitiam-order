import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = await prisma.groupOrder.findUnique({
    where: { id: params.id },
    include: { drinks: { orderBy: { createdAt: "asc" } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const organizerCookie = request.cookies.get(`organizer_${params.id}`)?.value;
  const isOrganizer = organizerCookie === order.organizerId;

  return NextResponse.json({ ...order, isOrganizer });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = await prisma.groupOrder.findUnique({
    where: { id: params.id },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const organizerCookie = request.cookies.get(`organizer_${params.id}`)?.value;
  if (organizerCookie !== order.organizerId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await request.json();

  const updated = await prisma.groupOrder.update({
    where: { id: params.id },
    data: {
      closedAt: body.closed ? new Date() : null,
    },
  });

  return NextResponse.json(updated);
}
