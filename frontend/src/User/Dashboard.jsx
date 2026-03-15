import React from 'react';
import { Search, Plus, CreditCard, Activity, ArrowRight, MapPin, FileText, Stethoscope, Calendar, Clock, Bell, List, User, Info, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DonorCard from './components/DonorCard';
import EmergencyRequest from './components/EmergencyRequest';
import useAuthStore from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000`;

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [notification, setNotification] = React.useState(null);

  // Socket — register user and listen for real-time notifications from doctors
  useSocket({
    onNotification: React.useCallback((data) => {
      setNotification(data);
      // Auto-dismiss after 6 seconds
      setTimeout(() => setNotification(null), 6000);
      // Re-fetch profile to sync latest appointment statuses
      if (user?.uid) {
        fetch(`${API_BASE}/api/user/profile?userId=${user.uid}`)
          .then(res => res.json())
          .then(d => { if (d.user) updateUser(d.user); })
          .catch(() => {});
      }
    }, [user?.uid, updateUser]),
  });

  // Sync latest user profile data from backend on mount
  React.useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!user?.uid) return;
      try {
        const response = await fetch(`${API_BASE}/api/user/profile?userId=${user.uid}`);
        const data = await response.json();
        // user_routes.py returns {"status": "success", "message": "...", "user": {...}}
        if (response.ok && data.user) {
          updateUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching latest profile:", error);
      }
    };
    fetchLatestProfile();
  }, [user?.uid, updateUser]);

  // Get the most recent upcoming appointment
  const upcomingAppointment = user?.appointments
    ?.filter(apt => apt.status === 'Upcoming')
    ?.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))?.[0];

  // Parse existing chronic diseases
  const getDiseases = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string' && data.trim()) return data.split(',').map(d => d.trim()).filter(Boolean);
    return [];
  };

  const profileDiseases = getDiseases(user?.chronicDiseases);
  const appointmentDiseases = getDiseases(upcomingAppointment?.chronicDiseases);
  
  // Find diseases added during booking that aren't in the main profile
  const missingDiseases = appointmentDiseases.filter(d => !profileDiseases.includes(d));
  
  const handleUpdateProfileDiseases = () => {
    const mergedDiseases = [...new Set([...profileDiseases, ...missingDiseases])];
    updateUser({ chronicDiseases: mergedDiseases });
  };

  return (
    <div className="flex min-h-screen bg-background-light transition-colors duration-300">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-12">
        {/* Real-time notification toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="fixed top-6 right-6 z-50 bg-white border border-green-200 shadow-2xl rounded-2xl p-5 flex items-center gap-4 max-w-md"
            >
              <div className="p-2.5 bg-green-50 rounded-xl text-green-600">
                <CheckCircle size={24} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-1">Live Update</p>
                <p className="text-sm text-slate-700 font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="flex justify-between items-center mb-14">
          <div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
              Welcome back, <span className="text-primary-600">{user?.name?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'Patient'}</span>
            </h2>
            <p className="text-slate-500 font-medium mt-1">Manage your healthcare appointments and life-saving contributions.</p>
          </div>
          <div className="flex items-center gap-4">
            {user?.bloodGroup && (
               <div className="flex flex-col items-center bg-white border border-slate-200 px-6 py-2 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood Group</span>
                  <span className="text-2xl font-black text-primary-600 leading-none">{user.bloodGroup}</span>
               </div>
            )}
            <button className="flex items-center gap-2 px-6 py-4 bg-primary-500 text-white rounded-2xl font-black shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-widest">
              <MapPin size={20} />
              {user?.city || 'Delhi'}
            </button>
          </div>
        </header>

        {/* Upcoming Appointment Section */}
        {upcomingAppointment && (
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary-50 rounded-2xl text-primary-600 border border-primary-100">
              <Calendar size={24} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Upcoming Appointment</h3>
          </div>
          
          <div className="bg-white rounded-4xl p-8 border border-slate-100 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:bg-primary-100 transition-colors duration-500"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8 items-start lg:items-center">
               <div className="flex items-start gap-5">
                  <div className="p-4 bg-primary-500 text-white rounded-2xl shadow-lg shadow-primary-500/20">
                     <Calendar size={32} />
                  </div>
                  <div>
                     <h4 className="text-2xl font-black text-slate-900 mb-1">{upcomingAppointment.hospitalName}</h4>
                     <p className="text-slate-500 font-medium flex items-center gap-2 mb-4">
                        <Stethoscope size={18} className="text-primary-400" />
                        {upcomingAppointment.ward} {upcomingAppointment.doctorName !== 'Not Specified' && `• ${upcomingAppointment.doctorName}`}
                     </p>
                     <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 font-bold text-sm uppercase tracking-widest rounded-xl border border-slate-100">
                           <Clock size={16} className="text-primary-500" />
                           {upcomingAppointment.date} at {upcomingAppointment.time}
                        </div>
                        <div className={`px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-widest border ${upcomingAppointment.priority === 'Urgent' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-primary-50 text-primary-600 border-primary-100'}`}>
                           Priority: {upcomingAppointment.priority}
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto mt-4 lg:mt-0">
                  <button 
                    onClick={() => setShowDetailsModal(true)}
                    className="flex-1 lg:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-slate-800 transition-colors whitespace-nowrap"
                  >
                     View Details
                  </button>
               </div>
            </div>
          </div>
        </section>
        )}

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-primary-50 rounded-2xl text-primary-600 border border-primary-100">
              <Activity size={24} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Quick Actions</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
            {/* Book Appointment Card */}
            <motion.div 
               whileHover={{ y: -5 }}
               onClick={() => navigate('/user/book-appointment')}
               className="group relative overflow-hidden bg-white rounded-[2.5rem] p-1 border border-slate-100 shadow-xl cursor-pointer"
            >
               <div className="absolute inset-0 bg-linear-to-br from-primary-600 to-red-700"></div>
               <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
               
               <div className="relative p-10 h-full flex flex-col items-start min-h-[280px]">
                  <div className="mb-6 p-4 bg-white/20 backdrop-blur-md rounded-3xl border border-white/30">
                     <Plus size={32} className="stroke-[3px]" />
                  </div>
                  <h4 className="text-4xl font-black mb-3 leading-tight tracking-tight">Book an <br/>Appointment</h4>
                  <p className="text-white/80 font-medium mb-auto text-lg">Secure your slot with our healthcare experts today.</p>
                  
                  <div className="mt-8 flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-2xl font-black text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                     Book Now <ArrowRight size={18} />
                  </div>
               </div>
            </motion.div>

            {/* Donor Card - Changes based on registration status */}
            {!user?.isBloodDonor ? (
              <motion.div 
                 whileHover={{ y: -5 }}
                 onClick={() => navigate('/user/donation')}
                 className="group relative overflow-hidden bg-white rounded-[2.5rem] p-1 border border-slate-100 shadow-xl cursor-pointer"
              >
                 <div className="absolute inset-0 bg-slate-900"></div>
                 <div className="absolute inset-0 bg-linear-to-tr from-primary-600/20 to-transparent"></div>
                 
                 <div className="relative p-10 h-full flex flex-col items-start min-h-[280px]">
                    <div className="mb-6 p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                       <CreditCard size={32} className="stroke-[3px]" />
                    </div>
                    <h4 className="text-4xl font-black mb-3 leading-tight tracking-tight">Become a <br/>Lifesaver</h4>
                    <p className="text-slate-400 font-medium mb-auto text-lg">Register as a blood or organ donor and save lives.</p>
                    
                    <div className="mt-8 flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                       Register Now <ArrowRight size={18} />
                    </div>
                 </div>
              </motion.div>
            ) : (
              <motion.div 
                 whileHover={{ y: -5 }}
                 onClick={() => navigate('/user/donation')}
                 className="group relative overflow-hidden bg-white rounded-[2.5rem] p-1 border border-slate-100 shadow-xl cursor-pointer"
              >
                 <div className="absolute inset-0 bg-slate-900"></div>
                 <div className="absolute inset-0 bg-linear-to-tr from-primary-600/20 to-transparent"></div>
                 
                 <div className="relative p-10 h-full flex flex-col items-start min-h-[280px]">
                    <div className="mb-6 p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                       <CreditCard size={32} className="stroke-[3px] text-white" />
                    </div>
                    <h4 className="text-4xl font-black mb-3 leading-tight tracking-tight text-white">Active <br/>Donor</h4>
                    <p className="text-slate-400 font-medium mb-auto text-lg">You're registered! View your donation profile and history.</p>
                    
                    <div className="mt-8 flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                       View Profile <ArrowRight size={18} />
                    </div>
                 </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Health Information Section */}
        {(profileDiseases.length > 0 || missingDiseases.length > 0) && (
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-red-50 rounded-2xl text-[#960018] border border-red-100">
              <FileText size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Health Information</h3>
          </div>
          
          <div className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-start gap-4">
               <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
                  <Stethoscope size={28} strokeWidth={2.5} />
               </div>
               <div className="flex-1">
                  <h4 className="text-xl font-black text-slate-900 mb-2 mt-1">Chronic Conditions</h4>
                  
                  {profileDiseases.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                       {profileDiseases.map((d, i) => (
                           <span key={i} className="text-slate-600 font-medium">
                              {d}{i < profileDiseases.length - 1 ? ', ' : ''}
                           </span>
                       ))}
                    </div>
                  )}

                  {missingDiseases.length > 0 && (
                    <div className="mt-4 p-5 bg-orange-50/50 border border-orange-100 rounded-2xl">
                       <p className="text-sm text-slate-600 font-medium mb-3">
                          You reported <span className="font-bold text-orange-600">{missingDiseases.join(', ')}</span> during your recent booking. 
                          <br className="hidden lg:block"/>Would you like to permanently add this to your profile?
                       </p>
                       <button 
                         onClick={handleUpdateProfileDiseases}
                         className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-colors shadow-md shadow-orange-500/20"
                       >
                         Update Profile
                       </button>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </section>
        )}

        {/* Emergency Requests Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-xl text-red-600">
                <Activity size={24} className="animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Emergency Requests in <span className="text-red-600">{user?.city || 'Delhi'}</span>
              </h3>
            </div>
            <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full border border-red-100">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-xs text-red-600 font-black uppercase tracking-widest">3 Live Requests</span>
            </div>
          </div>
          
          <div className="grid gap-4">
            <EmergencyRequest 
              hospital="AIIMS Trauma Centre"
              locality="Ansari Nagar East, Delhi"
              distance="2.4 km"
              urgency="Critical"
              bloodGroup="B+"
              type="Whole Blood"
              units="3"
              timeAgo="15 mins ago"
              variant="critical"
            />
            <EmergencyRequest 
              hospital="Fortis Escorts Heart Institute"
              locality="Okhla Road, Delhi"
              distance="5.1 km"
              urgency="Urgent"
              bloodGroup="O-"
              type="Platelets"
              units="2"
              timeAgo="45 mins ago"
              variant="urgent"
            />
          </div>

          <div className="mt-12">
            <button className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-600 font-black rounded-3xl hover:bg-slate-50 hover:border-primary-300 hover:text-primary-600 transition-all shadow-sm group mx-auto text-xs uppercase tracking-widest">
              View All Emergency Requests
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      </main>

      {/* Appointment Details Modal */}
      {showDetailsModal && upcomingAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDetailsModal(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-black text-slate-900">Appointment Details</h3>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Hospital Info */}
                <div className="p-6 bg-primary-50 rounded-2xl border border-primary-100">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-500 text-white rounded-xl">
                      <Calendar size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">Hospital</p>
                      <h4 className="text-xl font-black text-slate-900">{upcomingAppointment.hospitalName}</h4>
                    </div>
                  </div>
                </div>

                {/* Department & Doctor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Stethoscope size={20} className="text-primary-500" />
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Department</p>
                    </div>
                    <p className="text-lg font-black text-slate-900">{upcomingAppointment.ward}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <User size={20} className="text-primary-500" />
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Doctor</p>
                    </div>
                    <p className="text-lg font-black text-slate-900">{upcomingAppointment.doctorName}</p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar size={20} className="text-primary-500" />
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date</p>
                    </div>
                    <p className="text-lg font-black text-slate-900">{upcomingAppointment.date}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock size={20} className="text-primary-500" />
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Time</p>
                    </div>
                    <p className="text-lg font-black text-slate-900">{upcomingAppointment.time}</p>
                  </div>
                </div>

                {/* Priority & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-6 rounded-2xl border ${upcomingAppointment.priority === 'Urgent' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Info size={20} className={upcomingAppointment.priority === 'Urgent' ? 'text-red-500' : 'text-green-500'} />
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: upcomingAppointment.priority === 'Urgent' ? '#dc2626' : '#16a34a' }}>Priority</p>
                    </div>
                    <p className="text-lg font-black" style={{ color: upcomingAppointment.priority === 'Urgent' ? '#dc2626' : '#16a34a' }}>{upcomingAppointment.priority}</p>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity size={20} className="text-blue-500" />
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Status</p>
                    </div>
                    <p className="text-lg font-black text-blue-600">{upcomingAppointment.status}</p>
                  </div>
                </div>

                {/* Reason */}
                {upcomingAppointment.reason && (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText size={20} className="text-primary-500" />
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reason for Visit</p>
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed">{upcomingAppointment.reason}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => {
                      setShowDetailsModal(false);
                      navigate('/user/book-appointment');
                    }}
                    className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors"
                  >
                    View All Appointments
                  </button>
                  <button 
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
