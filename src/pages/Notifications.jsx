import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useNotifications } from '../context/NotificationContext';
import { Bell, BellOff, Clock, CheckCircle, Info, Trophy, Target } from 'lucide-react';

const Notifications = () => {
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'tournament_invite': return <Trophy className="text-yellow" size={20} />;
      case 'match_invite': return <Target className="text-violet" size={20} />;
      case 'invite_accepted': return <CheckCircle className="text-green" size={20} />;
      case 'result_recorded': return <Info className="text-blue" size={20} />;
      case 'tournament_started': return <Trophy className="text-primary" size={20} />;
      case 'tournament_completed': return <CheckCircle className="text-green" size={20} />;
      default: return <Bell className="text-primary" size={20} />;
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

  if (loading && notifications.length === 0) {
    return (
      <DashboardLayout title="Notification center">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout title="Notification center">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
           <div>
              <h3 className="text-2xl font-black text-text-emphasis tracking-tight">Your notifications</h3>
              <p className="text-text/60 text-sm">{unreadCount} unread, {notifications.length} total</p>
           </div>
           {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all"
              >
                Mark all as read
              </button>
           )}
        </div>

        <div className="grid gap-3">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n._id} 
                onClick={() => !n.isRead && markAsRead(n._id)}
                className={`p-5 rounded-[24px] border transition-all flex gap-4 relative group overflow-hidden ${
                  n.isRead 
                    ? 'bg-base2/10 border-base2/40' 
                    : 'bg-base3 border-primary/20 shadow-lg shadow-primary/5 ring-1 ring-primary/5 hover:border-primary/40'
                }`}
              >
                {!n.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                )}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                  n.isRead ? 'bg-base2/40 text-text/40' : 'bg-primary/10 text-primary'
                }`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-4">
                    <h4 className={`font-black tracking-tight leading-tight truncate ${n.isRead ? 'text-text/60' : 'text-text-emphasis'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-text/40 font-bold whitespace-nowrap flex items-center gap-1 mt-1">
                      <Clock size={10} />
                      {getTimeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${n.isRead ? 'text-text/40' : 'text-text/80'}`}>
                    {n.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-base2/10 rounded-[32px] border-2 border-dashed border-base2">
              <div className="w-20 h-20 bg-base2/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <BellOff size={32} className="text-text/20" />
              </div>
              <h3 className="text-xl font-black text-text-emphasis tracking-tight">All quiet here</h3>
              <p className="text-text/60 max-w-xs mx-auto mt-2">You don't have any notifications at the moment. We'll let you know when something happens.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
