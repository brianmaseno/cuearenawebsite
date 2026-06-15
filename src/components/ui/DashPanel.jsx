import React from 'react';

export const DashPanel = ({ title, description, icon: Icon, children, className = '', action }) => (
  <section className={`dash-form-panel ${className}`}>
    {(title || action) && (
      <div className="dash-form-panel-head">
        <div>
          {title && (
            <h3 className="dash-form-panel-title">
              {Icon && <Icon size={18} className="text-magenta shrink-0" />}
              {title}
            </h3>
          )}
          {description && <p className="dash-form-panel-desc">{description}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

export const DashField = ({ label, hint, children, className = '' }) => (
  <div className={`dash-field ${className}`}>
    {label && <label className="dash-field-label">{label}</label>}
    {children}
    {hint && <p className="dash-field-hint">{hint}</p>}
  </div>
);

export const dashInputClass =
  'w-full bg-surface/60 border border-base2/30 rounded-xl px-4 py-2.5 text-sm text-text-emphasis outline-none focus:ring-2 focus:ring-magenta/25 transition-all placeholder:text-text-muted';
