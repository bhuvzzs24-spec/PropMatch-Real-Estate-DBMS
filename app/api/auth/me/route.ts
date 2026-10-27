import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/db/mysql";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(
      process.env.COOKIE_NAME || "propmatch_token"
    )?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload?.userId) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    const [rows] = await pool.execute(
      `SELECT user_id, full_name, email, phone, role, is_active
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [payload.userId]
    );

    const users = rows as Array<{
      user_id: number;
      full_name: string;
      email: string;
      phone: string | null;
      role: string;
      is_active: boolean;
    }>;

    if (users.length === 0 || !users[0].is_active) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = users[0];

    return NextResponse.json({
      success: true,
      data: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }
}
