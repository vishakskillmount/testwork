import type { CreateStudentDto } from "../dto/create-student.dto";
import type { UpdateStudentDto } from "../dto/update-student.dto";
import type {
  CreateStudentResponseDto,
  StudentListResponseDto,
  StudentResponseDto,
} from "../dto/student-response.dto";
import { supabaseStudentRepository } from "../repositories/student.supabase.repository";

export const studentService = {
  async list(): Promise<StudentListResponseDto> {
    return { students: await supabaseStudentRepository.findAll() };
  },

  async create(input: CreateStudentDto): Promise<CreateStudentResponseDto> {
    const student = await supabaseStudentRepository.create(input, new Date());
    return { student };
  },

  async update(id: string, input: UpdateStudentDto): Promise<StudentResponseDto> {
    return supabaseStudentRepository.update(id, input);
  },

  async remove(id: string): Promise<void> {
    await supabaseStudentRepository.remove(id);
  },
};
