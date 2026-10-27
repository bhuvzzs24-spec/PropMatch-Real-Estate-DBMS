import { getMongoDb } from "@/lib/db/mongo";

export type ActivityEventType =
  | "VIEW"
  | "SEARCH"
  | "FAVORITE"
  | "UNFAVORITE"
  | "INQUIRY"
  | "VISIT_REQUEST";

export async function logActivity(params: {
  userId: number;
  eventType: ActivityEventType;
  propertyId?: number | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const db = await getMongoDb();

    await db.collection("user_activity").insertOne({
      userId: params.userId,
      eventType: params.eventType,
      propertyId: params.propertyId ?? null,
      metadata: params.metadata ?? {},
      createdAt: new Date(),
    });
  } catch (error) {
    // Activity logging should not break the main API request.
    console.error("Activity logging failed:", error);
  }
}