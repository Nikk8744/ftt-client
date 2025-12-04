'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, CheckCircle } from 'lucide-react';
import useTimerStore from '@/store/timer';
import { formatDuration } from '@/lib/utils';

/**
 * TimerNotifications displays timer auto-stop notifications
 * in a floating panel
 */
export function TimerNotifications() {
  const { notifications, removeNotification, clearNotifications } = useTimerStore();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.timestamp}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeNotification(notification.timestamp)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Message */}
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {notification.message}
              </p>

              {/* Timer Details */}
              {notification.data && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
                  {notification.data.name && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {notification.data.name}
                      </span>
                    </div>
                  )}
                  {notification.data.timeSpent && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Time Logged:</span>
                      <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                        {formatDuration(notification.data.timeSpent)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Stopped at:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {notification.data.endTime
                        ? new Date(notification.data.endTime).toLocaleTimeString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              )}

              {/* Action */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => removeNotification(notification.timestamp)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Clear All Button */}
      {notifications.length > 1 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={clearNotifications}
          className="w-full py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors"
        >
          Clear All ({notifications.length})
        </motion.button>
      )}
    </div>
  );
}
