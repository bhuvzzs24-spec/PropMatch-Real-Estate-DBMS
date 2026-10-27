
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

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const listingType = searchParams.get("listingType");
    const city = searchParams.get("city");

    let sql = `
      SELECT
        p.property_id AS propertyId,
        p.title,
        p.description,
        p.listing_type AS listingType,
        p.price,
        p.area_sqft AS areaSqft,
        p.bedrooms,
        p.bathrooms,
        p.furnishing,
        p.address_line AS addressLine,
        p.status,
        p.created_at AS createdAt,

        pt.type_name AS propertyType,

        l.city,
        l.locality,

        u.user_id AS agentId,
        u.full_name AS agentName,
        u.email AS agentEmail,

        ap.agency_name AS agencyName,
        ap.is_verified AS agentVerified

      FROM properties p

      JOIN property_types pt
        ON pt.type_id = p.type_id

      JOIN locations l
        ON l.location_id = p.location_id

      JOIN users u
        ON u.user_id = p.agent_id

      LEFT JOIN agent_profiles ap
        ON ap.agent_id = u.user_id

      WHERE 1 = 1
    `;

    const values: (string | number | boolean | null)[] = [];

    if (status) {
      sql += " AND p.status = ?";
      values.push(status);
    }

    if (listingType) {
      sql += " AND p.listing_type = ?";
      values.push(listingType);
    }

    if (city) {
      sql += " AND l.city = ?";
      values.push(city);
    }

    sql += " ORDER BY p.created_at DESC";

    const [rows] = await pool.execute(sql, values);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Admin properties GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch admin properties" },
      { status: 500 }
    );
  }
}
