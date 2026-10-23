import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db/mysql";
import { requireAuth } from "@/lib/auth/requireAuth";
import { logActivity } from "@/lib/db/activity";

interface VisitIdRow extends RowDataPacket {
  visit_id: number | string | null;
}

interface BookingError extends Error {
  sqlMessage?: string;
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

    const [rows] = await pool.execute(
      `
      SELECT
        v.visit_id,
        v.property_id,
        p.title,
        v.scheduled_at,
        v.status,
        v.created_at
      FROM site_visits v
      JOIN properties p
        ON p.property_id = v.property_id
      WHERE v.buyer_id = ?
      ORDER BY v.scheduled_at ASC
      `,
      [auth.userId]
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Visits GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch visits" },
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

    if (auth.role !== "BUYER") {
      return NextResponse.json(
        { error: "Only buyers can book site visits" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const propertyId = Number(body.propertyId);
    const scheduledAt = String(body.scheduledAt || "");

    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      return NextResponse.json(
        { error: "Valid propertyId is required" },
        { status: 400 }
      );
    }

    if (!scheduledAt) {
      return NextResponse.json(
        { error: "scheduledAt is required" },
        { status: 400 }
      );
    }

    const parsedScheduledAt = new Date(scheduledAt);

    if (Number.isNaN(parsedScheduledAt.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Valid scheduledAt is required",
          },
        },
        { status: 400 }
      );
    }

    const mysqlScheduledAt =
      parsedScheduledAt.getUTCFullYear() +
      "-" +
      String(parsedScheduledAt.getUTCMonth() + 1).padStart(2, "0") +
      "-" +
      String(parsedScheduledAt.getUTCDate()).padStart(2, "0") +
      " " +
      String(parsedScheduledAt.getUTCHours()).padStart(2, "0") +
      ":" +
      String(parsedScheduledAt.getUTCMinutes()).padStart(2, "0") +
      ":" +
      String(parsedScheduledAt.getUTCSeconds()).padStart(2, "0");

    const connection = await pool.getConnection();

    let visitId: number;

    try {
      await connection.execute(
        "CALL sp_book_visit(?, ?, ?, @visit_id)",
        [propertyId, auth.userId, mysqlScheduledAt]
      );

      const [visitRows] = await connection.execute<VisitIdRow[]>(
        "SELECT @visit_id AS visit_id"
      );

      const rawVisitId = visitRows[0]?.visit_id;

      if (rawVisitId === null || rawVisitId === undefined) {
        throw new Error("VISIT_ID_NOT_RETURNED");
      }

      visitId = Number(rawVisitId);

      if (!Number.isInteger(visitId) || visitId <= 0) {
        throw new Error("VISIT_ID_NOT_RETURNED");
      }
    } finally {
      connection.release();
    }

    await logActivity({
      userId: auth.userId,
      eventType: "VISIT_REQUEST",
      propertyId,
      metadata: {
        visitId,
        scheduledAt,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        visitId,
      },
      message: "Site visit booked successfully",
    });
  } catch (error: unknown) {
    console.error("Visits POST error:", error);

    const bookingError =
      error instanceof Error ? (error as BookingError) : undefined;
    const message =
      bookingError?.sqlMessage || bookingError?.message || "";

    if (message.includes("PROPERTY_NOT_AVAILABLE")) {
      return NextResponse.json(
        { error: "Property is not available" },
        { status: 400 }
      );
    }

    if (message.includes("SLOT_ALREADY_BOOKED")) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 }
      );
    }

    if (message.includes("VISIT_MUST_BE_IN_FUTURE")) {
      return NextResponse.json(
        { error: "Visit must be scheduled in the future" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to book site visit" },
      { status: 500 }
    );
  }
}