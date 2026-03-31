"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  DollarSign,
  BarChart3,
  ShoppingCart,
} from "lucide-react";

type Metrics = {
  today_sales: number;
  weekly_sales: number;
  transactions_today: number;
};

type ChartItem = {
  name: string;
  sales: number;
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH METRICS
  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:5000/dashboard/metrics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch metrics", err);
    }
  };

  // TEMP DATA
  const generateChartData = () => {
    setChartData([
      { name: "Mon", sales: 100 },
      { name: "Tue", sales: 200 },
      { name: "Wed", sales: 150 },
      { name: "Thu", sales: 300 },
      { name: "Fri", sales: 250 },
      { name: "Sat", sales: 400 },
      { name: "Sun", sales: 350 },
    ]);
  };

  useEffect(() => {
    fetchMetrics();
    generateChartData();
    setLoading(false);
  }, []);

  if (loading) {
    return <p className="p-6">Loading dashboard...</p>;
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1">
          Track your sales, performance, and activity
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Today's Sales"
          value={`KES ${metrics?.today_sales ?? 0}`}
          icon={<DollarSign size={20} />}
        />

        <StatCard
          title="Weekly Sales"
          value={`KES ${metrics?.weekly_sales ?? 0}`}
          icon={<BarChart3 size={20} />}
        />

        <StatCard
          title="Transactions"
          value={metrics?.transactions_today ?? 0}
          icon={<ShoppingCart size={20} />}
        />
      </div>

      {/* CHART */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Weekly Sales Trend
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* PREMIUM CARD */
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-500">{title}</h2>
        <div className="text-gray-700">{icon}</div>
      </div>

      <p className="text-2xl font-bold text-gray-900 mt-4">
        {value}
      </p>
    </div>
  );
}