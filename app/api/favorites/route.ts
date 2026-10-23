
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { requireAuth } from "@/lib/auth/requireAuth";
import { logActivity } from "@/lib/db/activity";
import type { RowDataPacket } from "mysql2";

interface FavoriteRow extends RowDataPacket {
  propertyId: number;
  title: string;
  description: string | null;
  listingType: string;
  price: number;
  areaSqft: number;
  bedrooms: number;
  bathrooms: number;
  furnishing: string | null;
  status: string;
  typeId: number;
  typeName: string;
  city: string;
  locality: string;
  primaryImage: string | null;
  agentName: string;
  createdAt: Date | string;
}

interface PropertyIdRow extends RowDataPacket {
  property_id: number;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    const [rows] = await pool.execute<FavoriteRow[]>(
      `
      SELECT
        p.property_id AS propertyId,
        p.title AS title,
        p.description AS description,
        p.listing_type AS listingType,
        p.price AS price,
        p.area_sqft AS areaSqft,
        p.bedrooms AS bedrooms,
        p.bathrooms AS bathrooms,
        p.furnishing AS furnishing,
        p.status AS status,
        p.type_id AS typeId,
        pt.type_name AS typeName,
        l.city AS city,
        l.locality AS locality,
        (
          SELECT pi.image_url
          FROM property_images pi
          WHERE pi.property_id = p.property_id
            AND pi.is_primary = TRUE
          LIMIT 1
        ) AS primaryImage,
        u.full_name AS agentName,
        p.created_at AS createdAt
      FROM favorites f
      JOIN properties p
        ON p.property_id = f.property_id
      JOIN locations l
        ON l.location_id = p.location_id
      JOIN property_types pt
        ON pt.type_id = p.type_id
      JOIN users u
        ON u.user_id = p.agent_id
      WHERE f.user_id = ?
      ORDER BY f.saved_at DESC
      `,
      [auth.userId]
    );

    const items = rows.map((row) => ({
      propertyId: Number(row.propertyId),
      title: row.title,
      description: row.description ?? null,
      listingType: row.listingType,
      price: Number(row.price),
      areaSqft: Number(row.areaSqft),
      bedrooms: Number(row.bedrooms),
      bathrooms: Number(row.bathrooms),
      furnishing: row.furnishing,
      status: row.status,
      typeId: Number(row.typeId),
      typeName: row.typeName,
      city: row.city,
      locality: row.locality,
      primaryImage: row.primaryImage ?? null,
      agentName: row.agentName,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : String(row.createdAt),
      isFavorite: true,
    }));

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Favorites GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch favorites",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const propertyId = Number(body.propertyId);

    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Valid propertyId is required",
          },
        },
        { status: 400 }
      );
    }

    const [propertyRows] = await pool.execute<PropertyIdRow[]>(
      `
      SELECT property_id
      FROM properties
      WHERE property_id = ?
      LIMIT 1
      `,
      [propertyId]
    );

    if (propertyRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Property not found",
          },
        },
        { status: 404 }
      );
    }

    const [existingRows] = await pool.execute<PropertyIdRow[]>(
      `
      SELECT property_id
      FROM favorites
      WHERE user_id = ?
        AND property_id = ?
      LIMIT 1
      `,
      [auth.userId, propertyId]
    );

    if (existingRows.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          propertyId,
          isFavorite: true,
        },
        message: "Property already added to favorites",
      });
    }

    await pool.execute(
      `
      INSERT INTO favorites (user_id, property_id)
      VALUES (?, ?)
      `,
      [auth.userId, propertyId]
    );

    await logActivity({
      userId: auth.userId,
      eventType: "FAVORITE",
      propertyId,
    });

    return NextResponse.json({
      success: true,
      data: {
        propertyId,
        isFavorite: true,
      },
      message: "Property added to favorites",
    });
  } catch (error) {
    console.error("Favorites POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to add favorite",
        },
      },
      { status: 500 }
    );
  }
}
