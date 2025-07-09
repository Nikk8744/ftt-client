"use client";

import { useQuery } from "@tanstack/react-query";
import ChartCard from "@/components/feature/reports/ChartCard";
import Loader from "@/components/ui/Loader";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import React from "react";
import { getWeeklySummary } from '@/services/log';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface WeeklyBarData {
  date: string;
  totalTime: number;
}

const ThisWeekBarGraph: React.FC = () => {
  const { data, isLoading, isError } = useQuery<WeeklyBarData[]>({
    queryKey: ["weeklyBarGraph"],
    queryFn: getWeeklySummary,
  });
  console.log("🚀 ~ data:", data)

  if (isLoading) {
    return <ChartCard title="This Week: Time Tracked"><Loader text="Loading weekly summary..." /></ChartCard>;
  }

  if (isError || !data) {
    return <ChartCard title="This Week: Time Tracked"><div className="text-red-500">Failed to load weekly summary.</div></ChartCard>;
  }

  // Format date for display (e.g., Mon, Tue, ...)
  const labels = data.map(d => new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }));
  const hours = data.map(d => +(d.totalTime / 3600).toFixed(2));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Hours Tracked",
        data: hours,
        backgroundColor: "rgba(99, 102, 241, 0.7)", // Tailwind indigo-500
        borderRadius: 6,
        maxBarThickness: 32,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return ` ${value} hrs`;
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(200, 200, 200, 0.2)",
        },
        ticks: {
          font: {
            size: 12,
          },
          stepSize: 1,
        },
        title: {
          display: true,
          text: "Hours",
        },
      },
    },
  };

  return (
    <ChartCard title="This Week: Time Tracked">
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </ChartCard>
  );
};

export { ThisWeekBarGraph };
export default ThisWeekBarGraph; 