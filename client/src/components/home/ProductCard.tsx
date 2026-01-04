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
    return (
        <Card className="group overflow-hidden rounded-2xl border-none bg-zinc-50/50 transition-all hover:shadow-xl hover:shadow-blue-500/10 dark:bg-zinc-900/50">
            <Link href={`/product/${product.id}`}>
                <div className="relative aspect-square overflow-hidden bg-white dark:bg-zinc-800">
                    <img
                        src={
                            product.images?.[0] ||
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000"
                        }
                        alt={product.name}
                        className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.stock <= 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white uppercase">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>
            </Link>
            <CardContent className="p-4 text-center">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {product.brand}
                </p>
                <h3 className="mb-2 line-clamp-1 text-lg font-bold group-hover:text-blue-600 transition-colors">
                    {product.name}
                </h3>
                <div className="mb-3 flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                        (4.5)
                    </span>
                </div>
                <p className="text-xl font-black text-blue-600">
                    ${product.price.toLocaleString()}
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button
                    className="w-full rounded-xl bg-zinc-900 font-bold transition-all hover:bg-blue-600 dark:bg-zinc-800 dark:hover:bg-blue-600"
                    disabled={product.stock <= 0}
                    onClick={() => {
                        useCartStore.getState().addItem(product);
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
