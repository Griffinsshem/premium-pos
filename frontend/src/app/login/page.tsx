"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-800">
        <h2 className="mb-6 text-2xl font-bold text-zinc-800 dark:text-white">
          Login to Premium POS
        </h2>

        <form className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-black focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-black focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black py-2 font-semibold text-white transition hover:bg-zinc-800"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}