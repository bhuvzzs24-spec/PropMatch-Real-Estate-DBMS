const dbName = db.getSiblingDB("propmatch_nosql");

// Clear existing demo data
dbName.user_preferences.deleteMany({});
dbName.user_activity.deleteMany({});
dbName.recommendations_cache.deleteMany({});

// Buyer 1 preferences
dbName.user_preferences.insertOne({
  userId: NumberInt(5),
  preferences: {
    city: "Bengaluru",
    listingType: "RENT",
    minPrice: 30000,
    maxPrice: 60000,
    minBedrooms: 2,
    preferredPropertyTypes: ["Apartment"],
    preferredAmenities: ["Parking", "Lift"]
  },
  updatedAt: new Date()
});

// Buyer 2 preferences
dbName.user_preferences.insertOne({
  userId: NumberInt(6),
  preferences: {
    city: "Bengaluru",
    listingType: "SALE",
    minPrice: 5000000,
    maxPrice: 15000000,
    minBedrooms: 2,
    preferredPropertyTypes: ["Apartment", "Villa"],
    preferredAmenities: ["Parking", "Security"]
  },
  updatedAt: new Date()
});

// Activity data
dbName.user_activity.insertMany([
  {
    userId: NumberInt(5),
    propertyId: NumberInt(6),
    eventType: "VIEW",
    metadata: {
      source: "recommendations"
    },
    createdAt: new Date()
  },
  {
    userId: NumberInt(5),
    propertyId: NumberInt(29),
    eventType: "VIEW",
    metadata: {
      source: "search"
    },
    createdAt: new Date()
  },
  {
    userId: NumberInt(5),
    propertyId: NumberInt(6),
    eventType: "FAVORITE",
    metadata: {},
    createdAt: new Date()
  },
  {
    userId: NumberInt(5),
    propertyId: null,
    eventType: "SEARCH",
    metadata: {
      filters: {
        city: "Bengaluru",
        listingType: "RENT",
        minPrice: 30000,
        maxPrice: 60000
      }
    },
    createdAt: new Date()
  },
  {
    userId: NumberInt(6),
    propertyId: NumberInt(1),
    eventType: "VIEW",
    metadata: {
      source: "search"
    },
    createdAt: new Date()
  }
]);

// Recommendation cache for Buyer 1
dbName.recommendations_cache.insertOne({
  userId: NumberInt(5),
  recommendations: [
    {
      propertyId: 6,
      score: 0.95,
      reason: "Matches preferred city, rent range and bedrooms"
    },
    {
      propertyId: 29,
      score: 0.88,
      reason: "Matches preferred city, rent range and property type"
    }
  ],
  generatedAt: new Date()
});

print("MongoDB seed completed successfully.");
print("User preferences:", dbName.user_preferences.countDocuments());
print("User activity:", dbName.user_activity.countDocuments());
print("Recommendation cache:", dbName.recommendations_cache.countDocuments());