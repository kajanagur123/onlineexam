
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === '1234' && pass === '1234') {
      localStorage.setItem('admin_auth', 'true');
      navigate('/admin-dashboard');
    } else {
      setError('Invalid username or password (Hint: 1234/1234)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 p-10 rounded-3xl shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-lock text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-white">Administrator Access</h2>
          <p className="text-slate-400">Enter secure credentials to manage portal</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-slate-400 text-sm mb-2">Username</label>
            <input 
              type="text" required
              className="w-full bg-slate-900 border border-slate-700 text-white p-4 rounded-xl focus:border-blue-500 outline-none transition"
              value={user}
              onChange={e => setUser(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-2">Password</label>
            <input 
              type="password" required
              className="w-full bg-slate-900 border border-slate-700 text-white p-4 rounded-xl focus:border-blue-500 outline-none transition"
              value={pass}
              onChange={e => setPass(e.target.value)}
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            Sign In to Portal
          </button>
        </form>
        <button onClick={() => navigate('/')} className="w-full mt-4 text-slate-500 text-sm hover:text-white transition">
          <i className="fas fa-chevron-left mr-2"></i> Back to Main
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
