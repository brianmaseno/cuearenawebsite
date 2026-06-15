import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { SidebarProvider } from './context/SidebarContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthGuard from './components/AuthGuard';
import InactivityTimer from './components/InactivityTimer';
import useActivityTracker from './hooks/useActivityTracker';

const ActivityTracker = () => {
  useActivityTracker();
  return null;
};

// Shared / Auth
import Login from './pages/Login';
import Register from './pages/Register';
const Landing = React.lazy(() => import('./pages/Landing'));
const PublicTournaments = React.lazy(() => import('./pages/public/PublicTournaments'));
const DashboardTournaments = React.lazy(() => import('./pages/PublicTournaments'));
const TournamentDetails = React.lazy(() => import('./pages/tournament/TournamentDetails'));
const PublicTournamentDetails = React.lazy(() => import('./pages/public/PublicTournamentDetails'));
const PublicFixtures = React.lazy(() => import('./pages/public/PublicFixtures'));
const PublicResults = React.lazy(() => import('./pages/public/PublicResults'));
const PublicRankings = React.lazy(() => import('./pages/public/PublicRankings'));
const PublicPlayers = React.lazy(() => import('./pages/public/PublicPlayers'));
const PublicPlayerDetails = React.lazy(() => import('./pages/public/PublicPlayerDetails'));

// Dashboards (Lazy Loaded)
const PlayerDashboard = React.lazy(() => import('./pages/player/PlayerDashboard'));
const CreateTournament = React.lazy(() => import('./pages/moderator/CreateTournament'));
const TournamentManage = React.lazy(() => import('./pages/moderator/TournamentManage'));
const CreateMatch = React.lazy(() => import('./pages/moderator/CreateMatch'));
const CreateBattle = React.lazy(() => import('./pages/moderator/CreateBattle'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminLogs = React.lazy(() => import('./pages/admin/AdminLogs'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminAnalytics = React.lazy(() => import('./pages/admin/AdminAnalytics'));
const PlayerHistory = React.lazy(() => import('./pages/player/PlayerHistory'));
const Leaderboard = React.lazy(() => import('./pages/player/Leaderboard'));
const OngoingActivities = React.lazy(() => import('./pages/moderator/OngoingActivities'));
const History = React.lazy(() => import('./pages/moderator/History'));
const ModeratorTables = React.lazy(() => import('./pages/moderator/ModeratorTables'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ModeratorApplication = React.lazy(() => import('./pages/ModeratorApplication'));
const AdminModeratorRequests = React.lazy(() => import('./pages/admin/AdminModeratorRequests'));
const AdminFinance = React.lazy(() => import('./pages/admin/AdminFinance'));
const Wallet = React.lazy(() => import('./pages/Wallet'));
const WalletCheckout = React.lazy(() => import('./pages/WalletCheckout'));
const Support = React.lazy(() => import('./pages/Support'));
const AdminDevices = React.lazy(() => import('./pages/admin/AdminDevices'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <SidebarProvider>
            <div className="min-h-screen">
              <Toaster position="top-right" />
              <InactivityTimer />
              <ActivityTracker />
              <React.Suspense fallback={
                <div className="flex items-center justify-center min-h-screen bg-background">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                <Routes>
                  {/* Public-ish Routes with Auth Guards */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<AuthGuard><Login /></AuthGuard>} />
                  <Route path="/register" element={<AuthGuard><Register /></AuthGuard>} />
                  <Route path="/tournaments" element={<PublicTournaments />} />
                  <Route path="/tournaments/:id" element={<PublicTournamentDetails />} />
                  <Route path="/fixtures" element={<PublicFixtures />} />
                  <Route path="/results" element={<PublicResults />} />
                  <Route path="/rankings" element={<PublicRankings />} />
                  <Route path="/players" element={<PublicPlayers />} />
                  <Route path="/players/:id" element={<PublicPlayerDetails />} />

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
                  <Route path="/dashboard/tournaments" element={
                    <ProtectedRoute roles={['player']}>
                      <DashboardTournaments />
                    </ProtectedRoute>
                  } />
                  <Route path="/leaderboard" element={
                    <ProtectedRoute>
                      <Leaderboard />
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
                  <Route path="/wallet" element={
                    <ProtectedRoute>
                      <Wallet />
                    </ProtectedRoute>
                  } />
                  <Route path="/wallet/checkout" element={
                    <ProtectedRoute>
                      <WalletCheckout />
                    </ProtectedRoute>
                  } />
                  <Route path="/support" element={
                    <ProtectedRoute>
                      <Support />
                    </ProtectedRoute>
                  } />

                  {/* Moderator Routes */}
                  <Route path="/moderator" element={<Navigate to="/moderator/ongoing" replace />} />
                  <Route path="/moderator/create-tournament" element={
                    <ProtectedRoute roles={['moderator', 'admin']}>
                      <CreateTournament />
                    </ProtectedRoute>
                  } />
                  <Route path="/moderator/manage-tournament/:id" element={
                    <ProtectedRoute roles={['moderator', 'admin']}>
                      <TournamentManage />
                    </ProtectedRoute>
                  } />
                  <Route path="/moderator/create-match" element={
                    <ProtectedRoute roles={['moderator', 'admin']}>
                      <CreateMatch />
                    </ProtectedRoute>
                  } />
                  <Route path="/moderator/create-battle" element={
                    <ProtectedRoute roles={['moderator', 'admin']}>
                      <CreateBattle />
                    </ProtectedRoute>
                  } />
                  {/* Match details are now handled inline in the moderator dashboard */}
                  <Route path="/moderator/ongoing" element={
                    <ProtectedRoute roles={['moderator', 'admin']}>
                      <OngoingActivities />
                    </ProtectedRoute>
                  } />
                  <Route path="/moderator/history" element={
                    <ProtectedRoute roles={['moderator', 'admin']}>
                      <History />
                    </ProtectedRoute>
                  } />
                  <Route path="/moderator/tables" element={
                    <ProtectedRoute roles={['moderator', 'admin']}>
                      <ModeratorTables />
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
                  <Route path="/admin/moderator-requests" element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminModeratorRequests />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/finance" element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminFinance />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/analytics" element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/devices" element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminDevices />
                    </ProtectedRoute>
                  } />
                  <Route path="/moderator-apply" element={<ModeratorApplication />} />

                  {/* 404/Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </React.Suspense>
            </div>
            </SidebarProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
