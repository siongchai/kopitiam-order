import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  const admin = await prisma.admin.findUnique({
    where: { username: username.trim() },
  });

  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  const session = createSession(admin.id);

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", session, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}
