"use client";

import { useEffect, useState } from "react";

type ReportType = "product" | "payment" | "low-stock";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("product");
  const [threshold, setThreshold] = useState(5);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);

    try {
      let url = "";

      if (reportType === "product") {
        url = "http://127.0.0.1:5000/reports/sales-by-product";
      } else if (reportType === "payment") {
        url = "http://127.0.0.1:5000/reports/sales-by-payment-method";
      } else if (reportType === "low-stock") {
        url = `http://127.0.0.1:5000/reports/low-stock?threshold=${threshold}`;
      }

      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Request failed:", res.status);
        setData([]);
        return;
      }

      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-gray-500">View business insights</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value as ReportType)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="product">Sales by Product</option>
          <option value="payment">Sales by Payment</option>
          <option value="low-stock">Low Stock</option>
        </select>

        {reportType === "low-stock" && (
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="border rounded-lg px-4 py-2"
            placeholder="Threshold"
          />
        )}

        <button
          onClick={fetchReport}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl p-6 border overflow-x-auto">
        {loading ? (
          <p>Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-500">No data available</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="py-2 px-4 capitalize">
                    {key.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b">
                  {Object.values(row).map((value: any, i) => (
                    <td key={i} className="py-2 px-4">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}