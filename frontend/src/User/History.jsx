import React, { useState } from 'react';
import { Calendar, Heart, Clock, Stethoscope, MapPin, Activity, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import useAuthStore from '../store/useAuthStore';

const History = () => {
  const user = useAuthStore((state) => state.user);
  const [filter, setFilter] = useState('all'); // 'all', 'appointments', 'donations'

  const appointments = user?.appointments || [];
  const donations = user?.donationHistory || [];

  // Combine and sort by date
  const allHistory = [
    ...appointments.map(apt => ({ ...apt, type: 'appointment', date: new Date(apt.date) })),
    ...donations.map(don => ({ ...don, type: 'donation', date: new Date(don.date) }))
  ].sort((a, b) => b.date - a.date);

  const filteredHistory = filter === 'all' 
    ? allHistory 
    : allHistory.filter(item => item.type === (filter === 'appointments' ? 'appointment' : 'donation'));

  return (
    <div className="flex min-h-screen bg-background-light">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-12">
        <header className="mb-12">
          <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
            My <span className="text-primary-600">History</span>
          </h2>
          <p className="text-slate-500 font-medium mt-2">View all your appointments and donation records</p>
        </header>

        {/* Filter Tabs */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Filter:</span>
          </div>
          <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm inline-flex">
            {['all', 'appointments', 'donations'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  filter === f 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
          <div className="ml-auto text-sm font-bold text-slate-400">
            {filteredHistory.length} {filteredHistory.length === 1 ? 'record' : 'records'}
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-4xl p-16 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Activity size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No History Found</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto">
              {filter === 'all' 
                ? "You don't have any appointments or donations recorded yet." 
                : `You don't have any ${filter} recorded yet.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredHistory.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                {item.type === 'appointment' ? (
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className="p-4 bg-primary-50 text-primary-600 rounded-2xl shrink-0">
                        <Calendar size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-black text-slate-900">{item.hospitalName}</h3>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            item.status === 'Upcoming' 
                              ? 'bg-blue-50 text-blue-600' 
                              : item.status === 'Completed'
                              ? 'bg-green-50 text-green-600'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium mb-4 flex items-center gap-2">
                          <Stethoscope size={16} className="text-slate-400" />
                          {item.ward} {item.doctorName !== 'Not Specified' && `• ${item.doctorName}`}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
                          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                            <Clock size={16} className="text-primary-500" />
                            {item.date.toLocaleDateString()} at {item.time}
                          </div>
                          {item.priority && (
                            <div className={`px-4 py-2 rounded-xl border ${
                              item.priority === 'Urgent' 
                                ? 'bg-red-50 border-red-100 text-red-600' 
                                : 'bg-slate-50 border-slate-100 text-slate-600'
                            }`}>
                              Priority: {item.priority}
                            </div>
                          )}
                        </div>
                        
                        {item.reason && (
                          <p className="mt-4 text-sm text-slate-500 font-medium">
                            <span className="font-bold text-slate-700">Reason:</span> {item.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className="p-4 bg-red-50 text-red-500 rounded-2xl shrink-0">
                        <Heart size={28} className="fill-current" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-black text-slate-900">Blood Donation</h3>
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600">
                            Completed
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium mb-4 flex items-center gap-2">
                          <MapPin size={16} className="text-slate-400" />
                          {item.location || user?.city || 'Not specified'}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
                          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                            <Clock size={16} className="text-red-500" />
                            {item.date.toLocaleDateString()}
                          </div>
                          <div className="px-4 py-2 rounded-xl border bg-red-50 border-red-100 text-red-600">
                            Blood Group: {user?.bloodGroup || 'N/A'}
                          </div>
                          {item.units && (
                            <div className="px-4 py-2 rounded-xl border bg-slate-50 border-slate-100 text-slate-600">
                              {item.units} {item.units === 1 ? 'unit' : 'units'}
                            </div>
                          )}
                        </div>
                        
                        {item.notes && (
                          <p className="mt-4 text-sm text-slate-500 font-medium">
                            <span className="font-bold text-slate-700">Notes:</span> {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredHistory.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={20} className="text-primary-500" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Appointments</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{appointments.length}</p>
            </div>
            
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Heart size={20} className="text-red-500 fill-current" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Donations</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{donations.length}</p>
            </div>
            
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Activity size={20} className="text-green-500" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Records</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{allHistory.length}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
