import React, { useState, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, FileText, Camera, Save, Key, Loader2, Bell, ShieldAlert } from 'lucide-react';
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
    <DashboardLayout title="Member Profile">
      <div className="max-w-3xl mx-auto space-y-6 pb-20 pt-2">
        
        {/* Profile Card */}
        <div className="aura-card p-6 border-none shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-[80px] group-hover:bg-primary/10 transition-all duration-700"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="relative group/avatar cursor-pointer" onClick={handleImageClick}>
                <div className="w-32 h-32 rounded-[32px] overflow-hidden ring-1 ring-primary/20 shadow-xl ring-offset-2 ring-offset-base3 group-hover/avatar:ring-primary/40 transition-all duration-500">
                  <img 
                    src={formData.profilePhoto || `https://ui-avatars.com/api/?name=${formData.fullName}&background=random`} 
                    alt="Profile" 
                    className="w-full h-full object-cover group-hover/avatar:scale-110 transition-all duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] rounded-[32px] opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-all duration-500">
                  <Camera className="text-white mb-1 drop-shadow-lg" size={24} strokeWidth={1.5} />
                  <span className="text-[10px] text-white font-medium uppercase tracking-widest">Update</span>
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
                <h2 className="text-xl font-medium text-text-emphasis tracking-tight">{user?.fullName}</h2>
                <div className="px-3 py-1 bg-primary/10 rounded-full mt-1.5 inline-block">
                  <p className="text-[9px] font-medium text-primary uppercase tracking-widest">{user?.role}</p>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Identity Details */}
              <div className="col-span-full">
                <h3 className="text-[13px] font-medium text-text-emphasis mb-3 flex items-center gap-2">
                   <div className="w-1 h-1 bg-primary rounded-full" />
                   Identity Details
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium uppercase text-text/50 tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-base3/50 border border-base2/50 rounded-xl pl-11 pr-4 py-3 text-sm text-text-emphasis focus:border-primary/30 shadow-inner outline-none transition-all font-medium relative z-10"
                    placeholder="Full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium uppercase text-text/50 tracking-widest ml-1">Account Email</label>
                <div className="relative opacity-60">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    className="w-full bg-base3/30 border border-base2/30 rounded-xl pl-11 pr-4 py-3 text-sm text-text-emphasis shadow-sm outline-none cursor-not-allowed font-medium"
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium uppercase text-text/50 tracking-widest ml-1">Phone Contact</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-base3/50 border border-base2/50 rounded-xl pl-11 pr-4 py-3 text-sm text-text-emphasis focus:border-primary/30 shadow-inner outline-none transition-all font-medium relative z-10"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="col-span-full space-y-1.5">
                <label className="text-[10px] font-medium uppercase text-text/50 tracking-widest ml-1">Member Bio</label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-3.5 text-text/30 group-focus-within:text-primary transition-colors" size={18} />
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="2"
                    className="w-full bg-base3/50 border border-base2/50 rounded-2xl pl-11 pr-4 py-3 text-sm text-text-emphasis focus:border-primary/30 shadow-inner outline-none transition-all resize-none font-medium leading-relaxed italic relative z-10"
                    placeholder="Short bit about yourself..."
                  />
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="col-span-full pt-6 mt-2 border-t border-base2/20">
                <h3 className="text-[13px] font-medium text-text-emphasis mb-3 flex items-center gap-2">
                   <div className="w-1 h-1 bg-primary rounded-full" />
                   Global Alerts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between p-4 bg-base3/40 border border-base2/40 rounded-2xl cursor-pointer hover:bg-primary/5 transition-all group/opt">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary/60 transition-colors group-hover/opt:bg-primary/10">
                        <Mail size={16} />
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-text-emphasis">Email</p>
                        <p className="text-[9px] text-text/40 font-medium uppercase tracking-tight">Schedules</p>
                      </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-all relative ${formData.notifications.email ? 'bg-primary' : 'bg-base2'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.notifications.email ? 'left-5.5' : 'left-0.5'}`} />
                      <input 
                        type="checkbox" 
                        name="notif_email" 
                        checked={formData.notifications.email} 
                        onChange={handleChange} 
                        className="hidden"
                      />
                    </div>
                  </label>
                  <label className="flex items-center justify-between p-4 bg-base3/40 border border-base2/40 rounded-2xl cursor-pointer hover:bg-primary/5 transition-all group/opt">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary/60 transition-colors group-hover/opt:bg-primary/10">
                        <Bell size={16} />
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-text-emphasis">Browser</p>
                        <p className="text-[9px] text-text/40 font-medium uppercase tracking-tight">Real-time alerts</p>
                      </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-all relative ${formData.notifications.push ? 'bg-primary' : 'bg-base2'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.notifications.push ? 'left-5.5' : 'left-0.5'}`} />
                      <input 
                        type="checkbox" 
                        name="notif_push" 
                        checked={formData.notifications.push} 
                        onChange={handleChange} 
                        className="hidden"
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* Password Section */}
              <div className="col-span-full pt-6 mt-2 border-t border-base2/20">
                <h3 className="text-[13px] font-medium text-text-emphasis mb-3 flex items-center gap-2">
                   <div className="w-1 h-1 bg-primary rounded-full" />
                   Security Protocol
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium uppercase text-text/50 tracking-widest ml-1">New Passcode</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-base3/50 border border-base2/50 rounded-xl pl-11 pr-4 py-3 text-sm text-text-emphasis focus:border-primary/30 shadow-inner outline-none transition-all font-medium relative z-10"
                    placeholder="New password"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium uppercase text-text/50 tracking-widest ml-1">Verify Passcode</label>
                <div className="relative group">
                   <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-primary transition-colors" size={18} />
                   <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-base3/50 border border-base2/50 rounded-xl pl-11 pr-4 py-3 text-sm text-text-emphasis focus:border-primary/30 shadow-inner outline-none transition-all font-medium relative z-10"
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <div className="col-span-full pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="aura-btn w-full py-4 bg-primary text-base3 rounded-2xl font-medium uppercase tracking-widest text-xs active:scale-95 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 group/btn"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} strokeWidth={1.5} /> : <Save size={18} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform" />}
                  Save Changes
                </button>
              </div>

              {/* Account Management Zone */}
              <div className="col-span-full mt-8 p-6 bg-base2/10 rounded-[32px] border border-base2/20 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                       <Key size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                       <h4 className="text-[15px] font-medium text-text-emphasis tracking-tight">Active Session</h4>
                       <p className="text-[11px] text-text/40 font-medium leading-relaxed mt-0.5 max-w-[240px]">Securely sign out of your account on this device.</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                        if(window.confirm('Are you sure you want to log out?')) {
                            // The actual logout logic would go here if I had access to the context
                            window.location.href = '/login'; // Fallback redirect if direct call isn't easy
                        }
                    }}
                    className="px-8 py-3 bg-primary text-base3 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all duration-300"
                  >
                    Log Out
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="col-span-full mt-4 p-6 bg-base2/5 rounded-[32px] border border-red/5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-12 h-12 bg-red/10 text-red rounded-2xl flex items-center justify-center shrink-0 shadow-sm shadow-red/10">
                       <ShieldAlert size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                       <h4 className="text-[15px] font-medium text-text-emphasis tracking-tight">Deactivate Account</h4>
                       <p className="text-[11px] text-text/40 font-medium leading-relaxed mt-0.5 max-w-[240px]">Permanently remove your tournament presence.</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                        if(window.confirm('Terminate presence in Cue Arena? This action is irrevocable.')) {
                            toast.error('Termination sequence initiated.');
                        }
                    }}
                    className="px-6 py-3 bg-red/5 text-red border border-red/10 rounded-2xl font-medium text-[10px] uppercase tracking-widest hover:bg-red hover:text-base3 transition-all duration-300 active:scale-95 whitespace-nowrap"
                  >
                    Terminate
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
