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
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = user?.role === 'admin' ? '/admin' : 
                        user?.role === 'moderator' ? '/moderator' : '/dashboard';

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
    <aside className={`bg-base3 border-r border-base2 flex flex-col h-screen sticky top-0 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      <div className={`p-6 flex items-center border-b border-base2/50 ${isCollapsed ? 'flex-col gap-4 justify-center' : 'justify-between'}`}>
        <Link to={dashboardPath} className="flex items-center gap-3">
          {!isCollapsed && <span className="text-xl brand-premium truncate">Cue Arena</span>}
        </Link>
        <button 
          onClick={toggleSidebar}
          className={`hover:text-primary transition-all p-2 rounded-xl bg-base2 text-text/40 hover:bg-primary/5 ${isCollapsed ? 'w-10 h-10 flex items-center justify-center' : ''}`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto thin-scrollbar">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${
                isActive 
                  ? 'bg-primary/10 text-primary shadow-sm' 
                  : 'text-text hover:bg-base2/50 hover:text-text-emphasis'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? link.label : ''}
            >
              <Icon size={20} className="shrink-0" />
              {!isCollapsed && <span className="truncate">{link.label}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-base3 border border-base2 rounded-lg text-xs font-bold text-text-emphasis opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  {link.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-base2 space-y-2">
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-text hover:bg-base2/50 transition-all group ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? 'Profile Settings' : ''}
        >
          <Settings size={20} className="shrink-0" />
          {!isCollapsed && <span className="truncate">Settings</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-base3 border border-base2 rounded-lg text-xs font-bold text-text-emphasis opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
              Settings
            </div>
          )}
        </Link>
        
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red hover:bg-red/5 transition-all group ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? 'Sign Out' : ''}
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="truncate">Sign Out</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-red text-white rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
              Sign Out
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
