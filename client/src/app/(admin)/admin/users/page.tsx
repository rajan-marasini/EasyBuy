/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminUsers,
  useDeleteUser,
  useUpdateUser,
} from "@/hooks/useAdminUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { User } from "@/lib/types";
import {
  Ban,
  CircleCheck,
  Loader2,
  Mail,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Smartphone,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ManageUsersPage() {
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    data: usersData,
    isLoading,
    isError,
  } = useAdminUsers(page, 10, debouncedSearch);

  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return {
          label: "Active",
          class: "bg-emerald-100 text-emerald-700 font-bold",
          icon: CircleCheck,
        };
      case "inactive":
        return {
          label: "Inactive",
          class: "bg-zinc-100 text-zinc-700 font-bold",
          icon: Ban,
        };
      default:
        return {
          label: status,
          class: "bg-zinc-100 text-zinc-700 font-bold",
          icon: UserIcon,
        };
    }
  };

  const getRoleBadge = (role: string) => {
    return role.toLowerCase() === "admin"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-blue-100 text-blue-700 border-blue-200";
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    deleteUser.mutate(deleteId, {
      onSuccess: () => {
        toast.success("User deleted successfully");
        setDeleteId(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete user");
      },
    });
  };

  const toggleStatus = (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    updateUser.mutate(
      { id: user.id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(`User marked as ${newStatus}`);
        },
      },
    );
  };

  const toggleRole = (user: User) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    updateUser.mutate(
      { id: user.id, data: { role: newRole } },
      {
        onSuccess: () => {
          toast.success(`User role updated to ${newRole}`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-100 animate-pulse"></div>
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 absolute top-0 left-0" />
        </div>
        <p className="text-zinc-500 font-medium animate-pulse text-lg">
          Loading users...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 bg-red-50/50 rounded-3xl border border-red-100">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <UserIcon className="w-8 h-8 text-red-600" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-zinc-900">Access Denied</h3>
          <p className="text-zinc-500 mt-1 max-w-xs">
            We couldn&apos;t fetch the user list. Please ensure you have admin
            privileges.
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="rounded-xl border-zinc-200"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const users = usersData?.data || [];
  const meta = usersData?.meta || {
    current_page: 1,
    total_pages: 1,
    limit: 10,
    total_items: 0,
  };

  const startIdx = (page - 1) * meta.limit + 1;
  const endIdx = Math.min(page * meta.limit, meta.total_items);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 bg-linear-to-r from-zinc-900 to-zinc-500 bg-clip-text">
            User Management
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">
            Monitor and manage all registered users of EasyBuy.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full md:w-auto max-w-xl">
          <div className="bg-white/50 p-6 rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/20 backdrop-blur-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search by name or email..."
                className="pl-11 pr-10 rounded-2xl bg-white border-zinc-200 h-12 w-full focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {meta.total_items > 0 && (
          <div className="px-6 py-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-emerald-700 font-bold text-sm shadow-sm">
            Showing{" "}
            <span className="text-emerald-900">
              {startIdx}-{endIdx}
            </span>{" "}
            of <span className="text-emerald-900">{meta.total_items}</span>{" "}
            results
          </div>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="hover:bg-transparent border-zinc-100">
              <TableHead className="w-[300px] py-6 px-8 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                User profile
              </TableHead>
              <TableHead className="py-6 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Contact Info
              </TableHead>
              <TableHead className="py-6 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Permissions
              </TableHead>
              <TableHead className="py-6 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Verified
              </TableHead>
              <TableHead className="py-6 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Status
              </TableHead>
              <TableHead className="py-6 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Joined Date
              </TableHead>
              <TableHead className="text-right py-6 pr-8 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const statusInfo = getStatusBadge(user.status);
              const joinedDate = new Date(user.created_at).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                },
              );

              return (
                <TableRow
                  key={user.id}
                  className="group hover:bg-zinc-50/80 transition-all duration-300 border-zinc-100"
                >
                  <TableCell className="py-4 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg border border-emerald-100 shadow-sm group-hover:scale-105 transition-transform">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-zinc-900 line-clamp-1 flex items-center gap-2">
                          {user.name}
                          {user.is_verified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 font-medium">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm text-zinc-600 font-medium">
                        <Mail className="w-4 h-4 text-zinc-400" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <Smartphone className="w-3.5 h-3.5" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className={`${getRoleBadge(user.role)} border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="secondary"
                      className={`${
                        user.is_verified
                          ? "bg-emerald-100 text-emerald-700 font-bold"
                          : "bg-zinc-100 text-zinc-500 font-bold"
                      } border-none px-4 py-1.5 rounded-full text-[10px] shadow-sm flex items-center gap-1.5 w-fit`}
                    >
                      {user.is_verified ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Verified
                        </>
                      ) : (
                        "Not Verified"
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="secondary"
                      className={`${statusInfo.class} hover:${statusInfo.class} border-none px-4 py-1.5 rounded-full text-[10px] shadow-sm flex items-center gap-1.5 w-fit`}
                    >
                      <statusInfo.icon className="w-3.5 h-3.5" />
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-zinc-600 font-medium text-sm">
                      {joinedDate}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4 pr-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-10 w-10 p-0 hover:bg-zinc-100 rounded-2xl transition-all duration-200"
                        >
                          <MoreHorizontal className="h-5 w-5 text-zinc-400 group-hover:text-zinc-900" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-[1.5rem] p-2 border-zinc-100 shadow-2xl min-w-[180px] glassmorphism"
                      >
                        <DropdownMenuItem
                          onClick={() => toggleStatus(user)}
                          className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-emerald-50 focus:text-emerald-700 font-semibold"
                        >
                          {user.status === "active" ? (
                            <>
                              <Ban className="w-4 h-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CircleCheck className="w-4 h-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleRole(user)}
                          className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-amber-50 focus:text-amber-700 font-semibold"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Change to {user.role === "admin" ? "User" : "Admin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(user.id)}
                          className="gap-3 p-3 rounded-xl cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 font-semibold"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {meta.total_pages > 1 && (
        <div className="flex justify-end pt-4">
          <div className="bg-white/50 p-1.5 rounded-2xl border border-zinc-100/50 shadow-lg shadow-zinc-200/20">
            <Pagination>
              <PaginationContent className="gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    className={`h-11 px-6 rounded-xl hover:bg-white hover:text-emerald-600 font-bold transition-all duration-200 ${
                      page === 1
                        ? "pointer-events-none opacity-40"
                        : "shadow-sm border border-zinc-100"
                    }`}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < meta.total_pages) setPage(page + 1);
                    }}
                    className={`h-11 px-6 rounded-xl hover:bg-white hover:text-emerald-600 font-bold transition-all duration-200 ${
                      page === meta.total_pages
                        ? "pointer-events-none opacity-40"
                        : "shadow-sm border border-zinc-100"
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8 max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-zinc-900 text-center">
              Delete User Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-center text-lg leading-relaxed">
              Are you absolutely sure? This will permanently remove this user
              and all their data from the platform. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="w-full sm:flex-1 h-12 rounded-2xl border-zinc-200 font-bold text-zinc-600 hover:bg-zinc-50 transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full sm:flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-200 transition-all"
            >
              {deleteUser.isPending ? "Removing..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
