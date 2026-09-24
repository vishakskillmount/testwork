import { Db, MongoClient } from "mongodb";

import { env } from "@/server/config/env";

// Reused across hot reloads so dev restarts don't open a new pool each time.
const globalForMongo = globalThis as typeof globalThis & {
  _mongoClient?: MongoClient;
};

export async function getDb(): Promise<Db> {
  if (!globalForMongo._mongoClient) {
    globalForMongo._mongoClient = new MongoClient(env.mongodbUri);
  }

  const client = globalForMongo._mongoClient;
  await client.connect();

  return client.db();
}
