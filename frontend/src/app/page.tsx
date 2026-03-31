"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 🔝 NAVBAR */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <h1 className="text-xl font-bold text-gray-800">TruVend</h1>

        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition"
        >
          Login
        </button>
      </header>

      {/* 🔥 HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 max-w-2xl">
          Smart POS System for Modern Businesses
        </h2>

        <p className="mt-4 text-gray-600 max-w-xl">
          Manage sales, track inventory, and monitor performance — all in one
          powerful platform.
        </p>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition"
          >
            Get Started
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-200 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </main>

      {/* 🔻 FOOTER */}
      <footer className="text-center text-sm text-gray-500 py-4">
        © {new Date().getFullYear()} TruVend POS. All rights reserved.
      </footer>
    </div>
  );
}