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
      <div className="min-h-screen flex">
        <div className="hidden md:flex md:w-1/2 relative bg-base2">
          <img src="/images/players_win.png" alt="Cue Arena" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-base3/80 via-base3/60 to-primary/30" />
          <div className="relative z-10 flex flex-col justify-center p-16">
            <Link to="/" className="inline-flex items-center gap-3 mb-8">
              <span className="text-4xl brand-premium drop-shadow-lg">Cue Arena</span>
            </Link>
            <h2 className="text-3xl font-bold text-text-light mb-4 drop-shadow-md">Application Received!</h2>
            <p className="text-lg text-text-light/80 max-w-md leading-relaxed">
              Thank you for applying to be a moderator. Our management team will review your details and contact you via email shortly.
            </p>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-background">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
            <div className="md:hidden mb-8">
              <Link to="/" className="inline-flex items-center gap-3 mb-4">
                <span className="text-3xl brand-premium">Cue Arena</span>
              </Link>
            </div>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image */}
      <div className="hidden md:flex md:w-1/2 relative bg-base2">
        <img
          src="/images/players_win.png"
          alt="Cue Arena"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-base3/80 via-base3/60 to-primary/30" />
        <div className="relative z-10 flex flex-col justify-center p-16">
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <span className="text-4xl brand-premium drop-shadow-lg">Cue Arena</span>
          </Link>
          <h2 className="text-3xl font-bold text-text-light mb-4 drop-shadow-md">
            Become a Moderator
          </h2>
          <p className="text-lg text-text-light/80 max-w-md leading-relaxed">
            Join our elite management team and help shape the future of professional pool. Organize tournaments, manage matches, and build the community.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-lg">
          {/* Mobile Brand */}
          <div className="md:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-base2 rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-primary" size={24} />
              </div>
              <span className="text-2xl brand-premium">Cue Arena</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-text-emphasis mb-2">Become a Moderator</h1>
          <p className="text-text mb-8">Join our elite management team and help shape the future of professional pool.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-text-emphasis mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base1">
                    <User size={18} />
                  </div>
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-base2/50 border border-base2 rounded-xl pl-10 pr-4 py-3 text-text-emphasis focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-emphasis mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base1">
                    <Mail size={18} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-base2/50 border border-base2 rounded-xl pl-10 pr-4 py-3 text-text-emphasis focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-emphasis mb-2">Phone Number (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base1">
                  <Phone size={18} />
                </div>
                <input
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-base2/50 border border-base2 rounded-xl pl-10 pr-4 py-3 text-text-emphasis focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-emphasis mb-2">Why do you want to join?</label>
              <textarea
                name="experience"
                required
                rows={5}
                value={formData.experience}
                onChange={handleChange}
                className="w-full bg-base2/50 border border-base2 rounded-xl px-4 py-3 text-text-emphasis focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                placeholder="Tell us about your experience with pool management or refereeing..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group h-14 bg-primary hover:bg-primary-dark disabled:opacity-70 text-text-light font-black text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-base3/0 via-base3/10 to-base3/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <Send size={20} />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/register" className="text-text/50 font-bold hover:text-primary transition-colors inline-flex items-center gap-2">
              <ArrowLeft size={16} /> Back to Player Registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeratorApplication;
