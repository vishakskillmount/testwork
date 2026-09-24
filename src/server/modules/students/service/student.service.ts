import { ApiError } from "@/server/http/api-error";
import { StudentSource } from "@/shared/enums/student-source.enum";
import type { StudentSource as StudentSourceValue } from "@/shared/enums/student-source.enum";
import type { CreateStudentDto } from "../dto/create-student.dto";
import type { UpdateStudentDto } from "../dto/update-student.dto";
import type {
  CreateStudentResponseDto,
  StudentListResponseDto,
  StudentResponseDto,
} from "../dto/student-response.dto";
import { mongoStudentRepository } from "../repositories/student.mongo.repository";
import { supabaseStudentRepository } from "../repositories/student.supabase.repository";

function repositoryFor(source: StudentSourceValue) {
  if (source === StudentSource.MongoDB) {
    return mongoStudentRepository;
  }

  if (source === StudentSource.Supabase) {
    return supabaseStudentRepository;
  }

  throw ApiError.badRequest("Invalid student source");
}

export const studentService = {
  async list(): Promise<StudentListResponseDto> {
    const [mongodb, supabase] = await Promise.all([
      mongoStudentRepository.findAll(),
      supabaseStudentRepository.findAll(),
    ]);

    return { mongodb, supabase };
  },

  async create(input: CreateStudentDto): Promise<CreateStudentResponseDto> {
    const createdAt = new Date();
    const mongodb = await mongoStudentRepository.create(input, createdAt);

    try {
      const supabase = await supabaseStudentRepository.create(input, createdAt);
      return { mongodb, supabase };
    } catch (error) {
      try {
        await mongoStudentRepository.remove(mongodb.id);
      } catch (rollbackError) {
        console.error("MongoDB rollback failed:", rollbackError);
        throw ApiError.internal(
          "Supabase did not save the student, and the MongoDB copy could not be removed."
        );
      }

      throw error;
    }
  },

  async update(
    id: string,
    source: StudentSourceValue,
    input: UpdateStudentDto
  ): Promise<StudentResponseDto> {
    return repositoryFor(source).update(id, input);
  },

  async remove(id: string, source: StudentSourceValue): Promise<void> {
    await repositoryFor(source).remove(id);
  },
};
