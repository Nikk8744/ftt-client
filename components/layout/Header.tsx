"use client";
import React, { useState, useRef } from "react";
import useAuth from "../../lib/hooks/useAuth";
import useTimer from "../../lib/hooks/useTimer";
import Button from "../ui/Button";
import NotificationBell from "../feature/notifications/NotificationBell";
import { useNotifications } from "../../lib/hooks/useNotifications";
import { Pause, Play } from "lucide-react";
import { StopTimerModal } from "../feature/timer/StopTimerModal";
import { UserDropdown } from "../feature/common";

interface HeaderProps {
  sidebarOpen: boolean;
  isMobile: boolean;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, isMobile }) => {
  // Initialize notifications
  useNotifications();

  const {} = useAuth();
  const {
    isRunning,
    formattedTime,
    startTimer,
    stopTimer,
    isLoading: timerIsLoading,
  } = useTimer();

  const [isStopTimerModalOpen, setIsStopTimerModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  return (
    <header
      className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 fixed ${
        sidebarOpen && !isMobile ? "lg:left-[280px]" : "left-0"
      } right-0 z-10 shadow-sm transition-all duration-300`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end h-16">
          {/* Timer Display & Controls */}
          <div className="flex items-center gap-3">
            {/* Timer Display */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2">
              <div
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                  isRunning ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              />
              <span className="text-sm sm:text-lg font-mono font-semibold text-gray-900 dark:text-gray-100 min-w-[60px] sm:min-w-[80px]">
                {formattedTime}
              </span>
            </div>

            {/* Timer Control Button */}
            {isRunning ? (
              <Button
                variant="brandBtn"
                size="sm"
                onClick={() => setIsStopTimerModalOpen(true)}
                isLoading={timerIsLoading}
                className="sm:px-4 sm:py-2 px-2 py-1 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1 sm:gap-2"
              >
                <Pause className="w-4 h-4" />
                <span className="hidden sm:inline">Stop</span>
              </Button>
            ) : (
              <Button
                variant="brandBtn"
                size="sm"
                onClick={startTimer}
                isLoading={timerIsLoading}
                className="sm:px-4 sm:py-2 px-2 py-1 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1 sm:gap-2"
              >
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Start</span>
              </Button>
            )}
          </div>

          {/* Notification Bell */}
          <div className="ml-3">
            <NotificationBell />
          </div>

          {/* User Menu */}
          <UserDropdown
            isUserMenuOpen={isUserMenuOpen}
            setIsUserMenuOpen={setIsUserMenuOpen}
            userMenuRef={userMenuRef as React.RefObject<HTMLDivElement>}
          />
        </div>
      </div>

      {/* Stop Timer Modal */}
      <StopTimerModal
        isOpen={isStopTimerModalOpen}
        onClose={() => setIsStopTimerModalOpen(false)}
        stopTimer={stopTimer}
        timerIsLoading={timerIsLoading}
      />
    </header>
  );
};

export default Header;
