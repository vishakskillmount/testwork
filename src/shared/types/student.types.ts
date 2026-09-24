export type Student = {
  id: string;
  name: string;
  email: string;
  course: string;
  createdAt: string;
};

export type CreateStudentInput = {
  name: string;
  email: string;
  course: string;
};

export type UpdateStudentInput = CreateStudentInput;
