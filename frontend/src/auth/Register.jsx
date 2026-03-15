import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Phone, MapPin, Droplets, Calendar, ArrowRight, Activity, CreditCard, Search, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('user'); // 'user' or 'doctor'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    aadhaarNumber: '',
    phone: '',
    password: '',
    city: '',
    pincode: '',
    bloodGroup: '',
    dob: '',
    // Doctor specific fields
    specialization: '',
    medicalRegNumber: '',
    hospitalName: '',
    hospitalId: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState([]);

  useEffect(() => {
    if (role === 'doctor') {
      fetchHospitals();
    }
  }, [role]);

  useEffect(() => {
    if (hospitalSearch) {
      const filtered = hospitals.filter(hospital => 
        hospital.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
        hospital.city.toLowerCase().includes(hospitalSearch.toLowerCase())
      );
      setFilteredHospitals(filtered);
    } else {
      setFilteredHospitals(hospitals);
    }
  }, [hospitalSearch, hospitals]);

  const fetchHospitals = async () => {
    setLoadingHospitals(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/hospitals');
      const data = await response.json();
      if (response.ok) {
        setHospitals(data.hospitals || []);
        setFilteredHospitals(data.hospitals || []);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const handleHospitalSelect = (hospital) => {
    const depts = hospital.departments ? hospital.departments.split(',').map(d => d.trim()).filter(Boolean) : [];
    setAvailableDepartments(depts);
    setFormData({ 
      ...formData, 
      hospitalName: hospital.name,
      hospitalId: hospital.hospital_id,
      department: '' // Reset department when hospital changes
    });
    setHospitalSearch(hospital.name);
    setShowHospitalDropdown(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Sanitize phone number to E.164 format (Indian only: +91 + 10 digits)
    const rawPhone = formData.phone.replace(/\D/g, '');
    if (rawPhone.length !== 10) {
        setError('Please enter a valid 10-digit phone number');
        setLoading(false);
        return;
    }
    const sanitizedPhone = '+91' + rawPhone;

    try {
        const endpoint = role === 'user' 
            ? 'http://localhost:5000/api/auth/register' 
            : 'http://localhost:5000/api/auth/doctor-register';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...formData, phone: sanitizedPhone })
        });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        console.log('Registration successful', data);
        
        // Save to Zustand store with uid included
        const userWithUid = { ...formData, uid: data.uid, role: data.role, status: data.account_status };
        useAuthStore.getState().setAuth(userWithUid, null);
        
        // Redirection after registration
        if (role === 'doctor') {
            // Doctors might need to wait for approval, but for now redirecting as requested
            navigate('/doctor/dashboard');
        } else {
            navigate('/user/dashboard');
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left side: Branding */}
      <div className="hidden lg:flex w-1/3 flex-col justify-center items-center bg-[#960018] text-white p-12 relative overflow-hidden">
        {/* Background ambient light effects */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[40rem] h-[40rem] rounded-full bg-primary-500 blur-[120px] mix-blend-screen"></div>
            <div className="absolute top-[60%] -right-[10%] w-[30rem] h-[30rem] rounded-full bg-primary-400 blur-[100px] mix-blend-screen"></div>
        </div>
        
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="z-10 text-center"
        >
          <div className="mb-8 flex justify-center">
            <div className="p-5 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl">
               <Droplets size={56} className="text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-black mb-6 tracking-tight text-white">
            RaktSetu
          </h1>
          <p className="text-lg text-primary-100/90 font-medium leading-relaxed max-w-xs mx-auto">
            Your health journey starts here. Register to book appointments and save lives.
          </p>
        </motion.div>
      </div>

      {/* Right side: Registration Form */}
      <div className="w-full lg:w-2/3 flex justify-center items-center p-6 sm:p-12 relative overflow-hidden bg-linear-to-br from-[#FDF8F8] to-[#cb4c46]/10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full max-w-4xl z-10"
          >
            <div className="bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] w-full shadow-2xl border border-white/40">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 pb-8 border-b border-gray-100">
                    <div className="text-center md:text-left mb-6 md:mb-0">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight mb-2">Create Account</h2>
                        <p className="text-gray-500 font-bold">Join RaktSetu for healthcare & donations.</p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-sm font-bold text-gray-400 mb-1">Already have an account?</p>
                        <Link to="/auth/login" className="inline-flex items-center text-primary-600 font-black hover:text-primary-800 transition-colors">
                            Sign in instead <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </div>
                </div>

                {/* Role Selection */}
                <div className="flex justify-center mb-12">
                    <div className="bg-gray-50 p-2 rounded-2xl flex gap-3 border border-gray-100 shadow-sm">
                        <button 
                            type="button"
                            onClick={() => setRole('user')}
                            className={`px-10 py-3 rounded-xl font-black transition-all duration-300 ${role === 'user' ? 'bg-white shadow-md text-primary-600 border border-primary-100' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Patient / User
                        </button>
                        <button 
                            type="button"
                            onClick={() => setRole('doctor')}
                            className={`px-10 py-3 rounded-xl font-black transition-all duration-300 ${role === 'doctor' ? 'bg-white shadow-md text-primary-600 border border-primary-100' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Hospital Doctor
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Shared Info */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Personal Details</h3>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User size={18} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                    </div>
                                    <input 
                                        type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                                        className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail size={18} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                    </div>
                                    <input 
                                        type="email" name="email" value={formData.email} onChange={handleChange} required
                                        className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Aadhaar Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <CreditCard size={18} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                    </div>
                                    <input 
                                        type="text" name="aadhaarNumber" value={formData.aadhaarNumber} 
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                                            setFormData({ ...formData, aadhaarNumber: val });
                                        }} required
                                        className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium font-mono"
                                        placeholder="12 Digit Aadhaar Number"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
                                    <input 
                                        type="password" name="password" value={formData.password} onChange={handleChange} required
                                        className="block w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                                        placeholder="••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Phone</label>
                                    <input 
                                        type="tel" name="phone" value={formData.phone} 
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setFormData({ ...formData, phone: val });
                                        }} required
                                        className="block w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                                        placeholder="10 Digits"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Role Specific */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                {role === 'user' ? 'Medical Details' : 'Professional Details'}
                            </h3>
                            {role === 'user' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">City</label>
                                            <input 
                                                type="text" name="city" value={formData.city} onChange={handleChange} required
                                                className="block w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                                                placeholder="City"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Blood Group</label>
                                            <select 
                                                name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required
                                                className="block w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-bold appearance-none"
                                            >
                                                <option value="" disabled>Select</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Date of Birth</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Calendar size={18} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                            </div>
                                            <input 
                                                type="date" name="dob" value={formData.dob} onChange={handleChange} required
                                                className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-primary-50/50 rounded-2xl border border-primary-100/50">
                                        <p className="text-[11px] text-primary-700 font-bold leading-relaxed">
                                            Role: Patient. You can register as a blood or organ donor later from your dashboard.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Specialization</label>
                                            <input 
                                                type="text" name="specialization" value={formData.specialization} onChange={handleChange} required
                                                className="block w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                                                placeholder="Specialty"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Department</label>
                                            <select 
                                                name="department" value={formData.department} onChange={handleChange} required
                                                disabled={availableDepartments.length === 0}
                                                className="block w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-bold appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="" disabled>{availableDepartments.length === 0 ? 'Select hospital first' : 'Select Department'}</option>
                                                {availableDepartments.map(dept => (
                                                  <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                            {availableDepartments.length === 0 && (
                                              <p className="text-xs text-orange-600 mt-2 ml-1 font-medium">Select a hospital to see available departments</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Hospital Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Building2 size={18} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={hospitalSearch} 
                                                onChange={(e) => {
                                                  setHospitalSearch(e.target.value);
                                                  setShowHospitalDropdown(true);
                                                  if (!e.target.value) {
                                                    setFormData({ ...formData, hospitalName: '', hospitalId: '' });
                                                  }
                                                }}
                                                onFocus={() => setShowHospitalDropdown(true)}
                                                onBlur={() => setTimeout(() => setShowHospitalDropdown(false), 200)}
                                                required
                                                className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                                                placeholder="Search hospital..."
                                            />
                                            {loadingHospitals && (
                                              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                                              </div>
                                            )}
                                        </div>
                                        {showHospitalDropdown && hospitalSearch && filteredHospitals.length > 0 && (
                                          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                                            {filteredHospitals.map((hospital) => (
                                              <div
                                                key={hospital.hospital_id}
                                                onClick={() => handleHospitalSelect(hospital)}
                                                className="px-4 py-3 hover:bg-primary-50 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0"
                                              >
                                                <div className="font-bold text-gray-900">{hospital.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">{hospital.city} • {hospital.hospital_id}</div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        {showHospitalDropdown && filteredHospitals.length === 0 && hospitalSearch && (
                                          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 text-center text-gray-500 text-sm">
                                            No hospitals found
                                          </div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Medical Reg No.</label>
                                        <input 
                                            type="text" name="medicalRegNumber" value={formData.medicalRegNumber} onChange={handleChange} required
                                            className="block w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                                            placeholder="REG-123456"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="pt-2">
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex justify-center items-center gap-3 py-5 px-4 text-white rounded-[1.5rem] font-black text-xl transition-all shadow-xl ${
                                        loading
                                        ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                        : 'bg-primary-600 hover:bg-primary-700 transform active:scale-[0.98] shadow-primary-900/10'
                                    }`}
                                >
                                    {loading ? 'Processing...' : (role === 'user' ? 'Complete Registration' : 'Register for Approval')}
                                </button>
                                {error && (
                                    <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center font-bold">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
          </motion.div>
      </div>
    </div>
  );
};

export default Register;
