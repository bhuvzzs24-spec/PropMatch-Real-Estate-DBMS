import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { requireAuth } from "@/lib/auth/requireAuth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (auth.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const [rows] = await pool.execute(`
      SELECT
        u.user_id,
        u.full_name,
        u.email,
        u.phone,
        u.is_active,
        u.created_at,
        ap.agent_id,
        ap.agency_name,
        ap.license_no,
        ap.is_verified,
        ap.bio
      FROM users u
      JOIN agent_profiles ap
        ON ap.agent_id = u.user_id
      WHERE u.role = 'AGENT'
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Admin agents GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
