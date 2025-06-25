"use client";

import * as React from "react";
import { format, subDays, startOfMonth, startOfYear, startOfWeek, endOfWeek } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft } from "lucide-react";
import { DateRange, DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  onChange: (range: { from: Date; to: Date }) => void;
  className?: string;
  placeholder?: string;
}

export default function DateRangePicker({
  onChange,
  className,
  placeholder = "Select date range",
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);

  // Handle date change
  const handleDateSelect = (selectedRange: DateRange | undefined) => {
    setDate(selectedRange);
    // Auto-close only if both dates are selected
    if (selectedRange?.from && selectedRange?.to) {
      onChange({ from: selectedRange.from, to: selectedRange.to });
    }
  };

  // Preset date ranges with better organization
  const presets = [
    {
      label: "Today",
      value: "today",
      onClick: () => {
        const today = new Date();
        const range = { from: today, to: today };
        setDate(range);
        onChange(range);
        setIsPopoverOpen(false);
      },
    },
    {
      label: "This week",
      value: "this-week",
      onClick: () => {
        const today = new Date();
        const range = {
          from: startOfWeek(today, { weekStartsOn: 1 }),
          to: endOfWeek(today, { weekStartsOn: 1 }),
        };
        setDate(range);
        onChange(range);
        setIsPopoverOpen(false);
      },
    },
    {
      label: "Last 7 days",
      value: "last-7-days",
      onClick: () => {
        const today = new Date();
        const range = {
          from: subDays(today, 6),
          to: today,
        };
        setDate(range);
        onChange(range);
        setIsPopoverOpen(false);
      },
    },
    {
      label: "Last 30 days",
      value: "last-30-days",
      onClick: () => {
        const today = new Date();
        const range = {
          from: subDays(today, 29),
          to: today,
        };
        setDate(range);
        onChange(range);
        setIsPopoverOpen(false);
      },
    },
    {
      label: "This month",
      value: "this-month",
      onClick: () => {
        const today = new Date();
        const range = {
          from: startOfMonth(today),
          to: today,
        };
        setDate(range);
        onChange(range);
        setIsPopoverOpen(false);
      },
    },
    {
      label: "This year",
      value: "this-year",
      onClick: () => {
        const today = new Date();
        const range = {
          from: startOfYear(today),
          to: today,
        };
        setDate(range);
        onChange(range);
        setIsPopoverOpen(false);
      },
    },
  ];

  const formatDateRange = () => {
    if (!date?.from) return null;
    
    if (date.to) {
      // Same date
      if (date.from.toDateString() === date.to.toDateString()) {
        return format(date.from, "MMM d, yyyy");
      }
      // Same month and year
      if (date.from.getMonth() === date.to.getMonth() && 
          date.from.getFullYear() === date.to.getFullYear()) {
        return `${format(date.from, "MMM d")} - ${format(date.to, "d, yyyy")}`;
      }
      // Same year
      if (date.from.getFullYear() === date.to.getFullYear()) {
        return `${format(date.from, "MMM d")} - ${format(date.to, "MMM d, yyyy")}`;
      }
      // Different years
      return `${format(date.from, "MMM d, yyyy")} - ${format(date.to, "MMM d, yyyy")}`;
    }
    
    return format(date.from, "MMM d, yyyy");
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "min-w-[240px] justify-start font-normal h-10 px-3",
              "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "transition-all duration-200",
              !date && "text-gray-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {formatDateRange() || (
                <span className="text-gray-500">{placeholder}</span>
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 mr-6 border-gray-200 shadow-lg rounded-xl max-w-[calc(100vw-2rem)] md:max-w-[700px] lg:max-w-[800px]"
          align="start"
          sideOffset={8}
        >
          <div className="flex flex-col lg:flex-row relative">
            {/* Toggle filters button (mobile only) */}
            <button 
              className="absolute top-2 right-2 lg:hidden z-10 bg-white p-1 rounded-md border border-gray-200 shadow-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform", showFilters ? "rotate-180" : "")} />
            </button>
            
            {/* Presets sidebar - hidden on mobile unless toggled */}
            <div className={cn(
              "border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50/50 p-3 w-full lg:w-1/4",
              "transition-all duration-200 ease-in-out",
              "lg:block", // Always visible on LG and up
              !showFilters ? "hidden" : "block" // Toggle on mobile
            )}>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                Quick Select
              </p>
              <div className="space-y-1 flex flex-col gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={preset.onClick}
                    className={cn(
                      "text-left px-3 py-2 text-sm rounded-md",
                      "transition-colors duration-150",
                      "hover:bg-gray-200/50 hover:text-black",
                      "focus:outline-none focus:bg-brand focus:text-white",
                      // Highlight active preset
                      date?.from && date?.to && 
                      preset.value === "last-30-days" && 
                      date.from.toDateString() === subDays(new Date(), 29).toDateString() &&
                      date.to.toDateString() === new Date().toDateString() &&
                      "bg-white text-gray-900 font-medium"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="p-4 w-full">
              <DayPicker
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                showOutsideDays
                classNames={{
                  months: "flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4",
                  month: "space-y-4 w-full max-w-[240px] mx-auto md:mx-0",
                  caption: "flex justify-between items-center px-2",
                  caption_label: "text-sm font-medium text-brand",
                  nav: "flex items-center space-x-1",
                  nav_button: cn(
                    "h-7 w-7 bg-transparent p-0 text-gray-600",
                    "hover:bg-gray-100 rounded-md transition-colors",
                    "inline-flex items-center justify-center",
                    "disabled:opacity-30 disabled:cursor-not-allowed"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse",
                  head_row: "flex",
                  head_cell: "text-gray-500 rounded-md w-7 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: cn(
                    "relative h-7 w-7 text-center text-sm p-0",
                    "focus-within:relative focus-within:z-20",
                    "[&:has([aria-selected])]:bg-blue-50",
                    "[&:has([aria-selected].day-range-end)]:rounded-r-md",
                    "[&:has([aria-selected].day-range-start)]:rounded-l-md",
                    "[&:has([aria-selected].day-outside)]:bg-blue-50/50"
                  ),
                  day: cn(
                    "h-7 w-7 p-0 font-normal text-center",
                    "hover:bg-gray-100 rounded-md transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    "aria-selected:opacity-100"
                  ),
                  day_selected: cn(
                    "bg-brand text-blue-50 hover:bg-brand hover:text-white",
                    "focus:bg-brand focus:text-white"
                  ),
                  day_today: "bg-gray-100 font-semibold",
                  day_outside: "text-gray-400 opacity-50",
                  day_disabled: "text-gray-400 opacity-50",
                  day_range_middle: cn(
                    "aria-selected:bg-blue-50 aria-selected:text-blue-900",
                    "aria-selected:hover:bg-blue-100"
                  ),
                  day_hidden: "invisible",
                }}
              />
              
              {/* Footer */}
              <div className="border-t border-gray-200 pt-4 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                  {date?.from && !date?.to && "Please select end date"}
                  {date?.from && date?.to && (
                    <span className="font-medium text-gray-900">
                      {Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24)) + 1} days selected
                    </span>
                  )}
                  {!date?.from && "Select start date"}
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDate(undefined);
                      setIsPopoverOpen(false);
                    }}
                    className="h-8 px-3 text-sm border-gray-200 hover:bg-gray-50"
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsPopoverOpen(false)}
                    disabled={!date?.from || !date?.to}
                    className="h-8 px-3 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}