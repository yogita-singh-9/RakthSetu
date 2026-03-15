import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Stethoscope, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle2,
  Activity,
  User,
  List
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import useAuthStore from '../store/useAuthStore';
import ConfirmModal from '../components/ConfirmModal';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000';

const BookAppointment = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('book'); // 'book' or 'history'
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    hospitalName: '',
    ward: '',
    doctorName: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    priority: 'Normal',
  });

  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

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
    diseaseToDelete: null,
    appointmentToCancel: null
  });

  // Fetch all hospitals and doctors on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [hospitalsRes, doctorsRes] = await Promise.all([
          fetch(`${API_BASE}/api/user/hospitals`),
          fetch(`${API_BASE}/api/user/doctors`)
        ]);

        if (hospitalsRes.ok) {
          const hospData = await hospitalsRes.json();
          setHospitals(hospData.hospitals || []);
        }

        if (doctorsRes.ok) {
          const docData = await doctorsRes.json();
          setAllDoctors(docData.doctors || []);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter available doctors locally when hospital and department are selected
  React.useEffect(() => {
    if (formData.hospitalName && formData.ward) {
      const filtered = allDoctors.filter(doc => 
        doc.hospitalName === formData.hospitalName && 
        doc.department === formData.ward
      );
      setDoctors(filtered);
    } else {
      setDoctors([]);
    }
  }, [formData.hospitalName, formData.ward, allDoctors]);

  const handleHospitalChange = (e) => {
    const selectedHospital = hospitals.find(h => h.name === e.target.value);
    if (selectedHospital) {
      const depts = selectedHospital.departments ? selectedHospital.departments.split(',').map(d => d.trim()).filter(Boolean) : [];
      setDepartments(depts);
      setFormData({ ...formData, hospitalName: e.target.value, ward: '', doctorName: '' });
    }
  };

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
    setModalConfig({ isOpen: false, diseaseToDelete: null, appointmentToCancel: null });
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`${API_BASE}/api/user/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user?.uid })
      });

      const data = await response.json();

      if (response.ok) {
        const updatedAppointments = user.appointments.map(apt => 
          apt.id === appointmentId ? { ...apt, status: 'Cancelled' } : apt
        );
        updateUser({ appointments: updatedAppointments });
        setModalConfig({ isOpen: false, diseaseToDelete: null, appointmentToCancel: null });
      } else {
        throw new Error(data.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'ward') {
      setFormData({ ...formData, [name]: value, doctorName: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const newAppointment = {
      id: Date.now().toString(),
      hospitalName: formData.hospitalName,
      ward: formData.ward,
      doctorName: formData.doctorName || 'Not Specified',
      doctorId: doctors.find(d => d.fullName === formData.doctorName)?.uid || null,
      date: formData.appointmentDate,
      time: formData.appointmentTime,
      reason: formData.reason,
      priority: formData.priority,
      status: 'Upcoming',
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_BASE}/api/user/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.uid,
          ...newAppointment,
          chronicDiseases: diseasesList
        })
      });

      const data = await response.json();

      if (response.ok) {
        const updatedAppointments = [...(user?.appointments || []), newAppointment];
        updateUser({ 
          chronicDiseases: diseasesList,
          appointments: updatedAppointments
        });
        
        setLoading(false);
        setStep(3);
      } else {
        throw new Error(data.message || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to book appointment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDF8F8] font-sans">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-12 relative overflow-hidden">
        {/* Background Decorative Blurs */}
        <div className="absolute top-[-10%] right-[-10%] w-160 h-160 bg-primary-100/30 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-120 h-120 bg-slate-200/50 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <button 
                onClick={() => navigate('/user/dashboard')}
                className="group flex items-center gap-2 text-slate-400 hover:text-primary-600 font-black text-xs uppercase tracking-widest transition-all mb-4"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>
              <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {viewMode === 'book' ? (
                  <>Book <span className="text-primary-600">Appointment</span></>
                ) : (
                  <>My <span className="text-primary-600">Appointments</span></>
                )}
              </h2>
            </div>
            
            <div className="flex flex-col items-end gap-4">
              {/* View Toggle */}
              <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm inline-flex">
                 <button 
                   onClick={() => setViewMode('book')}
                   className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${viewMode === 'book' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                 >
                   Book New
                 </button>
                 <button 
                   onClick={() => setViewMode('history')}
                   className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'history' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                 >
                   <List size={14} />
                   History
                 </button>
              </div>

              {viewMode === 'book' && (
                <div className="flex items-center gap-2">
                    {[1, 2].map((s) => (
                        <div 
                            key={s} 
                            className={`w-3 h-3 rounded-full transition-all duration-500 ${step === s ? 'bg-primary-500 w-8' : 'bg-slate-200'}`}
                        ></div>
                    ))}
                </div>
              )}
            </div>
          </header>

          {viewMode === 'history' ? (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-6"
             >
               {(!user?.appointments || user.appointments.length === 0) ? (
                 <div className="bg-white/70 backdrop-blur-2xl p-16 rounded-[3rem] shadow-2xl shadow-slate-900/5 border border-white/40 text-center">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                     <Calendar size={32} />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 mb-2">No Appointments Yet</h3>
                   <p className="text-slate-500 font-medium max-w-md mx-auto">You haven't booked any appointments yet. Click 'Book New' to schedule a visit.</p>
                 </div>
               ) : (
                 <div className="grid gap-6">
                   {user.appointments.sort((a, b) => new Date(b.date) - new Date(a.date)).map((apt) => (
                     <div key={apt.id} className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-6">
                       <div className="flex items-start gap-5">
                         <div className="p-4 bg-primary-50 text-primary-600 rounded-2xl shrink-0">
                           <Calendar size={28} />
                         </div>
                         <div>
                           <div className="flex items-center gap-3 mb-2">
                             <h3 className="text-xl font-black text-slate-900">{apt.hospitalName}</h3>
                             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${apt.status === 'Upcoming' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                               {apt.status}
                             </span>
                           </div>
                           <p className="text-slate-600 font-medium mb-4 flex items-center gap-2">
                             <Stethoscope size={16} className="text-slate-400" />
                             {apt.ward} {apt.doctorName !== 'Not Specified' && `• ${apt.doctorName}`}
                           </p>
                           
                           <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
                             <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                               <Clock size={16} className="text-primary-500" />
                               {apt.date} at {apt.time}
                             </div>
                             <div className={`px-4 py-2 rounded-xl border ${apt.priority === 'Urgent' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                               Priority: {apt.priority}
                             </div>
                           </div>
                         </div>
                       </div>
                       
                       <div className="flex flex-col justify-end">
                         {apt.status === 'Upcoming' && (
                            <button 
                              onClick={() => setModalConfig({ 
                                isOpen: true, 
                                diseaseToDelete: null, 
                                appointmentToCancel: apt.id 
                              })}
                              className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-black text-xs uppercase tracking-widest transition-colors w-full md:w-auto text-center border border-red-100"
                            >
                              Cancel
                            </button>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </motion.div>
          ) : step < 3 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-2xl p-10 md:p-14 rounded-[3rem] shadow-2xl shadow-primary-900/5 border border-white/40"
            >
              <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit}>
                {step === 1 ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Hospital Details */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary-50 rounded-xl text-primary-600 border border-primary-100">
                                <Building2 size={20} />
                            </div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Hospital Choice</h3>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Hospital Name</label>
                          <select 
                            name="hospitalName" 
                            value={formData.hospitalName} 
                            onChange={handleHospitalChange}
                            required
                            disabled={loadingData}
                            className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 shadow-sm appearance-none cursor-pointer disabled:opacity-50"
                          >
                            <option value="" disabled>{loadingData ? 'Loading hospitals...' : 'Select Hospital'}</option>
                            {hospitals.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Department / Ward</label>
                          <select 
                            name="ward" 
                            value={formData.ward} 
                            onChange={handleChange}
                            required
                            disabled={!formData.hospitalName || departments.length === 0}
                            className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 shadow-sm appearance-none cursor-pointer disabled:opacity-50"
                          >
                            <option value="" disabled>{!formData.hospitalName ? 'Select hospital first' : departments.length === 0 ? 'No departments available' : 'Select Department'}</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Doctor Details */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary-50 rounded-xl text-primary-600 border border-primary-100">
                                <Stethoscope size={20} />
                            </div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Medical Professional</h3>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Doctor's Name (Optional)</label>
                          <select 
                            name="doctorName" 
                            value={formData.doctorName} 
                            onChange={handleChange}
                            disabled={!formData.ward || loadingData}
                            className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 shadow-sm appearance-none cursor-pointer disabled:opacity-50"
                          >
                            <option value="">{!formData.ward ? 'Select department first' : doctors.length === 0 ? 'No doctors available' : 'Any Available Doctor'}</option>
                            {doctors.map(d => <option key={d.uid} value={d.fullName}>{d.fullName} - {d.specialization}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Priority Level</label>
                          <div className="grid grid-cols-2 gap-3">
                              {['Normal', 'Urgent'].map(p => (
                                  <button 
                                    key={p}
                                    type="button"
                                    onClick={() => setFormData({...formData, priority: p})}
                                    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${formData.priority === p ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20' : 'bg-white text-slate-400 border-slate-100 hover:border-primary-200'}`}
                                  >
                                      {p}
                                  </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full flex justify-center items-center gap-2 py-5 bg-slate-900 text-white rounded-3xl font-black text-lg shadow-2xl hover:bg-slate-800 transition-all group"
                    >
                      Next Step <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       {/* Schedule Details */}
                       <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-primary-50 rounded-xl text-primary-600 border border-primary-100">
                                <Activity size={20} />
                             </div>
                             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Appointment Timing</h3>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Preferred Date</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                    <Calendar size={18} />
                                </div>
                                <input 
                                    type="date" 
                                    name="appointmentDate" 
                                    value={formData.appointmentDate} 
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-900 shadow-sm"
                                />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Preferred Time</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                    <Clock size={18} />
                                </div>
                                <input 
                                    type="time" 
                                    name="appointmentTime" 
                                    value={formData.appointmentTime} 
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-900 shadow-sm"
                                />
                            </div>
                          </div>
                       </div>

                       {/* Additional Health Info */}
                       <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-primary-50 rounded-xl text-primary-600 border border-primary-100">
                                <Stethoscope size={20} />
                             </div>
                             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Additional Health Info</h3>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Chronic Diseases (Optional)</label>
                            <p className="text-xs text-slate-400 mb-3 ml-1 font-medium">e.g., Blood Pressure, Diabetes, Asthma. This will be saved to your profile for future visits.</p>
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
                                    placeholder={diseasesList.length === 0 ? "e.g., Asthma (Press Enter)" : "Add more... (Press Enter)"}
                                 />
                               </div>
                             </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Description (Symptoms/Reason)</label>
                            <textarea 
                                name="reason" 
                                value={formData.reason} 
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full px-6 py-4 bg-white border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-900 shadow-sm resize-none"
                                placeholder="Describe your health concern..."
                            />
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-5 bg-white border border-slate-100 text-slate-600 rounded-3xl font-black text-lg hover:bg-slate-50 transition-all"
                      >
                        Back
                      </button>
                      <button 
                        type="submit"
                        disabled={loading}
                        className={`flex-2 py-5 text-white rounded-3xl font-black text-xl shadow-2xl transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 active:scale-[0.98] shadow-primary-500/20'}`}
                      >
                        {loading ? 'Confirming...' : 'Confirm Booking'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-16 rounded-[4rem] shadow-2xl text-center border border-slate-50"
            >
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <CheckCircle2 size={48} strokeWidth={3} />
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Booking Successful!</h3>
              <p className="text-slate-500 text-lg font-medium mb-12 max-w-md mx-auto leading-relaxed">
                Your appointment at <span className="text-slate-900 font-bold">{formData.hospitalName}</span> for <span className="text-slate-900 font-bold">{formData.ward}</span> has been scheduled for {formData.appointmentDate} at {formData.appointmentTime}.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/user/dashboard')}
                  className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Go to Dashboard
                </button>
                <button 
                  onClick={() => setStep(1)}
                  className="px-10 py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Book Another
                </button>
              </div>
            </motion.div>
          )}

          {/* User Info Footnote */}
          <div className="mt-12 text-center p-6 bg-primary-50/50 rounded-3xl border border-primary-100/30">
            <p className="text-sm text-primary-700/80 font-bold tracking-tight">
              Booking for: <span className="text-primary-700 underline underline-offset-4 font-black">{user?.name || user?.fullName || 'Health Patient'}</span>
            </p>
          </div>
        </div>
      </main>

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.diseaseToDelete ? "Remove Disease/Condition?" : "Cancel Appointment?"}
        message={
          modalConfig.diseaseToDelete 
            ? `Are you sure you want to remove "${modalConfig.diseaseToDelete}"? This action will take effect once you complete the booking.`
            : "Are you sure you want to cancel this appointment? This action cannot be undone."
        }
        onConfirm={() => {
          if (modalConfig.diseaseToDelete) {
            confirmDeleteDisease();
          } else if (modalConfig.appointmentToCancel) {
            handleCancelAppointment(modalConfig.appointmentToCancel);
          }
        }}
        onCancel={() => setModalConfig({ isOpen: false, diseaseToDelete: null, appointmentToCancel: null })}
        confirmText={modalConfig.diseaseToDelete ? "Remove" : "Cancel Appointment"}
      />
    </div>
  );
};

export default BookAppointment;
