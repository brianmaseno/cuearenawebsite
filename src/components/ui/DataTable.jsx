import React from 'react';
import { Loader2 } from 'lucide-react';

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/**
 * Clean, borderless data table — spacing and typography define structure,
 * not heavy grid lines (sports/finance dashboard style).
 */
const DataTable = ({
  columns = [],
  data = [],
  keyExtractor = (row, index) => row.id ?? row._id ?? index,
  onRowClick,
  selectedKey,
  loading = false,
  loadingMessage = 'Loading…',
  emptyIcon: EmptyIcon,
  emptyTitle = 'No data',
  emptyDescription,
  minWidth = 720,
  stickyHeader = false,
  className = '',
  skeletonRows = 5,
}) => {
  if (loading) {
    return (
      <div className={`dash-panel ${className}`}>
        <div className="dash-panel-body flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="animate-spin text-magenta" size={28} />
          <p className="text-sm text-text-muted font-medium">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={`dash-panel ${className}`}>
        <div className="dash-panel-body flex flex-col items-center justify-center py-16 text-center px-6">
          {EmptyIcon && (
            <div className="w-14 h-14 rounded-2xl bg-base2/40 flex items-center justify-center mb-4 text-text-muted">
              <EmptyIcon size={26} />
            </div>
          )}
          <p className="text-base font-semibold text-text-emphasis">{emptyTitle}</p>
          {emptyDescription && (
            <p className="text-sm text-text-muted mt-1 max-w-sm">{emptyDescription}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`dash-panel overflow-hidden ${className}`}>
      <div className="overflow-x-auto thin-scrollbar">
        <table className="dash-table w-full" style={{ minWidth }}>
          <thead className={stickyHeader ? 'dash-table-head-sticky' : undefined}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${alignClass[col.align || 'left']} ${col.headerClassName || ''}`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const key = keyExtractor(row, index);
              const selected = selectedKey != null && String(selectedKey) === String(key);
              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                  className={[
                    'group',
                    onRowClick ? 'cursor-pointer' : '',
                    selected ? 'dash-table-row-selected' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${alignClass[col.align || 'left']} ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row, index) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
