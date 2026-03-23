import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { ShieldCheck, Mail, User, Phone, Send, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ModeratorApplication = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/moderator-requests', formData);
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full card-premium p-10 text-center rounded-[32px]"
        >
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-text-emphasis mb-4">Application Received!</h2>
          <p className="text-text/70 mb-8 font-medium">
            Thank you for applying to be a moderator. Our management team will review your details and contact you via email shortly.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-2xl">
            Return Home <ArrowLeft size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-10 h-10 bg-base2 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <ShieldCheck className="text-primary" size={24} />
            </div>
            <span className="text-2xl brand-premium">Cue-Arena</span>
          </Link>
          <h1 className="text-4xl lg:text-5xl font-black text-text-emphasis mb-4 tracking-tight">Become a Moderator</h1>
          <p className="text-text/60 text-lg font-medium">Join our elite management team and help shape the future of professional pool.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-8 lg:p-12 rounded-[40px] border border-base2/50 backdrop-blur-3xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-text-emphasis mb-3 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text/30">
                    <User size={18} />
                  </div>
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-base2/30 border border-base2/50 rounded-2xl pl-12 pr-4 py-4 text-text-emphasis focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-text-emphasis mb-3 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text/30">
                    <Mail size={18} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-base2/30 border border-base2/50 rounded-2xl pl-12 pr-4 py-4 text-text-emphasis focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-text-emphasis mb-3 uppercase tracking-widest">Phone Number (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text/30">
                  <Phone size={18} />
                </div>
                <input
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-base2/30 border border-base2/50 rounded-2xl pl-12 pr-4 py-4 text-text-emphasis focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-text-emphasis mb-3 uppercase tracking-widest">Why do you want to join?</label>
              <textarea
                name="experience"
                required
                rows={5}
                value={formData.experience}
                onChange={handleChange}
                className="w-full bg-base2/30 border border-base2/50 rounded-2xl px-6 py-4 text-text-emphasis focus:ring-2 focus:ring-primary outline-none transition-all font-medium resize-none"
                placeholder="Tell us about your experience with pool management or refereeing..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 text-xl font-black shadow-2xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </motion.div>

        <div className="mt-8 text-center">
          <Link to="/register" className="text-text/50 font-bold hover:text-primary transition-colors flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Back to Player Registration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ModeratorApplication;
