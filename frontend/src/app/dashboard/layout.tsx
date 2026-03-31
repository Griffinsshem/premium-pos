"use client";

import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="md:flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 min-h-screen p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}