import React from 'react';
import { Calendar, Users, Clock, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from './components/DoctorSidebar';
import useAuthStore from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';

const MOCK_DOCTOR_PROFILE = {
  name: 'Dr. Hans',
  specialization: 'MD',
  hospitalName: 'City General Hospital'
};

const MOCK_STATS = {
  todayAppointments: 12,
  pendingPatients: 5,
  completedToday: 7,
  totalPatients: 156
};

const MOCK_UPCOMING_APPOINTMENTS = [
  { id: 1, patientName: 'Rajesh Kumar', time: '10:00 AM', type: 'Consultation', priority: 'Normal' },
  { id: 2, patientName: 'Priya Sharma', time: '10:30 AM', type: 'Follow-up', priority: 'Urgent' },
  { id: 3, patientName: 'Amit Patel', time: '11:00 AM', type: 'Consultation', priority: 'Normal' },
  { id: 4, patientName: 'Neha Verma', time: '11:30 AM', type: 'Routine Checkup', priority: 'Normal' },
  { id: 5, patientName: 'Rohit Singh', time: '12:00 PM', type: 'Blood Donation Checkup', priority: 'Urgent' },
];

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [pendingCount, setPendingCount] = React.useState(5);

  // Socket — register doctor and listen for queue changes
  useSocket({
    doctorId: user?.uid,
    onQueueUpdate: React.useCallback((data) => {
      console.log('[Doctor Dashboard] Queue update:', data);
      // Decrement pending if completed, keep as-is for in-progress
      if (data.status === 'completed') {
        setPendingCount(prev => Math.max(0, prev - 1));
      }
    }, []),
  });

  const doctorName = user?.name || user?.fullName || MOCK_DOCTOR_PROFILE.name;
  const doctorSpecialization = user?.specialization || MOCK_DOCTOR_PROFILE.specialization;
  const doctorHospital = user?.hospitalName || user?.hospital_name || MOCK_DOCTOR_PROFILE.hospitalName;

  const stats = {
    ...MOCK_STATS,
    pendingPatients: pendingCount
  };

  const upcomingAppointments = MOCK_UPCOMING_APPOINTMENTS;

  return (
    <div className="flex min-h-screen bg-background-light transition-colors duration-300">
      <DoctorSidebar />
      
      <main className="flex-1 ml-64 p-12">
        <header className="mb-14">
          <div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
              Welcome, <span className="text-primary-600">
                {(() => {
                  const fullName = doctorName;
                  const nameParts = fullName.split(' ');
                  // Remove 'Dr' or 'Dr.' from the beginning if present
                  const firstName = nameParts.find(part => 
                    !part.toLowerCase().startsWith('dr') && part.trim() !== ''
                  ) || nameParts[0];
                  return `Dr. ${firstName}`;
                })()}
              </span>
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              {doctorSpecialization} • {doctorHospital}
            </p>
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
                  <Calendar size={24} />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.todayAppointments}</h3>
              <p className="text-slate-500 font-medium text-sm">Total Appointments</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate('/doctor/queue')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                  <Clock size={24} />
                </div>
                <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-lg text-xs font-black">
                  Active
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.pendingPatients}</h3>
              <p className="text-slate-500 font-medium text-sm">In Queue</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                  <CheckCircle size={24} />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Done</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.completedToday}</h3>
              <p className="text-slate-500 font-medium text-sm">Completed Today</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate('/doctor/patients')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                  <Users size={24} />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">{stats.totalPatients}</h3>
              <p className="text-slate-500 font-medium text-sm">Total Patients</p>
            </motion.div>
          </div>
        </section>

        {/* Upcoming Appointments */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary-50 rounded-2xl text-primary-600 border border-primary-100">
              <Calendar size={24} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Upcoming Appointments</h3>
          </div>

          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                      <Users size={24} className="text-primary-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">{appointment.patientName}</h4>
                      <p className="text-sm text-slate-500 font-medium">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                      <Clock size={16} className="text-primary-500" />
                      <span className="text-sm font-bold text-slate-700">{appointment.time}</span>
                    </div>
                    <div className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider ${
                      appointment.priority === 'Urgent' 
                        ? 'bg-red-50 text-red-600 border border-red-100' 
                        : 'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                      {appointment.priority}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary-50 rounded-2xl text-primary-600 border border-primary-100">
              <Activity size={24} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => navigate('/doctor/queue')}
              className="group relative overflow-hidden bg-white rounded-3xl p-8 border border-slate-100 shadow-lg cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="mb-4 p-3 bg-primary-50 rounded-2xl text-primary-600 w-fit group-hover:bg-white/20 group-hover:text-white transition-all">
                  <Clock size={28} />
                </div>
                <h4 className="text-xl font-black mb-2 text-slate-900 group-hover:text-white transition-colors">View Queue</h4>
                <p className="text-slate-500 font-medium text-sm group-hover:text-white/80 transition-colors">Check waiting patients</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => navigate('/doctor/appointments')}
              className="group relative overflow-hidden bg-white rounded-3xl p-8 border border-slate-100 shadow-lg cursor-pointer"
            >
              <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="mb-4 p-3 bg-slate-50 rounded-2xl text-slate-600 w-fit group-hover:bg-white/10 group-hover:text-white transition-all">
                  <Calendar size={28} />
                </div>
                <h4 className="text-xl font-black mb-2 text-slate-900 group-hover:text-white transition-colors">All Appointments</h4>
                <p className="text-slate-500 font-medium text-sm group-hover:text-slate-300 transition-colors">Manage schedule</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => navigate('/doctor/patients')}
              className="group relative overflow-hidden bg-white rounded-3xl p-8 border border-slate-100 shadow-lg cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="mb-4 p-3 bg-purple-50 rounded-2xl text-purple-600 w-fit group-hover:bg-white/20 group-hover:text-white transition-all">
                  <Users size={28} />
                </div>
                <h4 className="text-xl font-black mb-2 text-slate-900 group-hover:text-white transition-colors">Patient Records</h4>
                <p className="text-slate-500 font-medium text-sm group-hover:text-white/80 transition-colors">View patient history</p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DoctorDashboard;
