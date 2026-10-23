import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { verifyPassword } from "@/lib/auth/password";
import { createToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      `SELECT user_id, full_name, email, password_hash, role, is_active
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    const users = rows as Array<{
      user_id: number;
      full_name: string;
      email: string;
      password_hash: string;
      role: string;
      is_active: boolean;
    }>;

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = users[0];

    if (!user.is_active) {
      return NextResponse.json(
        { error: "Account is inactive" },
        { status: 403 }
      );
    }

    const validPassword = await verifyPassword(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Record every successful login in MySQL
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const userAgent = request.headers.get("user-agent") || "unknown";

    await pool.execute(
      `INSERT INTO login_audit
        (user_id, login_at, ip_address, user_agent)
       VALUES (?, NOW(), ?, ?)`,
      [user.user_id, ipAddress, userAgent]
    );

    const token = await createToken({
      userId: user.user_id,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set({
      name: process.env.COOKIE_NAME || "propmatch_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
