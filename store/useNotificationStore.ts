import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Notification, getNotifications, getUnreadCount } from '@/services/notification';
import { toast } from '@/components/ui/use-toast';

interface NotificationState {
  // State
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
  isLoading: boolean;
  socket: Socket | null;
  
  // Actions
  initializeSocket: (token: string) => void;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: number) => void;
  fetchUnreadCount: () => Promise<void>;
  fetchRecentNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  setUnreadCount: (count: number) => void;
  cleanup: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  hasMore: false,
  isLoading: false,
  socket: null,
  
  // Initialize WebSocket connection
  initializeSocket: (token: string) => {
    // Clean up any existing socket
    const { socket: currentSocket, cleanup } = get();
    if (currentSocket) {
      cleanup();
    }
    
    if (!token) {
      console.error('No token provided for WebSocket connection');
      return;
    }
    
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: { token }
    });
    
    // Set up event listeners
    socketInstance.on('notification', (notification: Notification) => {
      get().addNotification(notification);
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        variant: "default"
      });
    });
    
    socketInstance.on('unreadNotificationsCount', ({ count }: { count: number }) => {
      set({ unreadCount: count });
    });
    
    // Store the socket instance
    set({ socket: socketInstance });
    
    // Fetch initial unread count and recent notifications
    get().fetchUnreadCount();
    get().fetchRecentNotifications();
  },
  
  // Fetch recent notifications (both read and unread)
  fetchRecentNotifications: async () => {
    try {
      set({ isLoading: true });
      const response = await getNotifications(1, 10);
      if (response.data && response.data.notifications) {
        set({ 
          notifications: response.data.notifications,
          hasMore: response.data.hasMore
        });
      }
    } catch (error) {
      console.error('Failed to fetch recent notifications:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Add a new notification to the list
  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },
  
  // Set unread count
  setUnreadCount: (count: number) => {
    set({ unreadCount: count });
  },
  
  // Fetch unread count from API
  fetchUnreadCount: async () => {
    try {
      const response = await getUnreadCount();
      set({ unreadCount: response.count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },
  
  // Mark a notification as read
  markAsRead: (notificationId: number) => {
    const { socket } = get();
    if (!socket) return;
    
    socket.emit('markNotificationAsRead', notificationId);
    
    // Optimistically update UI
    set((state) => ({
      notifications: state.notifications.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: 1 } : notif
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));
  },
  
  // Mark all notifications as read
  markAllAsRead: () => {
    const { socket } = get();
    if (!socket) return;
    
    socket.emit('markAllNotificationsAsRead');
    
    // Optimistically update UI
    set((state) => ({
      notifications: state.notifications.map(notif => ({ ...notif, isRead: 1 })),
      unreadCount: 0
    }));
  },
  
  // Delete a notification
  deleteNotification: (notificationId: number) => {
    const { socket, notifications } = get();
    if (!socket) return;
    
    // Find the notification to delete
    const notificationToDelete = notifications.find(n => n.id === notificationId);
    
    // Optimistically update UI
    set((state) => ({
      notifications: state.notifications.filter(notif => notif.id !== notificationId),
      unreadCount: notificationToDelete && !notificationToDelete.isRead 
        ? Math.max(0, state.unreadCount - 1) 
        : state.unreadCount
    }));
    
    // Emit delete event
    socket.emit('deleteNotification', notificationId);
  },
  
  // Clean up socket connection
  cleanup: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null });
  }
})); 