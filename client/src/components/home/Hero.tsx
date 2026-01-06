"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
    {
        id: 1,
        title: "Summer Sale",
        description: "Get up to 50% off on electronics",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072",
        gradient: "from-emerald-500 via-teal-600 to-cyan-600",
    },
    {
        id: 2,
        title: "New Arrivals",
        description: "Explore the latest smartphones and gadgets",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=2000",
        gradient: "from-teal-500 via-emerald-600 to-green-600",
    },
    {
        id: 3,
        title: "Premium Sound",
        description: "Best quality headphones for music lovers",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=2070",
        gradient: "from-green-600 via-emerald-600 to-teal-600",
    },
];

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative h-[500px] w-full overflow-hidden">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        index === currentSlide ? "opacity-100" : "opacity-0"
                    } bg-gradient-to-br ${slide.gradient}`}
                >
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>

                    <div className="container mx-auto h-full px-4 flex flex-col md:flex-row items-center justify-between text-white relative z-10">
                        <div className="md:w-1/2 mt-12 md:mt-0 text-center md:text-left">
                            <h1 className="text-5xl md:text-7xl font-black mb-4 animate-in fade-in slide-in-from-left-8 duration-700 leading-tight">
                                {slide.title}
                            </h1>
                            <p className="text-xl md:text-2xl mb-8 text-white/90 animate-in fade-in slide-in-from-left-12 duration-1000">
                                {slide.description}
                            </p>
                            <Button
                                size="lg"
                                className="rounded-xl px-8 h-12 text-lg font-bold bg-white text-zinc-900 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                Shop Now
                            </Button>
                        </div>
                        <div className="md:w-1/2 h-full flex items-center justify-center p-8">
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="max-h-[350px] md:max-h-[400px] object-contain rounded-2xl shadow-2xl animate-in zoom-in duration-1000"
                            />
                        </div>
                    </div>
                </div>
            ))}

            {/* Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-all hover:scale-110"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-all hover:scale-110"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all ${
                            index === currentSlide
                                ? "bg-white w-8"
                                : "bg-white/50 w-2 hover:bg-white/70"
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}
