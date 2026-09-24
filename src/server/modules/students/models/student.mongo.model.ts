import { Collection, ObjectId } from "mongodb";

import { getDb } from "@/server/database/mongo.client";
import { STUDENTS_COLLECTION } from "@/shared/constants/database.constants";

/** Document stored in the MongoDB `students` collection. */
export type MongoStudentDocument = {
  _id: ObjectId;
  name: string;
  email: string;
  course: string;
  createdAt: Date;
};

const studentValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "email", "course", "createdAt"],
    properties: {
      name: { bsonType: "string", minLength: 1, maxLength: 120 },
      email: { bsonType: "string", minLength: 3, maxLength: 120 },
      course: { bsonType: "string", minLength: 1, maxLength: 120 },
      createdAt: { bsonType: "date" },
    },
  },
};

let schemaReady: Promise<void> | null = null;

function ensureStudentSchema() {
  if (!schemaReady) {
    schemaReady = applyStudentSchema().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady;
}

async function applyStudentSchema() {
  const db = await getDb();
  const existing = await db
    .listCollections({ name: STUDENTS_COLLECTION })
    .toArray();

  if (existing.length === 0) {
    await db.createCollection(STUDENTS_COLLECTION, {
      validator: studentValidator,
      validationLevel: "moderate",
    });
    return;
  }

  await db.command({
    collMod: STUDENTS_COLLECTION,
    validator: studentValidator,
    validationLevel: "moderate",
  });
}

export async function mongoStudentModel(): Promise<
  Collection<MongoStudentDocument>
> {
  await ensureStudentSchema();
  const db = await getDb();
  return db.collection<MongoStudentDocument>(STUDENTS_COLLECTION);
}
