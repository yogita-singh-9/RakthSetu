import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Plus, Edit2 } from 'lucide-react';
import AdminSidebar from './components/AdminSidebar';
import CreateHospitalModal from './components/CreateHospitalModal';
import EditHospitalModal from './components/EditHospitalModal';

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateHospital, setShowCreateHospital] = useState(false);
  const [showEditHospital, setShowEditHospital] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/hospitals');
      const data = await response.json();
      if (response.ok) {
        setHospitals(data.hospitals || []);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalCreated = () => {
    fetchHospitals();
  };

  const handleEditClick = (hospital) => {
    setSelectedHospital(hospital);
    setShowEditHospital(true);
  };

  const handleHospitalUpdated = () => {
    fetchHospitals();
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      
      <main className="flex-1 ml-64 p-12">
        <header className="mb-14">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
                Hospital <span className="text-primary-600">Management</span>
              </h2>
              <p className="text-slate-500 font-medium mt-1">View and manage all registered hospitals in the system.</p>
            </div>
            <button 
              onClick={() => setShowCreateHospital(true)}
              className="flex items-center gap-2 px-6 py-4 bg-primary-500 text-white rounded-2xl font-black shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
            >
              <Plus size={20} />
              Add Hospital
            </button>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-500 font-medium">Loading hospitals...</p>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center">
            <div className="inline-flex p-6 bg-slate-50 rounded-3xl mb-6">
              <Building2 size={48} className="text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Hospitals Yet</h3>
            <p className="text-slate-500 font-medium mb-6">Get started by creating your first hospital.</p>
            <button 
              onClick={() => setShowCreateHospital(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-2xl font-black hover:bg-primary-600 transition-colors"
            >
              <Plus size={20} />
              Create Hospital
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hospitals.map((hospital) => (
              <div key={hospital.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-4 bg-primary-50 rounded-2xl text-primary-600">
                      <Building2 size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-slate-900 mb-1">{hospital.name}</h3>
                      <span className="inline-block px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-100">
                        {hospital.type}
                      </span>
                    </div>
                    <button
                      onClick={() => handleEditClick(hospital)}
                      className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all opacity-0 group-hover:opacity-100"
                      title="Edit Hospital"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">{hospital.address}</p>
                        <p className="text-xs text-slate-500">{hospital.city} - {hospital.pincode}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-slate-400 flex-shrink-0" />
                      <p className="text-sm font-medium text-slate-700">{hospital.phone}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-slate-400 flex-shrink-0" />
                      <p className="text-sm font-medium text-slate-700">{hospital.email}</p>
                    </div>
                  </div>

                  {hospital.departments && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Departments</p>
                      <div className="flex flex-wrap gap-2">
                        {hospital.departments.split(',').map((dept, idx) => (
                          <span key={idx} className="px-2 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-medium">
                            {dept.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                      <span className="font-bold">Hospital ID:</span> {hospital.hospitalId}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateHospitalModal 
        isOpen={showCreateHospital}
        onClose={() => setShowCreateHospital(false)}
        onSuccess={handleHospitalCreated}
      />

      <EditHospitalModal 
        isOpen={showEditHospital}
        onClose={() => {
          setShowEditHospital(false);
          setSelectedHospital(null);
        }}
        onSuccess={handleHospitalUpdated}
        hospital={selectedHospital}
      />
    </div>
  );
};

export default Hospitals;
