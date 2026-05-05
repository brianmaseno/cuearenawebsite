import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if user is logged in
    if (user && user.id) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || `${window.location.origin}`;
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'], // WebSocket first, fallback to polling
      });
      setSocket(newSocket);

      // Join user-specific room for private notifications
      newSocket.emit('join_room', `user_${user.id}`);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  const joinMatchRoom = (matchId) => {
    if (socket) socket.emit('join_room', `match_${matchId}`);
  };

  const leaveMatchRoom = (matchId) => {
    if (socket) socket.emit('leave_room', `match_${matchId}`);
  };

  const joinTournamentRoom = (tournamentId) => {
    if (socket) socket.emit('join_room', `tournament_${tournamentId}`);
  };

  const leaveTournamentRoom = (tournamentId) => {
    if (socket) socket.emit('leave_room', `tournament_${tournamentId}`);
  };

  const value = React.useMemo(() => ({
    socket,
    joinMatchRoom,
    leaveMatchRoom,
    joinTournamentRoom,
    leaveTournamentRoom
  }), [socket]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
