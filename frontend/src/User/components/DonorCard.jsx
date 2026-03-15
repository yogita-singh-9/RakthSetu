import React from 'react';
import { Droplets, Heart, FileText, CheckCircle2, ChevronRight, Plus } from 'lucide-react';

const DonorCard = ({ type, eligibility, status, bloodGroup, lastDonation, organs, isBloodDonor }) => {
  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className={`absolute top-0 right-0 w-40 h-40 -mr-10 -mt-10 rounded-full blur-3xl opacity-10 transition-transform group-hover:scale-110 ${isBloodDonor ? 'bg-primary-400' : 'bg-blue-400'}`}></div>
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border ${
            isBloodDonor 
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
            : 'bg-blue-50 text-blue-600 border-blue-100'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isBloodDonor ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
            {eligibility || status}
          </div>
          <h4 className="text-3xl font-black text-slate-900 tracking-tight">{type}</h4>
        </div>
        <div className={`p-4 rounded-3xl ${isBloodDonor ? 'bg-primary-50 text-primary-500' : 'bg-blue-50 text-blue-500'}`}>
          {isBloodDonor ? <Droplets size={28} className="fill-current" /> : <Heart size={28} className="fill-current" />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        {isBloodDonor ? (
          <>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100/50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Blood Group</p>
              <p className="text-xl font-black text-slate-800">{bloodGroup}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100/50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Last Donation</p>
              <p className="text-xl font-black text-slate-800">{lastDonation}</p>
            </div>
          </>
        ) : (
          <div className="col-span-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Consented Organs</p>
            <div className="flex flex-wrap gap-2">
              {organs.map(organ => (
                <span key={organ} className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-100">
                  {organ}
                </span>
              ))}
              <button className="px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-xs font-black border border-primary-100 flex items-center gap-2 hover:bg-primary-100 transition-colors">
                <Plus size={14} /> Add More
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 relative z-10">
        <button className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
          isBloodDonor 
          ? 'bg-primary-600 text-white shadow-primary-600/20 hover:bg-primary-700' 
          : 'bg-slate-800 text-white shadow-slate-800/20 hover:bg-slate-900'
        }`}>
          {isBloodDonor ? <FileText size={18} /> : <CheckCircle2 size={18} />}
          {isBloodDonor ? 'View Certificate' : 'Download Pledge Card'}
          <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default DonorCard;
