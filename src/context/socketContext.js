import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './authContext.js';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { currentUser, currentCompany } = useAuth();

  useEffect(() => {
    // Tạo socket connection
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:8800', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // Socket event handlers
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup khi component unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Join user room khi user thay đổi
  useEffect(() => {
    if (socket && isConnected) {
      const user = currentUser || currentCompany;
      if (user) {
        const userType = currentUser ? 'user' : 'company';
        const userId = user?.id?.toString() || 
                       user?.user_id?.toString() || 
                       user?.company_id?.toString() ||
                       user?.userId?.toString() ||
                       user?.companyId?.toString();

        if (userId) {
          socket.emit('join', { userType, userId });
        }
      }
    }
  }, [socket, isConnected, currentUser, currentCompany]);

  const value = {
    socket,
    isConnected,
    emit: (event, data) => {
      if (socket && isConnected) {
        socket.emit(event, data);
      }
    },
    on: (event, callback) => {
      if (socket) {
        socket.on(event, callback);
      }
    },
    off: (event, callback) => {
      if (socket) {
        socket.off(event, callback);
      }
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
