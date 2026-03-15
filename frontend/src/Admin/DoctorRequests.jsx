import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Filter } from 'lucide-react';
import AdminSidebar from './components/AdminSidebar';
import DoctorRequestCard from './components/DoctorRequestCard';

const DoctorRequests = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, filter]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/doctors');
      const data = await response.json();
      if (response.ok) {
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(doc => doc.status === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
  };

  const handleApprove = async (uid) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/approve-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid })
      });
      
      if (response.ok) {
        fetchDoctors();
      }
    } catch (error) {
      console.error('Error approving doctor:', error);
    }
  };

  const handleReject = async (uid) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/reject-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid })
      });
      
      if (response.ok) {
        fetchDoctors();
      }
    } catch (error) {
      console.error('Error rejecting doctor:', error);
    }
  };

  const pendingCount = doctors.filter(d => d.status === 'pending').length;
  const approvedCount = doctors.filter(d => d.status === 'approved').length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      
      <main className="flex-1 ml-64 p-12">
        <header className="mb-14">
          <div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
              Doctor <span className="text-primary-600">Requests</span>
            </h2>
            <p className="text-slate-500 font-medium mt-1">Review and approve doctor registration requests.</p>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Pending</p>
                <p className="text-3xl font-black text-orange-600">{pendingCount}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <UserCheck size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Approved</p>
                <p className="text-3xl font-black text-green-600">{approvedCount}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <UserCheck size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
                <p className="text-3xl font-black text-slate-900">{doctors.length}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <UserCheck size={24} className="text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, specialization..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all font-medium"
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('pending')}
                className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  filter === 'pending' 
                  ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                  : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
                }`}
              >
                Pending
              </button>
              <button 
                onClick={() => setFilter('approved')}
                className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  filter === 'approved' 
                  ? 'bg-green-50 text-green-600 border border-green-100' 
                  : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
                }`}
              >
                Approved
              </button>
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  filter === 'all' 
                  ? 'bg-primary-50 text-primary-600 border border-primary-100' 
                  : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* Doctor List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-500 font-medium">Loading doctor requests...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center">
            <div className="inline-flex p-6 bg-slate-50 rounded-3xl mb-6">
              <UserCheck size={48} className="text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Requests Found</h3>
            <p className="text-slate-500 font-medium">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No doctor requests match the selected filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDoctors.map((doctor) => (
              <DoctorRequestCard 
                key={doctor.uid}
                doctor={doctor}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorRequests;
