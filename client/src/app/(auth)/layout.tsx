"use client";

import { useAuthStore } from "@/lib/auth-store";
import { Gift, ShoppingBag, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user } = useAuthStore();

    if (user) {
        return router.push("/");
    }

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Branding & Description */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-emerald-500 via-teal-600 to-cyan-600">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <div className="mb-8">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 group"
                        >
                            <ShoppingBag className="w-10 h-10 group-hover:scale-110 transition-transform" />
                            <span className="text-4xl font-black tracking-tight">
                                EasyBuy
                            </span>
                        </Link>
                    </div>

                    <h1 className="text-5xl font-black leading-tight mb-6">
                        Start Your
                        <br />
                        Shopping Journey
                        <br />
                        Today
                    </h1>

                    <p className="text-xl text-white/90 mb-12 leading-relaxed">
                        Join thousands of happy shoppers and discover amazing
                        deals, exclusive offers, and a world of endless
                        possibilities.
                    </p>

                    {/* Features */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 group">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 transition-all">
                                <Gift className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">
                                    Exclusive Welcome Offers
                                </h3>
                                <p className="text-white/80">
                                    Get special discounts and deals when you
                                    create your account
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 transition-all">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">
                                    Track Your Orders
                                </h3>
                                <p className="text-white/80">
                                    Stay updated with real-time tracking and
                                    delivery notifications
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 transition-all">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">
                                    Curated Collections
                                </h3>
                                <p className="text-white/80">
                                    Discover handpicked products tailored to
                                    your style and preferences
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {children}
        </div>
    );
}
