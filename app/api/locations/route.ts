import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/mysql";

export async function GET(request: NextRequest) {
  try {
    const city = request.nextUrl.searchParams.get("city");

    const [rows] = await pool.execute(
      `
        SELECT
          location_id AS locationId,
          city,
          locality,
          state,
          pincode,
          latitude,
          longitude
        FROM locations
        ${city ? "WHERE city = ?" : ""}
        ORDER BY city, locality
      `,
      city ? [city] : []
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Locations GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch locations",
        },
      },
      { status: 500 }
    );
  }
}
