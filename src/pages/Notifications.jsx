import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { Bell, BellOff, Clock, CheckCircle, Info, Trophy, Target, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications/my');
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking as read');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'tournament_invite': return <Trophy className="text-yellow" />;
      case 'match_invite': return <Target className="text-violet" />;
      case 'invite_accepted': return <CheckCircle className="text-green" />;
      case 'result_recorded': return <Info className="text-blue" />;
      default: return <Bell className="text-primary" />;
    }
  };

  if (loading) return <DashboardLayout title="Notifications">Loading...</DashboardLayout>;

  return (
    <DashboardLayout title="Notification Center">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-text font-medium">{notifications.length} Total Notifications</h3>
           <button className="text-primary text-sm font-bold hover:underline">Mark all as read</button>
        </div>

        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n._id} 
                onClick={() => !n.isRead && markAsRead(n._id)}
                className={`p-4 rounded-2xl border transition-all flex gap-4 cursor-pointer ${
                  n.isRead 
                    ? 'bg-base2/10 border-base2 grayscale-[0.5]' 
                    : 'bg-base3 border-primary/20 shadow-md ring-1 ring-primary/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${n.isRead ? 'bg-base2' : 'bg-primary/10'}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-bold ${n.isRead ? 'text-text' : 'text-text-emphasis'}`}>{n.title}</h4>
                    <span className="text-[10px] text-text font-medium flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm ${n.isRead ? 'text-text/70' : 'text-text'}`}>{n.message}</p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                )}
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-base3/30 rounded-3xl border-2 border-dashed border-base2">
              <BellOff size={48} className="mx-auto text-base2 mb-4" />
              <h3 className="text-xl font-bold text-text-emphasis">All quiet here</h3>
              <p className="text-text">You have no notifications yet.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
