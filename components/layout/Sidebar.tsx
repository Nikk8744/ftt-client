"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  FolderOpen,
  CheckCircle,
  Clock,
  Settings,
  BarChart2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Logo from "../ui/Logo";
interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  className?: string;
  onSidebarChange?: (isOpen: boolean, isMobile: boolean) => void;
}

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <Home className="w-5 h-5" />,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: <FolderOpen className="w-5 h-5" />,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: <CheckCircle className="w-5 h-5" />,
  },
  {
    name: "Time Logs",
    href: "/logs",
    icon: <Clock className="w-5 h-5" />,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: <BarChart2 className="w-5 h-5" />,
  },
  {
    name: "Settings",
    href: "/profile",
    icon: <Settings className="w-5 h-5" />,
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  className = "",
  onSidebarChange,
}) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const initialRender = useRef(true);

  // Handle screen resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint in Tailwind
      setIsMobile(mobile);
      // Auto close sidebar on mobile
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Check on mount
    checkMobile();

    // Set up resize listener
    window.addEventListener("resize", checkMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Notify parent when sidebar state changes, but only after initial render
  useEffect(() => {
    // Skip the first render to avoid an initial update loop
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    // Only call onSidebarChange if it exists
    if (onSidebarChange) {
      onSidebarChange(isOpen, isMobile);
    }
  }, [isOpen, isMobile, onSidebarChange]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-[100]">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Backdrop */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-[85] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Position */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-[90]
          w-[280px] bg-gradient-to-b from-white to-indigo-50 dark:from-gray-900 dark:to-gray-800 border-r border-indigo-100 dark:border-gray-700 shadow-lg
          transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isMobile ? "" : "lg:translate-x-0"}
          ${className}
        `}
      >
        {/* Logo and Title - Fixed at the top */}
        <div className="px-6 py-8 flex-shrink-0">
          <div className="flex flex-col gap-1 justify-center">
            <div className="flex items-center justify-normal gap-1">
              <div className="p-2 bg-transparent">
                <Logo size="md" showText={false} />
              </div>
              <Link href="/dashboard" className="text-3xl font-semibold font-serif text-black dark:text-white">
                Tracksy
              </Link>
            </div>
            <p className="pxj-2 text-xs text-black dark:text-gray-400 font-serif">
              Manage your time effectively
            </p>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <nav className="px-4 space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => isMobile && setIsOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out
                    group hover:bg-gradient-to-r hover:from-indigo-50 hover:to-brand-100 dark:hover:from-gray-800 dark:hover:to-brand-900/30
                    ${
                      isActive
                        ? "bg-[#ecf3ff] dark:bg-brand-900 text-brand dark:text-brand-300 font-semibold shadow-sm"
                        : "text-gray-700 dark:text-gray-300 font-semibold hover:text-brand-600 dark:hover:text-brand-300"
                    }
                  `}
                >
                  <span
                    className={`
                    mr-3 transition-transform duration-200 ease-in-out
                    group-hover:scale-110
                    ${isActive ? "text-brand dark:text-brand-300 scale-110" : "text-gray-600 dark:text-gray-400 group-hover:text-brand-500 dark:group-hover:text-brand-300"}
                  `}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* This empty div creates space for the sidebar in the layout */}
      <div className="hidden lg:block w-[280px] flex-shrink-0"></div>
    </>
  );
};

export default Sidebar;
