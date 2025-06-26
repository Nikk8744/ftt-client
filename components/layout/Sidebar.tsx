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
          className="bg-white shadow-md hover:bg-gray-50"
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

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-[90]
          w-[280px] bg-gradient-to-b from-white to-indigo-50 border-r border-indigo-100 shadow-lg
          transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-0
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${className}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Title */}
          <div className="px-6 py-8">
            <div className="flex flex-col gap-1 justify-center">
              <div className="flex items-center justify-normal gap-1">
                <div className="p-2 bg-transparent">
                  {/* <Clock className="w-6 h-6 text-white" /> */}
                  <Logo size="md" showText={false} />
                </div>
                <Link href="/dashboard" className="text-3xl font-semibold font-serif text-black">
                  Tracksy
                </Link>
              </div>
              <p className="pxj-2 text-xs text-black font-serif">
                Manage your time effectively
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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
                    group hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50
                    ${
                      isActive
                        ? "bg-[#ecf3ff] text-brand font-semibold shadow-sm"
                        : "text-gray-700 font-semibold hover:text-indigo-700"
                    }
                  `}
                >
                  <span
                    className={`
                    mr-3 transition-transform duration-200 ease-in-out
                    group-hover:scale-110
                    ${isActive ? "text-brand scale-110" : "text-gray-600"}
                  `}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Help Section */}
          {/* <div className="px-4 py-6">
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-5 rounded-lg shadow-inner border border-indigo-200">
              <h3 className="text-sm font-medium text-indigo-700 mb-1">Need help?</h3>
              <p className="text-xs text-gray-600 mb-3">Check out our documentation or contact support</p>
              <a
                href="https://github.com/your-repo/time-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
              >
                <ExternalLink className="mr-1.5 h-4 w-4" />
                View Documentation
              </a>
            </div>
          </div> */}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
