const MAX_LENGTH = 120;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type StudentFields = {
  name: string;
  email: string;
  course: string;
};

export function studentFieldError(fields: StudentFields): string | null {
  const name = fields.name.trim();
  const email = fields.email.trim();
  const course = fields.course.trim();

  if (!name || !email || !course) {
    return "Please fill all fields";
  }

  if (name.length > MAX_LENGTH || email.length > MAX_LENGTH || course.length > MAX_LENGTH) {
    return `Each field must be ${MAX_LENGTH} characters or fewer`;
  }

  if (!EMAIL_PATTERN.test(email)) {
    return "Enter a valid email address";
  }

  return null;
}
