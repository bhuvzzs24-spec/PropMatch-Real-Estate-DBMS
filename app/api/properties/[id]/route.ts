import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { logActivity } from "@/lib/db/activity";
import pool from "@/lib/db/mysql";
import { requireAuth } from "@/lib/auth/requireAuth";

interface PropertyDetailsRow extends RowDataPacket {
  property_id: number;
  agent_id: number;
  type_id: number;
  location_id: number;
  title: string;
  description: string | null;
  listing_type: string;
  price: number | string;
  area_sqft: number;
  bedrooms: number | null;
  bathrooms: number | null;
  furnishing: string | null;
  address_line: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  city: string;
  locality: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  type_name: string;
  agent_name: string;
  agency_name: string | null;
}

interface PropertyOwnerRow extends RowDataPacket {
  property_id: number;
  agent_id: number;
  status?: string;
}

async function getPropertyId(params: Promise<{ id: string }>) {
  const { id } = await params;
  const propertyId = Number(id);

  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    return null;
  }

  return propertyId;
}

const allowedStatuses = [
  "ACTIVE",
  "INACTIVE",
  "SOLD",
  "RENTED",
] as const;

type PropertyStatus = (typeof allowedStatuses)[number];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const propertyId = await getPropertyId(params);

    if (!propertyId) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute<PropertyDetailsRow[]>(
      `SELECT
        p.property_id,
        p.agent_id,
        p.type_id,
        p.location_id,
        p.title,
        p.description,
        p.listing_type,
        p.price,
        p.area_sqft,
        p.bedrooms,
        p.bathrooms,
        p.furnishing,
        p.address_line,
        p.status,
        p.created_at,
        p.updated_at,
        l.city,
        l.locality,
        l.state,
        l.pincode,
        l.latitude,
        l.longitude,
        pt.type_name,
        u.full_name AS agent_name,
        ap.agency_name
      FROM properties p
      JOIN locations l ON l.location_id = p.location_id
      JOIN property_types pt ON pt.type_id = p.type_id
      JOIN agent_profiles ap ON ap.agent_id = p.agent_id
      JOIN users u ON u.user_id = p.agent_id
      WHERE p.property_id = ?`,
      [propertyId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const property = rows[0];

    const [images] = await pool.execute(
      `SELECT
        image_id AS imageId,
        image_url AS imageUrl,
        is_primary AS isPrimary
      FROM property_images
      WHERE property_id = ?
      ORDER BY is_primary DESC, image_id ASC`,
      [propertyId]
    );

    const [amenities] = await pool.execute(
      `SELECT
        a.amenity_id AS amenityId,
        a.amenity_name AS amenityName
      FROM property_amenities pa
      JOIN amenities a ON a.amenity_id = pa.amenity_id
      WHERE pa.property_id = ?
      ORDER BY a.amenity_name`,
      [propertyId]
    );

    const [priceHistory] = await pool.execute(
      `SELECT
        history_id AS priceHistoryId,
        old_price AS oldPrice,
        new_price AS newPrice,
        changed_at AS changedAt
      FROM price_history
      WHERE property_id = ?
      ORDER BY changed_at ASC`,
      [propertyId]
    );

    const auth = await requireAuth(request);

    if (auth?.role === "BUYER") {
      await logActivity({
        userId: auth.userId,
        eventType: "VIEW",
        propertyId,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        propertyId: property.property_id,
        agentId: property.agent_id,
        typeId: property.type_id,
        locationId: property.location_id,
        title: property.title,
        description: property.description,
        listingType: property.listing_type,
        price: Number(property.price),
        areaSqft: property.area_sqft,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        furnishing: property.furnishing,
        addressLine: property.address_line,
        status: property.status,
        createdAt: property.created_at,
        updatedAt: property.updated_at,
        city: property.city,
        locality: property.locality,
        state: property.state,
        pincode: property.pincode,
        latitude: property.latitude,
        longitude: property.longitude,
        typeName: property.type_name,
        agent: {
          agentId: property.agent_id,
          fullName: property.agent_name,
          agencyName: property.agency_name,
        },
        images,
        amenities,
        priceHistory,
      },
    });
  } catch (error) {
    console.error("Property details API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const propertyId = await getPropertyId(params);

    if (!propertyId) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      listingType,
      price,
      areaSqft,
      bedrooms,
      bathrooms,
      furnishing,
      addressLine,
      locationId,
      typeId,
    } = body;

    const [existingRows] = await pool.execute<PropertyOwnerRow[]>(
      `SELECT property_id, agent_id
       FROM properties
       WHERE property_id = ?`,
      [propertyId]
    );

    const existing = existingRows[0];

    if (!existing) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (
      auth.role === "AGENT" &&
      Number(existing.agent_id) !== Number(auth.userId)
    ) {
      return NextResponse.json(
        { error: "You can only update your own property" },
        { status: 403 }
      );
    }

    await pool.execute(
      `UPDATE properties SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        listing_type = COALESCE(?, listing_type),
        price = COALESCE(?, price),
        area_sqft = COALESCE(?, area_sqft),
        bedrooms = COALESCE(?, bedrooms),
        bathrooms = COALESCE(?, bathrooms),
        furnishing = COALESCE(?, furnishing),
        address_line = COALESCE(?, address_line),
        location_id = COALESCE(?, location_id),
        type_id = COALESCE(?, type_id)
      WHERE property_id = ?`,
      [
        title ?? null,
        description ?? null,
        listingType ? listingType.toUpperCase() : null,
        price ?? null,
        areaSqft ?? null,
        bedrooms ?? null,
        bathrooms ?? null,
        furnishing ?? null,
        addressLine ?? null,
        locationId ?? null,
        typeId ?? null,
        propertyId,
      ]
    );

    return NextResponse.json({
      success: true,
      data: { propertyId },
      message: "Property updated successfully",
    });
  } catch (error) {
    console.error("Property PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const propertyId = await getPropertyId(params);

    if (!propertyId) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    const body: { status?: unknown } = await request.json();
    const status = body.status;

    if (
      typeof status !== "string" ||
      !allowedStatuses.includes(status as PropertyStatus)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Use ACTIVE, INACTIVE, SOLD or RENTED",
        },
        { status: 400 }
      );
    }

    const validStatus = status as PropertyStatus;

    const [rows] = await pool.execute<PropertyOwnerRow[]>(
      `SELECT property_id, agent_id
       FROM properties
       WHERE property_id = ?`,
      [propertyId]
    );

    const property = rows[0];

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (
      auth.role === "AGENT" &&
      Number(property.agent_id) !== Number(auth.userId)
    ) {
      return NextResponse.json(
        { error: "You can only change status of your own property" },
        { status: 403 }
      );
    }

    await pool.execute(
      `UPDATE properties SET status = ?
       WHERE property_id = ?`,
      [validStatus, propertyId]
    );

    return NextResponse.json({
      success: true,
      propertyId,
      status: validStatus,
      message: "Property status updated successfully",
    });
  } catch (error) {
    console.error("Property status PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update property status" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const propertyId = await getPropertyId(params);

    if (!propertyId) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute<PropertyOwnerRow[]>(
      `SELECT property_id, agent_id, status
       FROM properties
       WHERE property_id = ?`,
      [propertyId]
    );

    const property = rows[0];

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const isAdmin = auth.role === "ADMIN";

    if (
      !isAdmin &&
      Number(property.agent_id) !== Number(auth.userId)
    ) {
      return NextResponse.json(
        { error: "You can only close your own property" },
        { status: 403 }
      );
    }

    const [resultSets] = await pool.query(
      "CALL sp_close_property(?, ?, ?)",
      [propertyId, auth.userId, isAdmin ? 1 : 0]
    );

    return NextResponse.json({
      success: true,
      propertyId,
      message: "Property closed successfully",
      result: resultSets,
    });
  } catch (error) {
    console.error("Property close error:", error);
    return NextResponse.json(
      { error: "Failed to close property" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const propertyId = await getPropertyId(params);

    if (!propertyId) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `DELETE FROM properties
       WHERE property_id = ?`,
      [propertyId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      propertyId,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Property DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}