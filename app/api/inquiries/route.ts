import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/lib/db/mysql";
import { requireAuth } from "@/lib/auth/requireAuth";
import { logActivity } from "@/lib/db/activity";

interface ActivePropertyRow extends RowDataPacket {
  property_id: number;
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
      `SELECT
         i.inquiry_id,
         i.property_id,
         p.title,
         i.message,
         i.status,
         i.created_at,
         i.updated_at
       FROM inquiries i
       JOIN properties p ON p.property_id = i.property_id
       WHERE i.buyer_id = ?
       ORDER BY i.inquiry_id DESC`,
      [auth.userId]
    );

    return NextResponse.json({
      success: true,
      inquiries: rows,
    });
  } catch (error) {
    console.error("Inquiries GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
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
        { error: "Only buyers can submit inquiries" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const propertyId = Number(body.propertyId);
    const message = String(body.message || "").trim();

    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      return NextResponse.json(
        { error: "Valid propertyId is required" },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters" },
        { status: 400 }
      );
    }

    const [properties] = await pool.execute<ActivePropertyRow[]>(
      `SELECT property_id
       FROM properties
       WHERE property_id = ?
         AND status = 'ACTIVE'`,
      [propertyId]
    );

    if (properties.length === 0) {
      return NextResponse.json(
        { error: "Property not found or inactive" },
        { status: 404 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO inquiries
       (property_id, buyer_id, message, status)
       VALUES (?, ?, ?, 'NEW')`,
      [propertyId, auth.userId, message]
    );

    const inquiryId = result.insertId;

    await logActivity({
      userId: auth.userId,
      eventType: "INQUIRY",
      propertyId,
      metadata: {
        inquiryId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        inquiryId,
      },
      message: "Inquiry submitted successfully",
    });
  } catch (error) {
    console.error("Inquiries POST error:", error);

    return NextResponse.json(
      { error: "Failed to create inquiry" },
      { status: 500 }
    );
  }
}