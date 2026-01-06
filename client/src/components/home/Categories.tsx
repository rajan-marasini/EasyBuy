"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import {
    Camera,
    Headphones,
    Laptop,
    Monitor,
    Music,
    Smartphone,
    Speaker,
    Watch,
} from "lucide-react";

const iconMap: Record<string, any> = {
    Phones: Smartphone,
    Laptops: Laptop,
    Watches: Watch,
    Audio: Headphones,
    Music: Music,
    Cameras: Camera,
    Desktop: Monitor,
    Accessories: Speaker,
};

interface CategoriesProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export default function Categories({
    selectedCategory,
    onSelectCategory,
}: CategoriesProps) {
    const { data: categories, isLoading } = useCategories();

    if (isLoading) {
        return (
            <div className="bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 border-b overflow-x-auto no-scrollbar">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-8 min-w-max">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center gap-2"
                            >
                                <Skeleton className="h-12 w-12 rounded-2xl" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const allCategories = [{ id: "All", name: "All" }, ...(categories || [])];

    return (
        <div className="bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 border-b overflow-x-auto no-scrollbar backdrop-blur-sm">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center gap-6 min-w-max">
                    {allCategories.map((cat) => {
                        const Icon = iconMap[cat.name] || null;
                        const catId = cat.id || "All";
                        const isActive = selectedCategory === catId;

                        return (
                            <button
                                key={cat.id || cat.name}
                                onClick={() =>
                                    onSelectCategory(cat.id || "All")
                                }
                                className={cn(
                                    "flex flex-col items-center gap-2.5 transition-all duration-300 group relative",
                                    isActive ? "scale-110" : "hover:scale-105"
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-3.5 rounded-2xl transition-all duration-300 shadow-md relative overflow-hidden",
                                        isActive
                                            ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/50"
                                            : "bg-white/80 backdrop-blur-sm group-hover:bg-gradient-to-br group-hover:from-emerald-50 group-hover:to-teal-50 group-hover:shadow-lg"
                                    )}
                                >
                                    {/* Glassmorphism overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {Icon ? (
                                        <Icon
                                            className={cn(
                                                "h-6 w-6 transition-all duration-300 relative z-10",
                                                isActive
                                                    ? "text-white"
                                                    : "text-zinc-600 group-hover:text-emerald-600"
                                            )}
                                        />
                                    ) : (
                                        <div
                                            className={cn(
                                                "h-6 w-6 flex items-center justify-center font-black text-xs relative z-10 transition-all duration-300",
                                                isActive
                                                    ? "text-white"
                                                    : "text-zinc-600 group-hover:text-emerald-600"
                                            )}
                                        >
                                            ALL
                                        </div>
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-xs font-bold uppercase tracking-wider transition-all duration-300",
                                        isActive
                                            ? "text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text"
                                            : "text-zinc-600 group-hover:text-zinc-900"
                                    )}
                                >
                                    {cat.name}
                                </span>
                                {isActive && (
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-1 w-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full animate-in slide-in-from-bottom-2 shadow-lg shadow-emerald-500/50" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
