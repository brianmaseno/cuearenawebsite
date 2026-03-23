import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Search, User, Clock, CheckCircle, Info, Trophy, Target, BellOff, Star } from 'lucide-react';

const TopBar = ({ title }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [livePoints, setLivePoints] = useState(user?.points || 0);
  const dropdownRef = useRef(null);

  // Fetch live points from backend
  useEffect(() => {
    if (!user) return;
    
    const fetchPoints = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setLivePoints(data.points || 0);
      } catch (err) {
        console.error('Failed to fetch live points:', err);
      }
    };

    fetchPoints();
    const interval = setInterval(fetchPoints, 30000); // Sync every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'tournament_invite': return <Trophy className="text-yellow" size={14} />;
      case 'match_invite': return <Target className="text-violet" size={14} />;
      case 'invite_accepted': return <CheckCircle className="text-green" size={14} />;
      case 'result_recorded': return <Info className="text-blue" size={14} />;
      case 'tournament_started': return <Trophy className="text-primary" size={14} />;
      case 'tournament_completed': return <CheckCircle className="text-green" size={14} />;
      default: return <Bell className="text-primary" size={14} />;
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

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

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`relative p-2 transition-all hover:scale-110 active:scale-95 rounded-full ${
              isDropdownOpen ? 'bg-primary/10 text-primary' : 'text-text hover:text-primary'
            }`}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red text-white text-[10px] font-black rounded-full border-2 border-base3 flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-base3 border border-base2 rounded-[28px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="p-5 border-b border-base2 flex items-center justify-between bg-base2/5">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm tracking-tight">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    className="text-[10px] font-black text-primary hover:text-primary-focus uppercase tracking-widest transition-colors"
                  >
                    Mark all
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto thin-scrollbar">
                {notifications.length > 0 ? (
                  notifications.slice(0, 10).map((n) => (
                    <div 
                      key={n._id}
                      onClick={() => {
                        if (!n.isRead) markAsRead(n._id);
                        
                        // Direct Navigation Logic
                        const rolePath = user?.role === 'moderator' ? '/moderator' : '/dashboard';
                        const isCompleted = n.message?.toLowerCase().includes('completed') || n.title?.toLowerCase().includes('completed');

                        if (isCompleted) {
                          navigate(`${rolePath}/history`);
                        } else if (n.type.includes('tournament')) {
                          navigate(`${rolePath}/${user?.role === 'moderator' ? 'manage-tournament' : 'tournament'}/${n.relatedId}`);
                        } else if (n.type.includes('match') || n.type === 'result_recorded') {
                          navigate(rolePath);
                        } else if (n.type === 'invite_accepted') {
                          // Try to guess or just go to invitations if ambiguous
                          navigate(`${rolePath}/invitations`);
                        } else {
                          navigate('/notifications');
                        }
                        
                        setIsDropdownOpen(false);
                      }}
                      className={`p-4 border-b border-base2/50 flex gap-3 cursor-pointer hover:bg-base2/20 transition-all group last:border-0 ${
                        !n.isRead ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                        !n.isRead ? 'bg-primary/10 text-primary' : 'bg-base2 text-text/40'
                      }`}>
                        {getIcon(n.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5 mt-0.5">
                          <p className={`text-xs font-black truncate pr-2 tracking-tight ${!n.isRead ? 'text-text-emphasis' : 'text-text/60'}`}>
                            {n.title}
                          </p>
                          <span className="text-[9px] text-text/40 font-bold whitespace-nowrap">
                            {getTimeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className={`text-[11px] line-clamp-2 leading-tight ${!n.isRead ? 'text-text/80' : 'text-text/40'}`}>
                          {n.message}
                        </p>
                      </div>

                      {!n.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n._id);
                          }}
                          className="self-center p-2 text-text/20 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                          title="Mark as read"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 bg-base2/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BellOff size={24} className="text-text/20" />
                    </div>
                    <p className="text-xs text-text/40 font-black tracking-tight">No notifications yet</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-base2">
          <div className="text-right hidden md:flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
                <Star size={10} className="fill-primary" /> {livePoints} pts
              </span>
              <p className="text-sm font-bold text-text-emphasis leading-none">{user?.fullName}</p>
            </div>
            <p className="text-[10px] text-text/40 font-black uppercase tracking-widest leading-none">{user?.role}</p>
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
