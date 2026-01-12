"use client";

import EditProfileDialog from "@/components/profile/EditProfileDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/useProfile";
import {
    Calendar,
    CheckCircle2,
    Clock,
    Edit,
    Mail,
    Phone,
    Shield,
    User,
} from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
    const { profile, isLoading } = useProfile();
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <Skeleton className="h-12 w-64 mb-8" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="text-center">
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        Failed to load profile
                    </p>
                </div>
            </div>
        );
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/20">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 backdrop-blur-xl border border-emerald-200/50 dark:border-emerald-800/50 shadow-xl">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white dark:ring-zinc-900">
                                {getInitials(profile.name)}
                            </div>
                            {profile.is_verified && (
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 ring-4 ring-white dark:ring-zinc-900">
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                                    {profile.name}
                                </h1>
                                {profile.is_verified && (
                                    <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                        Verified
                                    </Badge>
                                )}
                                <Badge
                                    variant="outline"
                                    className="capitalize border-emerald-500 text-emerald-700 dark:text-emerald-400"
                                >
                                    {profile.role}
                                </Badge>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {profile.email}
                            </p>
                        </div>

                        {/* Edit Button */}
                        <Button
                            onClick={() => setEditDialogOpen(true)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                    </div>
                </div>

                {/* Information Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Personal Information */}
                    <Card className="border-emerald-200/50 dark:border-emerald-800/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                <User className="w-5 h-5" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Full Name
                                </p>
                                <p className="font-semibold text-zinc-900 dark:text-white">
                                    {profile.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    Phone Number
                                </p>
                                <p className="font-semibold text-zinc-900 dark:text-white">
                                    {profile.phone || "Not provided"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Status */}
                    <Card className="border-emerald-200/50 dark:border-emerald-800/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                <Shield className="w-5 h-5" />
                                Account Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Status
                                </p>
                                <Badge
                                    variant="outline"
                                    className="capitalize border-emerald-500 text-emerald-700 dark:text-emerald-400"
                                >
                                    {profile.status}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Email Verification
                                </p>
                                <div className="flex items-center gap-2">
                                    {profile.is_verified ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                                Verified
                                            </span>
                                        </>
                                    ) : (
                                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                                            Not Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                            {profile.email_verified_at && (
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        Verified At
                                    </p>
                                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        {formatDate(profile.email_verified_at)}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Account Activity */}
                    <Card className="border-emerald-200/50 dark:border-emerald-800/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                <Clock className="w-5 h-5" />
                                Account Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Member Since
                                </p>
                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    {formatDate(profile.created_at)}
                                </p>
                            </div>
                            {profile.last_login_at && (
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        Last Login
                                    </p>
                                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        {formatDate(profile.last_login_at)}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Last Updated
                                </p>
                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    {formatDate(profile.updated_at)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Details */}
                    <Card className="border-emerald-200/50 dark:border-emerald-800/50 shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                <Shield className="w-5 h-5" />
                                Account Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    User ID
                                </p>
                                <p className="font-mono text-xs text-zinc-700 dark:text-zinc-300 break-all">
                                    {profile.id}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Email Address
                                </p>
                                <p className="font-semibold text-zinc-900 dark:text-white">
                                    {profile.email}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Account Role
                                </p>
                                <Badge
                                    variant="outline"
                                    className="capitalize border-emerald-500 text-emerald-700 dark:text-emerald-400"
                                >
                                    {profile.role}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Profile Dialog */}
            {profile && (
                <EditProfileDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    user={profile}
                />
            )}
        </div>
    );
}
