"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (value: string) => {
    setAmount(value);

    const paid = parseFloat(value) || 0;
    setBalance(paid - total);

    if (paid >= total) {
      setError(null);
    }
  };

  const handlePayment = async () => {
    setError(null);

    const paid = parseFloat(amount);

    if (!paid || paid <= 0) {
      setError("Enter a valid amount");
      return;
    }

    if (paid < total) {
      setError("Insufficient payment");
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
          amount_paid: paid,
          payment_method: "cash",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Payment failed");
        return;
      }

      setSuccess(true);

      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-xl space-y-5 animate-in fade-in zoom-in">

        {/* HEADER */}
        <h2 className="text-xl font-bold text-center flex items-center justify-center gap-2">
          Cash Payment
        </h2>

        {/* SUCCESS STATE */}
        {success ? (
          <div className="flex flex-col items-center justify-center gap-3 py-6">
            <CheckCircle className="text-green-600" size={40} />
            <p className="text-green-600 font-semibold">
              Payment Successful
            </p>
          </div>
        ) : (
          <>
            {/* TOTAL */}
            <div className="text-center">
              <p className="text-gray-500 text-sm">Total</p>
              <p className="text-2xl font-bold">
                KES {total.toFixed(2)}
              </p>
            </div>

            {/* INPUT */}
            <input
              type="number"
              placeholder="Enter cash amount"
              value={amount}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* BALANCE */}
            <div className="text-center">
              <p className="text-gray-500 text-sm">Balance</p>
              <p
                className={`text-lg font-semibold ${balance < 0 ? "text-red-500" : "text-green-600"
                  }`}
              >
                KES {balance.toFixed(2)}
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <XCircle size={16} />
                {error}
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex gap-3">
              <button
                onClick={handlePayment}
                disabled={loading || balance < 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Processing..." : "Confirm"}
              </button>

              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}