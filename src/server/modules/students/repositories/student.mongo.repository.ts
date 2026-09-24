import { ObjectId } from "mongodb";

import { ApiError } from "@/server/http/api-error";
import type { CreateStudentDto } from "../dto/create-student.dto";
import type { UpdateStudentDto } from "../dto/update-student.dto";
import type { StudentResponseDto } from "../dto/student-response.dto";
import { mapMongoStudent } from "../mappers/student.mapper";
import { mongoStudentModel } from "../models/student.mongo.model";

function toObjectId(id: string) {
  if (!ObjectId.isValid(id)) {
    throw ApiError.badRequest("Invalid student id");
  }

  return new ObjectId(id);
}

export const mongoStudentRepository = {
  async findAll(): Promise<StudentResponseDto[]> {
    const collection = await mongoStudentModel();
    const rows = await collection.find().sort({ createdAt: -1 }).toArray();

    return rows.map(mapMongoStudent);
  },

  async create(
    input: CreateStudentDto,
    createdAt: Date
  ): Promise<StudentResponseDto> {
    const collection = await mongoStudentModel();
    const document = {
      _id: new ObjectId(),
      ...input,
      createdAt,
    };
    await collection.insertOne(document);

    return mapMongoStudent(document);
  },

  async update(id: string, input: UpdateStudentDto): Promise<StudentResponseDto> {
    const collection = await mongoStudentModel();
    const updated = await collection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: input },
      { returnDocument: "after" }
    );

    if (!updated) {
      throw ApiError.notFound("Student not found");
    }

    return mapMongoStudent(updated);
  },

  async remove(id: string): Promise<void> {
    const collection = await mongoStudentModel();
    const result = await collection.deleteOne({ _id: toObjectId(id) });

    if (result.deletedCount === 0) {
      throw ApiError.notFound("Student not found");
    }
  },
};
