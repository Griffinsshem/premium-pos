"use client";

import { useState } from "react";
import { Smartphone, Loader2, CheckCircle, XCircle } from "lucide-react";

interface MpesaModalProps {
  total: number;
  saleId: number;
  token: string;
  onClose: () => void;
}

export default function MpesaModal({
  total,
  saleId,
  token,
  onClose,
}: MpesaModalProps) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize phone → 2547XXXXXXXX
  const normalizePhone = (input: string) => {
    let p = input.replace(/\s+/g, "");

    if (p.startsWith("0")) {
      return "254" + p.slice(1);
    }

    if (p.startsWith("+254")) {
      return p.replace("+", "");
    }

    return p;
  };

  const isValidPhone = (input: string) => {
    const normalized = normalizePhone(input);
    return /^2547\d{8}$/.test(normalized);
  };

  const handleMpesa = async () => {
    setError(null);

    if (!phone) {
      setError("Phone number is required");
      return;
    }

    if (!isValidPhone(phone)) {
      setError("Enter valid Safaricom number (07XXXXXXXX)");
      return;
    }

    const normalizedPhone = normalizePhone(phone);

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/mpesa/stk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sale_id: saleId,
          phone: normalizedPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "STK Push failed");
        return;
      }

      setSuccess(true);

      // Auto close after showing success
      setTimeout(() => {
        onClose();
      }, 2500);

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
          <Smartphone size={20} />
          M-Pesa Payment
        </h2>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle className="text-green-600" size={40} />
            <p className="text-green-600 font-semibold text-center">
              STK Push Sent 📲
            </p>
            <p className="text-sm text-gray-500 text-center">
              Customer should enter PIN on phone
            </p>
          </div>
        ) : (
          <>
            {/* AMOUNT */}
            <div className="text-center">
              <p className="text-gray-500 text-sm">Amount</p>
              <p className="text-2xl font-bold">
                KES {total.toFixed(2)}
              </p>
            </div>

            {/* PHONE */}
            <div className="space-y-1">
              <input
                type="tel"
                placeholder="07XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400">
                Enter Safaricom number
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
                onClick={handleMpesa}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Sending STK..." : "Send STK"}
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