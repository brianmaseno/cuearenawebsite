import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import { DashPanel, DashField, dashInputClass } from '../components/ui/DashPanel';
import StatusPill from '../components/ui/StatusPill';
import {
  MessageSquare,
  Send,
  Plus,
  Shield,
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
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/support', formData);
      toast.success('Ticket submitted');
      setShowNewTicket(false);
      setFormData({ title: '', description: '', category: 'technical', priority: 'medium' });
      fetchTickets();
    } catch (err) {
      toast.error('Failed to submit ticket');
    }
  };

  const statusTone = (status) => {
    if (status === 'resolved' || status === 'closed') return 'success';
    if (status === 'in_progress') return 'warning';
    return 'info';
  };

  return (
    <DashboardLayout title="Support">
      <div className="max-w-2xl mx-auto space-y-5 pb-24">
        <div className="flex justify-between items-center gap-4">
          <p className="text-sm text-text-muted">Get help with technical issues, payments, or disputes.</p>
          <button
            type="button"
            onClick={() => setShowNewTicket(!showNewTicket)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-magenta to-violet text-white shrink-0"
          >
            {showNewTicket ? <MessageSquare size={16} /> : <Plus size={16} />}
            {showNewTicket ? 'My tickets' : 'New request'}
          </button>
        </div>

        {showNewTicket ? (
          <DashPanel title="Open support request" description="Describe your issue and we'll respond soon" icon={Send}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <DashField label="Issue title">
                <input
                  type="text"
                  required
                  placeholder="Brief summary"
                  className={dashInputClass}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </DashField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DashField label="Category">
                  <select
                    className={dashInputClass}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="technical">Technical issue</option>
                    <option value="payment">Payment / wallet</option>
                    <option value="dispute">Game dispute</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </DashField>
                <DashField label="Priority">
                  <select
                    className={dashInputClass}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </DashField>
              </div>
              <DashField label="Description">
                <textarea
                  rows={5}
                  required
                  placeholder="Provide details about your issue…"
                  className={`${dashInputClass} resize-none`}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </DashField>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-magenta to-violet text-white text-sm font-semibold"
              >
                Submit ticket
              </button>
            </form>
          </DashPanel>
        ) : loading ? (
          <p className="text-sm text-text-muted text-center py-12">Loading tickets…</p>
        ) : tickets.length === 0 ? (
          <DashPanel>
            <div className="text-center py-10">
              <MessageSquare size={40} className="mx-auto text-text-muted opacity-40 mb-3" />
              <p className="text-sm font-medium text-text-emphasis">No support tickets</p>
              <p className="text-sm text-text-muted mt-1">Open a new request if you need help.</p>
            </div>
          </DashPanel>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <DashPanel key={ticket.id} className="!p-4">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <StatusPill tone={statusTone(ticket.status)}>{ticket.status.replace(/_/g, ' ')}</StatusPill>
                  <span className="text-xs text-text-muted">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-semibold text-text-emphasis">{ticket.title}</h4>
                <p className="text-sm text-text-muted mt-1 line-clamp-2">{ticket.description}</p>
                {ticket.responses?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-base2/30">
                    <p className="text-xs font-medium text-magenta flex items-center gap-1 mb-2">
                      <Shield size={12} /> Staff reply
                    </p>
                    <p className="text-sm text-text pl-3 border-l-2 border-magenta/40">
                      {ticket.responses[ticket.responses.length - 1].message}
                    </p>
                  </div>
                )}
              </DashPanel>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Support;
