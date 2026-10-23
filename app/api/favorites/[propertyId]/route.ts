import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import pool from "@/lib/db/mysql";
import { verifyToken } from "@/lib/auth/jwt";
import { logActivity } from "@/lib/db/activity";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const auth = await requireAuth(request);

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = request.cookies.get(
      process.env.COOKIE_NAME || "propmatch_token"
    )?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload?.userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (payload.role !== "BUYER") {
      return NextResponse.json(
        { error: "Only buyers can remove favorites" },
        { status: 403 }
      );
    }

    const { propertyId } = await params;
    const id = Number(propertyId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      `DELETE FROM favorites
       WHERE user_id = ? AND property_id = ?`,
      [auth.userId, id]
    );

    const deleteResult = result as { affectedRows: number };

    if (deleteResult.affectedRows === 0) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }

    await logActivity({
      userId: auth.userId,
      eventType: "UNFAVORITE",
      propertyId: id,
    });

    return NextResponse.json({
      success: true,
      message: "Favorite removed successfully",
      propertyId: id,
    });
  } catch (error) {
    console.error("DELETE /api/favorites/[propertyId] error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}