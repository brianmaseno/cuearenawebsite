import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Trophy, Target, Plus, Search, Calendar, MapPin, Users } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { Link } from 'react-router-dom';

const ModeratorDashboard = () => {
  const [data, setData] = useState({
    myTournaments: [],
    myMatches: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModData = async () => {
      try {
        const [tRes, mRes] = await Promise.all([
          api.get('/tournaments?organizerId=me'),
          api.get('/direct-matches?organizerId=me'),
        ]);
        setData({
          myTournaments: tRes.data,
          myMatches: mRes.data,
        });
      } catch (err) {
        console.error('Error fetching moderator data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchModData();
  }, []);

  if (loading) return <DashboardLayout title="Moderator Hub">Loading...</DashboardLayout>;

  return (
    <DashboardLayout title="Organizer Dashboard">
      <div className="space-y-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Tournaments */}
          <section className="card-premium rounded-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-base2 flex items-center justify-between bg-base3/50">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Trophy size={20} className="text-yellow" />
                My Tournaments
              </h3>
              <Link to="/moderator/tournaments" className="text-primary text-sm font-bold">View List</Link>
            </div>
            <div className="p-0 flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-base2/30 text-xs font-bold uppercase text-text tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Tournament Name</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Capacity</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base2">
                    {data.myTournaments.slice(0, 5).map((t) => (
                      <tr key={t._id} className="hover:bg-base2/20 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-text-emphasis">{t.name}</p>
                          <p className="text-xs text-text">{new Date(t.startDate).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs">
                            <Users size={14} className="text-base1" />
                            {t.confirmedPlayers.length} / {t.maxPlayers}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/moderator/manage-tournament/${t._id}`} className="text-primary font-bold text-sm">Manage</Link>
                        </td>
                      </tr>
                    ))}
                    {data.myTournaments.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center italic text-text">No tournaments created yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Direct Matches */}
          <section className="card-premium rounded-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-base2 flex items-center justify-between bg-base3/50">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Target size={20} className="text-violet" />
                Direct Matches
              </h3>
              <Link to="/moderator/matches" className="text-primary text-sm font-bold">View History</Link>
            </div>
            <div className="p-4 space-y-4 flex-1">
              {data.myMatches.slice(0, 4).map((m) => (
                <div key={m._id} className="p-4 rounded-xl border border-base2 bg-base3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-text-emphasis">{m.title}</h4>
                    <p className="text-xs text-text">
                      {m.player1Id.fullName} vs {m.player2Id.fullName}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={m.status} />
                    <div className="mt-2">
                       <Link to={`/moderator/match/${m._id}`} className="text-xs font-bold text-primary">Details</Link>
                    </div>
                  </div>
                </div>
              ))}
              {data.myMatches.length === 0 && (
                <div className="p-8 text-center italic text-text">No direct matches setup.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ModeratorDashboard;
