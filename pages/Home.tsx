
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center text-center group hover:scale-[1.02] transition-transform cursor-pointer">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
            <i className="fas fa-user-shield text-3xl text-blue-600 group-hover:text-white"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Administrator Portal</h2>
          <p className="text-gray-600 mb-8">Manage students, create exams, and publish results.</p>
          <Link to="/admin-login" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Admin Login
          </Link>
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center text-center group hover:scale-[1.02] transition-transform cursor-pointer">
          <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
            <i className="fas fa-user-graduate text-3xl text-indigo-600 group-hover:text-white"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Portal</h2>
          <p className="text-gray-600 mb-8">Access assigned exams and check your performance.</p>
          <Link to="/student-login" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            Student Login
          </Link>
        </div>
      </div>
      <div className="fixed bottom-6 text-gray-400 text-sm">
        © 2025 EduQuest Systems. Secure Examination Environment.
      </div>
    </div>
  );
};

export default Home;
