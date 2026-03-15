import React from 'react';
import { MapPin, Droplet, User, Clock, HeartHandshake, ChevronRight } from 'lucide-react';

const EmergencyRequest = ({ hospital, locality, distance, urgency, bloodGroup, type, units, timeAgo, variant }) => {
  const isCritical = variant === 'critical';
  
  return (
    <div className={`bg-white rounded-4xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group border-l-4 ${isCritical ? 'border-primary-500' : 'border-orange-500'}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex gap-6 items-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${isCritical ? 'bg-primary-50 text-primary-500' : 'bg-orange-50 text-orange-500'}`}>
            <HeartHandshake size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h5 className="text-xl font-black text-slate-900 tracking-tight">{hospital}</h5>
              <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                isCritical ? 'bg-primary-50 text-primary-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {urgency}
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-xs font-bold">
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-slate-300" />
                <span>{locality}</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
              <span>{distance} away</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-8 bg-slate-50/50 px-8 py-3 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Required</p>
              <p className="text-sm font-black text-primary-600">{bloodGroup} {type}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Units</p>
              <p className="text-sm font-black text-slate-900">{units} Units</p>
            </div>
          </div>

          <div className="hidden xl:flex flex-col items-end gap-3 min-w-[140px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Posted {timeAgo}
            </p>
            <button className={`w-full py-3 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg transition-all ${isCritical ? 'bg-primary-500 text-white shadow-primary-500/20 hover:bg-primary-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              I Can Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyRequest;
