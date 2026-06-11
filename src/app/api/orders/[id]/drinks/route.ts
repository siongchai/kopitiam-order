import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";
import { buildDrinkName, DRINK_BASES } from "@/lib/drinks";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = await prisma.groupOrder.findUnique({
    where: { id: params.id },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.closedAt) {
    return NextResponse.json({ error: "Order is closed" }, { status: 400 });
  }

  const body = await request.json();
  const { personName, base, milkType, sweetness, temperature, notes } = body;

  if (!personName || !base || !temperature) {
    return NextResponse.json(
      { error: "personName, base, and temperature are required" },
      { status: 400 }
    );
  }

  const baseInfo = DRINK_BASES.find((b) => b.id === base);
  if (!baseInfo) {
    return NextResponse.json({ error: "Invalid drink base" }, { status: 400 });
  }

  const drinkName = buildDrinkName({
    base,
    milkType: baseInfo.hasMilkOption ? milkType || "condensed" : null,
    sweetness: sweetness || "normal",
    temperature,
  });

  const drink = await prisma.drinkOrder.create({
    data: {
      id: nanoid(10),
      groupId: params.id,
      personName: personName.trim(),
      drinkName,
      base,
      milkType: milkType || null,
      sweetness: sweetness || "normal",
      temperature,
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json(drink, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const drinkId = searchParams.get("drinkId");

  if (!drinkId) {
    return NextResponse.json(
      { error: "drinkId is required" },
      { status: 400 }
    );
  }

  await prisma.drinkOrder.delete({ where: { id: drinkId } });

  return NextResponse.json({ success: true });
}
