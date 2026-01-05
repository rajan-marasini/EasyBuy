"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

export default function CartPage() {
    const router = useRouter();
    const { items, removeItem, updateQuantity, getTotalPrice, clearCart } =
        useCartStore();

    // Hydration guard for Next.js
    const [isHydrated, setIsHydrated] = useState(false);
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const totalPrice = getTotalPrice();
    const tax = totalPrice * 0.1; // 10% tax
    const shipping = totalPrice > 100 ? 0 : 10; // Free shipping over $100
    const finalTotal = totalPrice + tax + shipping;

    if (!isHydrated) {
        return (
            <div className="container mx-auto px-4 py-20">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="animate-pulse bg-zinc-100 rounded-3xl h-[400px]" />
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-16 border-2 border-blue-100">
                        <div className="mb-8 flex justify-center">
                            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                                <ShoppingBag className="h-16 w-16 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Your Cart is Empty
                        </h1>
                        <p className="text-zinc-600 mb-8 text-lg">
                            Looks like you haven't added anything to your cart
                            yet. Start shopping to fill it up!
                        </p>
                        <Button
                            size="lg"
                            onClick={() => router.push("/")}
                            className="rounded-2xl h-14 px-8 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
                        >
                            Start Shopping
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Shopping Cart
                </h1>
                <Button
                    variant="ghost"
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl font-semibold"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.product.id}
                            className="bg-white rounded-2xl p-6 border-2 border-zinc-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group"
                        >
                            <div className="flex gap-6">
                                {/* Product Image */}
                                <div className="relative h-32 w-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-zinc-50 to-blue-50/30 border border-zinc-200 group-hover:border-blue-300 transition-all duration-300">
                                    <img
                                        src={
                                            item.product.images?.[0] ||
                                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200"
                                        }
                                        alt={item.product.name}
                                        className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <Link
                                                href={`/product/${item.product.id}`}
                                                className="font-bold text-lg text-zinc-900 hover:text-blue-600 transition-colors line-clamp-2"
                                            >
                                                {item.product.name}
                                            </Link>
                                            <p className="text-sm text-zinc-500 mt-1">
                                                {item.product.brand}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                removeItem(item.product.id)
                                            }
                                            className="text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-300 hover:scale-110"
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center bg-gradient-to-r from-zinc-100 to-zinc-50 rounded-full p-1 shadow-inner">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full h-8 w-8 hover:bg-white hover:shadow-md transition-all duration-300"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.product.id,
                                                        Math.max(
                                                            1,
                                                            item.quantity - 1
                                                        )
                                                    )
                                                }
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="w-12 text-center font-bold text-sm">
                                                {item.quantity}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full h-8 w-8 hover:bg-white hover:shadow-md transition-all duration-300"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.product.id,
                                                        Math.min(
                                                            item.product.stock,
                                                            item.quantity + 1
                                                        )
                                                    )
                                                }
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Price */}
                                        <div className="text-right">
                                            <p className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                $
                                                {(
                                                    (item.product.price || 0) *
                                                    item.quantity
                                                ).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                ${item.product.price || 0} each
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-blue-100 sticky top-24">
                        <h2 className="text-2xl font-black mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Order Summary
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-zinc-700">
                                <span className="font-semibold">Subtotal</span>
                                <span className="font-bold">
                                    ${totalPrice.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-zinc-700">
                                <span className="font-semibold">Tax (10%)</span>
                                <span className="font-bold">
                                    ${tax.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-zinc-700">
                                <span className="font-semibold">Shipping</span>
                                <span
                                    className={cn(
                                        "font-bold",
                                        shipping === 0 && "text-green-600"
                                    )}
                                >
                                    {shipping === 0 ? "FREE" : `$${shipping}`}
                                </span>
                            </div>
                            {totalPrice < 100 && (
                                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                                    Add ${(100 - totalPrice).toFixed(2)} more
                                    for free shipping!
                                </p>
                            )}
                            <div className="h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />
                            <div className="flex justify-between text-xl font-black">
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Total
                                </span>
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    ${finalTotal.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full rounded-2xl h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 mb-3"
                        >
                            Proceed to Checkout
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => router.push("/")}
                            className="w-full rounded-2xl h-12 font-semibold border-2 hover:bg-white transition-all duration-300"
                        >
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
