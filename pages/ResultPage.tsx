
import React, { useState } from 'react';
import { getStudentResults } from '../store';
import { ExamAttempt } from '../types';

const ResultPage: React.FC = () => {
  const [roll, setRoll] = useState('');
  const [dob, setDob] = useState('');
  const [results, setResults] = useState<ExamAttempt[] | null>(null);
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const data = getStudentResults(roll, dob);
    if (!data) {
      setError('Student not found. Please check Roll Number and DOB.');
      setResults(null);
    } else {
      setError('');
      setResults(data);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Examination Results</h1>
          <p className="text-gray-500">Enter your credentials to view your performance report</p>
        </header>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-12">
          <form onSubmit={handleSearch} className="grid md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Roll Number</label>
              <input 
                type="text" required
                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition"
                placeholder="Ex: S001"
                value={roll}
                onChange={e => setRoll(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Date of Birth</label>
              <input 
                type="date" required
                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition"
                value={dob}
                onChange={e => setDob(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
              Fetch Report Card
            </button>
          </form>
          {error && <p className="mt-4 text-red-500 text-sm font-medium"><i className="fas fa-info-circle mr-2"></i>{error}</p>}
        </div>

        {results && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {results.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 text-gray-400">
                <i className="fas fa-search text-4xl mb-4"></i>
                <p>No completed exam records found for this student.</p>
              </div>
            ) : (
              results.map((res, i) => (
                <div key={i} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className={`p-6 flex justify-between items-center ${res.status === 'Pass' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                    <div>
                      <h3 className="text-2xl font-bold">{res.subjectCode} - Exam Result</h3>
                      <p className="opacity-80 text-sm">Attempted on: {new Date(res.startTime).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black">{Math.round((res.score! / res.totalMarks!) * 100)}%</div>
                      <div className="text-xs font-bold uppercase tracking-widest opacity-80">Aggregate Score</div>
                    </div>
                  </div>
                  <div className="p-8 grid md:grid-cols-4 gap-8">
                    <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Total Marks</p>
                      <p className="text-2xl font-bold text-gray-800">{res.totalMarks}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Obtained Marks</p>
                      <p className="text-2xl font-bold text-blue-600">{res.score}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Status</p>
                      <p className={`text-2xl font-bold ${res.status === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>{res.status}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Pass/Fail</p>
                      <div className={`flex justify-center mt-1 text-2xl ${res.status === 'Pass' ? 'text-green-500' : 'text-red-500'}`}>
                        <i className={`fas ${res.status === 'Pass' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
