
import React, { useState, useEffect } from 'react';
import { getStore, addStudent, deleteStudent, addSubject, deleteSubject, updateStudent, publishAttempt, saveStore } from '../store';
import { Student, Subject, Question, ExamAttempt } from '../types';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [view, setView] = useState<'students' | 'subjects' | 'results' | 'evaluate' | 'add-questions'>('students');
  const [data, setData] = useState(getStore());
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null);
  const navigate = useNavigate();

  // Evaluation state
  const [evalScore, setEvalScore] = useState<number>(0);

  // Student Form
  const [studentForm, setStudentForm] = useState<Partial<Student>>({});
  
  // Subject & Question Creation Form
  const [subjectForm, setSubjectForm] = useState<Partial<Subject>>({ duration: 60 });
  const [assignRoll, setAssignRoll] = useState('');
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  useEffect(() => {
    if (!localStorage.getItem('admin_auth')) {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/admin-login');
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentForm.name && studentForm.rollNumber && studentForm.dob) {
      addStudent({
        id: Date.now().toString(),
        name: studentForm.name,
        rollNumber: studentForm.rollNumber,
        dob: studentForm.dob,
        profilePhoto: studentForm.profilePhoto || `https://picsum.photos/seed/${studentForm.rollNumber}/200`,
        assignedSubjectCodes: []
      } as Student);
      setData(getStore());
      setStudentForm({});
    }
  };

  const handleStartSubjectCreation = (e: React.FormEvent) => {
    e.preventDefault();
    if (subjectForm.name && subjectForm.code) {
      setCurrentQuestions([]);
      setView('add-questions');
    }
  };

  const handleAddQuestion = () => {
    if (newQuestion.text && newQuestion.options?.every(o => o.trim() !== '')) {
      const q: Question = {
        id: `q-${Date.now()}`,
        text: newQuestion.text,
        options: newQuestion.options as [string, string, string, string],
        correctAnswer: newQuestion.correctAnswer || 0
      };
      const updated = [...currentQuestions, q];
      setCurrentQuestions(updated);
      setNewQuestion({ text: '', options: ['', '', '', ''], correctAnswer: 0 });
      
      if (updated.length === 20) {
        // Finalize Subject
        const newSub: Subject = {
          id: Date.now().toString(),
          name: subjectForm.name!,
          code: subjectForm.code!,
          duration: subjectForm.duration || 60,
          questions: updated
        };
        addSubject(newSub);
        
        // Handle explicit roll number assignment if provided
        if (assignRoll) {
          const store = getStore();
          const student = store.students.find(s => s.rollNumber === assignRoll);
          if (student) {
            student.assignedSubjectCodes.push(newSub.code);
            updateStudent(student);
          }
        }
        
        setData(getStore());
        setView('subjects');
        setSubjectForm({ duration: 60 });
        setAssignRoll('');
      }
    } else {
      alert("Please fill all fields for the question.");
    }
  };

  const handleAssignByRoll = (roll: string, code: string) => {
    const store = getStore();
    const student = store.students.find(s => s.rollNumber === roll);
    if (!student) {
      alert("Roll number not found.");
      return;
    }
    if (!student.assignedSubjectCodes.includes(code)) {
      student.assignedSubjectCodes.push(code);
      updateStudent(student);
      setData(getStore());
      alert(`Assigned ${code} to ${roll}`);
    } else {
      alert("Subject already assigned to this student.");
    }
  };

  const startEvaluation = (attempt: ExamAttempt) => {
    setSelectedAttempt(attempt);
    setEvalScore(attempt.score || 0);
    setView('evaluate');
  };

  const handlePublish = () => {
    if (!selectedAttempt) return;
    const status = evalScore >= (selectedAttempt.totalMarks! * 0.4) ? 'Pass' : 'Fail';
    publishAttempt(selectedAttempt.studentRoll, selectedAttempt.subjectCode, evalScore, status);
    setData(getStore());
    setView('results');
    setSelectedAttempt(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-blue-400">EduQuest Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setView('students')} className={`w-full text-left px-4 py-3 rounded-lg transition ${view === 'students' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <i className="fas fa-users mr-3"></i> Students
          </button>
          <button onClick={() => setView('subjects')} className={`w-full text-left px-4 py-3 rounded-lg transition ${view === 'subjects' || view === 'add-questions' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <i className="fas fa-book mr-3"></i> Subjects & Exams
          </button>
          <button onClick={() => setView('results')} className={`w-full text-left px-4 py-3 rounded-lg transition ${view === 'results' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <i className="fas fa-poll mr-3"></i> Evaluation
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition">
            <i className="fas fa-sign-out-alt mr-3"></i> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto max-h-screen">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 capitalize">
            {view === 'evaluate' ? 'Manual Evaluation' : view.replace('-', ' ')}
          </h2>
          <div className="text-gray-500 font-medium">Administrator Panel</div>
        </header>

        {view === 'students' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4">Register Individual Student</h3>
              <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                  <input type="text" required className="w-full p-2 border rounded-lg" value={studentForm.name || ''} onChange={e => setStudentForm({...studentForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Roll Number</label>
                  <input type="text" required className="w-full p-2 border rounded-lg" value={studentForm.rollNumber || ''} onChange={e => setStudentForm({...studentForm, rollNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
                  <input type="date" required className="w-full p-2 border rounded-lg" value={studentForm.dob || ''} onChange={e => setStudentForm({...studentForm, dob: e.target.value})} />
                </div>
                <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">Save Student</button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4">Assigned Subjects</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img src={s.profilePhoto} className="w-10 h-10 rounded-full object-cover" alt="" />
                        <span className="font-semibold text-gray-800">{s.name}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono">{s.rollNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {s.assignedSubjectCodes.map(c => (
                            <span key={c} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">{c}</span>
                          ))}
                          {s.assignedSubjectCodes.length === 0 && <span className="text-xs text-gray-400">None</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => { deleteStudent(s.rollNumber); setData(getStore()); }} className="text-red-500 hover:text-red-700 transition">
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'subjects' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4">Step 1: Exam Basic Details</h3>
              <form onSubmit={handleStartSubjectCreation} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Subject Name</label>
                  <input type="text" required className="w-full p-2 border rounded-lg" value={subjectForm.name || ''} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Subject Code</label>
                  <input type="text" required className="w-full p-2 border rounded-lg" value={subjectForm.code || ''} onChange={e => setSubjectForm({...subjectForm, code: e.target.value})} />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Duration (Min)</label>
                  <input type="number" required className="w-full p-2 border rounded-lg" value={subjectForm.duration || 60} onChange={e => setSubjectForm({...subjectForm, duration: parseInt(e.target.value)})} />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Assign to Roll #</label>
                  <input type="text" className="w-full p-2 border rounded-lg" placeholder="Ex: S001" value={assignRoll} onChange={e => setAssignRoll(e.target.value)} />
                </div>
                <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                  Next: Add Questions
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.subjects.map(sub => (
                <div key={sub.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group">
                  <h4 className="text-lg font-bold text-gray-800">{sub.name}</h4>
                  <p className="text-xs text-gray-400 mb-4 font-mono">{sub.code}</p>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{sub.duration}m</span>
                      <span>20 MCQs</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        placeholder="Assign Roll #" 
                        className="text-xs p-1 border rounded flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAssignByRoll((e.target as HTMLInputElement).value, sub.code);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                  <button onClick={() => { deleteSubject(sub.code); setData(getStore()); }} className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'add-questions' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Question {currentQuestions.length + 1} of 20</h3>
                <div className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-bold">
                  {Math.round((currentQuestions.length / 20) * 100)}% Complete
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Question Text</label>
                  <textarea 
                    className="w-full p-3 border rounded-xl h-24 outline-none focus:border-blue-500"
                    placeholder="Type your question here..."
                    value={newQuestion.text}
                    onChange={e => setNewQuestion({...newQuestion, text: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {newQuestion.options?.map((opt, i) => (
                    <div key={i}>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Option {String.fromCharCode(65 + i)}</label>
                      <input 
                        type="text"
                        className="w-full p-2 border rounded-lg"
                        value={opt}
                        onChange={e => {
                          const opts = [...(newQuestion.options || [])];
                          opts[i] = e.target.value;
                          setNewQuestion({...newQuestion, options: opts as [string, string, string, string]});
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Correct Answer</label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={newQuestion.correctAnswer}
                    onChange={e => setNewQuestion({...newQuestion, correctAnswer: parseInt(e.target.value)})}
                  >
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </div>

                <button 
                  onClick={handleAddQuestion}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
                >
                  {currentQuestions.length === 19 ? 'Save and Complete Exam' : 'Save and Next Question'}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'results' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">Student Roll</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Auto-Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.attempts.filter(a => a.completed).map((a, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono">{a.studentRoll}</td>
                    <td className="px-6 py-4">{a.subjectCode}</td>
                    <td className="px-6 py-4 font-bold">{a.score}/{a.totalMarks}</td>
                    <td className="px-6 py-4">
                      {a.isPublished ? 
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Published</span> : 
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded uppercase">Draft</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => startEvaluation(a)} className="bg-slate-800 text-white px-3 py-1 rounded text-xs hover:bg-slate-700 transition">
                        {a.isPublished ? 'View Details' : 'Review & Publish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === 'evaluate' && selectedAttempt && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-4xl mx-auto border border-gray-100">
              <div className="flex justify-between items-center mb-8 border-b pb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Answer Sheet: {selectedAttempt.studentRoll}</h3>
                  <p className="text-gray-500">Subject: {selectedAttempt.subjectCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 uppercase font-bold tracking-widest">Calculated Score</p>
                  <p className="text-4xl font-black text-blue-600">{selectedAttempt.score}/{selectedAttempt.totalMarks}</p>
                </div>
              </div>

              {/* Detail Review List */}
              <div className="space-y-6 mb-12 max-h-96 overflow-y-auto pr-4 no-scrollbar">
                {data.subjects.find(s => s.code === selectedAttempt.subjectCode)?.questions.map((q, idx) => {
                  const studentAns = selectedAttempt.answers[idx];
                  const isCorrect = studentAns === q.correctAnswer;
                  return (
                    <div key={idx} className={`p-4 rounded-2xl border-2 ${isCorrect ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
                      <p className="font-bold text-gray-800 mb-2">Q{idx + 1}: {q.text}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-2 bg-white rounded-lg border">
                          <span className="text-gray-400 mr-2 font-bold">Student:</span>
                          <span className={studentAns === null ? 'text-gray-400 italic' : (isCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold')}>
                            {studentAns !== null ? q.options[studentAns] : 'No Answer'}
                          </span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border">
                          <span className="text-gray-400 mr-2 font-bold">Key:</span>
                          <span className="text-green-600 font-bold">{q.options[q.correctAnswer]}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end border-t pt-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Manual Evaluation (Adjust Marks)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      max={selectedAttempt.totalMarks} 
                      className="w-full p-4 border-2 rounded-xl text-2xl font-bold outline-none focus:border-blue-500"
                      value={evalScore}
                      onChange={e => setEvalScore(parseInt(e.target.value))}
                    />
                    <span className="text-2xl font-bold text-gray-400">/ {selectedAttempt.totalMarks}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setView('results')} className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">Back</button>
                  <button onClick={handlePublish} className="flex-1 bg-blue-600 text-white py-4 font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition">
                    Publish Result
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
