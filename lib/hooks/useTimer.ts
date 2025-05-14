'use client';

import { useEffect, useState } from 'react';
import useTimerStore from '@/store/timer';
import { startTimeLog, stopTimeLog } from '@/services/log';
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
        const now = new Date();
        const start = new Date(startTime);
        const diffInSeconds = Math.floor((now.getTime() - start.getTime()) / 1000) + elapsedTime;
        
        updateElapsedTime(diffInSeconds);
        setFormattedTime(formatDuration(diffInSeconds));
      }, 1000);
    } else if (!isRunning) {
      setFormattedTime(formatDuration(elapsedTime));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime, elapsedTime, updateElapsedTime]);

  const handleStartTimer = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await startTimeLog();
      const newLogId = response.log.id;
      
      startTimer(newLogId);
      setIsLoading(false);
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
      
      await stopTimeLog(activeLogId, data);
      
      stopTimer();
      setIsLoading(false);
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