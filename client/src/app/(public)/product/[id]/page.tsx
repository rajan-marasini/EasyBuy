"use client";

import { ReviewList } from "@/components/reviews/ReviewList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/useProduct";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import {
    Minus,
    Plus,
    RefreshCw,
    ShieldCheck,
    ShoppingCart,
    Star,
    Truck,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductDetailsPage() {
    const router = useRouter();
    const { id } = useParams();
    const { data: product, isLoading, error } = useProduct(id as string);
    const [quantity, setQuantity] = useState(1);
    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = () => {
        if (product) {
            addItem(product, quantity);
            toast.success(`Added ${quantity} ${product.name} to cart!`, {
                description: "View your cart to checkout",
                action: {
                    label: "View Cart",
                    onClick: () => router.push("/cart"),
                },
            });
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <Skeleton className="aspect-square w-full rounded-3xl" />
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-md mx-auto bg-linear-to-br from-red-50 to-pink-50 rounded-3xl p-12 border-2 border-red-100">
                    <h1 className="text-3xl font-black text-red-600 mb-4">
                        Product Not Found
                    </h1>
                    <p className="text-zinc-600 mb-6">
                        The product you&apos;re looking for does&apos;t exist or
                        has been removed.
                    </p>
                    <Button
                        onClick={() => router.push("/")}
                        className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/20"
                    >
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Product Image */}
                <div className="bg-linear-to-br from-zinc-50 to-emerald-50/30 rounded-3xl p-8 flex items-center justify-center aspect-square border-2 border-zinc-100 dark:from-zinc-900 dark:to-emerald-900/30 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {/*  eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={
                            product.images?.[0] ||
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000"
                        }
                        alt={product.name}
                        className="max-h-full w-full object-contain transition-transform duration-700 group-hover:scale-105 relative z-10"
                    />
                </div>

                {/* Product Info */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <Badge
                                variant="secondary"
                                className="bg-linear-to-r from-emerald-500 to-teal-600 text-white border-none px-4 py-1 text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/30"
                            >
                                {product.brand}
                            </Badge>
                            <div
                                className={cn(
                                    "flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full",
                                    product.stock > 0
                                        ? "bg-green-50 text-green-600"
                                        : "bg-red-50 text-red-500"
                                )}
                            >
                                <div
                                    className={cn(
                                        "h-2 w-2 rounded-full animate-pulse",
                                        product.stock > 0
                                            ? "bg-green-600"
                                            : "bg-red-500"
                                    )}
                                />
                                {product.stock > 0
                                    ? "In Stock"
                                    : "Out of Stock"}
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter leading-tight bg-linear-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent dark:from-zinc-100 dark:to-zinc-300">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-2 mb-6">
                            {[...Array(5)].map((_, i) => {
                                const rating = product.average_rating || 0;
                                const isFilled = i < Math.floor(rating);
                                const isHalf =
                                    i === Math.floor(rating) &&
                                    rating % 1 >= 0.5;

                                return (
                                    <Star
                                        key={i}
                                        className={`h-5 w-5 ${
                                            isFilled || isHalf
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "fill-none text-zinc-300 dark:text-zinc-600"
                                        }`}
                                    />
                                );
                            })}
                            <span className="text-sm font-bold text-zinc-500">
                                ({product.average_rating?.toFixed(1) || "0.0"})
                                · {product.total_reviews || 0}{" "}
                                {product.total_reviews === 1
                                    ? "Review"
                                    : "Reviews"}
                            </span>
                        </div>
                        <p className="text-5xl font-black bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
                            Rs.{(product.price || 0).toLocaleString()}
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg">
                            {product.description ||
                                "No description available for this product. High-quality build and industry-leading performance guaranteed."}
                        </p>
                    </div>

                    <div className="h-px bg-linear-to-r from-transparent via-zinc-200 to-transparent" />

                    {/* Controls */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-8">
                            <span className="font-bold uppercase tracking-widest text-xs text-zinc-400">
                                Quantity
                            </span>
                            <div className="flex items-center bg-linear-to-r from-zinc-100 to-zinc-50 rounded-full p-1 dark:from-zinc-800 dark:to-zinc-900 shadow-inner">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full h-8 w-8 hover:bg-white hover:shadow-md transition-all duration-300"
                                    onClick={() =>
                                        setQuantity((q) => Math.max(1, q - 1))
                                    }
                                    disabled={product.stock <= 0}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-12 text-center font-bold">
                                    {quantity}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full h-8 w-8 hover:bg-white hover:shadow-md transition-all duration-300"
                                    onClick={() =>
                                        setQuantity((q) =>
                                            Math.min(product.stock, q + 1)
                                        )
                                    }
                                    disabled={product.stock <= 0}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                size="lg"
                                className="flex-1 rounded-2xl h-14 text-lg font-bold bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105"
                                disabled={product.stock <= 0}
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Add to Cart
                            </Button>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-100 transition-all duration-300 hover:shadow-lg hover:scale-105">
                            <ShieldCheck className="h-8 w-8 text-emerald-600" />
                            <div className="text-xs font-bold leading-tight text-zinc-700">
                                1 YEAR <br /> WARRANTY
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-linear-to-br from-green-50 to-emerald-50 border border-green-100 transition-all duration-300 hover:shadow-lg hover:scale-105">
                            <Truck className="h-8 w-8 text-green-600" />
                            <div className="text-xs font-bold leading-tight text-zinc-700">
                                FREE <br /> SHIPPING
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-linear-to-br from-orange-50 to-amber-50 border border-orange-100 transition-all duration-300 hover:shadow-lg hover:scale-105">
                            <RefreshCw className="h-8 w-8 text-orange-600" />
                            <div className="text-xs font-bold leading-tight text-zinc-700">
                                30 DAYS <br /> RETURN
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Review Section */}
            <div className="mt-20">
                <ReviewList productId={id as string} />
            </div>
        </div>
    );
}
