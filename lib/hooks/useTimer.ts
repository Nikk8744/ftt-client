'use client';

import { useEffect, useState } from 'react';
import useTimerStore from '@/store/timer';
import { startTimeLog, stopTimeLog, getTimeLogById } from '@/services/log';
import { formatDuration } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

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

  const queryClient = useQueryClient();

  // Check if timer was stopped on the backend when component mounts
  useEffect(() => {
    const checkTimerStatus = async () => {
      if (isRunning && activeLogId) {
        try {
          const response = await getTimeLogById(activeLogId);
          // If the timer has an endTime, it was stopped on the backend
          if (response.data?.endTime) {
            console.log('[useTimer] Timer was stopped on backend, syncing local state');
            resetTimer();
          }
        } catch (err) {
          console.error('[useTimer] Error checking timer status:', err);
        }
      }
    };

    checkTimerStatus();
  }, [activeLogId, isRunning, resetTimer]);

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
  }, [isRunning, startTime, updateElapsedTime, stopTimer, elapsedTime]);

  const handleStartTimer = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the actual API to start a time log
      const response = await startTimeLog();
      
      if (response.data) {
        startTimer(response.data.id);
        setIsLoading(false);
        return { log: response.data };
      } else {
        throw new Error('Failed to start timer - no data received');
      }
    } catch (err) {
      setError('Failed to start timer');
      setIsLoading(false);
      console.error('Error starting timer:', err);
      throw err;
    }
  };

  const handleStopTimer = async (data: { projectId: number; taskId: number; description?: string }) => {
    try {
      if (!activeLogId) {
        throw new Error('No active timer to stop');
      }
      
      setIsLoading(true);
      setError(null);
      
      // Call the actual API to stop the time log
      const response = await stopTimeLog(activeLogId, {
        projectId: data.projectId,
        taskId: data.taskId,
        ...(data.description && { description: data.description })
      });
      
      if (response.data) {
        stopTimer();
        setIsLoading(false);
        handleResetTimer();
        queryClient.invalidateQueries({ queryKey: ['logs'] });
        return { log: response.data };
      } else {
        throw new Error('Failed to stop timer - no data received');
      }
    } catch (err) {
      setError('Failed to stop timer');
      setIsLoading(false);
      console.error('Error stopping timer:', err);
      throw err;
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