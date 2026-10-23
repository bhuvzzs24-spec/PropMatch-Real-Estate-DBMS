import { NextResponse } from "next/server";
import pool from "@/lib/db/mysql";

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT type_id, type_name
      FROM property_types
      ORDER BY type_name
    `);

    return NextResponse.json({
      success: true,
      propertyTypes: rows,
    });
  } catch (error) {
    console.error("Property types GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch property types",
      },
      { status: 500 }
    );
  }
}






