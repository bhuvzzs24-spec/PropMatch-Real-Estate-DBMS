import { NextResponse } from "next/server";
import pool from "@/lib/db/mysql";

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT
        amenity_id AS amenityId,
        amenity_name AS amenityName
      FROM amenities
      ORDER BY amenity_id
    `);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Amenities GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch amenities",
        },
      },
      { status: 500 }
    );
  }
}
