import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from './components/DoctorSidebar';
import useAuthStore from '../store/useAuthStore';
import { useSocket } from '../hooks/useSocket';

const DoctorQueue = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const doctorId = user?.uid;

  // Fetch today's appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`http://192.168.29.7:5000/api/doctor/appointments/today?doctorId=${doctorId}`);
        const data = await response.json();
        if (data.status === 'success') {
          setAppointments(data.appointments || []);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchAppointments();
    }
  }, [doctorId]);

  // WebSocket for real-time updates
  useSocket({
    doctorId,
    onQueueUpdate: (data) => {
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === data.appointmentId
            ? { ...apt, status: data.status }
            : apt
        )
      );
    },
  });

  const updateStatus = async (appointmentId, patientId, status) => {
    try {
      await fetch('http://192.168.29.7:5000/api/doctor/queue/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, patientId, doctorId, status })
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-orange-100 text-orange-700';
    }
  };

  return (
    <div className="flex min-h-screen bg-background-light">
      <DoctorSidebar />
      
      <main className="flex-1 ml-64 p-12">
        <header className="mb-10">
          <button 
            onClick={() => navigate('/doctor/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-primary-600 font-bold text-xs uppercase mb-4"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h2 className="text-4xl font-black text-slate-900">
            Today's <span className="text-primary-600">Queue</span>
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            Manage your appointments in real-time
          </p>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center">
            <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Appointments Today</h3>
            <p className="text-slate-500">You have no scheduled appointments for today.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt, index) => (
              <div 
                key={apt.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                      <span className="text-lg font-black text-primary-600">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">{apt.patientName || 'Patient'}</h4>
                      <p className="text-sm text-slate-500 font-medium">{apt.appointmentTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-xl font-bold text-xs uppercase ${getStatusColor(apt.status)}`}>
                      {apt.status || 'waiting'}
                    </span>
                    
                    <div className="flex gap-2">
                      {apt.status !== 'in-progress' && apt.status !== 'completed' && (
                        <button
                          onClick={() => updateStatus(apt.id, apt.patientId, 'in-progress')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700"
                        >
                          Start
                        </button>
                      )}
                      {apt.status === 'in-progress' && (
                        <button
                          onClick={() => updateStatus(apt.id, apt.patientId, 'completed')}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-xs hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorQueue;
