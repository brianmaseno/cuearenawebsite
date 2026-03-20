import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, User } from 'lucide-react';

const TopBar = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-base3/80 backdrop-blur-md border-b border-base2 px-8 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h2 className="text-2xl font-bold text-text-emphasis">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base1">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="bg-base2/40 border border-base2 rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none w-64"
            placeholder="Search tournaments..."
          />
        </div>

        <button className="relative p-2 text-text hover:text-primary transition-colors">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red rounded-full border-2 border-base3"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-base2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-text-emphasis">{user?.fullName}</p>
            <p className="text-xs text-text capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-base2 flex items-center justify-center text-primary font-bold overflow-hidden border border-base1">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={20} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
