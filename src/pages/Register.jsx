import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'player',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await register(formData);
      toast.success(`Account created! Welcome, ${user.fullName}`);
      
      if (user.role === 'moderator') navigate('/moderator');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <span className="text-3xl brand-premium">Cue-Arena</span>
          </Link>
          <p className="text-text">Join the premium pool community today</p>
        </div>

        <div className="card-premium p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form Fields */}
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
                  className="w-full bg-base2/50 border border-base2 rounded-xl pl-10 pr-4 py-3 text-text-emphasis focus:ring-2 focus:ring-primary outline-none"
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
                  className="w-full bg-base2/50 border border-base2 rounded-xl pl-10 pr-4 py-3 text-text-emphasis focus:ring-2 focus:ring-primary outline-none"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-emphasis mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base1">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-base2/50 border border-base2 rounded-xl pl-10 pr-4 py-3 text-text-emphasis focus:ring-2 focus:ring-primary outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 mt-4 rounded-xl flex items-center justify-center gap-2 text-lg font-bold shadow-md disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-base2">
            <p className="text-text">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
