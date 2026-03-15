import React, { useState, useEffect } from 'react';
import { Building2, UserCheck, Users, Activity, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import CreateHospitalModal from './components/CreateHospitalModal';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalHospitals: 0,
    pendingDoctors: 0,
    approvedDoctors: 0,
    totalUsers: 0
  });
  const [showCreateHospital, setShowCreateHospital] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats');
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalCreated = () => {
    fetchStats();
  };

  return (
    <div className="flex min-h-screen bg-background-light transition-colors duration-300">
      <AdminSidebar />
      
      <main className="flex-1 ml-64 p-12">
        <header className="mb-14">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
                Admin <span className="text-primary-600">Dashboard</span>
              </h2>
              <p className="text-slate-500 font-medium mt-1">Manage hospitals, doctors, and system operations.</p>
            </div>
            <button 
              onClick={() => setShowCreateHospital(true)}
              className="flex items-center gap-2 px-6 py-4 bg-primary-500 text-white rounded-2xl font-black shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
            >
              <Plus size={20} />
              Create Hospital
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="mb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <Building2 size={24} />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.totalHospitals}</h3>
              <p className="text-slate-500 font-medium text-sm">Registered Hospitals</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate('/admin/doctor-requests')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                  <UserCheck size={24} />
                </div>
                <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-lg text-xs font-black">
                  Pending
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.pendingDoctors}</h3>
              <p className="text-slate-500 font-medium text-sm">Doctor Requests</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                  <Activity size={24} />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.approvedDoctors}</h3>
              <p className="text-slate-500 font-medium text-sm">Approved Doctors</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                  <Users size={24} />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.totalUsers}</h3>
              <p className="text-slate-500 font-medium text-sm">Registered Users</p>
            </motion.div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-primary-50 rounded-2xl text-primary-600 border border-primary-100">
              <Activity size={24} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => navigate('/admin/hospitals')}
              className="group relative overflow-hidden bg-white rounded-[2.5rem] p-1 border border-slate-100 shadow-lg cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-red-700"></div>
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
              
              <div className="relative p-8 h-full flex flex-col items-start min-h-[200px]">
                <div className="mb-4 p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                  <Building2 size={28} className="text-white" />
                </div>
                <h4 className="text-3xl font-black mb-2 leading-tight tracking-tight text-white">Manage Hospitals</h4>
                <p className="text-white/80 font-medium text-sm">View and manage all registered hospitals</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => navigate('/admin/doctor-requests')}
              className="group relative overflow-hidden bg-white rounded-[2.5rem] p-1 border border-slate-100 shadow-lg cursor-pointer"
            >
              <div className="absolute inset-0 bg-slate-900"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-transparent"></div>
              
              <div className="relative p-8 h-full flex flex-col items-start min-h-[200px]">
                <div className="mb-4 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <UserCheck size={28} className="text-white" />
                </div>
                <h4 className="text-3xl font-black mb-2 leading-tight tracking-tight text-white">Review Doctors</h4>
                <p className="text-slate-400 font-medium text-sm">Approve or reject doctor registrations</p>
                {stats.pendingDoctors > 0 && (
                  <div className="mt-auto">
                    <span className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-black">
                      {stats.pendingDoctors} Pending
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <CreateHospitalModal 
        isOpen={showCreateHospital}
        onClose={() => setShowCreateHospital(false)}
        onSuccess={handleHospitalCreated}
      />
    </div>
  );
};

export default AdminDashboard;
