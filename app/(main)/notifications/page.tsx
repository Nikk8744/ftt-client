'use client';

import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, Notification, NotificationResponse } from '@/services/notification';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Check, Mail, MailOpen, Loader2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import PageWrapper from '@/components/layout/PageWrapper';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/auth';
import { useNotificationStore } from '@/store/useNotificationStore';

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const notificationStore = useNotificationStore();
  const { unreadCount, markAsRead: markAsReadStore, markAllAsRead: markAllAsReadStore, deleteNotification: deleteNotificationStore } = notificationStore;
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

  // Fetch notifications with infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam = 1 }) => getNotifications(pageParam as number, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage: NotificationResponse, allPages) => {
      return lastPage.data.hasMore ? allPages.length + 1 : undefined;
    },
    enabled: isAuthenticated,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to view your notifications</p>
          <Link href="/login">
            <Button variant="default">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Handle mark as read
  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
    if (markAsReadStore) markAsReadStore(id); // Also update the store
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
    if (markAllAsReadStore) markAllAsReadStore(); // Also update the store
  };

  // Handle delete notification
  const handleDeleteNotification = (id: number) => {
    deleteNotificationMutation.mutate(id);
    if (deleteNotificationStore) deleteNotificationStore(id); // Also update the store
  };

  // Handle selection
  const toggleSelection = (id: number) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notifId => notifId !== id) 
        : [...prev, id]
    );
  };

  // Handle bulk actions
  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => {
      deleteNotificationMutation.mutate(id);
      if (deleteNotificationStore) deleteNotificationStore(id); // Also update the store
    });
    setSelectedNotifications([]);
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => {
      markAsReadMutation.mutate(id);
      if (markAsReadStore) markAsReadStore(id); // Also update the store
    });
    setSelectedNotifications([]);
  };

  // Flatten notifications from all pages
  const notifications = data?.pages.flatMap(page => page?.data.notifications) || [];
  const totalCount = data?.pages[0]?.data.notifications.length || 0;

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_CREATED':
      case 'TASK_UPDATED':
      case 'TASK_COMPLETED':
        return <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">📋</div>;
      case 'PROJECT_CREATED':
      case 'PROJECT_UPDATED':
      case 'PROJECT_COMPLETED':
        return <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">📁</div>;
      case 'MEMBER_ADDED':
      case 'MEMBER_REMOVED':
        return <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">👥</div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">🔔</div>;
    }
  };

  return (
    <PageWrapper
      title="Notifications"
      description="View and manage your notifications"
      actions={
        unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <MailOpen className="h-4 w-4 mr-2" />
            )}
            Mark all as read
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {/* Bulk actions */}
        {selectedNotifications.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {selectedNotifications.length} notification{selectedNotifications.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkMarkAsRead}
                className="text-xs"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Mark as read
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Notifications list */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <p className="text-red-500">Error loading notifications</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
              >
                Try again
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
              <p className="text-gray-500">You do not have any notifications yet</p>
            </div>
          ) : (
            <div>
              <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm text-gray-700">
                    {totalCount} Notification{totalCount !== 1 ? "s" : ""}
                  </h3>
                </div>
              </div>

              <ul className="divide-y divide-gray-200">
                {notifications.filter(notification => notification && notification.id).map((notification: Notification) => (
                  <li key={notification.id} className={cn(
                    "px-4 py-4 hover:bg-gray-50 transition-colors",
                    notification.isRead === 0 && "bg-blue-50/30"
                  )}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => toggleSelection(notification.id)}
                        />
                      </div>
                      <div className="flex-shrink-0 mr-3">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between">
                          <Link
                            href={`/${notification.entityType?.toLowerCase() || 'tasks'}/${notification.entityId || ''}`}
                            className={cn(
                              "text-sm",
                              notification.isRead === 0 ? "font-medium text-gray-900" : "text-gray-700"
                            )}
                          >
                            {notification.title}
                          </Link>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                        <div className="mt-2 flex items-center gap-2">
                          {notification.isRead === 0 && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center"
                            >
                              <MailOpen className="h-3.5 w-3.5 mr-1" />
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Load more button */}
              {hasNextPage && (
                <div className="px-4 py-3 border-t border-gray-200 text-center">
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-full"
                  >
                    {isFetchingNextPage ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    )}
                    Load more
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
} 