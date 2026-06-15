import React from 'react';

const MiniBarChart = ({ data = [], labels = [], height = 160, barClass = 'bg-magenta/70' }) => {
  const max = Math.max(...data, 1);

  return (
    <div className="mini-chart" style={{ height }}>
      <div className="mini-chart-bars">
        {data.map((val, i) => (
          <div key={i} className="mini-chart-col">
            <div className="mini-chart-bar-wrap">
              <div
                className={`mini-chart-bar ${barClass}`}
                style={{ height: `${(val / max) * 100}%` }}
              />
            </div>
            {labels[i] && <span className="mini-chart-label">{labels[i]}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniBarChart;
