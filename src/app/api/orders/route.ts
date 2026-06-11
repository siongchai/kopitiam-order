import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { label, stallName } = body;

  if (!label || typeof label !== "string" || label.trim().length === 0) {
    return NextResponse.json({ error: "Label is required" }, { status: 400 });
  }

  const id = nanoid(8);
  const organizerId = nanoid(16);

  const order = await prisma.groupOrder.create({
    data: {
      id,
      label: label.trim(),
      stallName: stallName?.trim() || null,
      organizerId,
    },
  });

  const response = NextResponse.json(order);
  response.cookies.set(`organizer_${id}`, organizerId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
