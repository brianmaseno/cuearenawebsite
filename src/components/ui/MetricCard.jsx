import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * PinenMFB-style metric card — dot grid, icon chip, trend pill, clean hierarchy.
 */
const MetricCard = ({
  label,
  value,
  prefix,
  suffix,
  icon: Icon,
  trend,
  featured = false,
  compact = false,
  className = '',
}) => {
  const positive = trend?.positive !== false && !String(trend?.value || '').startsWith('-');

  return (
    <div
      className={[
        'metric-card',
        featured ? 'metric-card-featured' : '',
        compact ? 'metric-card-compact' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="metric-card-grid" aria-hidden />

      <div className="metric-card-top">
        {Icon && (
          <div className={`metric-card-icon ${featured ? 'metric-card-icon-featured' : ''}`}>
            <Icon size={compact ? 16 : 18} strokeWidth={2} />
          </div>
        )}
        {trend && (
          <div className={`metric-trend ${positive ? 'metric-trend-up' : 'metric-trend-down'}`}>
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      <div className="metric-card-body">
        <p className="metric-card-label">{label}</p>
        <p className="metric-card-value">
          {prefix && <span className="metric-card-prefix">{prefix}</span>}
          {value}
          {suffix && <span className="metric-card-suffix">{suffix}</span>}
        </p>
        {trend?.label && <p className="metric-card-foot">{trend.label}</p>}
      </div>
    </div>
  );
};

export default MetricCard;
