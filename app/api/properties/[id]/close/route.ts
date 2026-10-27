import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db/mysql";
import { requireAuth } from "@/lib/auth/requireAuth";

interface PropertyOwnerRow extends RowDataPacket {
  agent_id: number;
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

    const { id } = await params;
    const propertyId = Number(id);

    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute<PropertyOwnerRow[]>(
      "SELECT agent_id FROM properties WHERE property_id = ?",
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

    await pool.query(
      "CALL sp_close_property(?, ?, ?)",
      [propertyId, auth.userId, isAdmin ? 1 : 0]
    );

    return NextResponse.json({
      success: true,
      propertyId,
      message: "Property closed successfully",
    });
  } catch (error) {
    console.error("Property close error:", error);

    return NextResponse.json(
      { error: "Failed to close property" },
      { status: 500 }
    );
  }
}