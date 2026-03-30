"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  return (
    <div className="w-64 h-screen bg-black text-white p-6 space-y-6">
      <h2 className="text-2xl font-bold">TruVend</h2>

      <nav className="flex flex-col gap-4">
        {/* Common */}
        <Link href="/dashboard" className="hover:text-gray-300">
          Dashboard
        </Link>

        <Link href="/products" className="hover:text-gray-300">
          Products
        </Link>

        <Link href="/sales" className="hover:text-gray-300">
          Sales
        </Link>

        {/* 🔒 ADMIN ONLY */}
        {role === "admin" && (
          <>
            <Link href="/users" className="hover:text-gray-300">
              Users
            </Link>

            <Link href="/reports" className="hover:text-gray-300">
              Reports
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}