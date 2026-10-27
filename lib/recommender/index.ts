
import pool from "@/lib/db/mysql";
import { getMongoDb } from "@/lib/db/mongo";

type Preference = {
  listingType: "SALE" | "RENT" | null;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredCities: string[];
  preferredLocalities: string[];
  preferredTypeIds: number[];
  minBedrooms: number | null;
  furnishing: string | null;
  mustHaveAmenityIds: number[];
};

type Listing = {
  property_id: number;
  title: string;
  description?: string | null;
  listing_type: "SALE" | "RENT";
  price: number;
  area_sqft: number;
  bedrooms: number | null;
  bathrooms: number | null;
  furnishing: string | null;
  type_id: number;
  type_name: string;
  location_id: number;
  city: string;
  locality: string;
  image_url: string | null;
  price_per_sqft?: number | null;
  amenity_ids: number[];
};

type ListingRow = Omit<Listing, "amenity_ids"> & {
  amenity_ids: string | number[] | null;
};

type ScoredListing = Listing & {
  matchScore: number;
  score: number;
  reasons: string[];
};

type Activity = {
  propertyId: number;
  eventType: string;
  weight: number;
};

type ActivityDocument = {
  propertyId: number;
  eventType: string;
  createdAt?: Date;
};

type TrendingDocument = {
  _id: number | string;
  views: number;
};

const WEIGHTS = {
  budget: 0.3,
  location: 0.25,
  type: 0.15,
  bedrooms: 0.1,
  amenities: 0.1,
  behaviour: 0.1,
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function budgetScore(
  price: number,
  min: number | null,
  max: number | null
): number {
  if (min === null && max === null) return 0;

  if (min !== null && max !== null) {
    if (price >= min && price <= max) return 1;

    const reference = price < min ? min : max;
    const difference = Math.abs(price - reference);

    if (reference <= 0) return 0;

    return Math.max(0, 1 - difference / (reference * 0.3));
  }

  if (min !== null) {
    if (price >= min) return 1;
    return Math.max(0, 1 - (min - price) / (min * 0.3));
  }

  if (max !== null) {
    if (price <= max) return 1;
    return Math.max(0, 1 - (price - max) / (max * 0.3));
  }

  return 0;
}

function locationScore(
  listing: Listing,
  preferences: Preference
): number {
  const localityMatch = preferences.preferredLocalities.some(
    (locality) =>
      locality.toLowerCase() === listing.locality.toLowerCase()
  );

  if (localityMatch) return 1;

  const cityMatch = preferences.preferredCities.some(
    (city) => city.toLowerCase() === listing.city.toLowerCase()
  );

  if (cityMatch) return 0.6;

  return 0;
}

function typeScore(
  listing: Listing,
  preferences: Preference
): number {
  return preferences.preferredTypeIds.includes(listing.type_id)
    ? 1
    : 0;
}

function bedroomScore(
  listing: Listing,
  preferences: Preference
): number {
  if (preferences.minBedrooms === null || listing.bedrooms === null) {
    return 0;
  }

  if (listing.bedrooms >= preferences.minBedrooms) return 1;

  if (listing.bedrooms === preferences.minBedrooms - 1) return 0.5;

  return 0;
}

function amenityScore(
  listing: Listing,
  preferences: Preference
): number {
  if (preferences.mustHaveAmenityIds.length === 0) return 0;

  const matched = preferences.mustHaveAmenityIds.filter((id) =>
    listing.amenity_ids.includes(id)
  ).length;

  return matched / preferences.mustHaveAmenityIds.length;
}

function behaviourScore(
  listing: Listing,
  activities: Activity[],
  activityProperties: Map<number, Listing>
): number {
  if (activities.length === 0) return 0;

  let weightedTotal = 0;
  let weightTotal = 0;

  for (const activity of activities) {
    const previous = activityProperties.get(activity.propertyId);

    if (!previous) continue;

    let similarity = 0;

    if (previous.type_id === listing.type_id) {
      similarity += 1 / 3;
    }

    if (
      previous.locality.toLowerCase() ===
      listing.locality.toLowerCase()
    ) {
      similarity += 1 / 3;
    }

    const priceDifference =
      Math.abs(previous.price - listing.price) /
      Math.max(previous.price, listing.price, 1);

    if (priceDifference <= 0.3) {
      similarity += 1 / 3;
    }

    weightedTotal += similarity * activity.weight;
    weightTotal += Math.abs(activity.weight);
  }

  if (weightTotal === 0) return 0;

  return Math.max(0, Math.min(1, weightedTotal / weightTotal));
}

function buildReasons(scores: {
  budget: number;
  location: number;
  type: number;
  bedrooms: number;
  amenities: number;
  behaviour: number;
}): string[] {
  const reasons: string[] = [];

  if (scores.budget >= 0.6) {
    reasons.push("Within your budget");
  }

  if (scores.location >= 1) {
    reasons.push("Preferred locality");
  } else if (scores.location >= 0.6) {
    reasons.push("Preferred city");
  }

  if (scores.type >= 0.6) {
    reasons.push("Preferred property type");
  }

  if (scores.bedrooms >= 0.6) {
    reasons.push("Meets your bedroom needs");
  }

  if (scores.amenities >= 0.6) {
    reasons.push("Has your must-have amenities");
  }

  if (scores.behaviour >= 0.6) {
    reasons.push("Similar to homes you viewed");
  }

  return reasons;
}

export async function generateRecommendations(
  userId: number,
  limit = 12
): Promise<ScoredListing[]> {
  const mongo = await getMongoDb();

  const preferenceDoc = await mongo
    .collection<Preference & { userId: number }>("user_preferences")
    .findOne({ userId });

  const preferences: Preference = {
    listingType: preferenceDoc?.listingType ?? null,
    budgetMin: preferenceDoc?.budgetMin ?? null,
    budgetMax: preferenceDoc?.budgetMax ?? null,
    preferredCities: preferenceDoc?.preferredCities ?? [],
    preferredLocalities: preferenceDoc?.preferredLocalities ?? [],
    preferredTypeIds: preferenceDoc?.preferredTypeIds ?? [],
    minBedrooms: preferenceDoc?.minBedrooms ?? null,
    furnishing: preferenceDoc?.furnishing ?? null,
    mustHaveAmenityIds: preferenceDoc?.mustHaveAmenityIds ?? [],
  };

  const activityDocs = await mongo
    .collection<ActivityDocument>("user_activity")
    .find({
      userId,
      eventType: { $in: ["VIEW", "FAVORITE"] },
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  const hasPreferences =
    preferences.listingType !== null ||
    preferences.budgetMin !== null ||
    preferences.budgetMax !== null ||
    preferences.preferredCities.length > 0 ||
    preferences.preferredLocalities.length > 0 ||
    preferences.preferredTypeIds.length > 0 ||
    preferences.minBedrooms !== null ||
    preferences.furnishing !== null ||
    preferences.mustHaveAmenityIds.length > 0;

  const hasActivity = activityDocs.length > 0;

  let candidateQuery = `
    SELECT
      v.property_id,
      v.title,
      v.listing_type,
      v.price,
      v.area_sqft,
      v.bedrooms,
      v.bathrooms,
      v.furnishing,
      v.type_id,
      v.type_name,
      v.location_id,
      v.city,
      v.locality,
      v.image_url,
      COALESCE(
        GROUP_CONCAT(DISTINCT pa.amenity_id),
        ''
      ) AS amenity_ids
    FROM v_active_listings v
    LEFT JOIN property_amenities pa
      ON pa.property_id = v.property_id
  `;

  const params: (string | number | boolean | null)[] = [];

  if (preferences.listingType) {
    candidateQuery += ` WHERE v.listing_type = ? `;
    params.push(preferences.listingType);
  }

  candidateQuery += `
    GROUP BY
      v.property_id,
      v.title,
      v.listing_type,
      v.price,
      v.area_sqft,
      v.bedrooms,
      v.bathrooms,
      v.furnishing,
      v.type_id,
      v.type_name,
      v.location_id,
      v.city,
      v.locality,
      v.image_url
  `;

  const [rows] = await pool.execute(candidateQuery, params);

  const listings: Listing[] = (rows as ListingRow[]).map((row) => ({
    ...row,
    price: Number(row.price),
    amenity_ids: Array.isArray(row.amenity_ids)
      ? row.amenity_ids.map(Number).filter(Number.isInteger)
      : row.amenity_ids
        ? String(row.amenity_ids)
            .split(",")
            .map(Number)
            .filter(Number.isInteger)
        : [],
  }));

  if (!hasPreferences && !hasActivity) {
    const viewed = (await mongo
      .collection("user_activity")
      .aggregate<TrendingDocument>([
        {
          $match: {
            eventType: "VIEW",
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: "$propertyId",
            views: { $sum: 1 },
          },
        },
        {
          $sort: { views: -1 },
        },
        {
          $limit: limit,
        },
      ])
      .toArray());

    const trendingIds = viewed.map((item) => Number(item._id));

    return listings
      .filter((listing) => trendingIds.includes(listing.property_id))
      .map((listing) => ({
        ...listing,
        matchScore: 0,
        score: 0,
        reasons: ["Popular with other buyers"],
      }));
  }

  const activityIds = activityDocs
    .map((doc) => Number(doc.propertyId))
    .filter(Number.isInteger);

  const activityListings = listings.filter((listing) =>
    activityIds.includes(listing.property_id)
  );

  const activityProperties = new Map<number, Listing>(
    activityListings.map(
      (listing): [number, Listing] => [listing.property_id, listing]
    )
  );

  const activities: Activity[] = activityDocs.map((doc) => ({
    propertyId: Number(doc.propertyId),
    eventType: String(doc.eventType),
    weight: doc.eventType === "FAVORITE" ? 3 : 1,
  }));

  const scored: ScoredListing[] = listings.map((listing) => {
    const scores = {
      budget: budgetScore(
        listing.price,
        preferences.budgetMin,
        preferences.budgetMax
      ),
      location: locationScore(listing, preferences),
      type: typeScore(listing, preferences),
      bedrooms: bedroomScore(listing, preferences),
      amenities: amenityScore(listing, preferences),
      behaviour: behaviourScore(
        listing,
        activities,
        activityProperties
      ),
    };

    const matchScore = round1(
      100 *
        (
          WEIGHTS.budget * scores.budget +
          WEIGHTS.location * scores.location +
          WEIGHTS.type * scores.type +
          WEIGHTS.bedrooms * scores.bedrooms +
          WEIGHTS.amenities * scores.amenities +
          WEIGHTS.behaviour * scores.behaviour
        )
    );

    return {
      ...listing,
      matchScore,
      score: matchScore,
      reasons: buildReasons(scores),
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored.slice(0, limit);
}
