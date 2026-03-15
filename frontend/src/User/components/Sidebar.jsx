import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  User, 
  ListOrdered, 
  History, 
  Home, 
  Bell, 
  LogOut, 
  Droplets,
  ChevronRight,
  Calendar,
  Heart
} from 'lucide-react';

const Sidebar = () => {

  const menuItems = [
    { name: 'Home', path: '/user/dashboard', icon: Home },
    { name: 'Appointments', path: '/user/book-appointment', icon: Calendar },
    { name: 'Queue', path: '/user/queue', icon: ListOrdered },
    { name: 'Donation', path: '/user/donation', icon: Heart },
    { name: 'History', path: '/user/history', icon: History },
    { name: 'Requests', path: '/user/requests', icon: Bell },
  ];

  return (
    <aside className="w-64 bg-white text-slate-600 h-screen fixed left-0 top-0 flex flex-col border-r border-slate-100 z-50">
      <div className="p-8 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Droplets size={24} className="text-white fill-current" />
          </div>
          <div>
            <h1 className="text-slate-900 font-black text-xl tracking-tighter uppercase">RAKTSETU</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">User Dashboard</p>
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
         <NavLink
            to="/user/profile"
            className={({ isActive }) =>
               `flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group ${
                 isActive 
                 ? 'bg-primary-50 text-primary-600 border border-primary-100/50' 
                 : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 bg-slate-50/50 border border-slate-100'
               }`
            }
         >
            {({ isActive }) => (
               <>
                 <div className="flex items-center gap-3">
                   <User size={20} className={`transition-transform group-hover:scale-110 ${isActive ? 'fill-current' : ''}`} />
                   <span className="font-bold text-sm tracking-tight">Profile & Access</span>
                 </div>
                 <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
               </>
            )}
         </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
