import React, { useState } from 'react';
import { User, Mail, Phone, Building2, Stethoscope, Hash, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

const DoctorRequestCard = ({ doctor, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(doctor.uid);
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    await onReject(doctor.uid);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-4 bg-primary-50 rounded-2xl text-primary-600">
              <User size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-900 mb-1">{doctor.name}</h3>
              <p className="text-slate-500 font-medium text-sm mb-3">{doctor.specialization}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100">
                  {doctor.hospital_name}
                </span>
                <span className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl text-xs font-bold border border-orange-100">
                  Pending Approval
                </span>
              </div>

              <button 
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-primary-600 font-bold text-sm hover:text-primary-700 transition-colors"
              >
                {expanded ? 'Hide Details' : 'View Details'}
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleApprove}
              disabled={loading}
              className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Approve"
            >
              <Check size={20} />
            </button>
            <button 
              onClick={handleReject}
              disabled={loading}
              className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reject"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg">
                <Mail size={16} className="text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium text-slate-700">{doctor.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg">
                <Phone size={16} className="text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                <p className="text-sm font-medium text-slate-700">{doctor.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg">
                <Building2 size={16} className="text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hospital ID</p>
                <p className="text-sm font-medium text-slate-700">{doctor.hospital_id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg">
                <Hash size={16} className="text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registration No.</p>
                <p className="text-sm font-medium text-slate-700">{doctor.registration_number}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg">
                <Stethoscope size={16} className="text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Specialization</p>
                <p className="text-sm font-medium text-slate-700">{doctor.specialization}</p>
              </div>
            </div>

            {doctor.aadhaarNumber && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Hash size={16} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aadhaar</p>
                  <p className="text-sm font-medium text-slate-700">{doctor.aadhaarNumber}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorRequestCard;
