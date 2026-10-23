
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { requireAuth } from "@/lib/auth/requireAuth";
import type { ResultSetHeader } from "mysql2";

type UserUpdateValue = string | number | boolean | null;

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
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updates: string[] = [];
    const values: UserUpdateValue[] = [];

    if (body.fullName !== undefined) {
      updates.push("full_name = ?");
      values.push(body.fullName);
    }

    if (body.phone !== undefined) {
      updates.push("phone = ?");
      values.push(body.phone);
    }

    if (body.isActive !== undefined) {
      updates.push("is_active = ?");
      values.push(body.isActive ? 1 : 0);
    }

    if (body.role !== undefined) {
      if (
        typeof body.role !== "string" ||
        !["BUYER", "AGENT", "ADMIN"].includes(body.role)
      ) {
        return NextResponse.json(
          { error: "Invalid role" },
          { status: 400 }
        );
      }

      updates.push("role = ?");
      values.push(body.role);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(userId);

    const [result] = await pool.execute(
      `UPDATE users
       SET ${updates.join(", ")}
       WHERE user_id = ?`,
      values
    );

    const updateResult = result as ResultSetHeader;

    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      userId,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Admin user PATCH error:", error);

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
