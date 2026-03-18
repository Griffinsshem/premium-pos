"use client";

import { useState } from "react";

interface CashModalProps {
  total: number;
  saleId: number;
  token: string;
  onClose: () => void;
}

export default function CashModal({
  total,
  saleId,
  token,
  onClose,
}: CashModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (value: string) => {
    setAmount(value);
    const paid = parseFloat(value) || 0;
    setBalance(paid - total);
  };

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sale_id: saleId,
          amount_paid: parseFloat(amount),
          payment_method: "cash",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Payment failed");
        return;
      }

      alert("✅ Payment successful");
      onClose();
    } catch (error) {
      console.error(error);
      alert("❌ Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-96 p-6 rounded-2xl shadow-lg space-y-4">
        <h2 className="text-xl font-bold text-center">Cash Payment</h2>

        <div>
          <p className="text-gray-600">Total</p>
          <p className="text-lg font-semibold">{total}</p>
        </div>

        <div>
          <input
            type="number"
            placeholder="Enter cash amount"
            value={amount}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <p className="text-gray-600">Balance</p>
          <p
            className={`text-lg font-semibold ${balance < 0 ? "text-red-500" : "text-green-600"
              }`}
          >
            {balance}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
          >
            {loading ? "Processing..." : "Confirm"}
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}