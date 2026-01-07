"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";

const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
    const { login } = useAuth();
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (values: z.infer<typeof loginSchema>) => {
        login.mutate(values);
    };

    return (
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-zinc-950">
            <div className="w-full max-w-md">
                {/* Mobile Logo */}
                <div className="lg:hidden mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <ShoppingBag className="w-8 h-8 text-emerald-600" />
                        <span className="text-3xl font-black text-emerald-600">
                            EasyBuy
                        </span>
                    </Link>
                </div>

                <div className="mb-8">
                    <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">
                        Welcome back
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Sign in your account to continue
                    </p>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-5"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-900 dark:text-white font-semibold">
                                        Email Address
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="you@example.com"
                                            {...field}
                                            className="h-12 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-emerald-600 dark:focus:border-emerald-500 transition-colors"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-900 dark:text-white font-semibold">
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            {...field}
                                            className="h-12 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-emerald-600 dark:focus:border-emerald-500 transition-colors"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end">
                            <Link
                                href="/forgot-password"
                                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl text-base font-bold bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all"
                            disabled={login.isPending}
                        >
                            {login.isPending ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Logging in...
                                </span>
                            ) : (
                                "Login"
                            )}
                        </Button>
                    </form>
                </Form>

                <div className="mt-8 text-center space-y-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                        >
                            Create an account
                        </Link>
                    </p>

                    <Link
                        href="/"
                        className="inline-block text-sm font-semibold text-zinc-500 hover:text-emerald-600 dark:text-zinc-500 dark:hover:text-emerald-500 transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
