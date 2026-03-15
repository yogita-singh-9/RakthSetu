import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Droplets, UserIcon, Activity, ShieldCheck   } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('user'); // 'user', 'doctor', 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, role })
        });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        console.log('Login successful', data);
        
        // Save to Zustand store with uid included in user object
        const userWithUid = { ...data.user, uid: data.uid };
        useAuthStore.getState().setAuth(userWithUid, data.idToken);
        
        // Role-based redirection
        const userRole = data.user?.role || role;
        if (userRole === 'admin') {
            navigate('/admin/dashboard');
        } else if (userRole === 'doctor') {
            navigate('/doctor/dashboard');
        } else {
            navigate('/user/dashboard');
        }
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
               <Droplets size={64} className="text-white" />
            </div>
          </div>
          <h1 className="text-7xl font-black mb-6 tracking-tight text-white drop-shadow-2xl">
            RaktSetu
          </h1>
          <p className="text-xl text-primary-100/90 font-medium leading-relaxed">
            Smart Healthcare and Donation Network. <br/>
            Connecting lifesavers with those in critical need.
          </p>
        </motion.div>
      </div>

      {/* Right side: Login Form */}
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
                    <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight leading-tight">Welcome Back</h2>
                    <p className="text-gray-500 font-bold">Please enter your details to sign in.</p>
                </div>

                {/* Role Selection */}
                <div className="mb-8">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">SIGN IN AS</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'user', label: 'USER', icon: UserIcon },
                            { id: 'doctor', label: 'DOCTOR', icon: Activity },
                            { id: 'admin', label: 'ADMIN', icon: ShieldCheck }
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setRole(item.id)}
                                    className={`flex flex-col items-center justify-center py-5 px-2 rounded-2xl border transition-all duration-300 ${
                                        role === item.id 
                                        ? 'bg-white border-primary-500 text-primary-600 shadow-lg shadow-primary-500/10 ring-1 ring-primary-500/20' 
                                        : 'bg-gray-50/50 border-transparent text-gray-400 hover:bg-white hover:border-gray-200'
                                    }`}
                                >
                                    <div className={`p-2.5 rounded-xl mb-2 transition-colors ${role === item.id ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className={`text-[9px] font-black tracking-widest ${role === item.id ? 'text-primary-700' : 'text-gray-400'}`}>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 tracking-tight">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail size={18} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                                placeholder="name@example.com"
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 ml-1">
                        <div className="flex items-center">
                            <input type="checkbox" id="remember" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer" />
                            <label htmlFor="remember" className="ml-2 block text-sm font-bold text-gray-600 cursor-pointer">Remember me</label>
                        </div>
                        <a href="#" className="text-sm font-bold text-primary-700 hover:text-primary-800 transition-colors">
                            Forgot password?
                        </a>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center items-center gap-3 py-5 px-4 mt-2 text-white rounded-[1.25rem] font-black text-xl transition-all shadow-xl shadow-primary-900/20 ${
                            loading 
                            ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                            : 'bg-primary-600 hover:bg-primary-700 transform active:scale-[0.98]'
                        }`}
                    >
                        {loading ? 'Authenticating...' : (
                            <>Sign In <ArrowRight size={22} className="stroke-[3px]" /></>
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
                        Don't have an account?{' '}
                        <Link to="/auth/register" className="text-primary-600 hover:text-primary-800 transition-colors underline decoration-primary-200 underline-offset-4 decoration-2 font-black">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
          </motion.div>
      </div>
    </div>
  );
};

export default Login;
