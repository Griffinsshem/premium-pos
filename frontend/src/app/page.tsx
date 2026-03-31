"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Package,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* NAVBAR */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <h1 className="text-xl font-bold text-gray-800">TruVend</h1>

        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition"
        >
          Login
        </button>
      </header>

      {/* HERO */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 max-w-3xl leading-tight">
          Run Your Business Smarter with TruVend
        </h2>

        <p className="mt-6 text-gray-600 max-w-xl text-lg">
          A modern POS system to manage sales, inventory, and analytics — built
          for speed, simplicity, and growth.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push("/login")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition"
          >
            Get Started <ArrowRight size={18} />
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-200 transition"
          >
            View Dashboard
          </button>
        </div>
      </main>

      {/* FEATURES */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
          <FeatureCard
            icon={<ShoppingCart size={22} />}
            title="Sales Management"
            desc="Process transactions quickly and efficiently."
          />
          <FeatureCard
            icon={<Package size={22} />}
            title="Inventory Tracking"
            desc="Monitor stock levels in real-time."
          />
          <FeatureCard
            icon={<BarChart3 size={22} />}
            title="Analytics"
            desc="Get insights into your business performance."
          />
          <FeatureCard
            icon={<ShieldCheck size={22} />}
            title="Secure Access"
            desc="Role-based permissions for your team."
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-sm text-gray-500 py-6 border-t bg-white">
        © {new Date().getFullYear()} TruVend POS. All rights reserved.
      </footer>
    </div>
  );
}

/* Feature Card */
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
      <div className="mb-4 text-black">{icon}</div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-2">{desc}</p>
    </div>
  );
}