
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStore } from '../store';
import { Student, Subject, ExamAttempt } from '../types';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [assignedSubjects, setAssignedSubjects] = useState<Subject[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);

  useEffect(() => {
    const auth = localStorage.getItem('student_auth');
    if (!auth) {
      navigate('/student-login');
      return;
    }
    const studentData = JSON.parse(auth) as Student;
    
    const store = getStore();
    // Re-fetch student to get updated assignments
    const currentStudent = store.students.find(s => s.rollNumber === studentData.rollNumber);
    if (!currentStudent) {
      navigate('/student-login');
      return;
    }
    setStudent(currentStudent);
    
    // Only show assigned exams
    const assigned = store.subjects.filter(s => currentStudent.assignedSubjectCodes.includes(s.code));
    setAssignedSubjects(assigned);
    setAttempts(store.attempts.filter(a => a.studentRoll === studentData.rollNumber));
  }, [navigate]);

  if (!student) return null;

  const getStatus = (code: string) => {
    const attempt = attempts.find(a => a.subjectCode === code);
    if (!attempt) return { label: 'Not Started', color: 'bg-blue-100 text-blue-700', canStart: true };
    if (!attempt.completed) return { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', canStart: true };
    if (!attempt.isPublished) return { label: 'Pending Evaluation', color: 'bg-gray-100 text-gray-700', canStart: false };
    return { label: 'Result Published', color: 'bg-green-100 text-green-700', canStart: false, result: attempt };
  };

  const startExam = (sub: Subject) => {
    const status = getStatus(sub.code);
    if (!status.canStart) return;
    navigate(`/exam/${sub.code}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-indigo-600">Student Examination Portal</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">{student.name}</p>
            <p className="text-[10px] text-gray-500 font-bold">{student.rollNumber}</p>
          </div>
          <img src={student.profilePhoto} className="w-10 h-10 rounded-full border border-indigo-100" alt="" />
          <button onClick={() => { localStorage.removeItem('student_auth'); navigate('/'); }} className="text-gray-400 hover:text-red-500 p-2"><i className="fas fa-sign-out-alt"></i></button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8 grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 bg-white p-6 rounded-3xl shadow-sm border h-fit text-center">
          <img src={student.profilePhoto} className="w-32 h-32 rounded-3xl object-cover mx-auto mb-4 border-4 border-indigo-50" alt="" />
          <h2 className="text-xl font-bold text-gray-800">{student.name}</h2>
          <p className="text-gray-500 text-sm mb-6">{student.rollNumber}</p>
          <div className="text-left space-y-4">
             <div className="p-3 bg-gray-50 rounded-xl">
               <p className="text-[10px] text-gray-400 uppercase font-bold">DOB</p>
               <p className="font-bold text-gray-700">{student.dob}</p>
             </div>
             <button onClick={() => navigate('/results')} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100">My Reports</button>
          </div>
        </aside>

        <section className="md:col-span-3 space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">My Assigned Exams</h3>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {assignedSubjects.map(sub => {
              const status = getStatus(sub.code);
              return (
                <div key={sub.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group">
                  <div className={`absolute top-6 right-6 px-2 py-1 rounded text-[10px] font-bold ${status.color}`}>
                    {status.label}
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-1">{sub.name}</h4>
                  <p className="text-xs text-gray-400 font-mono mb-4">{sub.code}</p>
                  
                  <div className="flex gap-4 mb-6 text-xs text-gray-500 font-medium">
                    <span><i className="far fa-clock mr-1"></i>{sub.duration}m</span>
                    <span><i className="far fa-question-circle mr-1"></i>20 MCQs</span>
                  </div>

                  {status.canStart ? (
                    <button onClick={() => startExam(sub)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100">Start Exam</button>
                  ) : (
                    status.result ? (
                      <button onClick={() => navigate('/results')} className="w-full bg-green-50 text-green-600 py-3 rounded-xl font-bold text-sm border border-green-200">View Result Card</button>
                    ) : (
                      <button disabled className="w-full bg-gray-50 text-gray-400 py-3 rounded-xl font-bold text-sm cursor-not-allowed">Waiting for Admin</button>
                    )
                  )}
                </div>
              );
            })}
            {assignedSubjects.length === 0 && (
              <div className="col-span-2 p-12 text-center text-gray-400 border-2 border-dashed rounded-3xl italic">
                No exams have been assigned to you by the Administrator.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
