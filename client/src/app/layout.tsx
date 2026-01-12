import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "EasyBuy - Modern Ecommerce",
    description: "Shop the latest electronics and gadgets",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
                suppressHydrationWarning
            >
                <QueryProvider>
                    <AuthProvider>
                        {children}
                        <Toaster position="top-center" richColors />
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
