import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Trophy, Target, MessageSquare, Clock, MapPin, ArrowRight } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { Link } from 'react-router-dom';

const PlayerDashboard = () => {
  const [stats, setStats] = useState({
    upcomingMatches: [],
    invitations: [],
    myTournaments: [],
    notifications: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [matchesRes, invRes, tRes, notifRes] = await Promise.all([
          api.get('/direct-matches?playerId=me'),
          api.get('/invitations/my'),
          api.get('/tournaments?participantId=me'),
          api.get('/notifications/my'),
        ]);
        
        setStats({
          upcomingMatches: matchesRes.data.filter(m => m.status !== 'completed'),
          invitations: invRes.data,
          myTournaments: tRes.data.filter(t => t.status !== 'completed'),
          notifications: notifRes.data,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <DashboardLayout title="Dashboard">
      <div className="flex animate-pulse flex-col gap-6">
        <div className="h-40 bg-base2 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-base2 rounded-2xl"></div>
          <div className="h-64 bg-base2 rounded-2xl"></div>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Player Dashboard">
      <div className="space-y-8">
        {/* Alerts Container */}
        <div className="flex flex-col items-center gap-3">
           {/* Invitations Alert */}
           {stats.invitations.length > 0 && (
             <Link 
               to="/dashboard/invitations" 
               className="group flex items-center gap-2 px-6 py-2 bg-orange/5 border border-orange/10 rounded-full hover:bg-orange/10 transition-all animate-in slide-in-from-top duration-700"
             >
               <span className="text-sm font-bold text-text/60 group-hover:text-text transition-colors">
                 You have <span className="text-orange font-black">{stats.invitations.length}</span> {stats.invitations.length === 1 ? 'invite' : 'invites'}
               </span>
               <ArrowRight size={14} className="text-orange opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
             </Link>
           )}

           {/* Notifications Alert */}
           {stats.notifications.filter(n => !n.isRead).length > 0 && (
             <Link 
               to="/dashboard/notifications" 
               className="group flex items-center gap-2 px-6 py-2 bg-primary/5 border border-primary/10 rounded-full hover:bg-primary/10 transition-all animate-in slide-in-from-top duration-500 delay-100"
             >
               <span className="text-sm font-bold text-text/60 group-hover:text-text transition-colors">
                 You have <span className="text-primary font-black">{stats.notifications.filter(n => !n.isRead).length}</span> new {stats.notifications.filter(n => !n.isRead).length === 1 ? 'notification' : 'notifications'}
               </span>
               <Bell size={14} className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
             </Link>
           )}
        </div>

        {/* Welcome Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-blue/10 text-blue rounded-xl flex items-center justify-center">
              <Target size={24} />
            </div>
            <div>
              <p className="text-sm text-text font-bold uppercase tracking-wider">Active Matches</p>
              <h4 className="text-3xl font-extrabold text-text-emphasis">{stats.upcomingMatches.length}</h4>
            </div>
          </div>
          <div className="card-premium p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-green/10 text-green rounded-xl flex items-center justify-center">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm text-text font-bold uppercase tracking-wider">Tournaments</p>
              <h4 className="text-3xl font-extrabold text-text-emphasis">{stats.myTournaments.length}</h4>
            </div>
          </div>
          <div className="card-premium p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-orange/10 text-orange rounded-xl flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-sm text-text font-bold uppercase tracking-wider">New Invites</p>
              <h4 className="text-3xl font-extrabold text-text-emphasis">{stats.invitations.length}</h4>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Matches */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Clock size={20} className="text-primary" />
                Upcoming Matches
              </h3>
              <Link to="/dashboard/matches" className="text-primary text-sm font-bold hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {stats.upcomingMatches.length > 0 ? (
                stats.upcomingMatches.slice(0, 3).map((match) => (
                  <div key={match._id} className="card-premium p-4 rounded-xl flex items-center justify-between border-l-4 border-l-primary">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={match.status} />
                        <span className="text-xs text-text font-medium">{new Date(match.scheduledAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-bold text-text-emphasis">{match.title}</h4>
                      <p className="text-sm text-text">vs. {match.player1Id._id === 'me' ? match.player2Id.fullName : match.player1Id.fullName}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-text mb-2">
                        <MapPin size={14} />
                        {match.venue}
                      </div>
                      <Link to={`/dashboard/match/${match._id}`} className="p-2 hover:bg-base2 rounded-lg transition-colors inline-block text-primary">
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-base3 border border-dashed border-base2 p-8 text-center rounded-2xl">
                  <p className="text-text font-medium italic">No upcoming matches scheduled.</p>
                </div>
              )}
            </div>
          </section>

          {/* New Invitations */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare size={20} className="text-orange" />
                Pending Invitations
              </h3>
              <Link to="/dashboard/invitations" className="text-primary text-sm font-bold hover:underline">Manage All</Link>
            </div>
            <div className="space-y-4">
              {stats.invitations.length > 0 ? (
                stats.invitations.slice(0, 3).map((invite) => (
                  <div key={invite._id} className="card-premium p-4 rounded-xl bg-orange/5 border-orange/20">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase bg-orange text-base3 px-1.5 py-0.5 rounded mb-2 inline-block">
                          {invite.type.replace('_', ' ')}
                        </span>
                        <h4 className="font-bold text-text-emphasis">{invite.targetId.name || invite.targetId.title}</h4>
                        <p className="text-xs text-text">From: {invite.sentBy.fullName}</p>
                      </div>
                      <Link to="/dashboard/invitations" className="btn-primary py-1.5 px-3 text-xs">Respond</Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-base3 border border-dashed border-base2 p-8 text-center rounded-2xl">
                  <p className="text-text font-medium italic">All caught up! No pending invites.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlayerDashboard;
