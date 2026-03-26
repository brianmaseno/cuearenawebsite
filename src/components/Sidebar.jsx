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
  ChevronRight,
  Wallet,
  TrendingUp
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const [modRequestCount, setModRequestCount] = React.useState(0);
  const location = useLocation();

  React.useEffect(() => {
    if (user?.role === 'admin') {
      const fetchCount = async () => {
        try {
          const { data } = await api.get('/moderator-requests/count/pending');
          setModRequestCount(data.count);
        } catch (err) {
          console.error('Failed to fetch mod request count', err);
        }
      };
      fetchCount();
      // Optional: interval to keep it updated
      const interval = setInterval(fetchCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

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
        { label: 'Mod Requests', path: '/admin/moderator-requests', icon: Shield },
        { label: 'Activity Logs', path: '/admin/logs', icon: Activity },
        { label: 'Finance', path: '/admin/finance', icon: TrendingUp },
        { label: 'Wallet', path: '/wallet', icon: Wallet },
      ];
    }
    if (user.role === 'moderator') {
      return [
        { label: 'Active', path: '/moderator/ongoing', icon: Calendar },
        { label: 'History', path: '/moderator/history', icon: Clock },
        { label: 'Tables', path: '/moderator/tables', icon: Target },
        { label: 'Wallet', path: '/wallet', icon: Wallet },
      ];
    }
    return [
      { label: 'Active', path: '/dashboard', icon: LayoutDashboard },
      { label: 'History', path: '/dashboard/history', icon: Clock },
      { label: 'Open Tournaments', path: '/tournaments', icon: Calendar },
      { label: 'Wallet', path: '/wallet', icon: Wallet },
    ];
  };

  const links = getLinks();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex bg-base3 border-r border-base2 flex-col h-screen sticky top-0 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        <div className={`p-6 flex items-center border-b border-base2/50 ${isCollapsed ? 'flex-col gap-4 justify-center' : 'justify-between'}`}>
          <Link to={dashboardPath} className="flex items-center gap-3" onClick={() => navigate(dashboardPath)}>
            {!isCollapsed && <span className="text-xl brand-premium truncate tracking-tighter text-aura">Cue-Arena</span>}
          </Link>
          <button 
            onClick={toggleSidebar}
            className={`hover:text-primary transition-all p-2 rounded-xl bg-base2 text-text/40 hover:bg-primary/5 ${isCollapsed ? 'w-10 h-10 flex items-center justify-center' : ''}`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto thin-scrollbar">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all group relative ${
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-sm' 
                    : 'text-text hover:bg-base2/50 hover:text-text-emphasis'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? link.label : ''}
              >
                <Icon size={20} className="shrink-0" />
                {!isCollapsed && <span className="truncate flex-1">{link.label}</span>}
                {!isCollapsed && link.label === 'Mod Requests' && modRequestCount > 0 && (
                  <span className="bg-red text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
                    {modRequestCount}
                  </span>
                )}
                {isCollapsed && link.label === 'Mod Requests' && modRequestCount > 0 && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red rounded-full border border-base3 animate-pulse" />
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-base3 border border-base2 rounded-lg text-xs font-bold text-text-emphasis opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                    {link.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-base2 space-y-1">
          <Link
            to="/profile"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-text hover:bg-base2/50 transition-all group ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title={isCollapsed ? 'Profile Settings' : ''}
          >
            <Settings size={20} className="shrink-0" />
            {!isCollapsed && <span className="truncate">Settings</span>}
          </Link>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red hover:bg-red/5 transition-all group ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title={isCollapsed ? 'Sign Out' : ''}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="truncate">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 h-16 aura-card backdrop-blur-xl border-none shadow-2xl z-[100] flex justify-around items-center px-2 safe-bottom">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full relative group transition-all ${
                isActive ? 'text-primary' : 'text-text/40'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary/10' : 'group-hover:bg-base2'}`}>
                <Icon size={20} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {link.label.split(' ')[0]}
              </span>
              {isActive && <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full" />}
            </Link>
          );
        })}
        {/* Mobile Profile Link */}
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center gap-1 w-full h-full relative group transition-all ${
            location.pathname === '/profile' ? 'text-primary' : 'text-text/40'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${location.pathname === '/profile' ? 'bg-primary/10' : 'group-hover:bg-base2'}`}>
            <User size={20} />
          </div>
          <span className={`text-[9px] font-black uppercase tracking-tighter ${location.pathname === '/profile' ? 'opacity-100' : 'opacity-0'}`}>
            Me
          </span>
        </Link>

        {/* Mobile Logout Action */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 w-full h-full relative group transition-all text-red/60 hover:text-red"
        >
          <div className="p-2 rounded-xl transition-all group-hover:bg-red/5">
            <LogOut size={20} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
            Exit
          </span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
