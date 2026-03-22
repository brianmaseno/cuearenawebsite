import React from 'react';

const StatusBadge = ({ status, entryType }) => {
  const getStyles = () => {
    if (status === 'open_for_players' && entryType === 'invite_only') {
      return 'bg-violet/10 text-violet border-violet/20';
    }
    switch (status) {
      case 'open_for_players':
        return 'bg-green/10 text-green border-green/20';
      case 'full':
        return 'bg-violet/10 text-violet border-violet/20';
      case 'ongoing':
        return 'bg-blue/10 text-blue border-blue/20';
      case 'completed':
        return 'bg-base1/10 text-base1 border-base1/20';
      case 'draft':
        return 'bg-yellow/10 text-yellow border-yellow/20';
      case 'pending_invites':
        return 'bg-orange/10 text-orange border-orange/20';
      case 'confirmed':
        return 'bg-cyan/10 text-cyan border-cyan/20';
      case 'cancelled':
        return 'bg-red/10 text-red border-red/20';
      case 'expired':
        return 'bg-base2/10 text-text/40 border-base2/20';
      default:
        return 'bg-base2/50 text-text border-base2';
    }
  };

  const formatStatus = (s) => {
    if (s === 'open_for_players' && entryType === 'invite_only') return 'PRIVATE';
    return s.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${getStyles()}`}>
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
