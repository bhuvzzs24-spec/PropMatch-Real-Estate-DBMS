
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { requireAuth } from "@/lib/auth/requireAuth";
import type { RowDataPacket } from "mysql2";

interface InquiryRow extends RowDataPacket {
  inquiry_id: number;
  agent_id: number;
}

const allowedStatuses = ["NEW", "CONTACTED", "CLOSED"] as const;
type InquiryStatus = (typeof allowedStatuses)[number];

function isInquiryStatus(value: unknown): value is InquiryStatus {
  return (
    typeof value === "string" &&
    allowedStatuses.includes(value as InquiryStatus)
  );
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

    const { id } = await params;
    const inquiryId = Number(id);

    if (!Number.isInteger(inquiryId) || inquiryId <= 0) {
      return NextResponse.json(
        { error: "Invalid inquiry ID" },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("status" in body)
    ) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const statusValue = body.status;

    if (!isInquiryStatus(statusValue)) {
      return NextResponse.json(
        {
          error: "Invalid status. Use NEW, CONTACTED, or CLOSED",
        },
        { status: 400 }
      );
    }

    const status: InquiryStatus = statusValue;

    const [rows] = await pool.execute<InquiryRow[]>(
      `SELECT i.inquiry_id, p.agent_id
       FROM inquiries i
       JOIN properties p ON p.property_id = i.property_id
       WHERE i.inquiry_id = ?`,
      [inquiryId]
    );

    const inquiry = rows[0];

    if (!inquiry) {
      return NextResponse.json(
        { error: "Inquiry not found" },
        { status: 404 }
      );
    }

    const isAdmin = auth.role === "ADMIN";

    if (
      !isAdmin &&
      Number(inquiry.agent_id) !== Number(auth.userId)
    ) {
      return NextResponse.json(
        {
          error:
            "You can only update inquiries for your own properties",
        },
        { status: 403 }
      );
    }

    await pool.execute(
      `UPDATE inquiries
       SET status = ?
       WHERE inquiry_id = ?`,
      [status, inquiryId]
    );

    return NextResponse.json({
      success: true,
      inquiryId,
      status,
      message: "Inquiry updated successfully",
    });
  } catch (error) {
    console.error("Inquiry PATCH error:", error);

    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}
