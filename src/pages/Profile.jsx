import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { DashPanel, DashField, dashInputClass } from '../components/ui/DashPanel';
import StatusPill from '../components/ui/StatusPill';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, FileText, Camera, Save, Key, Loader2, Bell, LogOut, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
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
    const { name, value, checked } = e.target;
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

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error('File size too large. Max 2MB.');
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, profilePhoto: reader.result });
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
      if (formData.password) updateData.password = formData.password;
      await updateProfile(updateData);
      toast.success('Profile updated');
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-2xl mx-auto space-y-5 pb-24">
        {/* Identity header */}
        <DashPanel className="!p-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleImageClick}
              className="relative shrink-0 group"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-base2/50 bg-surface">
                <img
                  src={formData.profilePhoto || `https://ui-avatars.com/api/?name=${formData.fullName}&background=ec4899&color=fff`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={18} className="text-white" />
              </span>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-text-emphasis truncate">{user?.fullName}</h2>
                {user?.isVerified && <CheckCircle2 size={16} className="text-green shrink-0" />}
              </div>
              <StatusPill tone="info" className="mt-1.5 capitalize">{user?.role}</StatusPill>
            </div>
          </div>
        </DashPanel>

        <form onSubmit={handleSubmit} className="space-y-5">
          <DashPanel title="Identity" description="Your public profile information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DashField label="Full name">
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={dashInputClass} required />
              </DashField>
              <DashField label="Email" hint={user?.isVerified ? 'Verified' : 'Not verified'}>
                <input type="email" value={formData.email} className={`${dashInputClass} opacity-60 cursor-not-allowed`} readOnly />
              </DashField>
              <DashField label="Phone">
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={dashInputClass} placeholder="+254…" />
              </DashField>
              <DashField label="Bio" className="sm:col-span-2">
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className={`${dashInputClass} resize-none`} placeholder="A short bio…" />
              </DashField>
            </div>
          </DashPanel>

          <DashPanel title="Notifications" description="How we reach you">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-base2/30 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-text-muted" />
                  <span className="text-sm font-medium">Email updates</span>
                </div>
                <input type="checkbox" name="notif_email" checked={formData.notifications.email} onChange={handleChange} className="w-4 h-4 accent-magenta" />
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-base2/30 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Bell size={16} className="text-text-muted" />
                  <span className="text-sm font-medium">Browser alerts</span>
                </div>
                <input type="checkbox" name="notif_push" checked={formData.notifications.push} onChange={handleChange} className="w-4 h-4 accent-magenta" />
              </label>
            </div>
          </DashPanel>

          <DashPanel title="Security" description="Change your password">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DashField label="New password">
                <input type="password" name="password" value={formData.password} onChange={handleChange} className={dashInputClass} placeholder="Leave blank to keep" />
              </DashField>
              <DashField label="Confirm password">
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={dashInputClass} />
              </DashField>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-magenta to-violet text-white text-sm font-semibold disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={16} /> Save changes</>}
            </button>
          </DashPanel>
        </form>

        <DashPanel title="Session" description="Sign out on this device">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red/30 text-red text-sm font-semibold hover:bg-red/10 transition-colors"
          >
            <LogOut size={16} /> Sign out
          </button>
        </DashPanel>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
