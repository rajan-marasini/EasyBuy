"use client";

import Categories from "@/components/home/Categories";
import Hero from "@/components/home/Hero";
import ProductCard from "@/components/home/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";
import { useSearchStore } from "@/lib/search-store";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

export default function HomeContainer() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const { searchQuery, setSearchQuery } = useSearchStore();
    const { ref, inView } = useInView();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error,
    } = useProducts(selectedCategory, searchQuery);

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    return (
        <div className="pb-20">
            <Hero />
            <Categories
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />

            <div className="container mx-auto px-4 mt-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-black border-l-8 border-blue-600 pl-4 uppercase tracking-tighter">
                            {searchQuery
                                ? `Search Results`
                                : "Featured Products"}
                        </h2>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                            >
                                <X className="h-3 w-3" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {status === "pending" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="aspect-square w-full rounded-2xl" />
                                <Skeleton className="h-4 w-2/3 mx-auto" />
                                <Skeleton className="h-6 w-1/2 mx-auto" />
                            </div>
                        ))}
                    </div>
                ) : status === "error" ? (
                    <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
                        <p className="text-red-600 font-bold text-xl">
                            Error loading products. Please try again later.
                        </p>
                        <p className="text-red-400 mt-2">
                            {(error as any)?.message}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {data?.pages.map((page) =>
                                page.data.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))
                            )}
                        </div>

                        {/* Loading Trigger */}
                        <div ref={ref} className="mt-12 flex justify-center">
                            {isFetchingNextPage ? (
                                <div className="flex gap-2">
                                    <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce" />
                                    <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            ) : hasNextPage ? (
                                <p className="text-muted-foreground text-sm font-medium">
                                    Scroll down for more
                                </p>
                            ) : (
                                <div className="py-10 text-center w-full">
                                    <div className="h-px bg-zinc-100 w-full mb-8" />
                                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">
                                        You've reached the end of the collection
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
