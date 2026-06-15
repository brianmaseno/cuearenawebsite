import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Target, Users, Calendar, MapPin, Search, Loader2, Send, X, User } from 'lucide-react';
import toast from 'react-hot-toast';
import PotSplitPreview from '../../components/moderator/PotSplitPreview';
import { calculatePotSplit } from '../../utils/potSplit';

const CreateMatch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    venue: '',
    location: '',
    notes: '',
    stakeAmount: 0,
    moderatorFee: 0,
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
    if (selectedPlayers.length >= 2) {
      toast.error('Maximum 2 players allowed');
      return;
    }
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
    if (selectedPlayers.length !== 2) {
      return toast.error('Please select exactly two players');
    }

    setLoading(true);
    try {
      const stake = Number(formData.stakeAmount) || 0;
      const modFee = Number(formData.moderatorFee) || 0;
      if (stake > 0 && modFee > 0) {
        const { winnerPrize } = calculatePotSplit(stake * 2, modFee);
        if (winnerPrize <= 0) {
          toast.error('Moderator fee is too high for this stake');
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...formData,
        setsCount: Number(formData.setsCount || 1),
        player1Id: selectedPlayers[0].id,
        player2Id: selectedPlayers[1].id,
      };
      await api.post('/direct-matches', payload);
      toast.success('Direct match created and invitations sent!');
      navigate('/moderator');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Setup Direct Match">
      <div className="max-w-4xl mx-auto pb-20">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="card-premium p-8 rounded-2xl space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 border-b border-base2 pb-4 text-text-emphasis">
              <Target size={20} className="text-violet" />
              Match Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-text mb-2">Match Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="e.g., Regional Semifinals: Smith vs Doe"
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
                    placeholder="Grand Arena Pool Club"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text mb-2">Number of Sets</label>
                <div className="relative">
                   <Target size={18} className="absolute left-3 top-3.5 text-violet" />
                   <input
                    name="setsCount"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.setsCount || 1}
                    onChange={handleChange}
                    className="w-full bg-base2/30 border border-base2 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-violet"
                    placeholder="1"
                  />
                </div>
                <p className="text-[10px] text-text/50 mt-1 font-bold italic">Best of {formData.setsCount || 1} sets</p>
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
                <p className="text-[10px] text-text/50 mt-1 font-bold italic">Each player pays this amount</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-text mb-2">Your Moderator Fee (KES)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-blue font-bold text-sm">KES</span>
                  <input
                    name="moderatorFee"
                    type="number"
                    min="0"
                    value={formData.moderatorFee}
                    onChange={handleChange}
                    className="w-full bg-base2/30 border border-base2 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-blue"
                    placeholder="0"
                  />
                </div>
                <p className="text-[10px] text-text/50 mt-1 font-bold italic">Fixed amount you earn; platform takes 1.5%</p>
                <PotSplitPreview
                  totalPot={(Number(formData.stakeAmount) || 0) * 2}
                  moderatorFee={formData.moderatorFee}
                />
              </div>

            </div>
          </section>

          <section className="card-premium p-8 rounded-2xl space-y-6 relative">
            <h3 className="text-xl font-bold flex items-center gap-2 border-b border-base2 pb-4 text-text-emphasis">
              <Users size={20} className="text-blue" />
              Select Players (Exactly 2)
            </h3>

            {selectedPlayers.length < 2 ? (
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
                {searchQuery.length >= 3 && !isSearching && searchResults.length === 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-base3 border border-base2 rounded-xl p-4 text-center text-sm italic text-text shadow-xl">
                    No active players found matching "{searchQuery}"
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-primary text-sm font-bold text-center">
                Maximum players selected. Remove one to search for another.
              </div>
            )}

            {/* Selected Players List */}
            <div className="space-y-3 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text">Selected Players</h4>
              {selectedPlayers.length === 0 && (
                <p className="text-sm italic text-text opacity-50">No players selected yet.</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPlayers.map((p, index) => (
                  <div key={p.id} className="bg-base3 border border-base2 p-4 rounded-xl flex items-center justify-between group hover:border-primary transition-colors shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-base2 flex items-center justify-center text-text font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-text-emphasis">{p.fullName}</p>
                        <p className="text-xs text-text">{maskEmail(p.email)}</p>
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
              disabled={loading || selectedPlayers.length !== 2}
              className="bg-violet text-base3 px-12 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-violet/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
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
