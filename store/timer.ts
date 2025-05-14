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
      startTimer: (logId) => set({ 
        isRunning: true,
        activeLogId: logId,
        startTime: new Date().toISOString(),
        elapsedTime: 0
      }),
      stopTimer: () => set({ isRunning: false }),
      updateElapsedTime: (seconds) => set({ elapsedTime: seconds }),
      resetTimer: () => set({ 
        isRunning: false,
        activeLogId: null,
        startTime: null,
        elapsedTime: 0
      }),
    }),
    {
      name: 'timer-storage',
    }
  )
);

export default useTimerStore; 