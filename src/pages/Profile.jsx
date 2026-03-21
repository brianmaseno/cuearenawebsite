import React, { useState, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, FileText, Camera, Save, Key, Loader2, Bell, ShieldAlert, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    whatsApp: user?.whatsApp || '',
    profilePhoto: user?.profilePhoto || '',
    notifications: {
      email: user?.notifications?.email ?? true,
      push: user?.notifications?.push ?? true,
    },
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('notif_')) {
      const field = name.replace('notif_', '');
      setFormData({
        ...formData,
        notifications: { ...formData.notifications, [field]: checked }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error('File size too large. Max 2MB.');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
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
        whatsApp: formData.whatsApp,
        profilePhoto: formData.profilePhoto,
        notifications: formData.notifications
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
      <div className="max-w-4xl mx-auto space-y-8 pb-32">
        
        {/* Profile Card */}
        <div className="card-premium p-8 rounded-3xl border-none shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group/avatar cursor-pointer" onClick={handleImageClick}>
                <img 
                  src={formData.profilePhoto || `https://ui-avatars.com/api/?name=${formData.fullName}&background=random`} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-3xl object-cover ring-4 ring-base2 shadow-xl group-hover/avatar:scale-[1.02] transition-all"
                />
                <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-all">
                  <Camera className="text-white mb-1" size={24} />
                  <span className="text-[10px] text-white font-black uppercase tracking-widest">Update</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-black text-text-emphasis tracking-tight">{user?.fullName}</h2>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">{user?.role}</p>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text/40 tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40" size={18} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-base2/50 border border-base2 rounded-2xl pl-12 pr-4 py-3.5 text-text-emphasis focus:ring-2 focus:ring-primary shadow-sm outline-none transition-all font-bold"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text/40 tracking-widest ml-1">Account Email</label>
                <div className="relative opacity-60">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    className="w-full bg-base2/50 border border-base2 rounded-2xl pl-12 pr-4 py-3.5 text-text-emphasis shadow-sm outline-none cursor-not-allowed font-bold"
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text/40 tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40" size={18} />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-base2/50 border border-base2 rounded-2xl pl-12 pr-4 py-3.5 text-text-emphasis focus:ring-2 focus:ring-primary shadow-sm outline-none transition-all font-bold"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text/40 tracking-widest ml-1">WhatsApp Connectivity</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 bg-green/20 text-green rounded-md flex items-center justify-center">
                    <CheckCircle2 size={12} />
                  </div>
                  <input
                    type="text"
                    name="whatsApp"
                    value={formData.whatsApp}
                    onChange={handleChange}
                    className="w-full bg-base2/50 border border-base2 rounded-2xl pl-12 pr-4 py-3.5 text-text-emphasis focus:ring-2 focus:ring-primary shadow-sm outline-none transition-all font-bold"
                    placeholder="WhatsApp number"
                  />
                </div>
              </div>

              <div className="col-span-full space-y-2">
                <label className="text-[10px] font-black uppercase text-text/40 tracking-widest ml-1">Community Bio</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-text/40" size={18} />
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-base2/50 border border-base2 rounded-2xl pl-12 pr-4 py-3.5 text-text-emphasis focus:ring-2 focus:ring-primary shadow-sm outline-none transition-all resize-none font-bold italic"
                    placeholder="Share something about your cue skills..."
                  />
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="col-span-full pt-4 mt-2 border-t border-base2">
                <h3 className="text-xs font-black text-text-emphasis uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Bell size={14} className="text-primary" />
                  Communication Preferences
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between p-4 bg-base3 border border-base2 rounded-2xl cursor-pointer hover:bg-primary/5 transition-all">
                    <div>
                      <p className="text-xs font-black text-text-emphasis">Email Updates</p>
                      <p className="text-[10px] text-text/40 font-bold uppercase tracking-tight">Receive tournament alerts via mail</p>
                    </div>
                    <input 
                      type="checkbox" 
                      name="notif_email" 
                      checked={formData.notifications.email} 
                      onChange={handleChange} 
                      className="w-5 h-5 accent-primary rounded-lg border-base2"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-base3 border border-base2 rounded-2xl cursor-pointer hover:bg-primary/5 transition-all">
                    <div>
                      <p className="text-xs font-black text-text-emphasis">Browser Alerts</p>
                      <p className="text-[10px] text-text/40 font-bold uppercase tracking-tight">Live platform notifications</p>
                    </div>
                    <input 
                      type="checkbox" 
                      name="notif_push" 
                      checked={formData.notifications.push} 
                      onChange={handleChange} 
                      className="w-5 h-5 accent-primary rounded-lg border-base2"
                    />
                  </label>
                </div>
              </div>

              {/* Password Section */}
              <div className="col-span-full pt-4 mt-2 border-t border-base2">
                <h3 className="text-xs font-black text-text-emphasis uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Key size={14} className="text-primary" />
                  Security Protocol
                </h3>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text/40 tracking-widest ml-1">New Security Key</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-base2/50 border border-base2 rounded-2xl px-4 py-3.5 text-text-emphasis focus:ring-2 focus:ring-primary shadow-sm outline-none transition-all font-bold"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text/40 tracking-widest ml-1">Verify Key</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-base2/50 border border-base2 rounded-2xl px-4 py-3.5 text-text-emphasis focus:ring-2 focus:ring-primary shadow-sm outline-none transition-all font-bold"
                  placeholder="Repeat new password"
                />
              </div>

              <div className="col-span-full pt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-base3 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 shadow-xl shadow-primary/30 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Commit Changes
                </button>
              </div>

              {/* Danger Zone */}
              <div className="col-span-full pt-12 mt-8 border-t border-red/10">
                <div className="p-6 bg-red/5 border border-red/10 rounded-[32px] flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red/10 text-red rounded-2xl flex items-center justify-center shrink-0">
                       <ShieldAlert size={24} />
                    </div>
                    <div>
                       <h4 className="text-sm font-black text-red uppercase tracking-tight">Danger Zone</h4>
                       <p className="text-[11px] text-red/60 font-bold max-w-[300px]">Once you deactivate your account, there is no going back. Please be certain.</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                        if(window.confirm('Are you absolutely sure you want to deactivate your account? This action is permanent.')) {
                            toast.error('Account deactivation initiated. Please contact admin for final termination.');
                        }
                    }}
                    className="px-6 py-3 bg-red text-base3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-focus transition-all shadow-lg shadow-red/20 active:scale-95"
                  >
                    Terminate Account
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
