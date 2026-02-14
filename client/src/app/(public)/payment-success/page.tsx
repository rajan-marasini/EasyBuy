"use client";

import { Button } from "@/components/ui/button";
import { useCreateOrder } from "@/hooks/useOrder";
import { useCartStore } from "@/lib/cart-store";
import { AxiosError } from "axios";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { clearCart } = useCartStore();
  const { mutate: createOrder } = useCreateOrder();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing",
  );
  const hasCreatedOrder = useRef(false);

  useEffect(() => {
    (() => {
      if (hasCreatedOrder.current) return;

      const pendingOrder = localStorage.getItem("pending_order");
      if (!pendingOrder) {
        setStatus("error");
        toast.error("No pending order found");
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const dataParam = searchParams.get("data");
      const pidxParam = searchParams.get("pidx");

      let paymentId = "";
      if (pidxParam) {
        paymentId = pidxParam;
      } else if (dataParam) {
        try {
          const decodedData = JSON.parse(atob(dataParam));
          paymentId = decodedData.transaction_uuid;
        } catch (e) {
          console.error("Failed to decode eSewa data", e);
        }
      }

      const orderData = JSON.parse(pendingOrder);
      if (paymentId) {
        orderData.paymentId = paymentId;
      }

      hasCreatedOrder.current = true;

      createOrder(orderData, {
        onSuccess: () => {
          setStatus("success");
          clearCart();
          localStorage.removeItem("pending_order");
          toast.success("Order placed successfully!");
        },
        onError: (error: AxiosError<{ message: string }>) => {
          setStatus("error");
          toast.error(
            error?.response?.data?.message || "Failed to finalize order",
          );
          hasCreatedOrder.current = false;
        },
      });
    })();
  }, [createOrder, clearCart]);

  return (
    <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center">
      <div className="max-w-md w-full text-center space-y-8 p-12 rounded-3xl bg-white border-2 border-emerald-100 shadow-2xl shadow-emerald-500/10">
        {status === "processing" && (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-20 w-20 text-emerald-500 animate-spin" />
            </div>
            <h1 className="text-3xl font-black text-zinc-900">
              Finalizing Your Order...
            </h1>
            <p className="text-zinc-500 font-medium">
              Please wait while we confirm your payment and create your order.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-16 w-16 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-3xl font-black bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Payment Successful!
            </h1>
            <p className="text-zinc-500 font-medium">
              Thank you for your purchase. Your order has been placed
              successfully.
            </p>
            <Button
              onClick={() => router.push("/profile")}
              className="w-full rounded-2xl h-14 text-lg font-bold bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
            >
              Go to Profile
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-4xl text-red-600 font-black">X</span>
              </div>
            </div>
            <h1 className="text-3xl font-black text-red-600">
              Something Went Wrong
            </h1>
            <p className="text-zinc-500 font-medium">
              We couldn&apos;t finalize your order. Please contact support if
              your payment was deducted.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/cart")}
              className="w-full rounded-2xl h-14 text-lg font-bold border-2 hover:bg-zinc-50 transition-all duration-300"
            >
              Back to Cart
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
