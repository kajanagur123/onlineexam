
export interface Question {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0-3
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  duration: number; // in minutes
  questions: Question[];
}

export interface Student {
  id: string;
  name: string;
  dob: string;
  rollNumber: string;
  profilePhoto: string;
  assignedSubjectCodes: string[]; // List of subject codes assigned to this student
}

export interface ExamAttempt {
  studentRoll: string;
  subjectCode: string;
  answers: (number | null)[];
  startTime: number;
  completed: boolean;
  score?: number;
  totalMarks?: number;
  status?: 'Pass' | 'Fail';
  isPublished: boolean; // Only visible to students when true
  adminComments?: string;
}

export interface SystemData {
  students: Student[];
  subjects: Subject[];
  attempts: ExamAttempt[];
}
