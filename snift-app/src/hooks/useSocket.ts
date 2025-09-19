import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../api/config';
import { SocketEvents } from '../api/types';

export const useSocket = (userId: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!userId) {
      // Clean up existing connection if userId becomes null
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setIsAuthenticated(false);
      }
      return;
    }

    // Create socket connection with auth headers
    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true,
      auth: {
        token: null, // Will be set after getting token from storage
      },
    });

    socketRef.current = socket;

    // Set up authentication
    const authenticateSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          socket.auth = { token };
          socket.emit('authenticate', { userId });
        }
      } catch (error) {
        console.error('Error getting auth token for socket:', error);
      }
    };

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      authenticateSocket();
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
      setIsAuthenticated(false);
    });

    socket.on('connect_error', (error) => {
      console.log('❌ WebSocket connection failed:', error);
      setIsConnected(false);
      setIsAuthenticated(false);
    });

    socket.on('authenticated', (data: { success: boolean; userId?: string; error?: string }) => {
      if (data.success) {
        console.log('✅ WebSocket authenticated for user:', data.userId);
        setIsAuthenticated(true);
      } else {
        console.log('❌ WebSocket authentication failed:', data.error);
        setIsAuthenticated(false);
      }
    });

    // Handle reconnection
    socket.on('reconnect', () => {
      console.log('🔄 WebSocket reconnected');
      setIsConnected(true);
      authenticateSocket();
    });

    return () => {
      // Remove all listeners before disconnecting
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsAuthenticated(false);
    };
  }, [userId]);

  const emit = (event: string, data: any) => {
    if (socketRef.current && isConnected && isAuthenticated) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`Cannot emit ${event}: socket not ready`, { isConnected, isAuthenticated });
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  const removeAllListeners = (event?: string) => {
    if (socketRef.current) {
      if (event) {
        socketRef.current.removeAllListeners(event);
      } else {
        socketRef.current.removeAllListeners();
      }
    }
  };

  const joinRoom = (roomId: string) => {
    if (socketRef.current && isConnected && isAuthenticated) {
      socketRef.current.emit('join_room', { roomId });
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socketRef.current && isConnected && isAuthenticated) {
      socketRef.current.emit('leave_room', { roomId });
    }
  };

  return {
    socket: socketRef.current,
    emit,
    on,
    off,
    removeAllListeners,
    joinRoom,
    leaveRoom,
    isConnected,
    isAuthenticated,
    isReady: isConnected && isAuthenticated,
  };
};
