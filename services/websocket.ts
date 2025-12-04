import { io, Socket } from 'socket.io-client';
import { TimerAutoStoppedEvent } from '@/types';

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  /**
   * Initialize WebSocket connection with authentication
   */
  connect(): Socket | null {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const socketUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

    this.socket = io(socketUrl, {
      withCredentials: true, // Send cookies with the connection
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.setupConnectionHandlers();

    return this.socket;
  }

  /**
   * Set up connection event handlers
   */
  private setupConnectionHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('[WebSocket] Connected to server');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('[WebSocket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`[WebSocket] Reconnected after ${attemptNumber} attempts`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('[WebSocket] Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[WebSocket] Reconnection failed');
    });
  }

  /**
   * Listen for timer stopped events
   */
  onTimerStopped(callback: (event: TimerAutoStoppedEvent) => void) {
    if (!this.socket) {
      console.error('[WebSocket] Socket not initialized');
      return;
    }

    this.socket.on('timerStopped', (data: TimerAutoStoppedEvent) => {
      console.log('[WebSocket] Timer stopped event received:', data);
      callback(data);
    });
  }

  /**
   * Remove timer stopped event listener
   */
  offTimerStopped(callback?: (event: TimerAutoStoppedEvent) => void) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off('timerStopped', callback);
    } else {
      this.socket.off('timerStopped');
    }
  }

  /**
   * Emit a custom event to the server
   */
  emit(event: string, data?: unknown) {
    if (!this.socket) {
      console.error('[WebSocket] Socket not initialized');
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Listen for a custom event
   */
  on(event: string, callback: (...args: unknown[]) => void) {
    if (!this.socket) {
      console.error('[WebSocket] Socket not initialized');
      return;
    }

    this.socket.on(event, callback);
  }

  /**
   * Remove a custom event listener
   */
  off(event: string, callback?: (...args: unknown[]) => void) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('[WebSocket] Disconnected from server');
    }
  }

  /**
   * Check if the socket is connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected || false;
  }

  /**
   * Get the socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export a singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
