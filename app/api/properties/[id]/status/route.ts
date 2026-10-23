import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db/mysql";
import { requireAuth } from "@/lib/auth/requireAuth";

interface PropertyOwnerRow extends RowDataPacket {
  agent_id: number;
}

const allowedStatuses = [
  "ACTIVE",
  "INACTIVE",
  "SOLD",
  "RENTED",
] as const;

type PropertyStatus = (typeof allowedStatuses)[number];

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

    const { id } = await params;
    const propertyId = Number(id);

    if (!Number.isInteger(propertyId) || propertyId <= 0) {
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
            "Invalid status. Use ACTIVE, INACTIVE, SOLD, or RENTED",
        },
        { status: 400 }
      );
    }

    const validStatus = status as PropertyStatus;

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
        { error: "You can only update your own property" },
        { status: 403 }
      );
    }

    await pool.execute(
      "UPDATE properties SET status = ? WHERE property_id = ?",
      [validStatus, propertyId]
    );

    return NextResponse.json({
      success: true,
      propertyId,
      status: validStatus,
      message: "Property status updated successfully",
    });
  } catch (error) {
    console.error("Property status update error:", error);

    return NextResponse.json(
      { error: "Failed to update property status" },
      { status: 500 }
    );
  }
}