
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { getMongoDb } from "@/lib/db/mongo";
import { generateRecommendations } from "@/lib/recommender";

type CachedRecommendation = {
  propertyId?: number;
  title?: string;
  description?: string | null;
  listingType?: string;
  price?: number;
  areaSqft?: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  furnishing?: string | null;
  typeId?: number;
  typeName?: string;
  locationId?: number;
  city?: string;
  locality?: string;
  primaryImage?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  pricePerSqft?: number | null;
  matchScore?: number;
  score?: number;
  reasons?: string[];
};

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    if (auth.role !== "BUYER") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only buyers can access recommendations",
          },
        },
        { status: 403 }
      );
    }

    const mongo = await getMongoDb();
    const cache = mongo.collection("recommendations_cache");

    const cached = await cache.findOne({
      userId: auth.userId,
      generatedAt: {
        $gte: new Date(Date.now() - 60 * 60 * 1000),
      },
    });

    if (cached?.items && Array.isArray(cached.items)) {
      const items = (
        cached.items as CachedRecommendation[]
      ).map((item) => ({
        ...item,
        primaryImage:
          item.primaryImage ?? item.imageUrl ?? item.image_url ?? null,
      }));

      return NextResponse.json({
        success: true,
        data: items,
      });
    }

    const generated = await generateRecommendations(auth.userId, 12);

    const items = generated.map((item) => ({
      propertyId: Number(item.property_id),
      title: item.title,
      description: item.description ?? null,
      listingType: item.listing_type,
      price: Number(item.price),
      areaSqft: Number(item.area_sqft),
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      furnishing: item.furnishing,
      typeId: Number(item.type_id),
      typeName: item.type_name,
      locationId: Number(item.location_id),
      city: item.city,
      locality: item.locality,
      primaryImage: item.image_url ?? null,
      pricePerSqft:
        item.price_per_sqft != null
          ? Number(item.price_per_sqft)
          : null,
      matchScore: Number(item.matchScore),
      score: Number(item.score),
      reasons: item.reasons ?? [],
    }));

    await cache.updateOne(
      { userId: auth.userId },
      {
        $set: {
          userId: auth.userId,
          items,
          generatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Recommendations GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch recommendations",
        },
      },
      { status: 500 }
    );
  }
}
