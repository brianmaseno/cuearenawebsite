import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import FloatingActionButton from './FloatingActionButton';

const DashboardLayout = ({ children, title }) => {
  return (
    <div className="flex min-h-[100dvh] bg-background text-text overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto thin-scrollbar p-4 md:p-8 pb-32 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        <FloatingActionButton />
      </div>
    </div>
  );
};

export default DashboardLayout;
