import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Trophy,
  LayoutDashboard,
  Calendar,
  Users,
  LogOut,
  Shield,
  User,
  Target,
  Clock,
  Activity,
  ChevronLeft,
  ChevronRight,
  Wallet,
  TrendingUp,
  HelpCircle,
  Settings,
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
      const interval = setInterval(fetchCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'moderator' ? '/moderator' : '/dashboard';

  const getLinks = () => {
    if (user.role === 'admin') {
      return [
        { label: 'Overview', path: '/admin', icon: Shield },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Mod requests', path: '/admin/moderator-requests', icon: Shield, badge: modRequestCount },
        { label: 'Activity logs', path: '/admin/logs', icon: Activity },
        { label: 'Finance', path: '/admin/finance', icon: TrendingUp },
        { label: 'Analytics', path: '/admin/analytics', icon: Activity },
        { label: 'Wallet', path: '/wallet', icon: Wallet },
        { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
      ];
    }
    if (user.role === 'moderator') {
      return [
        { label: 'Active', path: '/moderator/ongoing', icon: Calendar },
        { label: 'History', path: '/moderator/history', icon: Clock },
        { label: 'Tables', path: '/moderator/tables', icon: Target },
        { label: 'Wallet', path: '/wallet', icon: Wallet },
        { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
      ];
    }
    return [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'History', path: '/dashboard/history', icon: Clock },
      { label: 'Tournaments', path: '/dashboard/tournaments', icon: Calendar },
      { label: 'Wallet', path: '/wallet', icon: Wallet },
      { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    ];
  };

  const links = getLinks();
  const firstName = user?.fullName?.split(' ')[0] || 'Player';

  const NavLink = ({ link }) => {
    const Icon = link.icon;
    const isActive =
      location.pathname === link.path ||
      (link.path !== dashboardPath && location.pathname.startsWith(link.path + '/'));

    return (
      <Link
        to={link.path}
        title={isCollapsed ? link.label : undefined}
        className={`dash-nav-item group ${isActive ? 'dash-nav-item-active' : ''} ${
          isCollapsed ? 'dash-nav-item-collapsed' : ''
        }`}
      >
        <span className={`dash-nav-icon ${isActive ? 'dash-nav-icon-active' : ''}`}>
          <Icon size={16} strokeWidth={isActive ? 2.25 : 2} />
        </span>
        {!isCollapsed && (
          <>
            <span className="dash-nav-label">{link.label}</span>
            {link.badge > 0 && (
              <span className="dash-nav-badge">{link.badge > 9 ? '9+' : link.badge}</span>
            )}
          </>
        )}
        {isCollapsed && link.badge > 0 && <span className="dash-nav-dot" />}
        {isCollapsed && (
          <span className="dash-nav-tooltip">{link.label}</span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col dash-sidebar transition-all duration-300 ${
          isCollapsed ? 'w-[76px]' : 'w-[248px]'
        }`}
      >
        {/* Brand */}
        <div className={`dash-sidebar-brand ${isCollapsed ? 'justify-center px-2' : ''}`}>
          {!isCollapsed ? (
            <Link to={dashboardPath} className="flex items-center gap-2.5 min-w-0">
              <span className="dash-logo-mark">CA</span>
              <span className="dash-logo-text truncate">Cue Arena</span>
            </Link>
          ) : (
            <Link to={dashboardPath} className="dash-logo-mark mx-auto">CA</Link>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            className="dash-sidebar-toggle"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-1 space-y-0.5 overflow-y-auto thin-scrollbar">
          {!isCollapsed && (
            <p className="dash-nav-section px-2.5 pt-1 pb-0.5">Menu</p>
          )}
          {links.map((link) => (
            <NavLink key={link.path} link={link} />
          ))}
        </nav>

        {/* User + utilities */}
        <div className="dash-sidebar-footer">
          {!isCollapsed && (
            <p className="dash-nav-section px-2.5 pb-1">Account</p>
          )}
          {!isCollapsed && (
            <div className="dash-user-chip mb-3">
              <div className="dash-user-avatar">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-emphasis truncate">{firstName}</p>
                <p className="text-[11px] text-text-muted capitalize">{user?.role}</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Link
              to="/support"
              className={`dash-nav-item dash-nav-item-muted ${isCollapsed ? 'dash-nav-item-collapsed' : ''}`}
              title={isCollapsed ? 'Support' : undefined}
            >
              <span className="dash-nav-icon"><HelpCircle size={18} /></span>
              {!isCollapsed && <span className="dash-nav-label">Support</span>}
            </Link>
            <Link
              to="/profile"
              className={`dash-nav-item dash-nav-item-muted ${isCollapsed ? 'dash-nav-item-collapsed' : ''} ${
                location.pathname === '/profile' ? 'dash-nav-item-active' : ''
              }`}
              title={isCollapsed ? 'Settings' : undefined}
            >
              <span className="dash-nav-icon"><Settings size={18} /></span>
              {!isCollapsed && <span className="dash-nav-label">Settings</span>}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className={`dash-nav-item dash-nav-item-muted w-full ${isCollapsed ? 'dash-nav-item-collapsed' : ''}`}
              title={isCollapsed ? 'Sign out' : undefined}
            >
              <span className="dash-nav-icon text-red/80"><LogOut size={18} /></span>
              {!isCollapsed && <span className="dash-nav-label text-red/90">Sign out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-4 left-3 right-3 h-[62px] dash-mobile-nav z-[100] flex justify-around items-center px-1 safe-bottom">
        {links.slice(0, 4).map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-2xl transition-all ${
                isActive ? 'text-white' : 'text-text-muted'
              }`}
            >
              <div className={`p-2 rounded-xl ${isActive ? 'bg-white/15' : ''}`}>
                <Icon size={20} />
              </div>
            </Link>
          );
        })}
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center flex-1 py-2 rounded-2xl ${
            location.pathname === '/profile' ? 'text-white' : 'text-text-muted'
          }`}
        >
          <div className={`p-2 rounded-xl ${location.pathname === '/profile' ? 'bg-white/15' : ''}`}>
            <User size={20} />
          </div>
        </Link>
      </nav>
    </>
  );
};

export default Sidebar;
