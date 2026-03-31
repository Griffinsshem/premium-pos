"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const [role, setRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-white">
        <h2 className="text-xl font-bold">TruVend</h2>
        <button onClick={() => setOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* OVERLAY (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:static top-0 left-0 z-50
          h-screen w-64 bg-white border-r p-6 space-y-6
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">TruVend</h2>

          {/* Close button (mobile) */}
          <button
            className="md:hidden"
            onClick={() => setOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-4 text-gray-700">
          <SidebarLink href="/dashboard" icon={<LayoutDashboard size={18} />}>
            Dashboard
          </SidebarLink>

          <SidebarLink href="/products" icon={<Package size={18} />}>
            Products
          </SidebarLink>

          <SidebarLink href="/sales" icon={<ShoppingCart size={18} />}>
            Sales
          </SidebarLink>

          {/* ADMIN ONLY */}
          {role === "admin" && (
            <>
              <SidebarLink href="/users" icon={<Users size={18} />}>
                Users
              </SidebarLink>

              <SidebarLink href="/reports" icon={<BarChart3 size={18} />}>
                Reports
              </SidebarLink>
            </>
          )}
        </nav>
      </div>
    </>
  );
}

/*  Reusable Link Component */
function SidebarLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}