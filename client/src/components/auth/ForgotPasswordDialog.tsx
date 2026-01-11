"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const forgotPasswordSchema = z.object({
    email: z.email("Invalid email address"),
});

const resetPasswordSchema = z
    .object({
        otp: z.string().length(6, "OTP must be 6 digits"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export function ForgotPasswordDialog() {
    const [step, setStep] = useState<"request" | "reset">("request");
    const [email, setEmail] = useState("");
    const [open, setOpen] = useState(false);
    const { forgotPassword, resetPassword } = useAuth();

    const requestForm = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const resetForm = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            otp: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onRequestSubmit = async (
        values: z.infer<typeof forgotPasswordSchema>
    ) => {
        try {
            await forgotPassword.mutateAsync(values.email);
            setEmail(values.email);
            setStep("reset");
        } catch {
            // Error is handled in useAuth mutation
        }
    };

    const onResetSubmit = async (
        values: z.infer<typeof resetPasswordSchema>
    ) => {
        try {
            await resetPassword.mutateAsync({
                email,
                otp: values.otp,
                password: values.password,
            });
            setOpen(false);
            setStep("request");
            requestForm.reset();
            resetForm.reset();
        } catch {
            // Error is handled in useAuth mutation
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                    Forgot Password?
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-2 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-zinc-900 dark:text-white">
                        {step === "request"
                            ? "Forgot Password"
                            : "Reset Password"}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                        {step === "request"
                            ? "Enter your email address and we'll send you an OTP to reset your password."
                            : `We've sent a 6-digit OTP to ${email}. Please enter it below along with your new password.`}
                    </DialogDescription>
                </DialogHeader>

                {step === "request" ? (
                    <Form {...requestForm}>
                        <form
                            onSubmit={requestForm.handleSubmit(onRequestSubmit)}
                            className="space-y-4 py-4"
                        >
                            <FormField
                                control={requestForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-zinc-900 dark:text-white">
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
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl text-base font-bold bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg transition-all"
                                disabled={forgotPassword.isPending}
                            >
                                {forgotPassword.isPending ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Sending OTP...
                                    </span>
                                ) : (
                                    "Send OTP"
                                )}
                            </Button>
                        </form>
                    </Form>
                ) : (
                    <Form {...resetForm}>
                        <form
                            onSubmit={resetForm.handleSubmit(onResetSubmit)}
                            className="space-y-5 py-4"
                        >
                            <FormField
                                control={resetForm.control}
                                name="otp"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-center">
                                        <FormLabel className="font-semibold self-start text-zinc-900 dark:text-white">
                                            Verification Code
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter 6-digit OTP"
                                                maxLength={6}
                                                {...field}
                                                className="h-12 text-center text-xl font-bold tracking-widest rounded-xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-emerald-600 dark:focus:border-emerald-500 transition-colors"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={resetForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-zinc-900 dark:text-white">
                                            New Password
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

                            <FormField
                                control={resetForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-zinc-900 dark:text-white">
                                            Confirm New Password
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

                            <div className="flex flex-col gap-3 pt-2">
                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl text-base font-bold bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg transition-all"
                                    disabled={resetPassword.isPending}
                                >
                                    {resetPassword.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Resetting Password...
                                        </span>
                                    ) : (
                                        "Update Password"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-12 rounded-xl text-zinc-500 font-semibold"
                                    onClick={() => setStep("request")}
                                >
                                    Change Email
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
