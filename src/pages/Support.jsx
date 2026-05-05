import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import AuraCard from '../components/AuraCard';
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technical',
    priority: 'medium'
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/support/my');
      setTickets(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/support', formData);
      toast.success('Ticket submitted successfully!');
      setShowNewTicket(false);
      setFormData({ title: '', description: '', category: 'technical', priority: 'medium' });
      fetchTickets();
    } catch (err) {
      toast.error('Failed to submit ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-primary bg-primary/10 border-primary/20';
      case 'in_progress': return 'text-yellow bg-yellow/10 border-yellow/20';
      case 'resolved': return 'text-green bg-green/10 border-green/20';
      case 'closed': return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      default: return 'text-gray-400';
    }
  };

  return (
    <DashboardLayout title="Support & Help">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-text-emphasis uppercase tracking-tighter">Support Center</h2>
            <p className="text-gray-500 text-sm">Need help? We're here for you 24/7.</p>
          </div>
          <button
            onClick={() => setShowNewTicket(!showNewTicket)}
            className="aura-btn bg-primary text-base3 p-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2"
          >
            {showNewTicket ? <Clock size={18} /> : <Plus size={18} />}
            {showNewTicket ? 'View History' : 'New Ticket'}
          </button>
        </div>

        {showNewTicket ? (
          <AuraCard className="p-8 border-none">
            <h3 className="text-lg font-black text-text-emphasis uppercase tracking-tighter mb-6 flex items-center gap-2">
              <Send size={20} className="text-primary" />
              Open New Support Request
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-emphasis mb-2">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="Summarize your issue..."
                  className="w-full bg-base3 border border-base2 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-emphasis mb-2">Category</label>
                  <select
                    className="w-full bg-base3 border border-base2 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 appearance-none font-bold"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="technical">Technical Issue</option>
                    <option value="payment">Payment / Wallet</option>
                    <option value="dispute">Game Dispute</option>
                    <option value="feedback">General Feedback</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-emphasis mb-2">Priority</label>
                  <select
                    className="w-full bg-base3 border border-base2 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 appearance-none font-bold"
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-emphasis mb-2">Description</label>
                <textarea
                  rows="5"
                  required
                  placeholder="Provide details about your issue..."
                  className="w-full bg-base3 border border-base2 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold resize-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
              <button type="submit" className="w-full aura-btn bg-primary text-base3 py-4 rounded-xl font-black uppercase tracking-widest">
                Submit Ticket
              </button>
            </form>
          </AuraCard>
        ) : (
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="text-center py-20 bg-dark-lighter rounded-3xl border-2 border-dashed border-base3/10">
                <MessageSquare size={48} className="mx-auto text-gray-700 mb-4 opacity-20" />
                <p className="text-gray-500 font-bold italic">No active support tickets.</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <AuraCard key={ticket.id} className="p-0 overflow-hidden border-none group transition-all hover:scale-[1.01]">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">#{String(ticket.id).slice(-8)}</span>
                      </div>
                      <span className="text-[10px] font-black text-gray-600">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-lg font-black text-text-emphasis uppercase tracking-tighter mb-2">{ticket.title}</h4>
                    <p className="text-gray-400 text-sm line-clamp-2 italic">"{ticket.description}"</p>
                  </div>

                  {ticket.responses?.length > 0 && (
                    <div className="bg-primary/5 p-6 border-t border-primary/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase text-primary">Admin Response</span>
                      </div>
                      <p className="text-sm font-bold text-text-emphasis border-l-2 border-primary/40 pl-4 py-1">
                        {ticket.responses[ticket.responses.length - 1].message}
                      </p>
                    </div>
                  )}
                </AuraCard>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Support;
