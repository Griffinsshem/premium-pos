"use client";

import { useState } from "react";
import CashModal from "@/components/CashModal";

export default function Home() {
  const [token, setToken] = useState<string>("");
  const [saleId, setSaleId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(100); // test total

  // 🔐 LOGIN (quick test)
  const handleLogin = async () => {
    const res = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@test.com",
        password: "123456",
      }),
    });

    const data = await res.json();
    setToken(data.access_token);
    alert("Logged in");
  };

  // 🛒 CREATE SALE
  const handleCreateSale = async () => {
    if (!token) {
      alert("Login first");
      return;
    }

    const res = await fetch("http://127.0.0.1:5000/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [
          {
            product_id: 1,
            qty: 1,
            price: 100,
          },
        ],
        subtotal: 100,
        tax: 0,
        discount: 0,
        total: 100,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Sale failed");
      return;
    }

    setSaleId(data.sale_id);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-100">
      <h1 className="text-2xl font-bold">Premium POS</h1>

      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Login
      </button>

      <button
        onClick={handleCreateSale}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Create Sale
      </button>

      {showModal && saleId && (
        <CashModal
          total={total}
          saleId={saleId}
          token={token}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}