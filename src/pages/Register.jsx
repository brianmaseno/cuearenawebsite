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
              className="w-full relative group h-14 mt-4 bg-primary hover:bg-primary-dark disabled:opacity-70 text-text-light font-black text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-base3/0 via-base3/10 to-base3/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="flex items-center justify-center gap-3">
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    <span>Initializing Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <UserPlus size={20} className="group-hover:scale-110 transition-all" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-base2">
            <p className="text-text">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-base2/50 text-center">
            <p className="text-text/60 font-medium mb-1">Looking to manage tournaments?</p>
            <Link to="/moderator-apply" className="text-primary font-black hover:underline tracking-tight">
              APPLY AS MODERATOR
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
