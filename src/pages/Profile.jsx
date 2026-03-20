import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, FileText, Camera, Save, Key, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    profilePhoto: user?.profilePhoto || '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const updateData = {
        fullName: formData.fullName,
        bio: formData.bio,
        phone: formData.phone,
        profilePhoto: formData.profilePhoto
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateProfile(updateData);
      toast.success('Profile updated successfully');
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Profile Settings">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        
        {/* Profile Card */}
        <div className="card-premium p-8 rounded-3xl border-none shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <img 
                  src={formData.profilePhoto || `https://ui-avatars.com/api/?name=${formData.fullName}&background=random`} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-3xl object-cover ring-4 ring-base2 shadow-xl group-hover:scale-[1.02] transition-all"
                />
                <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-text-emphasis">{user?.fullName}</h2>
                <p className="text-sm font-medium text-text/60 uppercase tracking-widest mt-1">{user?.role}</p>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-text/40 tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40" size={18} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-base2/50 border border-base2 rounded-2xl pl-12 pr-4 py-3.5 text-text-emphasis focus:ring-2 focus:ring-primary shadow-sm outline-none transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-text/40 tracking-widest ml-1">Email (Read Only)</label>
                <div className="relative opacity-60">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    className="w-full bg-base2/50 border border-base2 rounded-2xl pl-12 pr-4 py-3.5 text-text-emphasis shadow-sm outline-none cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-text/40 tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40" size={18} />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-base2/50 border border-base2 rounded-2xl pl-12 pr-4 py-3.5 text-text-emphasis focus:ring-2 focus:ring-primary shadow-sm outline-none transition-all"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-text/40 tracking-widest ml-1">Profile Photo URL</label>
                <div className="relative">
                  <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40" size={18} />
                  <input
                    type="text"
                    name="profilePhoto"
                    value={formData.profilePhoto}
                    onChange={handleChange}
                    className="w-full bg-base2/50 border border-base2 rounded-2xl pl-12 pr-4 py-3.5 text-text-emphasis focus:ring-2 focus:ring-primary shadow-sm outline-none transition-all"
                    placeholder="Paste image URL"
                  />
                </div>
              </div>

              <div className="col-span-full space-y-2">
                <label className="text-xs font-black uppercase text-text/40 tracking-widest ml-1">Bio</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-text/40" size={18} />
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-base2/50 border border-base2 rounded-2xl pl-12 pr-4 py-3.5 text-text-emphasis focus:ring-2 focus:ring-primary shadow-sm outline-none transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="col-span-full pt-4 mt-4 border-t border-base2">
                <h3 className="text-base font-bold text-text-emphasis flex items-center gap-2 mb-6">
                  <Key size={18} className="text-primary" />
                  Security Settings
                </h3>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-text/40 tracking-widest ml-1">New Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-base2/50 border border-base2 rounded-2xl px-4 py-3.5 text-text-emphasis focus:ring-2 focus:ring-primary shadow-sm outline-none transition-all"
                  placeholder="Min. 6 characters"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-text/40 tracking-widest ml-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-base2/50 border border-base2 rounded-2xl px-4 py-3.5 text-text-emphasis focus:ring-2 focus:ring-primary shadow-sm outline-none transition-all"
                  placeholder="Repeat your password"
                />
              </div>

              <div className="col-span-full pt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
