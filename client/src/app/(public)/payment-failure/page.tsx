"use client";

import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentFailurePage() {
    const router = useRouter();

    return (
        <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center">
            <div className="max-w-md w-full text-center space-y-8 p-12 rounded-3xl bg-white border-2 border-red-100 shadow-2xl shadow-red-500/10">
                <div className="flex justify-center">
                    <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="h-16 w-16 text-red-600" />
                    </div>
                </div>
                <h1 className="text-3xl font-black text-red-600">
                    Payment Failed
                </h1>
                <p className="text-zinc-500 font-medium">
                    Your transaction could not be completed. Don&apos;t worry,
                    your cart is still safe.
                </p>
                <div className="flex flex-col gap-4">
                    <Button
                        onClick={() => router.push("/cart")}
                        className="w-full rounded-2xl h-14 text-lg font-bold bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-xl shadow-red-500/30 transition-all duration-300 hover:scale-105"
                    >
                        Return to Cart
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/")}
                        className="w-full rounded-2xl h-12 font-semibold text-zinc-500 hover:text-zinc-700"
                    >
                        Continue Shopping
                    </Button>
                </div>
            </div>
        </div>
    );
}
