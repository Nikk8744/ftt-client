"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import { ThemeToggle } from "../../layout/ThemeToggle";
import useAuth from "../../../lib/hooks/useAuth"; // Adjust path as needed

interface UserDropdownProps {
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: (isOpen: boolean) => void;
  userMenuRef: React.RefObject<HTMLDivElement>;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  isUserMenuOpen,
  setIsUserMenuOpen,
  userMenuRef,
}) => {
  const { user, logout } = useAuth();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsUserMenuOpen, userMenuRef]);

  return (
    <div className="relative ml-3" ref={userMenuRef}>
      <button
        className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-medium text-sm shadow-sm hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-200"
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        aria-expanded={isUserMenuOpen}
      >
        {user?.name?.charAt(0)?.toUpperCase() || "U"}
      </button>

      {/* Dropdown Menu */}
      {isUserMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-20 animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700">
            <div className="font-medium truncate">{user?.name || "User"}</div>
            <div className="truncate text-gray-500 dark:text-gray-400 text-xs">
              {user?.email || ""}
            </div>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsUserMenuOpen(false)}
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsUserMenuOpen(false)}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <hr className="my-1 border-gray-100 dark:border-gray-700" />
          <div className="p-2">
            <ThemeToggle />
          </div>
          <hr className="my-1 border-gray-100 dark:border-gray-700" />
          <button
            onClick={() => {
              setIsUserMenuOpen(false);
              logout();
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
