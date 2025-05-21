'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimerState {
  isRunning: boolean;
  activeLogId: number | null;
  startTime: string | null;
  elapsedTime: number;
  startTimer: (logId: number) => void;
  stopTimer: () => void;
  updateElapsedTime: (seconds: number) => void;
  resetTimer: () => void;
}

const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      isRunning: false,
      activeLogId: null,
      startTime: null,
      elapsedTime: 0,
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
    }),
    {
      name: 'timer-storage',
      version: 1,
      partialize: (state) => ({
        isRunning: state.isRunning,
        activeLogId: state.activeLogId,
        startTime: state.startTime,
        elapsedTime: state.elapsedTime,
      }),
    }
  )
);

export default useTimerStore; 