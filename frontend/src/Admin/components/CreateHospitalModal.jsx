import React, { useState } from 'react';
import { X, Building2, MapPin, Phone, Mail, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateHospitalModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    hospitalId: '',
    address: '',
    city: '',
    pincode: '',
    phone: '',
    email: '',
    type: 'Government'
  });
  const [departmentsList, setDepartmentsList] = useState([]);
  const [departmentInput, setDepartmentInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Common department suggestions
  const departmentSuggestions = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology',
    'Dermatology', 'ENT', 'Ophthalmology', 'Psychiatry', 'Radiology',
    'Pathology', 'General Surgery', 'Dental', 'Emergency', 'ICU',
    'Oncology', 'Nephrology', 'Gastroenterology', 'Urology', 'Pulmonology',
    'Endocrinology', 'Rheumatology', 'Anesthesiology', 'General OPD'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDepartmentKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDepartment(departmentInput.trim());
    }
  };

  const addDepartment = (dept) => {
    if (dept && !departmentsList.includes(dept)) {
      setDepartmentsList([...departmentsList, dept]);
    }
    setDepartmentInput('');
    setShowSuggestions(false);
  };

  const removeDepartment = (dept) => {
    setDepartmentsList(departmentsList.filter(d => d !== dept));
  };

  const filteredSuggestions = departmentSuggestions.filter(
    s => s.toLowerCase().includes(departmentInput.toLowerCase()) && !departmentsList.includes(s)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/admin/create-hospital', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          departments: departmentsList.join(', ')
        })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create hospital');
      }
      
      onSuccess();
      onClose();
      setFormData({
        name: '',
        hospitalId: '',
        address: '',
        city: '',
        pincode: '',
        phone: '',
        email: '',
        type: 'Government'
      });
      setDepartmentsList([]);
      setDepartmentInput('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-8 rounded-t-[2.5rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
              <Building2 size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900">Create Hospital</h2>
              <p className="text-slate-500 font-medium text-sm">Add a new hospital to the system</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Hospital Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 size={18} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                  placeholder="AIIMS Delhi"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Hospital ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Hash size={18} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input 
                  type="text" 
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                  placeholder="AIIMS-DLH-001"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Type</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="block w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-bold appearance-none"
                required
              >
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="Trust">Trust</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Address</label>
              <div className="relative group">
                <div className="absolute top-4 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium resize-none"
                  placeholder="Full address"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">City</label>
              <input 
                type="text" 
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="block w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                placeholder="Delhi"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Pincode</label>
              <input 
                type="text" 
                name="pincode"
                value={formData.pincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setFormData({ ...formData, pincode: val });
                }}
                className="block w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                placeholder="110029"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Phone</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                  placeholder="+91 11 2658 8500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
                  placeholder="contact@hospital.com"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Departments</label>
              <p className="text-xs text-slate-400 mb-3 ml-1 font-medium">Type and press Enter, or click suggestions below</p>
              <div className="relative">
                <div className="w-full px-5 py-5 min-h-[120px] bg-white border border-slate-200 rounded-3xl outline-none focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:border-slate-300 transition-all font-medium text-slate-900 shadow-sm flex flex-wrap content-start gap-2">
                  <AnimatePresence>
                    {departmentsList.map((dept, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        key={idx} 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-xl text-sm font-bold border border-primary-100/50"
                      >
                        {dept}
                        <button 
                          type="button"
                          onClick={() => removeDepartment(dept)}
                          className="p-0.5 rounded-full hover:bg-primary-200/50 text-primary-600/60 hover:text-primary-600 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <input 
                    type="text"
                    value={departmentInput} 
                    onChange={(e) => {
                      setDepartmentInput(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onKeyDown={handleDepartmentKeyDown}
                    onFocus={() => setShowSuggestions(departmentInput.length > 0)}
                    className="flex-1 min-w-[150px] bg-transparent outline-none border-none py-1.5 text-slate-900 placeholder:text-slate-400"
                    placeholder={departmentsList.length === 0 ? "e.g., Cardiology (Press Enter)" : "Add more... (Press Enter)"}
                  />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                    {filteredSuggestions.slice(0, 8).map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addDepartment(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors text-sm font-medium text-slate-700 hover:text-primary-600 first:rounded-t-2xl last:rounded-b-2xl"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Add Suggestions */}
              {departmentInput.length === 0 && departmentsList.length < 5 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider self-center">Quick add:</span>
                  {departmentSuggestions.filter(s => !departmentsList.includes(s)).slice(0, 6).map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addDepartment(suggestion)}
                      className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium hover:bg-primary-50 hover:text-primary-600 transition-colors border border-slate-100"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm text-center font-bold">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-4 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${
                loading 
                ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-primary-600 hover:bg-primary-700 shadow-primary-900/20'
              }`}
            >
              {loading ? 'Creating...' : 'Create Hospital'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHospitalModal;
