import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import FloatingActionButton from './FloatingActionButton';

const DashboardLayout = ({ children, title }) => {
  return (
    <div className="flex min-h-screen bg-background text-text">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar title={title} />
        <main className="p-8 flex-1 overflow-y-auto thin-scrollbar">
          {children}
        </main>
        <FloatingActionButton />
      </div>
    </div>
  );
};

export default DashboardLayout;
