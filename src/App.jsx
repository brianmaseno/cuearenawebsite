import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { SidebarProvider } from './context/SidebarContext';
import ProtectedRoute from './components/ProtectedRoute';
import InactivityTimer from './components/InactivityTimer';

// Shared / Auth
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import PublicTournaments from './pages/PublicTournaments';
import TournamentDetails from './pages/tournament/TournamentDetails';

// Dashboards
import PlayerDashboard from './pages/player/PlayerDashboard';
import CreateTournament from './pages/moderator/CreateTournament';
import TournamentManage from './pages/moderator/TournamentManage';
import CreateMatch from './pages/moderator/CreateMatch';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogs from './pages/admin/AdminLogs';
import AdminUsers from './pages/admin/AdminUsers';
// MatchDetails removed - consoles are now inline in dashboards
import PlayerHistory from './pages/player/PlayerHistory';
import OngoingActivities from './pages/moderator/OngoingActivities';
import History from './pages/moderator/History';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <SidebarProvider>
              <div className="min-h-screen font-sans">
                <Toaster position="top-right" />
                <InactivityTimer />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/tournaments" element={<PublicTournaments />} />

                  {/* Player Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute roles={['player']}>
                      <PlayerDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/history" element={
                    <ProtectedRoute roles={['player']}>
                      <PlayerHistory />
                    </ProtectedRoute>
                  } />
                  {/* Match details are now handled inline in the player dashboard */}
                  <Route path="/dashboard/tournament/:id" element={
                    <ProtectedRoute roles={['player', 'moderator', 'admin']}>
                      <TournamentDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />

                  {/* Moderator Routes */}
                  <Route path="/moderator" element={<Navigate to="/moderator/ongoing" replace />} />
                  <Route path="/moderator/create-tournament" element={
                    <ProtectedRoute roles={['moderator']}>
                      <CreateTournament />
                    </ProtectedRoute>
                  } />
                  <Route path="/moderator/manage-tournament/:id" element={
                    <ProtectedRoute roles={['moderator']}>
                      <TournamentManage />
                    </ProtectedRoute>
                  } />
                  <Route path="/moderator/create-match" element={
                    <ProtectedRoute roles={['moderator']}>
                      <CreateMatch />
                    </ProtectedRoute>
                  } />
                  {/* Match details are now handled inline in the moderator dashboard */}
                  <Route path="/moderator/ongoing" element={
                    <ProtectedRoute roles={['moderator']}>
                      <OngoingActivities />
                    </ProtectedRoute>
                  } />
                  <Route path="/moderator/history" element={
                    <ProtectedRoute roles={['moderator']}>
                      <History />
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/logs" element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminLogs />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminUsers />
                    </ProtectedRoute>
                  } />

                  {/* 404/Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </SidebarProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
  );
}

export default App;
