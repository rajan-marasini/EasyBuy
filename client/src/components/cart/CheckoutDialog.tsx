"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface CheckoutDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (orderData: {
        paymentMethod: string;
        shippingAddress: string;
    }) => void;
    isLoading: boolean;
}

export function CheckoutDialog({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
}: CheckoutDialogProps) {
    const [shippingAddress, setShippingAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("KHALTI");

    const handleConfirm = () => {
        if (!shippingAddress.trim()) {
            return;
        }
        onConfirm({ shippingAddress, paymentMethod });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white rounded-3xl border-2 border-emerald-100 shadow-2xl shadow-emerald-500/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Complete Your Order
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 font-medium">
                        Please provide your shipping details and select a
                        payment method.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <Label
                            htmlFor="address"
                            className="text-sm font-bold text-zinc-700"
                        >
                            Shipping Address
                        </Label>
                        <Textarea
                            id="address"
                            placeholder="Enter your full delivery address..."
                            className="bg-zinc-50 border-2 border-zinc-100 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-2xl min-h-[100px] transition-all duration-300"
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <Label className="text-sm font-bold text-zinc-700">
                            Payment Method
                        </Label>
                        <RadioGroup
                            value={paymentMethod}
                            onValueChange={setPaymentMethod}
                            className="grid grid-cols-1 gap-3"
                        >
                            <div className="flex items-center space-x-3 bg-zinc-50 p-4 rounded-2xl border-2 border-zinc-100 hover:border-emerald-200 transition-all duration-300">
                                <RadioGroupItem
                                    value="KHALTI"
                                    id="khalti"
                                    className="text-emerald-600"
                                />
                                <Label
                                    htmlFor="khalti"
                                    className="flex-1 font-bold text-zinc-700 cursor-pointer"
                                >
                                    Khalti
                                    <span className="block text-xs font-medium text-zinc-400 mt-0.5">
                                        Pay via Khalti Wallet
                                    </span>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-3 bg-zinc-50 p-4 rounded-2xl border-2 border-zinc-100 hover:border-emerald-200 transition-all duration-300">
                                <RadioGroupItem
                                    value="ESEWA"
                                    id="esewa"
                                    className="text-emerald-600"
                                />
                                <Label
                                    htmlFor="esewa"
                                    className="flex-1 font-bold text-zinc-700 cursor-pointer"
                                >
                                    Esewa
                                    <span className="block text-xs font-medium text-zinc-400 mt-0.5">
                                        Pay via Esewa
                                    </span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-3 bg-zinc-50 p-4 rounded-2xl border-2 border-zinc-100 hover:border-emerald-200 transition-all duration-300">
                                <RadioGroupItem
                                    value="COD"
                                    id="cod"
                                    className="text-emerald-600"
                                />
                                <Label
                                    htmlFor="cod"
                                    className="flex-1 font-bold text-zinc-700 cursor-pointer"
                                >
                                    Cash on Delivery
                                    <span className="block text-xs font-medium text-zinc-400 mt-0.5">
                                        Pay when you receive the order
                                    </span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <DialogFooter className="sm:justify-end gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-xl font-bold text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading || !shippingAddress.trim()}
                        className="rounded-xl px-8 font-black bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        {isLoading ? "Confirming..." : "Confirm Selection"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
