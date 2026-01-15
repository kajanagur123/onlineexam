
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStore, saveAttempt } from '../store';
import { Student, Subject, Question, ExamAttempt } from '../types';
import { Calculator } from '../components/Calculator';

const ExamRoom: React.FC = () => {
  const { subjectCode } = useParams<{ subjectCode: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Initialize Exam
  useEffect(() => {
    const auth = localStorage.getItem('student_auth');
    if (!auth) { navigate('/student-login'); return; }
    
    const store = getStore();
    const studentData = JSON.parse(auth) as Student;
    const sub = store.subjects.find(s => s.code === subjectCode);
    
    // Safety check: already attempted?
    if (store.attempts.some(a => a.studentRoll === studentData.rollNumber && a.subjectCode === subjectCode && a.completed)) {
      alert("Exam already submitted.");
      navigate('/student-dashboard');
      return;
    }

    if (!sub) { navigate('/student-dashboard'); return; }

    setStudent(studentData);
    setSubject(sub);
    setAnswers(new Array(sub.questions.length).fill(null));
    setTimeLeft(sub.duration * 60);
    setExamStarted(true);

    // Initial Save (Attempt Tracking)
    // Fix: Added isPublished property to comply with ExamAttempt interface
    saveAttempt({
      studentRoll: studentData.rollNumber,
      subjectCode: sub.code,
      answers: new Array(sub.questions.length).fill(null),
      startTime: Date.now(),
      completed: false,
      isPublished: false
    });

    // Disable Right Click & Refresh
    const preventDefault = (e: any) => e.preventDefault();
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('contextmenu', preventDefault);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('contextmenu', preventDefault);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [subjectCode, navigate]);

  const handleSubmit = useCallback(() => {
    if (!subject || !student) return;

    // Evaluate
    let score = 0;
    subject.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });

    const totalMarks = subject.questions.length;
    const passMarks = totalMarks * 0.4; // 40% Pass

    // Fix: Added isPublished property to comply with ExamAttempt interface
    const result: ExamAttempt = {
      studentRoll: student.rollNumber,
      subjectCode: subject.code,
      answers: answers,
      startTime: Date.now(),
      completed: true,
      score: score,
      totalMarks: totalMarks,
      status: score >= passMarks ? 'Pass' : 'Fail',
      isPublished: false
    };

    saveAttempt(result);
    alert(`Exam submitted successfully! Score: ${score}/${totalMarks}`);
    navigate('/student-dashboard');
  }, [subject, student, answers, navigate]);

  // Timer Hook
  useEffect(() => {
    if (!examStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 300 && !showWarning) setShowWarning(true); // 5 mins warning
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timeLeft, handleSubmit, showWarning]);

  if (!subject || !student) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((answers.filter(a => a !== null).length) / subject.questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col select-none">
      {/* Top Navigation */}
      <header className="bg-slate-800 border-b border-slate-700 px-8 py-4 flex justify-between items-center text-white sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">{subject.code}</div>
          <h2 className="text-xl font-bold">{subject.name}</h2>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className={`text-2xl font-mono font-bold px-6 py-2 rounded-xl border-2 ${timeLeft < 300 ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-slate-700 border-slate-600 text-blue-400'}`}>
              <i className="far fa-clock mr-2"></i> {formatTime(timeLeft)}
            </div>
          </div>
          <button 
            onClick={() => { if(confirm("Are you sure you want to finish the exam?")) handleSubmit(); }}
            className="bg-green-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-green-700 transition shadow-lg"
          >
            Submit Exam
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Question Navigation Drawer */}
        <aside className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col p-6 hidden lg:flex">
          <div className="mb-8">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Exam Progress</h3>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="text-sm text-gray-500">{answers.filter(a => a !== null).length} of {subject.questions.length} Answered</div>
          </div>

          <div className="grid grid-cols-5 gap-2 overflow-y-auto no-scrollbar pr-2">
            {subject.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all border-2 ${
                  currentIdx === i ? 'bg-blue-600 border-blue-400 text-white scale-110 shadow-lg' :
                  answers[i] !== null ? 'bg-green-900/50 border-green-500 text-green-400' :
                  'bg-slate-700 border-slate-600 text-slate-400'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-8 border-t border-slate-700">
            <div className="flex items-center gap-3">
              <img src={student.profilePhoto} className="w-12 h-12 rounded-xl object-cover" alt="" />
              <div className="truncate">
                <p className="text-white font-bold truncate">{student.name}</p>
                <p className="text-slate-500 text-xs">{student.rollNumber}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Question Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-900">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Question Card */}
            <div className="bg-slate-800 p-10 rounded-3xl border border-slate-700 shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <span className="bg-slate-700 text-blue-400 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg">
                  {currentIdx + 1}
                </span>
                <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">Question</span>
              </div>
              
              <h3 className="text-2xl font-medium text-white mb-10 leading-relaxed">
                {subject.questions[currentIdx].text}
              </h3>

              <div className="space-y-4">
                {subject.questions[currentIdx].options.map((option, oIdx) => (
                  <label 
                    key={oIdx}
                    className={`block p-6 rounded-2xl border-2 transition-all cursor-pointer group ${
                      answers[currentIdx] === oIdx 
                        ? 'bg-blue-600/10 border-blue-500' 
                        : 'bg-slate-700/50 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name={`q-${currentIdx}`} 
                      className="hidden" 
                      checked={answers[currentIdx] === oIdx}
                      onChange={() => {
                        const newAnswers = [...answers];
                        newAnswers[currentIdx] = oIdx;
                        setAnswers(newAnswers);
                      }}
                    />
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                        answers[currentIdx] === oIdx ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-500 text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      <span className={`text-lg transition ${answers[currentIdx] === oIdx ? 'text-white' : 'text-slate-300'}`}>
                        {option}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center px-4">
              <button 
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 text-slate-400 hover:text-white disabled:opacity-30 transition font-bold"
              >
                <i className="fas fa-arrow-left"></i> Previous Question
              </button>
              <button 
                onClick={() => {
                  if (currentIdx < subject.questions.length - 1) {
                    setCurrentIdx(prev => prev + 1);
                  } else {
                    handleSubmit();
                  }
                }}
                className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition shadow-lg ${
                  currentIdx === subject.questions.length - 1 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {currentIdx === subject.questions.length - 1 ? 'Finish Exam' : 'Next Question'} 
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Warning Toast */}
      {showWarning && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce z-50">
          <i className="fas fa-exclamation-triangle text-2xl"></i>
          <div>
            <p className="font-bold">Attention!</p>
            <p className="text-sm opacity-90">Less than 5 minutes remaining. Your exam will auto-submit when the timer hits zero.</p>
          </div>
          <button onClick={() => setShowWarning(false)} className="ml-4 hover:scale-110 transition"><i className="fas fa-times"></i></button>
        </div>
      )}

      {/* Floating Calculator */}
      <Calculator />
    </div>
  );
};

export default ExamRoom;
