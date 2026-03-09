"use client";

import { Search, ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function POSPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="h-screen flex flex-col">

      {/* Header */}
      <div className="border-b px-6 py-4 flex justify-between items-center bg-white">
        <h1 className="text-2xl font-bold">TruVend Terminal</h1>

        <div className="text-sm text-gray-500">
          TruVend System
        </div>
      </div>

      {/* POS Layout */}
      <div className="flex-1 grid grid-cols-3 overflow-hidden">

        {/* Product Panel */}
        <div className="col-span-2 border-r p-6 flex flex-col">

          {/* Search */}
          <div className="relative mb-6">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search products..."
              className="w-full border rounded-lg pl-10 pr-4 py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Product List */}
          <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-gray-50">
            <p className="text-gray-500 text-sm">
              Products will appear here
            </p>
          </div>

        </div>

        {/* Cart Panel */}
        <div className="p-6 flex flex-col">

          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={20} />
            <h2 className="text-lg font-semibold">Cart</h2>
          </div>

          {/* Cart Items */}
          <div className="flex-1 border rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-500">
              Cart is empty
            </p>
          </div>

          {/* Total */}
          <div className="mt-6 border-t pt-4 space-y-3">

            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>$0.00</span>
            </div>

            <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition">
              Checkout
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}