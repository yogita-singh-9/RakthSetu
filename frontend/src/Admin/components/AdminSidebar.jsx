import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  UserCheck, 
  LogOut, 
  Droplets,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/auth/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
    { name: 'Hospitals', path: '/admin/hospitals', icon: Building2 },
    { name: 'Doctor Requests', path: '/admin/doctor-requests', icon: UserCheck },
  ];

  return (
    <aside className="w-64 bg-white text-slate-600 h-screen fixed left-0 top-0 flex flex-col border-r border-slate-100 z-50">
      <div className="p-8 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-slate-900 font-black text-xl tracking-tighter uppercase">RAKTSETU</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                  ? 'bg-primary-50 text-primary-600 border border-primary-100/50' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={`transition-transform group-hover:scale-110 ${isActive ? 'fill-current' : ''}`} />
                    <span className="font-bold text-sm tracking-tight">{item.name}</span>
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <button onClick={handleLogout} className="w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group text-slate-500 hover:bg-red-50 hover:text-red-600 bg-slate-50/50 border border-slate-100">
          <div className="flex items-center gap-3">
            <LogOut size={20} className="transition-transform group-hover:scale-110" />
            <span className="font-bold text-sm tracking-tight">Logout</span>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
