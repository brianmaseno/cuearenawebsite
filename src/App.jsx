import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Shared / Auth
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import PublicTournaments from './pages/PublicTournaments';
import Notifications from './pages/Notifications';
import TournamentDetails from './pages/tournament/TournamentDetails';

// Dashboards
import PlayerDashboard from './pages/player/PlayerDashboard';
import PlayerInvitations from './pages/player/PlayerInvitations';
import ModeratorDashboard from './pages/moderator/ModeratorDashboard';
import CreateTournament from './pages/moderator/CreateTournament';
import TournamentManage from './pages/moderator/TournamentManage';
import CreateMatch from './pages/moderator/CreateMatch';
import AdminDashboard from './pages/admin/AdminDashboard';
import MatchDetails from './pages/match/MatchDetails';
import OngoingActivities from './pages/moderator/OngoingActivities';
import History from './pages/moderator/History';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen font-sans">
        <Toaster position="top-right" />
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
          <Route path="/dashboard/invitations" element={
            <ProtectedRoute roles={['player']}>
              <PlayerInvitations />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/match/:id" element={
            <ProtectedRoute roles={['player', 'moderator', 'admin']}>
              <MatchDetails />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/tournament/:id" element={
            <ProtectedRoute roles={['player', 'moderator', 'admin']}>
              <TournamentDetails />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />

          {/* Moderator Routes */}
          <Route path="/moderator" element={
            <ProtectedRoute roles={['moderator']}>
              <ModeratorDashboard />
            </ProtectedRoute>
          } />
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
          <Route path="/moderator/match/:id" element={
            <ProtectedRoute roles={['moderator']}>
              <MatchDetails />
            </ProtectedRoute>
          } />
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

          {/* 404/Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
