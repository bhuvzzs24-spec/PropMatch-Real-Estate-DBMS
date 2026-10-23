
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { requireAuth } from "@/lib/auth/requireAuth";
import type { RowDataPacket } from "mysql2";

interface UserStatsRow extends RowDataPacket {
  total_users: number;
  buyers: number | null;
  agents: number | null;
  admins: number | null;
}

interface PropertyStatsRow extends RowDataPacket {
  total_properties: number;
  active_properties: number | null;
  sold_properties: number | null;
  rented_properties: number | null;
  inactive_properties: number | null;
}

interface InquiryStatsRow extends RowDataPacket {
  total_inquiries: number;
}

interface VisitStatsRow extends RowDataPacket {
  total_visits: number;
}

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

    const [users] = await pool.execute<UserStatsRow[]>(`
      SELECT
        COUNT(*) AS total_users,
        SUM(role = 'BUYER') AS buyers,
        SUM(role = 'AGENT') AS agents,
        SUM(role = 'ADMIN') AS admins
      FROM users
      WHERE is_active = TRUE
    `);

    const [properties] = await pool.execute<PropertyStatsRow[]>(`
      SELECT
        COUNT(*) AS total_properties,
        SUM(status = 'ACTIVE') AS active_properties,
        SUM(status = 'SOLD') AS sold_properties,
        SUM(status = 'RENTED') AS rented_properties,
        SUM(status = 'INACTIVE') AS inactive_properties
      FROM properties
    `);

    const [inquiries] = await pool.execute<InquiryStatsRow[]>(`
      SELECT COUNT(*) AS total_inquiries
      FROM inquiries
    `);

    const [visits] = await pool.execute<VisitStatsRow[]>(`
      SELECT COUNT(*) AS total_visits
      FROM site_visits
    `);

    return NextResponse.json({
      success: true,
      stats: {
        users: users[0],
        properties: properties[0],
        inquiries: inquiries[0],
        visits: visits[0],
      },
    });
  } catch (error) {
    console.error("Admin stats GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
