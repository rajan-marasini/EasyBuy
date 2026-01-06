"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCartStore } from "@/lib/cart-store";
import { Product } from "@/lib/types";
import { ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);

    return (
        <Card className="group overflow-hidden rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-200 dark:hover:border-emerald-900 hover:-translate-y-1">
            <Link href={`/product/${product.id}`}>
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900">
                    <img
                        src={
                            product.images?.[0] ||
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000"
                        }
                        alt={product.name}
                        className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.stock <= 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <span className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-bold text-white uppercase shadow-lg">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>
            </Link>
            <CardContent className="p-4 text-center">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {product.brand}
                </p>
                <h3 className="mb-2 line-clamp-1 text-lg font-bold text-zinc-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-teal-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {product.name}
                </h3>
                <div className="mb-3 flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                    ))}
                    <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                        (4.5)
                    </span>
                </div>
                <p className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Rs.{product.price.toLocaleString()}
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    disabled={product.stock <= 0}
                    onClick={() => {
                        addItem(product);
                        toast.success(`Added ${product.name} to cart!`);
                    }}
                >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                </Button>
            </CardFooter>
        </Card>
    );
}
