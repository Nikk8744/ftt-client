'use client';

import { useEffect, useState } from 'react';
import useTimerStore from '@/store/timer';
import { addMockLog, updateMockLog } from '@/lib/mockData';
// Comment out API imports
// import { startTimeLog, stopTimeLog } from '@/services/log';
import { formatDuration } from '@/lib/utils';

export default function useTimer() {
  const { 
    isRunning, 
    activeLogId, 
    startTime, 
    elapsedTime, 
    startTimer, 
    stopTimer, 
    updateElapsedTime, 
    resetTimer 
  } = useTimerStore();
  
  const [formattedTime, setFormattedTime] = useState<string>('00:00:00');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate elapsed time and update it every second
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && startTime) {
      interval = setInterval(() => {
        try {
          const now = new Date();
          const start = new Date(startTime);
          // Only calculate the difference from the start time, don't add elapsed time
          const diffInSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
          
          updateElapsedTime(diffInSeconds);
          setFormattedTime(formatDuration(diffInSeconds));
        } catch (err) {
          console.error('Error updating timer:', err);
          setError('Error updating timer');
          stopTimer();
        }
      }, 1000);
    } else if (!isRunning) {
      setFormattedTime(formatDuration(elapsedTime));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime, updateElapsedTime, stopTimer]);

  const handleStartTimer = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock the startTimeLog API call
      // const response = await startTimeLog();
      const newLog = addMockLog({
        userId: 1,
        startTime: new Date().toISOString(),
        endTime: null,
        duration: null,
      });
      
      const newLogId = newLog.id;
      
      startTimer(newLogId);
      setIsLoading(false);
      
      return { log: newLog };
    } catch (err) {
      setError('Failed to start timer');
      setIsLoading(false);
      console.error('Error starting timer:', err);
    }
  };

  const handleStopTimer = async (data?: { projectId?: number; taskId?: number; description?: string }) => {
    try {
      if (!activeLogId) return;
      
      setIsLoading(true);
      setError(null);
      
      // Mock the stopTimeLog API call
      // await stopTimeLog(activeLogId, data);
      const now = new Date();
      const endTime = now.toISOString();
      
      const updatedLog = updateMockLog(activeLogId, {
        ...data,
        endTime,
        duration: Math.floor(elapsedTime), // Use elapsed time from store
      });
      
      stopTimer();
      setIsLoading(false);
      
      return { log: updatedLog };
    } catch (err) {
      setError('Failed to stop timer');
      setIsLoading(false);
      console.error('Error stopping timer:', err);
    }
  };

  const handleResetTimer = () => {
    resetTimer();
    setFormattedTime('00:00:00');
  };

  return {
    isRunning,
    activeLogId,
    formattedTime,
    elapsedTime,
    isLoading,
    error,
    startTimer: handleStartTimer,
    stopTimer: handleStopTimer,
    resetTimer: handleResetTimer
  };
} 