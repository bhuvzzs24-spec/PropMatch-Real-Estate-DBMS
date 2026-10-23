const dbName = db.getSiblingDB("propmatch_nosql");

function ensureCollection(name, options) {
  if (!dbName.getCollectionNames().includes(name)) {
    dbName.createCollection(name, options);
  }
}

ensureCollection("user_preferences", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "userId",
        "listingType",
        "budgetMin",
        "budgetMax",
        "preferredCities",
        "preferredLocalities",
        "preferredTypeIds",
        "minBedrooms",
        "furnishing",
        "mustHaveAmenityIds",
        "createdAt",
        "updatedAt"
      ],
      properties: {
        userId: { bsonType: "int" },
        listingType: {
          enum: ["SALE", "RENT", null]
        },
        budgetMin: {
          bsonType: ["int", "long", "double", "decimal", "null"]
        },
        budgetMax: {
          bsonType: ["int", "long", "double", "decimal", "null"]
        },
        preferredCities: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        preferredLocalities: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        preferredTypeIds: {
          bsonType: "array",
          items: { bsonType: "int" }
        },
        minBedrooms: {
          bsonType: ["int", "long", "double", "null"]
        },
        furnishing: {
          enum: [
            "UNFURNISHED",
            "SEMI_FURNISHED",
            "FURNISHED",
            null
          ]
        },
        mustHaveAmenityIds: {
          bsonType: "array",
          items: { bsonType: "int" }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

ensureCollection("user_activity", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "eventType", "createdAt"],
      properties: {
        userId: { bsonType: "int" },
        propertyId: {
          bsonType: ["int", "long", "null"]
        },
        eventType: {
          enum: [
            "VIEW",
            "SEARCH",
            "FAVORITE",
            "UNFAVORITE",
            "INQUIRY",
            "VISIT_REQUEST"
          ]
        },
        metadata: {
          bsonType: "object"
        },
        createdAt: {
          bsonType: "date"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

ensureCollection("recommendations_cache", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "items", "generatedAt"],
      properties: {
        userId: { bsonType: "int" },
        items: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["propertyId", "score", "reasons"],
            properties: {
              propertyId: {
                bsonType: ["int", "long"]
              },
              score: {
                bsonType: ["int", "long", "double", "decimal"]
              },
              reasons: {
                bsonType: "array",
                items: { bsonType: "string" }
              }
            }
          }
        },
        generatedAt: {
          bsonType: "date"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

dbName.user_preferences.createIndex(
  { userId: 1 },
  { unique: true }
);

dbName.user_activity.createIndex(
  { userId: 1, createdAt: -1 }
);

dbName.user_activity.createIndex(
  { propertyId: 1, eventType: 1 }
);

dbName.user_activity.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 15552000 }
);

dbName.recommendations_cache.createIndex(
  { userId: 1 },
  { unique: true }
);

dbName.recommendations_cache.createIndex(
  { generatedAt: 1 },
  { expireAfterSeconds: 3600 }
);

print("MongoDB setup completed successfully.");
print("Database: propmatch_nosql");
print("Collections:");
printjson(dbName.getCollectionNames());
