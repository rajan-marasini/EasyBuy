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
        bgColor: "bg-blue-600",
    },
    {
        id: 2,
        title: "New Arrivals",
        description: "Explore the latest smartphones and gadgets",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=2000",
        bgColor: "bg-indigo-600",
    },
    {
        id: 3,
        title: "Premium Sound",
        description: "Best quality headphones for music lovers",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=2070",
        bgColor: "bg-blue-800",
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
        <section className="relative h-[400px] w-full overflow-hidden">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        index === currentSlide ? "opacity-100" : "opacity-0"
                    } ${slide.bgColor}`}
                >
                    <div className="container mx-auto h-full px-4 flex flex-col md:flex-row items-center justify-between text-white">
                        <div className="md:w-1/2 mt-12 md:mt-0 text-center md:text-left">
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-in fade-in slide-in-from-left-8 duration-700">
                                {slide.title}
                            </h1>
                            <p className="text-xl md:text-2xl mb-8 opacity-90 animate-in fade-in slide-in-from-left-12 duration-1000">
                                {slide.description}
                            </p>
                            <Button
                                size="lg"
                                variant="secondary"
                                className="rounded-full px-8 h-12 text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
                            >
                                Shop Now
                            </Button>
                        </div>
                        <div className="md:w-1/2 h-full flex items-center justify-center p-8">
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="max-h-[300px] md:max-h-[350px] object-contain rounded-2xl shadow-2xl animate-in zoom-in duration-1000"
                            />
                        </div>
                    </div>
                </div>
            ))}

            {/* Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
            >
                <ChevronLeft className="h-8 w-8" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
            >
                <ChevronRight className="h-8 w-8" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 w-2 rounded-full transition-all ${
                            index === currentSlide
                                ? "bg-white w-8"
                                : "bg-white/50"
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}
