import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import FloatingActionButton from './FloatingActionButton';

const DashboardLayout = ({ children, title }) => {
  return (
    <div className="dash-shell min-h-[100dvh] text-text overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto thin-scrollbar dash-main">
          <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 pb-28 md:pb-10 pt-2">
            {children}
          </div>
        </main>
        <FloatingActionButton />
      </div>
    </div>
  );
};

export default DashboardLayout;
