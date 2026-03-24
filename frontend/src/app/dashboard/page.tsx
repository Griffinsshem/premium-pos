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

  // 🔥 FETCH METRICS FROM BACKEND
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

  // 🔥 TEMP WEEKLY DATA (we improve this Day 23)
  const generateChartData = () => {
    const data: ChartItem[] = [
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
    setLoading(false);
  }, []);

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-8 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          TruVend Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          Overview of your business performance
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Today's Sales"
          value={`KES ${metrics?.today_sales ?? 0}`}
        />
        <Card
          title="Weekly Sales"
          value={`KES ${metrics?.weekly_sales ?? 0}`}
        />
        <Card
          title="Transactions Today"
          value={metrics?.transactions_today ?? 0}
        />
      </div>

      {/* SALES GRAPH */}
      <div className="bg-white shadow-md rounded-xl p-6 border">
        <h2 className="text-lg font-semibold mb-4">Weekly Sales</h2>

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


function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 border">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <p className="text-3xl font-bold mt-4 text-gray-900">{value}</p>
    </div>
  );
}