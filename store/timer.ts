'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TimerNotification } from '@/types';

interface TimerState {
  isRunning: boolean;
  activeLogId: number | null;
  startTime: string | null;
  elapsedTime: number;
  notifications: TimerNotification[];
  startTimer: (logId: number) => void;
  stopTimer: () => void;
  updateElapsedTime: (seconds: number) => void;
  resetTimer: () => void;
  addNotification: (notification: TimerNotification) => void;
  clearNotifications: () => void;
  removeNotification: (timestamp: string) => void;
  handleAutoStop: (data: { id: number; endTime: string; timeSpent: number }) => void;
}

const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      isRunning: false,
      activeLogId: null,
      startTime: null,
      elapsedTime: 0,
      notifications: [],
      startTimer: (logId) => {
        if (!logId) {
          console.error('Invalid log ID provided to startTimer');
          return;
        }
        set({
          isRunning: true,
          activeLogId: logId,
          startTime: new Date().toISOString(),
          elapsedTime: 0
        });
      },
      stopTimer: () => set((state) => ({
        isRunning: false,
        activeLogId: state.activeLogId,
        startTime: state.startTime
      })),
      updateElapsedTime: (seconds) => set((state) => {
        if (!state.isRunning) return state;
        return { elapsedTime: seconds };
      }),
      resetTimer: () => set({
        isRunning: false,
        activeLogId: null,
        startTime: null,
        elapsedTime: 0
      }),
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications]
      })),
      clearNotifications: () => set({ notifications: [] }),
      removeNotification: (timestamp) => set((state) => ({
        notifications: state.notifications.filter(n => n.timestamp !== timestamp)
      })),
      handleAutoStop: (data) => set((state) => {
        // Only handle auto-stop if this is the active timer
        if (state.activeLogId === data.id) {
          return {
            isRunning: false,
            activeLogId: null,
            startTime: null,
            elapsedTime: 0
          };
        }
        return state;
      }),
    }),
    {
      name: 'timer-storage',
      version: 2,
      partialize: (state) => ({
        isRunning: state.isRunning,
        activeLogId: state.activeLogId,
        startTime: state.startTime,
        elapsedTime: state.elapsedTime,
        notifications: state.notifications,
      }),
    }
  )
);

export default useTimerStore; 