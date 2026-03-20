import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Clock, 
  Trophy, 
  Target 
} from 'lucide-react';
import toast from 'react-hot-toast';

const PlayerInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    try {
      const { data } = await api.get('/invitations/my');
      setInvitations(data);
    } catch (err) {
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleResponse = async (id, status) => {
    try {
      await api.post(`/invitations/${id}/respond`, { status });
      toast.success(`Invitation ${status}`);
      fetchInvitations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error responding to invitation');
    }
  };

  if (loading) return <DashboardLayout title="Invitations">Checking for invites...</DashboardLayout>;

  return (
    <DashboardLayout title="My Invitations">
      <div className="max-w-4xl">
        <div className="space-y-6">
          {invitations.length > 0 ? (
            invitations.map((invite) => (
              <div key={invite._id} className="card-premium p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-l-orange bg-orange/5">
                <div className="flex gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    invite.type === 'tournament' ? 'bg-yellow/10 text-yellow' : 'bg-violet/10 text-violet'
                  }`}>
                    {invite.type === 'tournament' ? <Trophy size={32} /> : <Target size={32} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase bg-orange/20 text-orange px-1.5 py-0.5 rounded tracking-widest leading-none">
                        {invite.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-text flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-text-emphasis mb-1">
                      {invite.targetId.name || invite.targetId.title}
                    </h3>
                    <p className="text-text flex items-center gap-1">
                      Invited by <span className="font-bold text-text-emphasis">{invite.sentBy.fullName}</span>
                    </p>
                    {invite.targetId.venue && (
                      <p className="text-sm text-text-emphasis italic mt-2">Venue: {invite.targetId.venue}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleResponse(invite._id, 'declined')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-red/20 text-red font-bold hover:bg-red/5 transition-all"
                  >
                    <XCircle size={18} />
                    Decline
                  </button>
                  <button
                    onClick={() => handleResponse(invite._id, 'accepted')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-green text-base3 font-bold hover:opacity-90 shadow-md shadow-green/10 transition-all"
                  >
                    <CheckCircle size={18} />
                    Accept
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-base3 rounded-3xl border-2 border-dashed border-base2">
              <MessageSquare size={48} className="mx-auto text-base2 mb-4" />
              <h3 className="text-xl font-bold text-text-emphasis">No pending invitations</h3>
              <p className="text-text">Matches and tournaments you've been invited to will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlayerInvitations;
