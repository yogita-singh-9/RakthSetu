import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Stethoscope, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import DoctorSidebar from './components/DoctorSidebar';
import useAuthStore from '../store/useAuthStore';
import { motion } from 'framer-motion';

const DoctorAppointments = () => {
  const user = useAuthStore((state) => state.user);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'completed'

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const doctorName = user?.name || user?.fullName;
      const response = await fetch(
        `http://192.168.29.7:5000/api/doctor/appointments?doctorName=${encodeURIComponent(doctorName)}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, patientId, status, reason, doctorNote = null) => {
    try {
      const response = await fetch('http://192.168.29.7:5000/api/doctor/appointments/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId,
          patientId,
          status,
          reason,
          doctorNote
        })
      });

      if (response.ok) {
        setAppointments(appointments.map(apt => 
          apt.id === appointmentId ? { ...apt, status } : apt
        ));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const getFilteredAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    
    switch (filter) {
      case 'upcoming':
        return appointments.filter(apt => apt.date >= today && apt.status === 'Upcoming');
      case 'completed':
        return appointments.filter(apt => apt.status === 'Completed');
      default:
        return appointments;
    }
  };

  const filteredAppointments = getFilteredAppointments();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Completed':
        return 'bg-green-50 text-green-600 border-green-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getPriorityColor = (priority) => {
    return priority === 'Urgent' 
      ? 'bg-red-50 text-red-600 border-red-100' 
      : 'bg-slate-50 text-slate-600 border-slate-100';
  };

  return (
    <div className="flex min-h-screen bg-background-light">
      <DoctorSidebar />
      
      <main className="flex-1 ml-64 p-12">
        <header className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight mb-2">
            My <span className="text-primary-600">Appointments</span>
          </h2>
          <p className="text-slate-500 font-medium">View and manage all your patient appointments</p>
        </header>

        {/* Filter Tabs */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Filter size={20} />
            <span className="font-bold text-sm">Filter:</span>
          </div>
          <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm inline-flex">
            {[
              { id: 'all', label: 'All' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  filter === tab.id 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <span className="text-sm font-bold text-slate-600">
              Total: <span className="text-primary-600 text-lg">{filteredAppointments.length}</span>
            </span>
          </div>
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Calendar size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Appointments Found</h3>
            <p className="text-slate-500 font-medium">
              {filter === 'all' 
                ? "You don't have any appointments yet." 
                : `No ${filter} appointments found.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAppointments.map((apt, index) => (
              <motion.div
                key={apt.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl shrink-0">
                        <User size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-black text-slate-900">{apt.patientName || 'Patient'}</h3>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 font-medium mb-3">
                          <Phone size={16} className="text-slate-400" />
                          {apt.patientPhone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <Stethoscope size={16} className="text-slate-400" />
                          {apt.ward} • {apt.hospitalName}
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    {apt.reason && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-2xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Reason for Visit</p>
                        <p className="text-slate-700 font-medium">{apt.reason}</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Appointment Details */}
                  <div className="lg:w-80 space-y-4">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                      <Calendar size={20} className="text-primary-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date</p>
                        <p className="text-slate-900 font-bold">{apt.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                      <Clock size={20} className="text-primary-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Time</p>
                        <p className="text-slate-900 font-bold">{apt.time}</p>
                      </div>
                    </div>

                    <div className={`px-4 py-3 rounded-xl border ${getPriorityColor(apt.priority)}`}>
                      <div className="flex items-center gap-2">
                        {apt.priority === 'Urgent' ? (
                          <AlertCircle size={20} />
                        ) : (
                          <CheckCircle size={20} />
                        )}
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest">Priority</p>
                          <p className="font-black">{apt.priority}</p>
                        </div>
                      </div>
                    </div>

                    {apt.status === 'Upcoming' && (
                      <div className="flex flex-col gap-2">
                        {(apt.reason === 'Blood Donation Checkup' || apt.reason === 'Blood Donation Camp') ? (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(apt.id, apt.patientId, 'Passed', apt.reason)}
                              className="w-full px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-black text-sm uppercase tracking-widest transition-colors"
                            >
                              Pass (Eligible)
                            </button>
                            <button 
                              onClick={() => {
                                const note = window.prompt("Please provide a reason for rejecting this blood donation checkup:");
                                if (note === null) return; // User cancelled
                                handleUpdateStatus(apt.id, apt.patientId, 'Failed', apt.reason, note || 'Not specified');
                              }}
                              className="w-full px-6 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl font-black text-sm uppercase tracking-widest transition-colors"
                            >
                              Fail (Ineligible)
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleUpdateStatus(apt.id, apt.patientId, 'Completed', apt.reason)}
                            className="w-full px-6 py-3 bg-primary-600 text-white hover:bg-primary-700 rounded-xl font-black text-sm uppercase tracking-widest transition-colors"
                          >
                            Mark as Completed
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorAppointments;
