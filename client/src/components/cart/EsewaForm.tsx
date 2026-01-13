"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CryptoJS from "crypto-js";
import { useEffect, useState } from "react";

interface EsewaFormProps {
    amount: string;
    tax_amount?: string;
    total_amount: string;
    transaction_uuid: string;
    product_code?: string;
    product_service_charge?: string;
    product_delivery_charge?: string;
    success_url?: string;
    failure_url?: string;
    secret?: string;
}

export function EsewaForm({
    amount,
    tax_amount = "0",
    total_amount,
    transaction_uuid,
    product_code = "EPAYTEST",
    product_service_charge = "0",
    product_delivery_charge = "0",
    success_url = "",
    failure_url = "",
    secret = "8gBm/:&EnhH.1/q",
}: EsewaFormProps) {
    const [signature, setSignature] = useState("");

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const finalSuccessUrl = success_url || `${baseUrl}/payment-success`;
    const finalFailureUrl = failure_url || `${baseUrl}/payment-failure`;

    const generateSignature = (
        total_amount: string,
        transaction_uuid: string,
        product_code: string,
        secret: string
    ) => {
        const hashString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        const hash = CryptoJS.HmacSHA256(hashString, secret);
        const hashedSignature = CryptoJS.enc.Base64.stringify(hash);
        return hashedSignature;
    };

    useEffect(() => {
        (() => {
            const hashedSignature = generateSignature(
                total_amount,
                transaction_uuid,
                product_code,
                secret
            );
            setSignature(hashedSignature);
        })();
    }, [total_amount, transaction_uuid, product_code, secret]);

    return (
        <div className="bg-white p-8 rounded-3xl border-2 border-emerald-100 shadow-2xl shadow-emerald-500/10 max-w-md mx-auto">
            <h2 className="text-2xl font-black bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 text-center">
                Finalize eSewa Payment
            </h2>
            <form
                action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
                method="POST"
                className="space-y-6"
            >
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
                        value={`Rs. ${total_amount}`}
                        readOnly
                        className="bg-zinc-50 border-2 border-zinc-100 rounded-2xl h-12 font-bold text-lg text-emerald-600 focus-visible:ring-0"
                    />
                </div>

                {/* Hidden Fields */}
                <input type="hidden" name="amount" value={amount} />
                <input type="hidden" name="tax_amount" value={tax_amount} />
                <input type="hidden" name="total_amount" value={total_amount} />
                <input
                    type="hidden"
                    name="transaction_uuid"
                    value={transaction_uuid}
                />
                <input type="hidden" name="product_code" value={product_code} />
                <input
                    type="hidden"
                    name="product_service_charge"
                    value={product_service_charge}
                />
                <input
                    type="hidden"
                    name="product_delivery_charge"
                    value={product_delivery_charge}
                />
                <input
                    type="hidden"
                    name="success_url"
                    value={finalSuccessUrl}
                />
                <input
                    type="hidden"
                    name="failure_url"
                    value={finalFailureUrl}
                />
                <input
                    type="hidden"
                    name="signed_field_names"
                    value="total_amount,transaction_uuid,product_code"
                />
                <input type="hidden" name="signature" value={signature} />

                <Button
                    type="submit"
                    className="w-full rounded-2xl h-14 text-lg font-bold bg-linear-to-r from-[#41a124] to-[#41a124]/90 hover:from-[#368a1e] hover:to-[#368a1e]/90 shadow-xl shadow-emerald-500/20 transition-all duration-300 hover:scale-105 active:scale-95 text-white"
                >
                    Pay with eSewa
                </Button>
            </form>
        </div>
    );
}
