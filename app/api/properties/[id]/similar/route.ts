import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/mysql";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = Number(id);

    if (!Number.isInteger(propertyId)) {
      return NextResponse.json(
        { success: false, error: "Invalid property ID" },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      `
      SELECT
        p.property_id,
        p.title,
        p.description,
        p.listing_type,
        p.price,
        p.area_sqft,
        p.bedrooms,
        p.bathrooms,
        p.furnishing,
        l.city,
        l.locality,
        pt.type_name,
        (
          SELECT pi.image_url
          FROM property_images pi
          WHERE pi.property_id = p.property_id
            AND pi.is_primary = TRUE
          LIMIT 1
        ) AS image_url,
        fn_price_per_sqft(p.price, p.area_sqft) AS price_per_sqft
      FROM properties p
      JOIN locations l
        ON l.location_id = p.location_id
      JOIN property_types pt
        ON pt.type_id = p.type_id
      JOIN properties base
        ON base.property_id = ?
      WHERE p.property_id <> ?
        AND p.status = 'ACTIVE'
        AND p.listing_type = base.listing_type
        AND p.type_id = base.type_id
        AND p.bedrooms = base.bedrooms
        AND p.location_id = base.location_id
      ORDER BY ABS(p.price - base.price) ASC
      LIMIT 6
      `,
      [propertyId, propertyId]
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Similar properties GET error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch similar properties" },
      { status: 500 }
    );
  }
}

