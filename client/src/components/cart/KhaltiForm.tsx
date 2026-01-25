"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

interface KhaltiFormProps {
  amount: string;
  purchase_order_id: string;
  purchase_order_name?: string;
}

export function KhaltiForm({
  amount,
  purchase_order_id,
  purchase_order_name = "EasyBuy Order",
}: KhaltiFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleKhaltiPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(
        "https://dev.khalti.com/api/v2/epayment/initiate/",
        {
          method: "POST",
          headers: {
            Authorization: `Key ${process.env.NEXT_PUBLIC_KHALTI_LIVE_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            return_url: "http://localhost:3000/payment-success",
            website_url: "http://localhost:3000",
            amount: parseFloat(amount) * 100,
            purchase_order_id,
            purchase_order_name,
          }),
        },
      );
      const response = await res.json();
      if (response?.payment_url) {
        window.location.href = response.payment_url;
      } else {
        toast.error("Failed to initialize Khalti payment");
        setIsLoading(false);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Khalti initialization failed",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border-2 border-emerald-100 shadow-2xl shadow-emerald-500/10 max-w-md mx-auto">
      <h2 className="text-2xl font-black bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 text-center">
        Finalize Khalti Payment
      </h2>
      <form onSubmit={handleKhaltiPayment} className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="total_amount_display"
            className="text-sm font-bold text-zinc-700"
          >
            Total Amount to Pay
          </Label>
          <Input
            type="text"
            id="total_amount_display"
            value={`Rs. ${amount}`}
            readOnly
            className="bg-zinc-50 border-2 border-zinc-100 rounded-2xl h-12 font-bold text-lg text-emerald-600 focus-visible:ring-0"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl h-14 text-lg font-bold bg-[#5c2d91] hover:bg-[#4a2475] shadow-xl shadow-purple-500/20 transition-all duration-300 hover:scale-105 active:scale-95 text-white"
        >
          {isLoading ? "Redirecting..." : "Pay with Khalti"}
        </Button>
      </form>
    </div>
  );
}
