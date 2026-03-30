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
    <div className="w-64 h-screen bg-white border-r p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">TruVend</h2>

      <nav className="flex flex-col gap-4 text-gray-700">
        {/* Common */}
        <Link href="/dashboard" className="hover:text-black">
          Dashboard
        </Link>

        <Link href="/products" className="hover:text-black">
          Products
        </Link>

        <Link href="/sales" className="hover:text-black">
          Sales
        </Link>

        {/* 🔒 ADMIN ONLY */}
        {role === "admin" && (
          <>
            <Link href="/users" className="hover:text-black">
              Users
            </Link>

            <Link href="/reports" className="hover:text-black">
              Reports
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}