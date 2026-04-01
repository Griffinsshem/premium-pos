"use client";

import { useState, useEffect } from "react";
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
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------
  // PHONE HELPERS
  // -----------------------------
  const normalizePhone = (input: string) => {
    let p = input.replace(/\s+/g, "");

    if (p.startsWith("0")) return "254" + p.slice(1);
    if (p.startsWith("+254")) return p.replace("+", "");

    return p;
  };

  const isValidPhone = (input: string) => {
    const normalized = normalizePhone(input);
    return /^2547\d{8}$/.test(normalized);
  };

  // -----------------------------
  // POLLING FUNCTION
  // -----------------------------
  const checkPaymentStatus = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/payments/status/${saleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.status === "completed") {
        setSuccess(true);
        setWaiting(false);

        setTimeout(() => {
          onClose();
        }, 2000);
      }

    } catch (err) {
      console.error("Polling error", err);
    }
  };

  // -----------------------------
  // START POLLING WHEN WAITING
  // -----------------------------
  useEffect(() => {
    if (!waiting) return;

    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 3000); // every 3 sec

    return () => clearInterval(interval);
  }, [waiting]);

  // -----------------------------
  // SEND STK
  // -----------------------------
  const handleMpesa = async () => {
    setError(null);

    if (!isValidPhone(phone)) {
      setError("Enter valid Safaricom number");
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
        setError(data.error || "STK failed");
        return;
      }

      // START WAITING STATE
      setWaiting(true);

    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-xl space-y-5">

        <h2 className="text-xl font-bold text-center flex items-center justify-center gap-2">
          <Smartphone size={20} />
          M-Pesa Payment
        </h2>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle className="text-green-600" size={40} />
            <p className="text-green-600 font-semibold">
              Payment Confirmed ✅
            </p>
          </div>
        ) : waiting ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="animate-spin text-green-600" size={32} />
            <p className="text-center font-medium">
              Waiting for customer to complete payment...
            </p>
            <p className="text-sm text-gray-500 text-center">
              Check phone and enter M-Pesa PIN
            </p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="text-gray-500 text-sm">Amount</p>
              <p className="text-2xl font-bold">
                KES {total.toFixed(2)}
              </p>
            </div>

            <input
              type="tel"
              placeholder="07XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            />

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <XCircle size={16} />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleMpesa}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg"
              >
                {loading ? "Sending..." : "Send STK"}
              </button>

              <button
                onClick={onClose}
                className="flex-1 bg-gray-400 text-white py-2 rounded-lg"
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