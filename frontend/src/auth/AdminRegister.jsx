import React, { useState } from 'react';
import { Mail, Lock, User, Key, ArrowRight, Droplets, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    secretKey: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = mode === 'login' 
        ? 'http://localhost:5000/api/auth/login'
        : 'http://localhost:5000/api/auth/admin-register';
      
      const payload = mode === 'login'
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Admin ${mode} failed`);
      }
      
      console.log(`Admin ${mode} successful`, data);
      
      // Save to Zustand store
      if (mode === 'login') {
        useAuthStore.getState().setAuth({ ...data.user, uid: data.uid }, data.idToken);
      } else {
        useAuthStore.getState().setAuth({ ...formData, uid: data.uid, role: 'admin' }, null);
      }
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left side: Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-[#960018] text-white p-12 relative overflow-hidden">
        {/* Background ambient light effects */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[40rem] h-[40rem] rounded-full bg-primary-500 blur-[120px] mix-blend-screen"></div>
          <div className="absolute top-[60%] -right-[10%] w-[30rem] h-[30rem] rounded-full bg-primary-400 blur-[100px] mix-blend-screen"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 text-center max-w-lg"
        >
          <div className="mb-10 flex justify-center">
            <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl">
              <ShieldCheck size={64} className="text-white" />
            </div>
          </div>
          <h1 className="text-7xl font-black mb-6 tracking-tight text-white drop-shadow-2xl">
            RaktSetu
          </h1>
          <p className="text-xl text-primary-100/90 font-medium leading-relaxed">
            Admin Registration Portal. <br/>
            Secure access for system administrators.
          </p>
        </motion.div>
      </div>

      {/* Right side: Admin Registration Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-6 sm:p-12 relative overflow-hidden bg-linear-to-br from-[#FDF8F8] to-[#cb4c46]/20">
        {/* Decorative blurs */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-40 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-40 mix-blend-multiply pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="w-full max-w-md z-10"
        >
          <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[2.5rem] w-full shadow-2xl border border-white/40">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl mb-4">
                <ShieldCheck size={32} className="text-primary-600" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight leading-tight">
                Admin {mode === 'login' ? 'Login' : 'Registration'}
              </h2>
              <p className="text-gray-500 font-bold">
                {mode === 'login' ? 'Access your administrator account.' : 'Create a new administrator account.'}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-50 p-2 rounded-2xl flex gap-3 border border-gray-100 shadow-sm">
                <button 
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`px-8 py-3 rounded-xl font-black transition-all duration-300 ${mode === 'login' ? 'bg-white shadow-md text-primary-600 border border-primary-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Login
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className={`px-8 py-3 rounded-xl font-black transition-all duration-300 ${mode === 'register' ? 'bg-white shadow-md text-primary-600 border border-primary-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Register
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 tracking-tight">Username</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                      placeholder="Admin Username"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 tracking-tight">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 tracking-tight">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 tracking-tight">Secret Key</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Key size={18} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input 
                      type="password" 
                      name="secretKey"
                      value={formData.secretKey}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                      placeholder="Enter admin secret key"
                      required
                    />
                  </div>
                  <p className="mt-2 ml-1 text-xs text-gray-500 font-medium">
                    Contact system administrator for the secret key.
                  </p>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center gap-3 py-5 px-4 mt-2 text-white rounded-[1.25rem] font-black text-xl transition-all shadow-xl shadow-primary-900/20 ${
                  loading 
                  ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-primary-600 hover:bg-primary-700 transform active:scale-[0.98]'
                }`}
              >
                {loading ? (mode === 'login' ? 'Signing in...' : 'Creating Account...') : (
                  <>{mode === 'login' ? 'Sign In' : 'Register Admin'} <ArrowRight size={22} className="stroke-[3px]" /></>
                )}
              </button>
              
              {error && (
                <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm text-center font-bold">
                  {error}
                </div>
              )}
            </form>

            <div className="mt-10 text-center pt-8 border-t border-gray-100">
              <p className="text-gray-500 font-bold text-sm">
                Not an admin?{' '}
                <Link to="/auth/login" className="text-primary-600 hover:text-primary-800 transition-colors underline decoration-primary-200 underline-offset-4 decoration-2 font-black">
                  User Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminRegister;
