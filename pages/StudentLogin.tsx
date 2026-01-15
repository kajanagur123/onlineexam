
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStore } from '../store';

const StudentLogin: React.FC = () => {
  const [roll, setRoll] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const store = getStore();
    const student = store.students.find(s => s.rollNumber === roll && s.dob === dob);

    if (student) {
      localStorage.setItem('student_auth', JSON.stringify(student));
      navigate('/student-dashboard');
    } else {
      setError('No student found with these credentials. Contact Admin.');
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-indigo-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <i className="fas fa-graduation-cap text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Student Examination Login</h2>
          <p className="text-gray-500">Access your exams with Roll No and DOB</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-600 text-sm font-bold mb-2">Roll Number</label>
            <input 
              type="text" required placeholder="Ex: S001"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-600 p-4 rounded-2xl outline-none transition"
              value={roll}
              onChange={e => setRoll(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-bold mb-2">Date of Birth</label>
            <input 
              type="date" required
              className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-600 p-4 rounded-2xl outline-none transition"
              value={dob}
              onChange={e => setDob(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded-lg">{error}</p>}
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
            Access Dashboard
          </button>
        </form>
        <div className="flex justify-between items-center mt-8">
           <button onClick={() => navigate('/')} className="text-gray-400 text-sm hover:text-indigo-600 transition">
             <i className="fas fa-chevron-left mr-2"></i> Home
           </button>
           <button onClick={() => navigate('/results')} className="text-indigo-600 text-sm font-bold hover:underline">
             Check Previous Results
           </button>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
