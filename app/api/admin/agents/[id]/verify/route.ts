
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { requireAuth } from "@/lib/auth/requireAuth";
import type { ResultSetHeader } from "mysql2";

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

    if (auth.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const agentId = Number(id);

    if (!Number.isInteger(agentId) || agentId <= 0) {
      return NextResponse.json(
        { error: "Invalid agent ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (typeof body.isVerified !== "boolean") {
      return NextResponse.json(
        { error: "isVerified must be a boolean" },
        { status: 400 }
      );
    }

    const isVerified = body.isVerified ? 1 : 0;

    const [result] = await pool.execute(
      `UPDATE agent_profiles
       SET
         is_verified = ?,
         verified_at = CASE
           WHEN ? = 1 THEN CURRENT_TIMESTAMP
           ELSE NULL
         END
       WHERE agent_id = ?`,
      [isVerified, isVerified, agentId]
    );

    const updateResult = result as ResultSetHeader;

    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      agentId,
      isVerified: Boolean(isVerified),
      message: isVerified
        ? "Agent verified successfully"
        : "Agent verification removed successfully",
    });
  } catch (error) {
    console.error("Admin agent verification error:", error);

    return NextResponse.json(
      { error: "Failed to update agent verification" },
      { status: 500 }
    );
  }
}
