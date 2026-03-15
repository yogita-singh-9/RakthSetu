import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building2, Stethoscope, CreditCard, Save, Edit2, X } from 'lucide-react';
import DoctorSidebar from './components/DoctorSidebar';
import useAuthStore from '../store/useAuthStore';
import { motion } from 'framer-motion';

const DoctorProfile = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialization: user?.specialization || '',
    medicalRegNumber: user?.registration_number || '',
    hospitalName: user?.hospital_name || '',
    hospitalId: user?.hospital_id || '',
    department: user?.department || '',
    aadhaarNumber: user?.aadhaarNumber || ''
  });

  useEffect(() => {
    fetchHospitals();
    setHospitalSearch(user?.hospital_name || '');
  }, []);

  useEffect(() => {
    // Load departments for the current hospital on mount
    if (user?.hospital_name && hospitals.length > 0) {
      const currentHospital = hospitals.find(h => h.name === user.hospital_name);
      if (currentHospital) {
        const depts = currentHospital.departments ? currentHospital.departments.split(',').map(d => d.trim()).filter(Boolean) : [];
        setAvailableDepartments(depts);
      }
    }
  }, [hospitals, user?.hospital_name]);

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
    try {
      const response = await fetch('http://192.168.29.7:5000/api/admin/hospitals');
      const data = await response.json();
      if (response.ok) {
        setHospitals(data.hospitals || []);
        setFilteredHospitals(data.hospitals || []);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
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

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update in backend
      const response = await fetch('http://192.168.29.7:5000/api/doctor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: user?.uid,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          medicalRegNumber: formData.medicalRegNumber,
          hospitalName: formData.hospitalName,
          hospitalId: formData.hospitalId,
          department: formData.department,
          aadhaarNumber: formData.aadhaarNumber
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update user in Zustand store
        updateUser({
          name: formData.fullName,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          registration_number: formData.medicalRegNumber,
          hospital_name: formData.hospitalName,
          hospital_id: formData.hospitalId,
          department: formData.department,
          aadhaarNumber: formData.aadhaarNumber
        });
        
        setLoading(false);
        setIsEditing(false);
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      specialization: user?.specialization || '',
      medicalRegNumber: user?.registration_number || '',
      hospitalName: user?.hospital_name || '',
      hospitalId: user?.hospital_id || '',
      department: user?.department || '',
      aadhaarNumber: user?.aadhaarNumber || ''
    });
    setHospitalSearch(user?.hospital_name || '');
    setIsEditing(false);
  };

  return (
    <div className="flex min-h-screen bg-background-light transition-colors duration-300">
      <DoctorSidebar />
      
      <main className="flex-1 ml-64 p-12">
        <header className="mb-14 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
              Doctor <span className="text-primary-600">Profile</span>
            </h2>
            <p className="text-slate-500 font-medium mt-1">Manage your professional information</p>
          </div>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-4 bg-primary-500 text-white rounded-2xl font-black shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all text-sm uppercase tracking-widest"
              >
                <X size={18} />
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black shadow-lg text-sm uppercase tracking-widest transition-all ${
                  loading 
                    ? 'bg-slate-400 text-white cursor-not-allowed' 
                    : 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/20'
                }`}
              >
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </header>

        <div className="max-w-5xl">
          {/* Personal Information */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary-50 rounded-2xl text-primary-600 border border-primary-100">
                <User size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personal Information</h3>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-slate-400" />
                    </div>
                    <input 
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail size={18} className="text-slate-400" />
                    </div>
                    <input 
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Phone Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone size={18} className="text-slate-400" />
                    </div>
                    <input 
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Aadhaar Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CreditCard size={18} className="text-slate-400" />
                    </div>
                    <input 
                      type="text"
                      name="aadhaarNumber"
                      value={formData.aadhaarNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium font-mono disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Professional Information */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100">
                <Stethoscope size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Professional Information</h3>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Specialization</label>
                  <input 
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Department</label>
                  <select 
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={!isEditing || availableDepartments.length === 0}
                    className="block w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-bold appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">{availableDepartments.length === 0 ? 'Select hospital first' : 'Select Department'}</option>
                    {availableDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {availableDepartments.length === 0 && isEditing && (
                    <p className="text-xs text-orange-600 mt-2 ml-1">Please select a hospital to see available departments</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Medical Registration Number</label>
                  <input 
                    type="text"
                    name="medicalRegNumber"
                    value={formData.medicalRegNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Hospital Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building2 size={18} className="text-slate-400" />
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
                      onFocus={() => isEditing && setShowHospitalDropdown(true)}
                      onBlur={() => setTimeout(() => setShowHospitalDropdown(false), 200)}
                      disabled={!isEditing}
                      className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="Search hospital..."
                    />
                  </div>
                  {showHospitalDropdown && isEditing && hospitalSearch && filteredHospitals.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                      {filteredHospitals.map((hospital) => (
                        <div
                          key={hospital.hospital_id}
                          onClick={() => handleHospitalSelect(hospital)}
                          className="px-4 py-3 hover:bg-primary-50 cursor-pointer transition-colors border-b border-slate-50 last:border-b-0"
                        >
                          <div className="font-bold text-slate-900">{hospital.name}</div>
                          <div className="text-xs text-slate-500 mt-1">{hospital.city} • {hospital.hospital_id}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Hospital ID</label>
                  <input 
                    type="text"
                    name="hospitalId"
                    value={formData.hospitalId}
                    disabled
                    className="block w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none font-medium font-mono opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-2 ml-1">Hospital ID is auto-filled when you select a hospital</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DoctorProfile;
