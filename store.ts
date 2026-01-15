
import { SystemData, Student, Subject, ExamAttempt } from './types';

const STORAGE_KEY = 'eduquest_data';

const initialData: SystemData = {
  students: [
    {
      id: '1',
      name: 'John Doe',
      dob: '2000-01-01',
      rollNumber: 'S001',
      profilePhoto: 'https://picsum.photos/seed/john/200',
      assignedSubjectCodes: []
    }
  ],
  subjects: [],
  attempts: []
};

export const getStore = (): SystemData => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : initialData;
};

export const saveStore = (data: SystemData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addStudent = (student: Student) => {
  const store = getStore();
  store.students.push(student);
  saveStore(store);
};

export const updateStudent = (student: Student) => {
  const store = getStore();
  const idx = store.students.findIndex(s => s.rollNumber === student.rollNumber);
  if (idx > -1) {
    store.students[idx] = student;
    saveStore(store);
  }
};

export const deleteStudent = (rollNumber: string) => {
  const store = getStore();
  store.students = store.students.filter(s => s.rollNumber !== rollNumber);
  saveStore(store);
};

export const addSubject = (subject: Subject) => {
  const store = getStore();
  store.subjects.push(subject);
  saveStore(store);
};

export const deleteSubject = (code: string) => {
  const store = getStore();
  store.subjects = store.subjects.filter(s => s.code !== code);
  saveStore(store);
};

export const saveAttempt = (attempt: ExamAttempt) => {
  const store = getStore();
  const existingIdx = store.attempts.findIndex(
    a => a.studentRoll === attempt.studentRoll && a.subjectCode === attempt.subjectCode
  );
  if (existingIdx > -1) {
    store.attempts[existingIdx] = attempt;
  } else {
    store.attempts.push(attempt);
  }
  saveStore(store);
};

export const publishAttempt = (roll: string, code: string, score: number, status: 'Pass' | 'Fail') => {
  const store = getStore();
  const idx = store.attempts.findIndex(a => a.studentRoll === roll && a.subjectCode === code);
  if (idx > -1) {
    store.attempts[idx].score = score;
    store.attempts[idx].status = status;
    store.attempts[idx].isPublished = true;
    saveStore(store);
  }
};

export const getStudentResults = (roll: string, dob: string) => {
  const store = getStore();
  const student = store.students.find(s => s.rollNumber === roll && s.dob === dob);
  if (!student) return null;
  // Students only see published results
  return store.attempts.filter(a => a.studentRoll === roll && a.completed && a.isPublished);
};
