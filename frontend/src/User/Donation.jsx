import React, { useState } from 'react';
import { Heart, Calendar, ArrowRight, ShieldCheck, Activity, MapPin, CheckCircle2, Clock, Building2, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import useAuthStore from '../store/useAuthStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Donation = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [lastDonation, setLastDonation] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingDonation, setIsLoggingDonation] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [donationDate, setDonationDate] = useState(new Date().toISOString().split('T')[0]);

  // New states for Appointment Booking Checkup Flow
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [camps, setCamps] = useState([]);
  const [loadingCamps, setLoadingCamps] = useState(false);
  const [bookingSlotKey, setBookingSlotKey] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    hospitalName: '',
    doctorName: '',
    appointmentDate: '',
    appointmentTime: ''
  });

  const hasPendingCheckup = () => {
    if (!user?.appointments) return false;
    return user.appointments.some(apt => apt.reason === 'Blood Donation Checkup' && apt.status === 'Upcoming');
  };

  React.useEffect(() => {
    if (!user?.isBloodDonor && !hasPendingCheckup()) {
      fetchHospitals();
    }
  }, [user]);

  React.useEffect(() => {
    if (formData.hospitalName) {
      fetchDoctors(formData.hospitalName);
    } else {
      setDoctors([]);
    }
  }, [formData.hospitalName]);

  React.useEffect(() => {
    fetchDonationCamps();
  }, [user?.city]);

  const fetchHospitals = async () => {
    setLoadingHospitals(true);
    try {
      const response = await fetch(`${API_BASE}/api/user/hospitals`);
      const data = await response.json();
      if (response.ok) {
        setHospitals(data.hospitals || []);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const fetchDoctors = async (hospitalName) => {
    setLoadingDoctors(true);
    try {
      const response = await fetch(`${API_BASE}/api/user/doctors?hospitalName=${encodeURIComponent(hospitalName)}`);
      const data = await response.json();
      if (response.ok) {
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchDonationCamps = async () => {
    setLoadingCamps(true);
    try {
      const city = user?.city ? `?city=${encodeURIComponent(user.city)}` : '';
      const response = await fetch(`${API_BASE}/api/user/donation-camps${city}`);
      const data = await response.json();
      if (response.ok) {
        setCamps(data.camps || []);
      } else {
        throw new Error(data.message || 'Failed to load donation camps');
      }
    } catch (error) {
      console.error('Error fetching donation camps:', error);
      setErrorMsg(error.message || 'Failed to load donation camps');
    } finally {
      setLoadingCamps(false);
    }
  };

  const openConfirmModal = (camp, slot) => {
    setSelectedCamp(camp);
    setSelectedSlot(slot);
    setBookingSuccess(false);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedCamp(null);
    setSelectedSlot(null);
    setBookingSuccess(false);
  };

  const handleBookCampSlot = async () => {
    if (!user?.uid || !selectedCamp || !selectedSlot) {
      setErrorMsg('Unable to identify user. Please log in again.');
      return;
    }

    const camp = selectedCamp;
    const slot = selectedSlot;
    const slotKey = `${camp.id}-${slot.id}`;
    setErrorMsg('');
    setSuccessMsg('');
    setBookingSlotKey(slotKey);

    try {
      const response = await fetch(`${API_BASE}/api/user/donation-camps/${camp.id}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.uid,
          slotId: slot.id
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to book donation slot');
      }

      setBookingSuccess(true);

      if (data.booking) {
        updateUser({
          donationCampBookings: [...(user?.donationCampBookings || []), data.booking],
          appointments: [...(user?.appointments || []), ...(data.appointment ? [data.appointment] : [])]
        });
      }

      await fetchDonationCamps();
    } catch (error) {
      setErrorMsg(error.message || 'Failed to book donation slot');
      setShowConfirmModal(false);
    } finally {
      setBookingSlotKey('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'hospitalName') {
      setFormData({ ...formData, [name]: value, doctorName: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Calculate if eligible (90 days since last donation)
  const isEligible = () => {
    if (!user?.lastDonationDate) return true;
    const lastDate = new Date(user.lastDonationDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 90;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreed) return;

    if (!user?.uid) {
      setErrorMsg('Unable to identify user. Please log in again.');
      return;
    }

    if (!formData.hospitalName || !formData.appointmentDate || !formData.appointmentTime) {
      setErrorMsg('Please select hospital, date, and time for your checkup.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const newAppointment = {
      id: Date.now().toString(),
      hospitalName: formData.hospitalName,
      ward: 'Blood Bank',
      doctorName: formData.doctorName || 'Not Specified',
      date: formData.appointmentDate,
      time: formData.appointmentTime,
      reason: 'Blood Donation Checkup',
      priority: 'Normal',
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
          userId: user.uid,
          ...newAppointment
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to book checkup appointment');
      }

      const updatedAppointments = [...(user?.appointments || []), newAppointment];
      
      updateUser({
        appointments: updatedAppointments
      });

      setSuccessMsg('Checkup booked successfully! Wait for doctor approval.');
    } catch (error) {
      setErrorMsg(error.message || 'Failed to book checkup appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogDonation = async () => {
    if (!user?.uid) {
      setErrorMsg('Unable to identify user. Please log in again.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsLoggingDonation(true);

    try {
      const newDonation = {
        id: Date.now().toString(),
        date: donationDate,
        location: user?.city || 'Not specified',
        units: 1,
        notes: 'Blood donation logged'
      };

      const updatedHistory = [...(user?.donationHistory || []), newDonation];

      const response = await fetch(`${API_BASE}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.uid,
          isBloodDonor: true,
          lastDonationDate: donationDate,
          donationHistory: updatedHistory
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to log donation');
      }

      if (data.user) {
        updateUser({
          ...data.user,
          bloodGroup: data.user.bloodGroup || data.user.blood_group || user?.bloodGroup || user?.blood_group
        });
      } else {
        updateUser({
          isBloodDonor: true,
          lastDonationDate: donationDate,
          donationHistory: updatedHistory
        });
      }

      setSuccessMsg('Donation logged successfully. Cooling period has started.');
    } catch (error) {
      setErrorMsg(error.message || 'Failed to log donation');
    } finally {
      setIsLoggingDonation(false);
    }
  };

  const RegistrationForm = () => {
    const pendingAppointment = user?.appointments?.find(apt => apt.reason === 'Blood Donation Checkup' && apt.status === 'Upcoming');

    if (pendingAppointment) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto bg-white rounded-3xl p-10 shadow-xl border border-slate-100"
        >
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-blue-100">
              <Clock size={40} className="fill-current text-blue-200" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Checkup Pending Approval</h3>
            <p className="text-slate-500 font-medium max-w-lg">You have already booked a checkup for blood donation. Please wait for the doctor to approve it before you can become a registered donor.</p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 space-y-6">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Appointment Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-primary-500">
                   <Building2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hospital</p>
                  <p className="font-bold text-slate-900">{pendingAppointment.hospitalName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-primary-500">
                   <Stethoscope size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Doctor</p>
                  <p className="font-bold text-slate-900">{pendingAppointment.doctorName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-primary-500">
                   <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                  <p className="font-bold text-slate-900">{pendingAppointment.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-primary-500">
                   <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                  <p className="font-bold text-slate-900">{pendingAppointment.time}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    const failedAppointments = user?.appointments?.filter(apt => apt.reason === 'Blood Donation Checkup' && apt.status === 'Failed') || [];
    const latestFailed = failedAppointments.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-3xl p-10 shadow-xl border border-slate-100"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
            <Heart size={40} className="fill-current" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Become a Lifesaver</h3>
          <p className="text-slate-500 font-medium">Book a quick checkup with a doctor to join our network of donors.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {latestFailed && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="text-red-800 font-bold text-lg mb-1">Previous Checkup Rejected</h4>
                  <p className="text-red-600 font-medium text-sm mb-3">Your checkup on {latestFailed.date} was rejected by {latestFailed.doctorName}.</p>
                  <div className="bg-white/60 p-4 rounded-xl border border-red-100">
                    <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-1">Doctor's Note</p>
                    <p className="text-red-700 font-bold">{latestFailed.doctorNote || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Hospital Selection */}
             <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select Hospital</label>
                <select 
                  name="hospitalName" 
                  value={formData.hospitalName} 
                  onChange={handleChange}
                  required
                  disabled={loadingHospitals}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-4 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium appearance-none"
                >
                  <option value="" disabled>{loadingHospitals ? 'Loading hospitals...' : 'Choose a hospital'}</option>
                  {hospitals.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                </select>
             </div>

             {/* Doctor Selection */}
             <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select Doctor (Optional)</label>
                <select 
                  name="doctorName" 
                  value={formData.doctorName} 
                  onChange={handleChange}
                  disabled={!formData.hospitalName || loadingDoctors}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-4 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium appearance-none"
                >
                  <option value="">{loadingDoctors ? 'Loading doctors...' : !formData.hospitalName ? 'Select hospital first' : doctors.length === 0 ? 'No doctors available' : 'Any Available Doctor'}</option>
                  {doctors.map(d => <option key={d.uid} value={d.fullName}>{d.fullName} - {d.specialization}</option>)}
                </select>
             </div>
             
             {/* Date Selection */}
             <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Preferred Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="date" 
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-12 py-4 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium"
                  />
                </div>
             </div>

             {/* Time Selection */}
             <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Preferred Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="time" 
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-12 py-4 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium"
                  />
                </div>
             </div>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex gap-4 cursor-pointer hover:bg-slate-100 transition-colors mt-6" onClick={() => setAgreed(!agreed)}>
            <div className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${agreed ? 'bg-red-500 border-red-500' : 'bg-white border-slate-300'}`}>
              {agreed && <CheckCircle2 size={16} className="text-white" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">I consent to booking a checkup to become a registered blood donor.</p>
              <p className="text-xs font-medium text-slate-500 mt-1">I agree to be checked by a doctor prior to being listed as a donor.</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!agreed || isSubmitting}
            className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${
              agreed 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20 active:scale-[0.98]' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isSubmitting ? 'Booking...' : 'Book Checkup Appointment'}
          </button>
        </form>
      </motion.div>
    );
  };

  const DonorDashboard = () => (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Donor Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-1 shadow-2xl"
      >
        <div className="absolute inset-0 bg-linear-to-br from-red-900 to-red-950"></div>
        <div className="absolute -right-32 -top-32 w-96 h-96 bg-red-600/30 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative bg-white/5 backdrop-blur-3xl rounded-[2.4rem] p-10 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 bg-white/10 rounded-full border border-white/20 flex flex-col items-center justify-center shadow-inner relative">
              <span className="text-xs font-black uppercase tracking-widest text-red-200 absolute top-4">Blood</span>
              <span className="text-5xl font-black text-white tracking-tighter mt-3">{user?.bloodGroup || user?.blood_group || 'O+'}</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck size={28} className="text-red-400" />
                <h3 className="text-3xl font-black text-white tracking-tight">Registered Donor</h3>
              </div>
              <p className="text-red-200 font-medium text-lg">{user?.name || user?.fullName}</p>
              
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg border border-white/10">
                  <MapPin size={16} className="text-red-300" />
                  <span className="text-xs font-black uppercase tracking-widest text-white">{user?.city || 'Delhi'}</span>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-black uppercase tracking-widest ${isEligible() ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-orange-500/20 text-orange-300 border-orange-500/30'}`}>
                  {isEligible() ? (
                    <>
                      <CheckCircle2 size={16} /> Eligible to Donate
                    </>
                  ) : (
                    <>
                      <Clock size={16} /> Cooling Period
                    </>
                  )}
                </div>
                {(() => {
                  const upcomingCamp = user?.appointments?.find(
                    apt => apt.reason === 'Blood Donation Camp' && apt.status === 'Upcoming'
                  );
                  if (!upcomingCamp) return null;
                  return (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs font-black uppercase tracking-widest animate-pulse">
                      <Calendar size={16} /> Donation on {upcomingCamp.date}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
          
          <div className="bg-black/20 rounded-2xl p-6 border border-white/5 text-center min-w-[200px]">
             <p className="text-[10px] font-black uppercase tracking-widest text-red-300/70 mb-2">Last Donated</p>
             <p className="text-2xl font-black text-white">{user?.lastDonationDate ? new Date(user.lastDonationDate).toLocaleDateString('en-GB') : 'Never'}</p>
          </div>
        </div>
      </motion.div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className={`bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 group ${isLoggingDonation ? 'opacity-80' : ''}`}
        >
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 transition-colors">
            <Activity size={32} />
          </div>
          <h4 className="text-2xl font-black text-slate-900 mb-2">Log a Blood Donation</h4>
          <p className="text-slate-500 font-medium mb-6">Just donated blood? Log it here to start your 90-day cooling period tracker.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Donation Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="date" 
                  value={donationDate}
                  max={new Date().toISOString().split('T')[0]} // Cannot log future donations
                  onChange={(e) => setDonationDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-12 py-3 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium"
                />
              </div>
            </div>
            
            <button 
              onClick={handleLogDonation}
              disabled={isLoggingDonation || !donationDate}
              className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                isLoggingDonation || !donationDate 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-[0.98]'
              }`}
            >
              {isLoggingDonation ? 'Updating...' : 'Save Record'}
            </button>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 group"
        >
          <div className="w-16 h-16 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center mb-6">
            <MapPin size={32} />
          </div>
          <h4 className="text-2xl font-black text-slate-900 mb-2">Nearby Blood Camps</h4>
          <p className="text-slate-500 font-medium mb-6">Find upcoming blood donation drives and camps in your city and reserve a slot.</p>

          {loadingCamps ? (
            <p className="text-sm font-semibold text-slate-500">Loading donation camps...</p>
          ) : camps.length === 0 ? (
            <p className="text-sm font-semibold text-slate-500">No active donation camps found in your city right now.</p>
          ) : (
            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
              {camps.map((camp) => (
                <div key={camp.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-900">{camp.name}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">{camp.date} | {camp.venue}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{camp.address}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(camp.slots || []).map((slot) => {
                      const slotKey = `${camp.id}-${slot.id}`;
                      const isBooking = bookingSlotKey === slotKey;
                      const isFull = Number(slot.available || 0) <= 0;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => openConfirmModal(camp, slot)}
                          disabled={isBooking || isFull}
                          className={`rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                            isFull
                              ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                              : isBooking
                                ? 'border-red-300 bg-red-100 text-red-700'
                                : 'border-red-200 bg-white text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {isBooking ? 'Booking...' : `${slot.time} (${slot.available} left)`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background-light font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-12 relative overflow-hidden">
        {/* Background Elements */}
        {!user?.isBloodDonor && (
          <>
            <div className="absolute top-[-10%] right-[-10%] w-160 h-160 bg-red-50/50 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-120 h-120 bg-slate-100/50 rounded-full blur-[80px] pointer-events-none"></div>
          </>
        )}

        <div className="relative z-10">
          <header className="mb-12">
            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Donation <span className="text-red-500">Network</span>
            </h2>
            <p className="text-slate-500 font-medium mt-2">View and manage your donation profiles.</p>
            {errorMsg && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {errorMsg}
              </p>
            )}
            {successMsg && (
              <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {successMsg}
              </p>
            )}
          </header>

          {user?.isBloodDonor ? <DonorDashboard /> : <RegistrationForm />}
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedCamp && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeConfirmModal}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
          >
            {bookingSuccess ? (
              /* Success state */
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Slot Booked!</h3>
                <p className="text-slate-500 font-medium mb-2">Your donation slot at <strong className="text-slate-700">{selectedCamp.name}</strong> has been reserved.</p>
                <p className="text-sm text-slate-400 font-medium mb-8">A doctor from the camp will verify and approve your donation once you visit.</p>
                <button
                  onClick={closeConfirmModal}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Confirmation state */
              <>
                <div className="bg-red-50 p-8 border-b border-red-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-100 rounded-xl text-red-600">
                      <Heart size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Confirm Donation Slot</h3>
                  </div>
                  <p className="text-slate-500 font-medium text-sm">Review the details below and confirm your booking.</p>
                </div>

                <div className="p-8 space-y-5">
                  {/* Camp Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-red-500 shrink-0">
                        <Building2 size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Camp</p>
                        <p className="font-bold text-slate-900">{selectedCamp.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-red-500 shrink-0">
                        <MapPin size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Venue</p>
                        <p className="font-bold text-slate-900">{selectedCamp.venue}</p>
                        <p className="text-xs text-slate-500 font-medium">{selectedCamp.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-red-500 shrink-0">
                        <Calendar size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                        <p className="font-bold text-slate-900">{selectedCamp.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-red-500 shrink-0">
                        <Clock size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Slot</p>
                        <p className="font-bold text-slate-900">{selectedSlot.time}</p>
                        <p className="text-xs text-slate-500 font-medium">{selectedSlot.available} spots remaining</p>
                      </div>
                    </div>
                  </div>

                  {/* Donor Info */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Details</p>
                    <p className="font-bold text-slate-900">{user?.name || user?.fullName}</p>
                    <p className="text-sm text-slate-500 font-medium">Blood Group: {user?.bloodGroup || user?.blood_group || 'Not specified'} • {user?.city || 'N/A'}</p>
                  </div>

                  <p className="text-xs text-slate-400 font-medium text-center">A doctor at the camp will verify your donation after your visit.</p>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={closeConfirmModal}
                      className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBookCampSlot}
                      disabled={!!bookingSlotKey}
                      className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-60"
                    >
                      {bookingSlotKey ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Donation;
