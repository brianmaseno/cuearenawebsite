import React from 'react';
import {
  X,
  Camera,
  Mail,
  Phone,
  FileText,
  Save,
  Shield,
  User,
  History,
  UserX,
  Loader2,
  Trophy,
  Target,
} from 'lucide-react';
import StatusPill from '../ui/StatusPill';
import MetricCard from '../ui/MetricCard';
import { DashField, dashInputClass } from '../ui/DashPanel';

const roleTone = (role) => {
  if (role === 'admin') return 'danger';
  if (role === 'moderator') return 'info';
  return 'neutral';
};

const MemberDetailPanel = ({
  user,
  editData,
  setEditData,
  userStats,
  updating,
  onClose,
  onSave,
  onPhotoClick,
  fileInputRef,
  onPhotoChange,
  onRoleChange,
  onViewLogs,
  onDelete,
}) => {
  if (!user) return null;

  const stats = userStats[user.id];

  return (
    <aside className="w-full lg:w-[340px] xl:w-[360px] flex flex-col shrink-0 h-full min-h-0 dash-member-panel">
      <div className="dash-member-panel-head">
        <div>
          <h3 className="text-sm font-semibold text-text-emphasis">Member profile</h3>
          <p className="text-xs text-text-muted mt-0.5">Edit details and permissions</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-base2/40 text-text-muted transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto thin-scrollbar dash-member-panel-body">
        {/* Identity */}
        <div className="flex items-center gap-4 mb-5">
          <button
            type="button"
            onClick={onPhotoClick}
            className="relative shrink-0 group"
          >
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-base2/40 bg-surface">
              <img
                src={editData?.profilePhoto || `https://ui-avatars.com/api/?name=${user.fullName}&background=ec4899&color=fff`}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute inset-0 rounded-2xl bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera size={16} className="text-white" />
            </span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onPhotoChange}
              accept="image/*"
              className="hidden"
            />
          </button>
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={editData?.fullName || ''}
              onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
              className="w-full text-base font-semibold text-text-emphasis bg-transparent border-none outline-none focus:ring-0 p-0"
            />
            <StatusPill tone={roleTone(user.role)} className="mt-2 capitalize">
              {user.role}
            </StatusPill>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <MetricCard compact label="Points" value={user.points || 0} icon={Trophy} />
          <MetricCard compact label="Battles" value={stats?.totalGames || 0} icon={Target} />
          <MetricCard compact label="Wins" value={stats?.totalWins || 0} icon={Trophy} />
        </div>

        {/* Contact & bio */}
        <div className="space-y-4">
          <DashField label="Email">
            <div className={`${dashInputClass} flex items-center gap-2 opacity-90 cursor-default`}>
              <Mail size={15} className="text-text-muted shrink-0" />
              <span className="text-sm truncate">{user.email}</span>
            </div>
          </DashField>

          <DashField label="Phone">
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={editData?.phone || ''}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className={`${dashInputClass} pl-10`}
                placeholder="No phone set"
              />
            </div>
          </DashField>

          <DashField label="Bio">
            <div className="relative">
              <FileText size={15} className="absolute left-3.5 top-3 text-text-muted" />
              <textarea
                value={editData?.bio || ''}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                className={`${dashInputClass} pl-10 resize-none min-h-[72px]`}
                rows={3}
                placeholder="No bio yet"
              />
            </div>
          </DashField>

          <button
            type="button"
            onClick={onSave}
            disabled={updating}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-magenta to-violet text-white text-sm font-semibold disabled:opacity-50"
          >
            {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save changes
          </button>
        </div>

        {/* Role controls */}
        <div className="mt-6 pt-5 border-t border-base2/30">
          <p className="text-xs font-medium text-text-muted mb-3">Role</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onRoleChange(user.id, 'moderator')}
              disabled={user.role === 'moderator' || user.role === 'admin'}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-violet/10 text-violet border border-violet/20 hover:bg-violet/20 disabled:opacity-30 transition-colors"
            >
              <Shield size={14} /> Promote
            </button>
            <button
              type="button"
              onClick={() => onRoleChange(user.id, 'player')}
              disabled={user.role === 'player' || user.role === 'admin'}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-surface border border-base2/40 hover:bg-base2/20 disabled:opacity-30 transition-colors"
            >
              <User size={14} /> Demote
            </button>
          </div>
        </div>
      </div>

      <div className="dash-member-panel-foot space-y-2">
        <button
          type="button"
          onClick={onViewLogs}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-base2/40 hover:bg-surface transition-colors"
        >
          <History size={15} /> View audit trail
        </button>
        {user.role !== 'admin' && (
          <button
            type="button"
            onClick={() => onDelete(user.id)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-red border border-red/30 hover:bg-red/10 transition-colors"
          >
            <UserX size={15} /> Terminate account
          </button>
        )}
      </div>
    </aside>
  );
};

export default MemberDetailPanel;
