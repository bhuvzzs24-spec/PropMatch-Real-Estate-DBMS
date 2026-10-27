import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db/mysql";
import { requireAuth } from "@/lib/auth/requireAuth";

interface VisitRow extends RowDataPacket {
  visit_id: number;
  buyer_id: number;
  property_id: number;
}

interface PropertyAgentRow extends RowDataPacket {
  agent_id: number;
}

const allowedStatuses = [
  "REQUESTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

type VisitStatus = (typeof allowedStatuses)[number];

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

    const { id } = await params;
    const visitId = Number(id);

    if (!Number.isInteger(visitId) || visitId <= 0) {
      return NextResponse.json(
        { error: "Invalid visit ID" },
        { status: 400 }
      );
    }

    const body: { status?: unknown } = await request.json();
    const status = body.status;

    if (
      typeof status !== "string" ||
      !allowedStatuses.includes(status as VisitStatus)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Use REQUESTED, CONFIRMED, COMPLETED, or CANCELLED",
        },
        { status: 400 }
      );
    }

    const validStatus = status as VisitStatus;

    if (auth.role === "BUYER" && validStatus !== "CANCELLED") {
      return NextResponse.json(
        { error: "Buyers can only cancel visits" },
        { status: 403 }
      );
    }

    if (
      auth.role === "AGENT" &&
      !["CONFIRMED", "COMPLETED", "CANCELLED"].includes(validStatus)
    ) {
      return NextResponse.json(
        {
          error: "Agents can use CONFIRMED, COMPLETED, or CANCELLED",
        },
        { status: 403 }
      );
    }

    const [rows] = await pool.execute<VisitRow[]>(
      `SELECT visit_id, buyer_id, property_id
       FROM site_visits
       WHERE visit_id = ?`,
      [visitId]
    );

    const visit = rows[0];

    if (!visit) {
      return NextResponse.json(
        { error: "Visit not found" },
        { status: 404 }
      );
    }

    const [propertyRows] = await pool.execute<PropertyAgentRow[]>(
      `SELECT agent_id
       FROM properties
       WHERE property_id = ?`,
      [visit.property_id]
    );

    const property = propertyRows[0];

    const isAdmin = auth.role === "ADMIN";
    const isBuyer =
      auth.role === "BUYER" &&
      Number(visit.buyer_id) === Number(auth.userId);
    const isAgent =
      auth.role === "AGENT" &&
      !!property &&
      Number(property.agent_id) === Number(auth.userId);

    if (!isAdmin && !isBuyer && !isAgent) {
      return NextResponse.json(
        { error: "You are not allowed to update this visit" },
        { status: 403 }
      );
    }

    await pool.execute(
      `UPDATE site_visits
       SET status = ?
       WHERE visit_id = ?`,
      [validStatus, visitId]
    );

    return NextResponse.json({
      success: true,
      visitId,
      status: validStatus,
      message: "Visit updated successfully",
    });
  } catch (error) {
    console.error("Visit PATCH error:", error);

    return NextResponse.json(
      { error: "Failed to update visit" },
      { status: 500 }
    );
  }
}