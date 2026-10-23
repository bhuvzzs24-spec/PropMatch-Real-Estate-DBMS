import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/lib/db/mysql";
import { requireAuth } from "@/lib/auth/requireAuth";
import { logActivity } from "@/lib/db/activity";

interface PropertyListRow extends RowDataPacket {
  propertyId: number;
  title: string;
  description: string | null;
  listingType: string;
  price: number | string;
  areaSqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  furnishing: string | null;
  addressLine: string | null;
  status: string;
  city: string;
  locality: string;
  state: string;
  pincode: string;
  typeName: string;
  agentName: string;
  agencyName: string | null;
  primaryImage: string | null;
  pricePerSqft: number | string | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const city = searchParams.get("city");
    const listingType = searchParams.get("listingType");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");

    const page = Math.max(Number(searchParams.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") || "12"), 1),
      50
    );
    const offset = (page - 1) * limit;

    const conditions: string[] = ["p.status = 'ACTIVE'"];
    const values: Array<string | number> = [];

    if (city) {
      conditions.push("l.city = ?");
      values.push(city);
    }

    if (listingType) {
      conditions.push("p.listing_type = ?");
      values.push(listingType.toUpperCase());
    }

    if (minPrice) {
      conditions.push("p.price >= ?");
      values.push(Number(minPrice));
    }

    if (maxPrice) {
      conditions.push("p.price <= ?");
      values.push(Number(maxPrice));
    }

    if (bedrooms) {
      conditions.push("p.bedrooms >= ?");
      values.push(Number(bedrooms));
    }

    const auth = await requireAuth(request);

    const hasSearchFilters = [
      "q",
      "city",
      "locality",
      "listingType",
      "typeId",
      "minPrice",
      "maxPrice",
      "bedrooms",
      "furnishing",
    ].some((key) => searchParams.has(key));

    if (auth?.role === "BUYER" && hasSearchFilters) {
      await logActivity({
        userId: auth.userId,
        eventType: "SEARCH",
        propertyId: null,
        metadata: {
          filters: Object.fromEntries(searchParams.entries()),
        },
      });
    }

    const [rows] = await pool.execute<PropertyListRow[]>(
      `SELECT
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
        l.city,
        l.locality,
        l.state,
        l.pincode,
        pt.type_name AS typeName,
        u.full_name AS agentName,
        ap.agency_name AS agencyName,
        (
          SELECT pi.image_url
          FROM property_images pi
          WHERE pi.property_id = p.property_id
            AND pi.is_primary = TRUE
          LIMIT 1
        ) AS primaryImage,
        fn_price_per_sqft(p.price, p.area_sqft) AS pricePerSqft
      FROM properties p
      JOIN locations l ON l.location_id = p.location_id
      JOIN property_types pt ON pt.type_id = p.type_id
      JOIN agent_profiles ap ON ap.agent_id = p.agent_id
      JOIN users u ON u.user_id = p.agent_id
      WHERE ${conditions.join(" AND ")}
        AND ap.is_verified = TRUE
        AND u.is_active = TRUE
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: {
        items: rows,
        meta: {
          page,
          limit,
          total: rows.length,
          totalPages: rows.length < limit ? page : page + 1,
        },
      },
    });
  } catch (error) {
    console.error("Properties GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch properties" },
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

    if (auth.role !== "AGENT" && auth.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
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
      agentId,
    } = body;

    if (
      !title ||
      !listingType ||
      price === undefined ||
      !locationId ||
      !typeId
    ) {
      return NextResponse.json(
        {
          error:
            "title, listingType, price, locationId and typeId are required",
        },
        { status: 400 }
      );
    }

    const finalAgentId =
      auth.role === "AGENT" ? auth.userId : agentId;

    if (!finalAgentId) {
      return NextResponse.json(
        { error: "agentId is required for ADMIN" },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO properties
      (
        agent_id,
        type_id,
        location_id,
        title,
        description,
        listing_type,
        price,
        area_sqft,
        bedrooms,
        bathrooms,
        furnishing,
        address_line,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [
        finalAgentId,
        typeId,
        locationId,
        title,
        description || null,
        listingType.toUpperCase(),
        price,
        areaSqft || null,
        bedrooms || null,
        bathrooms || null,
        furnishing || null,
        addressLine || null,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        propertyId: result.insertId,
        message: "Property created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Properties POST error:", error);

    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}