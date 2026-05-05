import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Target, Users, Calendar, MapPin, Search, Loader2, Send, X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateBattle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    location: '',
    stakeAmount: 0,
  });

  // Handle live search
  useEffect(() => {
    const searchPlayers = async () => {
      if (searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data } = await api.get(`/users/players?search=${searchQuery}`);
        // Filter out already selected players
        const filtered = data.filter(
          p => !selectedPlayers.some(selected => selected.id === p.id)
        );
        setSearchResults(filtered);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchPlayers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedPlayers]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectPlayer = (player) => {
    setSelectedPlayers([...selectedPlayers, player]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemovePlayer = (id) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== id));
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    return `${name[0]}***@${domain}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedPlayers.length < 2) {
      return toast.error('Please select at least two players for a battle');
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        invitedPlayerIds: selectedPlayers.map(p => p.id),
      };
      await api.post('/battles', payload);
      toast.success('Multiplayer battle created and invitations sent!');
      navigate('/moderator');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating battle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Setup Multiplayer Battle">
      <div className="max-w-4xl mx-auto pb-20">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Battle Info Section */}
          <section className="card-premium p-8 rounded-2xl space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 border-b border-base2 pb-4 text-text-emphasis">
              <Shield size={20} className="text-primary" />
              Battle Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-text mb-2">Battle Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="e.g., Friday Night Showdown"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text mb-2">Venue</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3.5 text-base1" />
                  <input
                    name="venue"
                    type="text"
                    required
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full bg-base2/30 border border-base2 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Cue Masters Hub"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text mb-2">Location / Area</label>
                <input
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="e.g. Westlands, Nairobi"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text mb-2">Stake Amount (KES)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-emerald-500 font-bold text-sm">KES</span>
                  <input
                    name="stakeAmount"
                    type="number"
                    min="0"
                    value={formData.stakeAmount}
                    onChange={handleChange}
                    className="w-full bg-base2/30 border border-base2 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-emerald-600"
                    placeholder="0"
                  />
                </div>
                <p className="text-[10px] text-text/50 mt-1 font-bold italic">Each participant pays this amount</p>
              </div>

            </div>
          </section>

          {/* Player Selection Section */}
          <section className="card-premium p-8 rounded-2xl space-y-6 relative">
            <h3 className="text-xl font-bold flex items-center gap-2 border-b border-base2 pb-4 text-text-emphasis">
              <Users size={20} className="text-blue" />
              Invite Participants
            </h3>

            <div className="relative">
              <label className="block text-sm font-bold text-text mb-2">Search Player (Name or Email)</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3.5 text-base1" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-base2/30 border border-base2 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Type at least 3 characters..."
                />
                {isSearching && (
                  <div className="absolute right-3 top-3.5">
                    <Loader2 size={18} className="animate-spin text-primary" />
                  </div>
                )}
              </div>

              {/* Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-base3 border border-base2 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPlayer(p)}
                      className="w-full px-4 py-3 text-left hover:bg-base2/50 flex items-center gap-3 transition-colors border-b border-base2 last:border-0"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {p.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-text-emphasis text-sm">{p.fullName}</p>
                          <p className="text-xs text-text">{p.email}</p>
                        </div>
                      </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Players List */}
            <div className="space-y-3 pt-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text">Selected Players ({selectedPlayers.length})</h4>
                {selectedPlayers.length >= 2 && (
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                    Ready to Battle
                  </span>
                )}
              </div>
              
              {selectedPlayers.length === 0 && (
                <div className="p-8 border-2 border-dashed border-base2 rounded-xl text-center text-text opacity-40 italic text-sm">
                  No players selected yet. Search and add at least 2 players.
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPlayers.map((p, index) => (
                  <div key={p.id} className="bg-base3 border border-base2 p-4 rounded-xl flex items-center justify-between group hover:border-primary transition-colors shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-text-emphasis truncate max-w-[150px]">{p.fullName}</p>
                        <p className="text-xs text-text truncate max-w-[150px]">{maskEmail(p.email)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(p.id)}
                      className="p-2 text-red hover:bg-red/5 rounded-lg transition-colors"
                      title="Remove Player"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Submittion */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/moderator')}
              className="px-8 py-3 rounded-xl border border-base2 font-bold text-text hover:bg-base2/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedPlayers.length < 2}
              className="bg-primary text-base3 px-12 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              Send Battle Invites
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateBattle;
