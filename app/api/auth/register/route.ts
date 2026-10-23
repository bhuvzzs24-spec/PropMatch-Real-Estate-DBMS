
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { hashPassword } from "@/lib/auth/password";
import { createToken } from "@/lib/auth/jwt";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

interface ExistingUserRow extends RowDataPacket {
  user_id: number;
}

export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();

    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const phone = body.phone ? String(body.phone).trim() : null;
    const role = String(body.role || "").toUpperCase();

    const agencyName = body.agencyName
      ? String(body.agencyName).trim()
      : null;

    const licenseNo = body.licenseNo
      ? String(body.licenseNo).trim()
      : null;

    const bio = body.bio ? String(body.bio).trim() : null;

    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { error: "Validation error" },
        { status: 400 }
      );
    }

    if (role !== "BUYER" && role !== "AGENT") {
      return NextResponse.json(
        { error: "Only BUYER and AGENT registration is allowed" },
        { status: 400 }
      );
    }

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters and contain uppercase, lowercase, and a digit",
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    const [existingRows] = await connection.execute<ExistingUserRow[]>(
      `SELECT user_id FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (existingRows.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    await connection.beginTransaction();

    const passwordHash = await hashPassword(password);

    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO users
       (full_name, email, password_hash, phone, role, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [fullName, email, passwordHash, phone, role]
    );

    const userId = Number(result.insertId);

    if (role === "AGENT") {
      await connection.execute(
        `INSERT INTO agent_profiles
         (agent_id, agency_name, license_no, bio, is_verified)
         VALUES (?, ?, ?, ?, 0)`,
        [userId, agencyName, licenseNo, bio]
      );
    }

    await connection.commit();

    const token = await createToken({
      userId,
      role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: {
          userId,
          fullName,
          email,
          role,
        },
      },
      { status: 201 }
    );

    response.cookies.set({
      name: process.env.COOKIE_NAME || "propmatch_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}
