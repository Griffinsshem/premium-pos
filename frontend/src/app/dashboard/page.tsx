"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    today_sales: 0,
    weekly_sales: 0,
    transactions_today: 0,
  });

  type ChartItem = {
    name: string;
    sales: number;
  };

  const [chartData, setChartData] = useState<ChartItem[]>([])

  const fetchMetrics = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/dashboard/metrics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch metrics", err);
    }
  };

  const generateChartData = () => {
    const data = [
      { name: "Mon", sales: 100 },
      { name: "Tue", sales: 200 },
      { name: "Wed", sales: 150 },
      { name: "Thu", sales: 300 },
      { name: "Fri", sales: 250 },
      { name: "Sat", sales: 400 },
      { name: "Sun", sales: 350 },
    ];
    setChartData(data);
  };

  useEffect(() => {
    fetchMetrics();
    generateChartData();
  }, []);

  return (
    <div className="p-8 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          TrueVend Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          Welcome back. Here’s your business overview.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-xl p-6 border">
          <h2 className="text-sm text-gray-500">Today Sales</h2>
          <p className="text-3xl font-bold mt-2">
            KES {metrics.today_sales}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 border">
          <h2 className="text-sm text-gray-500">Weekly Sales</h2>
          <p className="text-3xl font-bold mt-2">
            KES {metrics.weekly_sales}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 border">
          <h2 className="text-sm text-gray-500">Transactions Today</h2>
          <p className="text-3xl font-bold mt-2">
            {metrics.transactions_today}
          </p>
        </div>
      </div>

      {/* SALES CHART */}
      <div className="bg-white shadow-md rounded-xl p-6 border">
        <h2 className="text-lg font-semibold mb-4">Weekly Sales Trend</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}