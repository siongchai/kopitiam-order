import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const adminCount = await prisma.admin.count();
  if (adminCount > 0) {
    return NextResponse.json(
      { error: "Admin already exists. Setup is disabled." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { username, password } = body;

  if (!username || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Username and password (min 6 chars) are required" },
      { status: 400 }
    );
  }

  const admin = await prisma.admin.create({
    data: {
      username: username.trim(),
      passwordHash: hashPassword(password),
    },
  });

  return NextResponse.json({ id: admin.id, username: admin.username }, { status: 201 });
}

export async function GET() {
  const adminCount = await prisma.admin.count();
  return NextResponse.json({ needsSetup: adminCount === 0 });
}
