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
    if (user && user._id) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
      setSocket(newSocket);

      // Join user-specific room for private notifications
      newSocket.emit('join_room', `user_${user._id}`);
      console.log(`Socket connected and joined user_${user._id}`);

      return () => {
        newSocket.close();
        console.log('Socket disconnected');
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

  return (
    <SocketContext.Provider value={{ 
      socket, 
      joinMatchRoom, 
      leaveMatchRoom, 
      joinTournamentRoom, 
      leaveTournamentRoom 
    }}>
      {children}
    </SocketContext.Provider>
  );
};
