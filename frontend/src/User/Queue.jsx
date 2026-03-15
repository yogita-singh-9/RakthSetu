import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, List, FileText, User, Info, Clock, Users, ArrowLeft } from 'lucide-react';
import Sidebar from './components/Sidebar';
import useAuthStore from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import { useCallback } from 'react';

const Queue = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [queueData, setQueueData] = useState([]);

  // Get the most recent upcoming appointment to figure out which queue they belong to
  const upcomingAppointment = user?.appointments?.filter(apt => apt.status === 'Upcoming')?.sort((a, b) => new Date(a.date) - new Date(b.date))?.[0];
  const doctorId = upcomingAppointment?.doctorId;

  // Mock queue data representing "all queue data" for this department
  const mockQueue = [
    { id: 'T-1', token: 'A-12', name: 'Rahul S.', status: 'Serving', time: '10:00 AM' },
    { id: 'T-2', token: 'A-13', name: 'Priya M.', status: 'Waiting', time: '10:07 AM' },
    { id: 'T-3', token: 'A-14', name: 'Amit K.', status: 'Waiting', time: '10:14 AM' },
    { id: 'T-4', token: 'A-15', name: 'Neha V.', status: 'Waiting', time: '10:21 AM' },
    { id: 'T-5', token: 'A-16', name: 'Vikram B.', status: 'Waiting', time: '10:28 AM' },
    { id: 'T-6', token: 'A-17', name: 'Sonia G.', status: 'Waiting', time: '10:35 AM' },
    { id: 'T-7', token: 'A-18', name: user?.name || user?.fullName || 'You', status: 'Waiting (You)', time: '10:42 AM', isCurrentUser: true },
    { id: 'T-8', token: 'A-19', name: 'Rohan D.', status: 'Waiting', time: '10:49 AM' },
  ];

  useEffect(() => {
    setQueueData(mockQueue);
  }, []);

  // WebSocket for real-time queue updates
  const handleQueueUpdate = useCallback((data) => {
    console.log('Queue update received:', data);
    setQueueData(prev => 
      prev.map(item => 
        item.id === data.appointmentId 
          ? { ...item, status: data.status === 'completed' ? 'Completed' : data.status === 'in-progress' ? 'Serving' : 'Waiting' }
          : item
      )
    );
  }, []);

  useSocket({ doctorId, onQueueUpdate: handleQueueUpdate });

  return (
    <div className="flex min-h-screen bg-background-light font-sans">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-12 relative overflow-hidden">
        {/* Background Decorative Blurs */}
        <div className="absolute top-[-10%] right-[-10%] w-160 h-160 bg-red-100/30 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-120 h-120 bg-slate-200/50 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <button 
                onClick={() => navigate('/user/dashboard')}
                className="group flex items-center gap-2 text-slate-400 hover:text-red-500 font-black text-xs uppercase tracking-widest transition-all mb-4"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>
              <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Live <span className="text-red-500">Queue Status</span>
              </h2>
              {upcomingAppointment && (
                 <p className="text-slate-500 font-medium mt-2">
                    Viewing real-time queue for <strong className="text-slate-700">{upcomingAppointment.ward || 'Cardiology'}</strong> at {upcomingAppointment.hospitalName}.
                 </p>
              )}
            </div>
            
            {upcomingAppointment && (
              <div className="flex gap-4">
                 <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                       <Clock size={20} strokeWidth={2.5}/>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Wait Time</p>
                       <p className="font-bold text-slate-800">7 mins / patient</p>
                    </div>
                 </div>
              </div>
            )}
          </header>

          {!upcomingAppointment ? (
            <div className="bg-white/70 backdrop-blur-2xl p-16 rounded-[3rem] shadow-2xl shadow-slate-900/5 border border-white/40 text-center mt-12">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <List size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No Active Queue</h3>
              <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">You do not have any upcoming appointments for today. Book an appointment to join a queue.</p>
              <button 
                 onClick={() => navigate('/user/book-appointment')}
                 className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
              >
                 Book Appointment
              </button>
            </div>
          ) : (
            <>
              {/* Live Queue Status Banner (Mirroring Dashboard) */}
              <section className="mb-12">
                <div className="relative overflow-hidden bg-linear-to-br from-[#fc8576] to-[#eb6254] rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-[#fb998c]">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[80px] -mr-48 -mt-48 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-900/10 rounded-full blur-[60px] -ml-32 -mb-32 pointer-events-none"></div>

                  {/* Header & Bell */}
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <h3 className="text-xl font-black text-red-950 tracking-widest uppercase">Live Status</h3>
                    <div className="flex items-center gap-2">
                       <span className="relative flex h-3 w-3">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                       </span>
                       <span className="text-xs font-black text-white/90 uppercase tracking-widest mr-4">Live</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                    {/* Currently Being Treated */}
                    <div className="flex flex-col items-center flex-1 md:flex-none">
                      <div className="w-36 h-36 bg-[#3a1d1d] rounded-full border-[6px] border-[#912b2b] shadow-2xl flex items-center justify-center mb-4 relative z-10 shadow-red-900/50">
                        <div className="absolute inset-0 rounded-full border border-white/5 m-2 pointer-events-none"></div>
                        <span className="text-5xl font-black text-white tracking-tighter shadow-sm">A-12</span>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-red-950">Currently Being Treated</span>
                    </div>

                    {/* Your Token & Details */}
                    <div className="flex flex-col md:flex-row items-center md:items-stretch gap-10 flex-2 justify-end w-full">
                      {/* Token Numbers */}
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#a13b31] mb-1">Your Token Number</span>
                        <span className="text-7xl lg:text-8xl font-black text-red-950 tracking-tighter leading-none mb-6 drop-shadow-sm">A-18</span>
                        
                        <div className="w-full flex items-center justify-between text-[10px] font-black text-[#852a21] tracking-widest uppercase mb-2 px-2">
                           <span>5 Patients Ahead</span>
                           <span>15 Minutes</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#d4483a] rounded-full overflow-hidden shadow-inner">
                           <div className="w-1/3 h-full bg-red-950 rounded-full"></div>
                        </div>
                      </div>

                      {/* Info Card */}
                      <div className="bg-[#fef6f6]/95 backdrop-blur-md rounded-3xl p-6 lg:p-7 min-w-[260px] shadow-xl border border-white/60 space-y-5">
                         <div className="flex items-center gap-4">
                            <div className="text-red-900/80">
                               <List size={22} strokeWidth={2.5}/>
                            </div>
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Queue Position</p>
                               <p className="text-lg font-black text-slate-800 leading-snug">6 of 20</p>
                            </div>
                         </div>

                         <div className="flex items-center gap-4">
                            <div className="text-red-900/80">
                               <FileText size={22} strokeWidth={2.5}/>
                            </div>
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Department</p>
                               <p className="text-lg font-black text-[#c4362a] leading-snug truncate max-w-[150px]">{upcomingAppointment.ward || 'Cardiology'}</p>
                            </div>
                         </div>

                         <div className="flex items-center gap-4">
                            <div className="text-red-900/80">
                               <User size={22} strokeWidth={2.5}/>
                            </div>
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Doctor</p>
                               <p className="text-lg font-black text-slate-800 leading-snug truncate max-w-[150px]">{upcomingAppointment.doctorName !== 'Not Specified' ? upcomingAppointment.doctorName : 'Dr. Mehta'}</p>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Patient List Section */}
              <section>
                 <div className="flex items-center gap-3 mb-6">
                   <div className="p-2.5 bg-slate-100 rounded-2xl text-slate-600 border border-slate-200">
                     <Users size={24} />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">Full Queue Roster</h3>
                 </div>
                 
                 <div className="bg-white rounded-4xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest">
                             <th className="py-5 px-8">Queue #</th>
                             <th className="py-5 px-8">Token</th>
                             <th className="py-5 px-8">Patient Name</th>
                             <th className="py-5 px-8">Estimated Time</th>
                             <th className="py-5 px-8 text-right">Status</th>
                          </tr>
                       </thead>
                       <tbody>
                          <AnimatePresence>
                             {queueData.map((item, index) => (
                                <motion.tr 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  key={item.id} 
                                  className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors ${item.isCurrentUser ? 'bg-red-50/30' : ''}`}
                                >
                                   <td className="py-5 px-8 font-bold text-slate-400">{index + 1}</td>
                                   <td className="py-5 px-8">
                                      <span className={`px-4 py-1.5 rounded-xl font-black text-sm tracking-wider ${item.status === 'Serving' ? 'bg-[#3a1d1d] text-white' : item.isCurrentUser ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                         {item.token}
                                      </span>
                                   </td>
                                   <td className={`py-5 px-8 font-bold ${item.isCurrentUser ? 'text-red-900' : 'text-slate-700'}`}>
                                      {item.isCurrentUser ? (
                                         <div className="flex items-center gap-2">
                                            {item.name}
                                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] uppercase tracking-widest font-black">You</span>
                                         </div>
                                      ) : item.name}
                                   </td>
                                   <td className="py-5 px-8 font-medium text-slate-500">{item.time}</td>
                                   <td className="py-5 px-8 text-right">
                                      <span className={`inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest ${
                                         item.status === 'Serving' ? 'text-green-600' : item.isCurrentUser ? 'text-red-500' : 'text-slate-400'
                                      }`}>
                                         {item.status === 'Serving' && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                                         {item.status}
                                      </span>
                                   </td>
                                </motion.tr>
                             ))}
                          </AnimatePresence>
                       </tbody>
                    </table>
                 </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Queue;
