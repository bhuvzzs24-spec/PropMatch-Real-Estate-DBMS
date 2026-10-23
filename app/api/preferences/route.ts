import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { getMongoDb } from "@/lib/db/mongo";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = await getMongoDb();

    const preferences = await db
      .collection("user_preferences")
      .findOne(
        { userId: auth.userId },
        { projection: { _id: 0 } }
      );

    return NextResponse.json({
      success: true,
      data: preferences || null,
    });
  } catch (error) {
    console.error("Preferences GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
        { error: "Only buyers can update preferences" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const input = body.preferences ?? body;

    const listingType =
      input.listingType === "SALE" || input.listingType === "RENT"
        ? input.listingType
        : null;

    const budgetMin =
      input.budgetMin ?? input.minPrice ?? null;

    const budgetMax =
      input.budgetMax ?? input.maxPrice ?? null;

    const preferredCities = Array.isArray(input.preferredCities)
      ? input.preferredCities
      : input.city
        ? [input.city]
        : [];

    const preferredLocalities = Array.isArray(input.preferredLocalities)
      ? input.preferredLocalities
      : [];

    const preferredTypeIds = Array.isArray(input.preferredTypeIds)
      ? input.preferredTypeIds.map(Number).filter(Number.isInteger)
      : [];

    const minBedrooms =
      input.minBedrooms !== null &&
      input.minBedrooms !== undefined
        ? Number(input.minBedrooms)
        : null;

    const furnishing = input.furnishing ?? null;

    const mustHaveAmenityIds = Array.isArray(input.mustHaveAmenityIds)
      ? input.mustHaveAmenityIds.map(Number).filter(Number.isInteger)
      : Array.isArray(input.preferredAmenities)
        ? input.preferredAmenities.map(Number).filter(Number.isInteger)
        : [];

    if (
      budgetMin !== null &&
      budgetMin !== undefined &&
      Number(budgetMin) < 0
    ) {
      return NextResponse.json(
        { error: "budgetMin cannot be negative" },
        { status: 400 }
      );
    }

    if (
      budgetMax !== null &&
      budgetMax !== undefined &&
      Number(budgetMax) < 0
    ) {
      return NextResponse.json(
        { error: "budgetMax cannot be negative" },
        { status: 400 }
      );
    }

    if (
      budgetMin !== null &&
      budgetMax !== null &&
      Number(budgetMin) > Number(budgetMax)
    ) {
      return NextResponse.json(
        { error: "budgetMin cannot exceed budgetMax" },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    const now = new Date();

    const preferences = {
      userId: auth.userId,
      listingType,
      budgetMin:
        budgetMin === null || budgetMin === undefined
          ? null
          : Number(budgetMin),
      budgetMax:
        budgetMax === null || budgetMax === undefined
          ? null
          : Number(budgetMax),
      preferredCities,
      preferredLocalities,
      preferredTypeIds,
      minBedrooms,
      furnishing,
      mustHaveAmenityIds,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection("user_preferences").updateOne(
      { userId: auth.userId },
      {
        $set: {
          listingType: preferences.listingType,
          budgetMin: preferences.budgetMin,
          budgetMax: preferences.budgetMax,
          preferredCities: preferences.preferredCities,
          preferredLocalities: preferences.preferredLocalities,
          preferredTypeIds: preferences.preferredTypeIds,
          minBedrooms: preferences.minBedrooms,
          furnishing: preferences.furnishing,
          mustHaveAmenityIds: preferences.mustHaveAmenityIds,
          updatedAt: now,
        },
        $setOnInsert: {
          userId: auth.userId,
          createdAt: now,
        },
      },
      { upsert: true }
    );

    await db.collection("recommendations_cache").deleteOne({
      userId: auth.userId,
    });

    const savedPreferences = await db
      .collection("user_preferences")
      .findOne(
        { userId: auth.userId },
        { projection: { _id: 0 } }
      );

    return NextResponse.json({
      success: true,
      data: savedPreferences,
    });
  } catch (error) {
    console.error("Preferences PUT error:", error);

    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 }
    );
  }
}
