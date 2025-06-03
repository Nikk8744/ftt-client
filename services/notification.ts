import apiClient from './api-client';

export interface Notification {
  id: number;
  userId: number;
  type: string;        // 'TASK_CREATED', 'PROJECT_COMPLETED', etc.
  title: string;       // Short title for notification
  message: string;     // Detailed message
  entityType: string;  // 'TASK', 'PROJECT', etc.
  entityId: number;    // ID for navigation
  initiatorId: number; // User who triggered the notification
  isRead: boolean;
  createdAt: Date;
}

export interface NotificationResponse {
  notifications: Notification[];
  totalCount: number;
  hasMore: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

/**
 * Get user's notifications with pagination
 */
export const getNotifications = async (page = 1, limit = 10): Promise<NotificationResponse> => {
  const response = await apiClient.get(`/notifications?page=${page}&limit=${limit}`);
  return response.data;
};

/**
 * Get count of unread notifications
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await apiClient.get('/notifications/unread-count');
  return response.data;
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId: number): Promise<void> => {
  await apiClient.patch(`/notifications/mark-read/${notificationId}`);
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/mark-all-read');
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: number): Promise<void> => {
  await apiClient.delete(`/notifications/${notificationId}`);
}; 