
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { requireAuth } from "@/lib/auth/requireAuth";
import type { RowDataPacket } from "mysql2";

interface AgentPerformanceRow extends RowDataPacket {
  agent_id: number;
  agent_name: string;
  agency_name: string | null;
  is_verified: number | boolean;
  total_listings: number;
  active_listings: number;
  closed_listings: number;
  total_inquiries: number;
  total_visits: number;
  avg_listing_price: number | string | null;
}

interface StatusCountRow extends RowDataPacket {
  status: string;
  count: number;
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

    if (auth.role !== "AGENT" && auth.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const [performanceRows] =
      await pool.execute<AgentPerformanceRow[]>(
        `
        SELECT
          agent_id,
          agent_name,
          agency_name,
          is_verified,
          total_listings,
          active_listings,
          closed_listings,
          total_inquiries,
          total_visits,
          avg_listing_price
        FROM v_agent_performance
        WHERE agent_id = ?
        `,
        [auth.userId]
      );

    const performance = performanceRows[0];

    if (!performance) {
      return NextResponse.json(
        { error: "Agent stats not found" },
        { status: 404 }
      );
    }

    const [inquiryRows] = await pool.execute<StatusCountRow[]>(
      `
      SELECT
        status,
        COUNT(*) AS count
      FROM inquiries
      WHERE property_id IN (
        SELECT property_id
        FROM properties
        WHERE agent_id = ?
      )
      GROUP BY status
      `,
      [auth.userId]
    );

    const [visitRows] = await pool.execute<StatusCountRow[]>(
      `
      SELECT
        status,
        COUNT(*) AS count
      FROM site_visits
      WHERE property_id IN (
        SELECT property_id
        FROM properties
        WHERE agent_id = ?
      )
      GROUP BY status
      `,
      [auth.userId]
    );

    const inquiriesByStatus = {
      NEW: 0,
      CONTACTED: 0,
      CLOSED: 0,
    };

    for (const row of inquiryRows) {
      if (row.status in inquiriesByStatus) {
        inquiriesByStatus[
          row.status as keyof typeof inquiriesByStatus
        ] = Number(row.count);
      }
    }

    const visitsByStatus = {
      REQUESTED: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    for (const row of visitRows) {
      if (row.status in visitsByStatus) {
        visitsByStatus[
          row.status as keyof typeof visitsByStatus
        ] = Number(row.count);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalListings: Number(performance.total_listings),
        activeListings: Number(performance.active_listings),
        closedListings: Number(performance.closed_listings),
        totalInquiries: Number(performance.total_inquiries),
        totalVisits: Number(performance.total_visits),
        avgListingPrice: Number(performance.avg_listing_price || 0),
        inquiriesByStatus,
        visitsByStatus,
      },
    });
  } catch (error) {
    console.error("Agent stats GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch agent stats" },
      { status: 500 }
    );
  }
}
