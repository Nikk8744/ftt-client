"use client";

import Badge  from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, CheckCircle, Circle } from "lucide-react";
// import { useState } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import useAuthStore from "@/store/auth";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/services/notification";
import { cn } from "@/lib/utils";

export default function NotificationBell() {
  const { isAuthenticated } = useAuthStore();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotificationStore();
    // console.log("🚀 ~ NotificationBell ~ unreadCount:", unreadCount)
  
  const handleNotificationClick = (id: number) => {
    markAsRead(id);
  };

  const handleMarkAsRead = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  // Get the most recent 5 notifications, regardless of read status
  const recentNotifications = notifications
  .filter(notification => notification && notification.id)
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 5);
  
  // Don't render anything if the user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>  
        <Button size="icon" variant="outline" className="relative rounded-full w-10 h-10 dark:bg-gray-600" aria-label="Open notifications">
          <Bell size={16} strokeWidth={2} aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge className="absolute bg-brand dark:bg-brand rounded-full text-white text-xs -top-2 left-full min-w-5 -translate-x-1/2 px-2 py-1">
              {unreadCount > 99 ? "99+" : unreadCount }
            </Badge>
          )}
        </Button> 
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1 mr-4 lg:mr-6 mt-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-baseline justify-between gap-4 px-3 py-2">
          <Link href="/notifications" className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</Link>
          {unreadCount > 0 && (
            <button className="text-xs font-medium hover:underline text-primary-600 dark:text-primary-400" onClick={handleMarkAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>
        <div
          role="separator"
          aria-orientation="horizontal"
          className="-mx-1 my-1 h-px bg-border dark:bg-gray-700"
        ></div>
        {recentNotifications.length === 0 ? (
          <div className="py-6 text-center">
            <div className="flex justify-center mb-3">
              <Bell size={24} className="text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
          </div>
        ) : (
          recentNotifications.map((notification: Notification) => (
            <div
              key={notification.id}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent dark:hover:bg-gray-700",
                notification.isRead === 0 ? "bg-blue-50 dark:bg-blue-900/30" : "bg-transparent"
              )}
            >
              <div className="relative flex items-start pe-3">
                <div className="flex-shrink-0 mt-1 mr-2">
                  <button 
                    onClick={(e) => handleMarkAsRead(e, notification.id)}
                    className={cn(
                      "flex items-center justify-center w-5 h-5 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600",
                      notification.isRead === 0 ? "text-primary-600 dark:text-primary-400" : "text-gray-400 dark:text-gray-500"
                    )}
                    title={notification.isRead === 0 ? "Mark as read" : "Already read"}
                  >
                    {notification.isRead === 0 ? (
                      <Circle size={16} className="text-primary-600 dark:text-primary-400" />
                    ) : (
                      <CheckCircle size={16} className="text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
                
                <div className="flex-1 space-y-1">
                  <Link
                    href={`/${notification.entityType?.toLowerCase()}s/${notification.entityId || ''}`}
                    className="text-left text-foreground/80 after:absolute after:inset-0 z-10"
                    onClick={() => handleNotificationClick(notification.id)}
                  > 
                    <span className={cn(
                      "font-medium hover:underline",
                      notification.isRead === 0 ? "text-foreground dark:text-gray-100 font-semibold" : "text-foreground/80 dark:text-gray-300"
                    )}>
                      {notification.title}
                    </span>
                    <div className="text-xs text-muted-foreground dark:text-gray-400 mt-1 line-clamp-2">
                      {notification.message}
                    </div>
                  </Link>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground dark:text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700">
          <Link
            href="/notifications"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
