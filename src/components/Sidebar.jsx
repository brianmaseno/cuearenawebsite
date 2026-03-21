import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Trophy, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Bell, 
  Settings, 
  LogOut, 
  MessageSquare,
  Shield,
  User,
  Target,
  Clock,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    if (user.role === 'admin') {
      return [
        { label: 'Admin Panel', path: '/admin', icon: Shield },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Activity Logs', path: '/admin/logs', icon: Activity },
      ];
    }
    if (user.role === 'moderator') {
      return [
        { label: 'Active', path: '/moderator/ongoing', icon: Calendar },
        { label: 'History', path: '/moderator/history', icon: Clock },
      ];
    }
    return [
      { label: 'Active', path: '/dashboard', icon: LayoutDashboard },
      { label: 'History', path: '/dashboard/history', icon: Clock },
      { label: 'Open Tournaments', path: '/tournaments', icon: Calendar },
    ];
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-base3 border-r border-base2 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center">
            <img src="/favicon.png" alt="7 Ball" className="w-8 h-8 drop-shadow-md" />
          </div>
          <span className="text-xl font-bold text-text-emphasis">Cue Arena</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive 
                  ? 'bg-primary/10 text-primary shadow-sm' 
                  : 'text-text hover:bg-base2/50 hover:text-text-emphasis'
              }`}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-base2">
        <Link
          to="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-text hover:bg-base2/50 transition-all mb-2"
        >
          <Settings size={20} />
          Profile Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red hover:bg-red/5 transition-all"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
