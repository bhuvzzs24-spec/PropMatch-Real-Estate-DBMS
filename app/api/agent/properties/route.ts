
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import pool from "@/lib/db/mysql";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

type QueryValue = string | number | boolean | null;

interface PropertyRow extends RowDataPacket {
  property_id: number;
  title: string;
  description: string;
  listing_type: string;
  price: number;
  area_sqft: number;
  bedrooms: number;
  bathrooms: number;
  furnishing: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  city: string;
  locality: string;
  type_name: string;
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

    const [rows] = await pool.execute<PropertyRow[]>(
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
        p.status,
        p.created_at,
        p.updated_at,
        l.city,
        l.locality,
        pt.type_name
      FROM properties p
      JOIN locations l
        ON l.location_id = p.location_id
      JOIN property_types pt
        ON pt.type_id = p.type_id
      WHERE p.agent_id = ?
      ORDER BY p.created_at DESC
      `,
      [auth.userId]
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Agent properties GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch agent properties" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (auth.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can create properties" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      locationId,
      typeId,
      title,
      description,
      listingType,
      price,
      areaSqft,
      bedrooms = 0,
      bathrooms = 0,
      furnishing = "UNFURNISHED",
      addressLine = null,
    } = body;

    if (
      !Number.isInteger(Number(locationId)) ||
      !Number.isInteger(Number(typeId)) ||
      !title ||
      !description ||
      !listingType ||
      !price ||
      !areaSqft
    ) {
      return NextResponse.json(
        { error: "Missing required property fields" },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO properties
      (
        agent_id,
        location_id,
        type_id,
        title,
        description,
        listing_type,
        price,
        area_sqft,
        bedrooms,
        bathrooms,
        furnishing,
        address_line
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        auth.userId,
        Number(locationId),
        Number(typeId),
        title,
        description,
        listingType,
        Number(price),
        Number(areaSqft),
        Number(bedrooms),
        Number(bathrooms),
        furnishing,
        addressLine,
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        propertyId: result.insertId,
      },
      message: "Property created successfully",
    });
  } catch (error) {
    console.error("Agent property POST error:", error);

    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const propertyId = Number(body.propertyId);

    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      return NextResponse.json(
        { error: "Valid propertyId is required" },
        { status: 400 }
      );
    }

    let sql = `
      UPDATE properties
      SET status = 'INACTIVE'
      WHERE property_id = ?
    `;

    const values: QueryValue[] = [propertyId];

    if (auth.role === "AGENT") {
      sql += " AND agent_id = ?";
      values.push(auth.userId);
    }

    const [result] = await pool.execute<ResultSetHeader>(
      sql,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Property not found or not owned by agent" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      propertyId,
      message: "Property removed successfully",
    });
  } catch (error) {
    console.error("Agent property DELETE error:", error);

    return NextResponse.json(
      { error: "Failed to remove property" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const propertyId = Number(body.propertyId);

    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      return NextResponse.json(
        { error: "Valid propertyId is required" },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: QueryValue[] = [];

    if (body.title !== undefined) {
      updates.push("title = ?");
      values.push(String(body.title));
    }

    if (body.description !== undefined) {
      updates.push("description = ?");
      values.push(String(body.description));
    }

    if (body.price !== undefined) {
      updates.push("price = ?");
      values.push(Number(body.price));
    }

    if (body.areaSqft !== undefined) {
      updates.push("area_sqft = ?");
      values.push(Number(body.areaSqft));
    }

    if (body.bedrooms !== undefined) {
      updates.push("bedrooms = ?");
      values.push(Number(body.bedrooms));
    }

    if (body.bathrooms !== undefined) {
      updates.push("bathrooms = ?");
      values.push(Number(body.bathrooms));
    }

    if (body.furnishing !== undefined) {
      updates.push("furnishing = ?");
      values.push(String(body.furnishing));
    }

    if (body.addressLine !== undefined) {
      updates.push("address_line = ?");
      values.push(String(body.addressLine));
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(propertyId);

    let sql = `
      UPDATE properties
      SET ${updates.join(", ")}
      WHERE property_id = ?
    `;

    if (auth.role === "AGENT") {
      sql += " AND agent_id = ?";
      values.push(auth.userId);
    }

    const [result] = await pool.execute<ResultSetHeader>(
      sql,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Property not found or not owned by agent" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      propertyId,
      message: "Property updated successfully",
    });
  } catch (error) {
    console.error("Agent property PUT error:", error);

    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}
