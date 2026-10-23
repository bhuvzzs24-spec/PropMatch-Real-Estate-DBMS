import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;

const client = new MongoClient(uri);

let db: Db | null = null;

export async function getMongoDb(): Promise<Db> {
  if (db) {
    return db;
  }

  await client.connect();
  db = client.db(dbName);

  return db;
}
