import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  MapPin, 
  Activity, 
  Save, 
  LogOut, 
  ShieldCheck, 
  Droplets,
  Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import useAuthStore from '../store/useAuthStore';
import ConfirmModal from '../components/ConfirmModal';

const Profile = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [diseasesList, setDiseasesList] = useState(() => {
    if (Array.isArray(user?.chronicDiseases)) return user.chronicDiseases;
    if (typeof user?.chronicDiseases === 'string' && user.chronicDiseases.trim()) {
      return user.chronicDiseases.split(',').map(d => d.trim()).filter(Boolean);
    }
    return [];
  });
  const [diseaseInput, setDiseaseInput] = useState('');
  
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    diseaseToDelete: null
  });

  const handleDiseaseKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = diseaseInput.trim();
      if (val && !diseasesList.includes(val)) {
        setDiseasesList([...diseasesList, val]);
      }
      setDiseaseInput('');
    }
  };

  const confirmDeleteDisease = () => {
    if (modalConfig.diseaseToDelete) {
      setDiseasesList(diseasesList.filter(d => d !== modalConfig.diseaseToDelete));
    }
    setModalConfig({ isOpen: false, diseaseToDelete: null });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://192.168.29.7:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.uid,
          chronicDiseases: diseasesList
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Save updated chronic diseases to the user profile
        updateUser({ chronicDiseases: diseasesList });
        
        setLoading(false);
        setSuccessMsg('Health information updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  // Helper to determine role badge color
  const getRoleBadgeColor = (role) => {
    if (role === 'doctor') return 'bg-blue-50 text-blue-600 border-blue-100';
    if (role === 'admin') return 'bg-purple-50 text-purple-600 border-purple-100';
    return 'bg-emerald-50 text-emerald-600 border-emerald-100'; // Default user/patient
  };

  return (
    <div className="flex min-h-screen bg-background-light font-sans">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-12 relative overflow-hidden">
        {/* Background Decorative Blurs */}
        <div className="absolute top-[-10%] right-[-10%] w-160 h-160 bg-primary-100/30 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-12">
            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight mb-2">
              My <span className="text-primary-600">Profile</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg">Manage your personal and health information.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: User Identity Card */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="lg:col-span-1 space-y-8"
            >
               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl relative overflow-hidden text-center group">
                  <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-primary-50 to-white"></div>
                  
                  <div className="relative z-10">
                     <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center text-primary-500 text-5xl font-black mx-auto mb-6 z-10 relative">
                        {user?.name?.[0] || user?.fullName?.[0] || 'U'}
                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
                     </div>
                     
                     <h3 className="text-2xl font-black text-slate-900 mb-1">{user?.name || user?.fullName || 'User'}</h3>
                     <p className="text-slate-500 font-medium mb-6 flex items-center justify-center gap-2">
                        <Mail size={16} />
                        {user?.email || 'user@example.com'}
                     </p>
                     
                     <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${getRoleBadgeColor(user?.role)}`}>
                        <ShieldCheck size={16} />
                        {user?.role || 'Patient'}
                     </div>
                  </div>
               </div>

               {/* Blood Group Quick Card */}
               {user?.bloodGroup && (
               <div className="bg-[#960018] text-white rounded-[2.5rem] p-8 shadow-lg shadow-[#960018]/20 relative overflow-hidden group">
                  <div className="absolute right-0 bottom-0 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
                  <div className="flex items-center justify-between relative z-10 w-full">
                     <div>
                        <p className="text-white/80 text-xs font-black uppercase tracking-widest mb-1">Blood Group</p>
                        <h4 className="text-5xl font-black drop-shadow-sm">{user.bloodGroup}</h4>
                     </div>
                     <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                        <Droplets size={32} className="text-white" />
                     </div>
                  </div>
               </div>
               )}

            </motion.div>

            {/* Right Column: Details & Edit Forms */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="lg:col-span-2 space-y-8"
            >
               {/* Personal Information Setup */}
               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl relative text-left">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                        <UserIcon size={24} />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personal Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                     <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                        <p className="text-lg font-bold text-slate-900">{user?.name || user?.fullName || 'Not Provided'}</p>
                     </div>
                     <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Aadhaar Number</p>
                        <p className="text-lg font-bold text-slate-900 tracking-widest font-mono">
                           {user?.aadhaarNumber ? `XXXX-XXXX-${String(user.aadhaarNumber).slice(-4)}` : 'XXXX-XXXX-0000'}
                        </p>
                     </div>
                     <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                        <div className="flex items-center gap-2">
                           <MapPin size={18} className="text-slate-400" />
                           <p className="text-lg font-bold text-slate-900 truncate">{user?.city || 'Not Provided'}</p>
                        </div>
                     </div>
                     <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                        <p className="text-lg font-bold text-slate-900 truncate">{user?.phone || 'Not Provided'}</p>
                     </div>
                  </div>
                  
                  <p className="text-xs text-slate-400 italic">Core details can only be changed by contacting support.</p>
               </div>

               {/* Health Information Form */}
               <div className="bg-white rounded-[2.5rem] p-10 md:p-12 border border-slate-100 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 text-[#960018] rounded-2xl">
                           <Activity size={24} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Health Information</h3>
                     </div>
                     {successMsg && (
                        <span className="text-emerald-500 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-lg animate-pulse">
                           {successMsg}
                        </span>
                     )}
                  </div>

                  <form onSubmit={handleSave} className="space-y-6">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Chronic Diseases / Conditions</label>
                        <p className="text-xs text-slate-400 mb-3 ml-1 font-medium">Keep this updated to ensure faster and more accurate medical care during appointments or emergencies.</p>
                         <div className="relative">
                           <div className="w-full px-5 py-5 min-h-[120px] bg-white border border-slate-200 rounded-3xl outline-none focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:border-slate-300 transition-all font-medium text-slate-900 shadow-sm flex flex-wrap content-start gap-2">
                             <AnimatePresence>
                               {diseasesList.map((disease, idx) => (
                                 <motion.div 
                                   initial={{ opacity: 0, scale: 0.8 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   exit={{ opacity: 0, scale: 0.8 }}
                                   key={idx} 
                                   className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-[#960018] rounded-xl text-sm font-bold border border-red-100/50"
                                 >
                                   {disease}
                                   <button 
                                     type="button"
                                     onClick={() => setModalConfig({ isOpen: true, diseaseToDelete: disease })}
                                     className="p-0.5 rounded-full hover:bg-red-200/50 text-[#960018]/60 hover:text-[#960018] transition-colors"
                                   >
                                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                   </button>
                                 </motion.div>
                               ))}
                             </AnimatePresence>
                             <input 
                                type="text"
                                value={diseaseInput} 
                                onChange={(e) => setDiseaseInput(e.target.value)}
                                onKeyDown={handleDiseaseKeyDown}
                                className="flex-1 min-w-[150px] bg-transparent outline-none border-none py-1.5 text-slate-900 placeholder:text-slate-400"
                                placeholder={diseasesList.length === 0 ? "e.g., Blood Pressure, Diabetes (Press Enter)" : "Add more... (Press Enter)"}
                             />
                           </div>
                         </div>
                     </div>
                     
                     <div className="flex justify-end">
                        <button 
                           type="submit"
                           disabled={loading}
                           className={`flex items-center justify-center gap-3 px-8 py-3.5 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#960018] hover:bg-[#7a0013] active:scale-[0.98] shadow-[#960018]/20'}`}
                        >
                           <Save size={18} />
                           {loading ? 'Saving...' : 'Save Health Data'}
                        </button>
                     </div>
                  </form>
               </div>

               {/* Danger Zone / Global Actions */}
               <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl mt-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div>
                        <h4 className="text-xl font-black text-slate-900 mb-2">Account Access</h4>
                        <p className="text-slate-500 text-sm">Securely sign out of your RaktSetu profile.</p>
                     </div>
                     
                     <button 
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-3 px-8 py-3.5 bg-red-50 text-[#960018] hover:bg-red-100 rounded-2xl font-black text-sm uppercase tracking-widest transition-colors group"
                     >
                        <LogOut size={16} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                     </button>
                  </div>
               </div>

            </motion.div>
          </div>
        </div>
      </main>

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        title="Remove Disease/Condition?"
        message={`Are you sure you want to remove "${modalConfig.diseaseToDelete}" from your health profile? This action will take effect once you click "Save Health Data".`}
        onConfirm={confirmDeleteDisease}
        onCancel={() => setModalConfig({ isOpen: false, diseaseToDelete: null })}
        confirmText="Remove"
      />
    </div>
  );
};

export default Profile;
