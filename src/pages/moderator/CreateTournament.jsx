import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Trophy, Calendar, MapPin, Users, Info, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateTournament = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    venue: '',
    location: '',
    format: 'single_elimination',
    numPlayers: '',
    maxPlayers: '',
    minPlayers: '',
    entryType: 'open_request',
    startDate: '',
    registrationDeadline: '',
    matchSetsCount: 1,
    stakePerPlayer: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'numPlayers') {
      const val = value === '' ? '' : parseInt(value) || 0;
      setFormData(prev => ({ ...prev, numPlayers: value, minPlayers: val, maxPlayers: val }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Date validation
    if (new Date(formData.startDate) < new Date(formData.registrationDeadline)) {
      return toast.error('Start date cannot be before the registration deadline. They can be the same day.');
    }

    setLoading(true);
    try {
      await api.post('/tournaments', formData);
      toast.success('Tournament created and open for players!');
      navigate('/moderator');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create New Tournament">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <section className="card-premium p-8 rounded-2xl space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 border-b border-base2 pb-4">
              <Info size={20} className="text-primary" />
              General Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2">
                <label className="block text-sm font-bold text-text-emphasis mb-2">Tournament Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g., Summer Masters 2026"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-text-emphasis mb-2">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Rules, prize info, etc."
                ></textarea>
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
                    placeholder="Cue Haven"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-emphasis mb-2">Location</label>
                <input
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Chicago, IL"
                />
              </div>
            </div>
          </section>

          {/* Rules & Limits */}
          <section className="card-premium p-8 rounded-2xl space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 border-b border-base2 pb-4">
              <Trophy size={20} className="text-yellow" />
              Tournament Rules
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-text-emphasis mb-2">Format</label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="single_elimination">Single Elimination</option>
                  <option value="double_elimination">Double Elimination</option>
                  <option value="round_robin">Round Robin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-emphasis mb-2">No. of players</label>
                <div className="relative">
                  <Users size={18} className="absolute left-3 top-3.5 text-base1" />
                  <input
                    name="numPlayers"
                    type="number"
                    min="2"
                    value={formData.numPlayers}
                    onChange={handleChange}
                    placeholder="e.g., 16"
                    className="w-full bg-base2/30 border border-base2 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-emphasis mb-2">Registration Type</label>
                <select
                  name="entryType"
                  value={formData.entryType}
                  onChange={handleChange}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="open_request">Open Request</option>
                  <option value="invite_only">Invite Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-emphasis mb-2">Start Date</label>
                <input
                  name="startDate"
                  type="date"
                  required
                  min={today}
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-emphasis mb-2">Reg. Deadline</label>
                <input
                  name="registrationDeadline"
                  type="date"
                  required
                  min={today}
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-emphasis mb-2">Sets per Match</label>
                <input
                  name="matchSetsCount"
                  type="number"
                  min="1"
                  max="11"
                  step="2"
                  value={formData.matchSetsCount}
                  onChange={handleChange}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                />
                <p className="text-[10px] text-text/50 mt-1 italic font-bold uppercase transition-all">Best of {formData.matchSetsCount} (1, 3, 5...)</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-emphasis mb-2">Stake per Player (KES)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-emerald-500 font-bold text-sm">KES</span>
                  <input
                    name="stakePerPlayer"
                    type="number"
                    min="0"
                    value={formData.stakePerPlayer}
                    onChange={handleChange}
                    placeholder="0 for free"
                    className="w-full bg-base2/30 border border-base2 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none font-bold text-emerald-600"
                  />
                </div>
                <p className="text-[10px] text-text/50 mt-1 font-bold italic uppercase transition-all">Player pays this to join</p>
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
              className="btn-primary px-12 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Create Tournament
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateTournament;
