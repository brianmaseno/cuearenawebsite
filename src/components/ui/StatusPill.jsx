import React from 'react';

const toneMap = {
  success: 'dash-status-success',
  warning: 'dash-status-warning',
  danger: 'dash-status-danger',
  info: 'dash-status-info',
  neutral: 'dash-status-neutral',
};

const StatusPill = ({ children, tone = 'neutral', className = '' }) => (
  <span className={`dash-status ${toneMap[tone] || toneMap.neutral} ${className}`}>
    <span className="dash-status-dot" aria-hidden />
    {children}
  </span>
);

export default StatusPill;
