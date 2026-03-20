import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Target, Users, Calendar, MapPin, Search, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateMatch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    player1Id: '',
    player2Id: '',
    venue: '',
    location: '',
    scheduledAt: '',
    notes: '',
  });

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data } = await api.get('/users/players');
        setPlayers(data);
      } catch (err) {
        toast.error('Failed to load players');
      }
    };
    fetchPlayers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.player1Id === formData.player2Id) {
      return toast.error('Please select two different players');
    }
    setLoading(true);
    try {
      await api.post('/direct-matches', formData);
      toast.success('Direct match created and invitations sent!');
      navigate('/moderator');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating match');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(p => 
    p.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Setup Direct Match">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="card-premium p-8 rounded-2xl space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 border-b border-base2 pb-4">
              <Target size={20} className="text-violet" />
              Match Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-text-emphasis mb-2">Match Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g., Friday Afternoon Friendly"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-emphasis mb-2">Venue</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3.5 text-base1" />
                  <input
                    name="venue"
                    type="text"
                    required
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full bg-base2/30 border border-base2 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="The Green Room"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-emphasis mb-2">Scheduled At</label>
                <input
                  name="scheduledAt"
                  type="datetime-local"
                  required
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </section>

          <section className="card-premium p-8 rounded-2xl space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 border-b border-base2 pb-4">
              <Users size={20} className="text-blue" />
              Selection Exactly 2 Players
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Player 1 Selection */}
              <div>
                <label className="block text-sm font-bold text-text-emphasis mb-2">Player 1</label>
                <select
                  name="player1Id"
                  required
                  value={formData.player1Id}
                  onChange={handleChange}
                  className="w-full bg-base3 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none mb-2"
                >
                  <option value="">Select Player 1</option>
                  {players.map(p => (
                    <option key={p._id} value={p._id}>{p.fullName}</option>
                  ))}
                </select>
              </div>

              {/* Player 2 Selection */}
              <div>
                <label className="block text-sm font-bold text-text-emphasis mb-2">Player 2</label>
                <select
                  name="player2Id"
                  required
                  value={formData.player2Id}
                  onChange={handleChange}
                  className="w-full bg-base3 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none mb-2"
                >
                  <option value="">Select Player 2</option>
                  {players.map(p => (
                    <option key={p._id} value={p._id}>{p.fullName}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/moderator')}
              className="px-8 py-3 rounded-xl border border-base2 font-bold text-text hover:bg-base2/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-violet text-base3 px-12 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-violet/20 hover:bg-violet/90 disabled:opacity-70"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              Send Match Invites
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateMatch;
