"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useAdminOrders";
import { OrderListItem } from "@/lib/types";
import {
  Eye,
  FileText,
  Loader2,
  MoreHorizontal,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ManageOrdersPage() {
  const [page, setPage] = useState(1);
  const { data: ordersData, isLoading, isError } = useAdminOrders(page);
  const updateStatus = useUpdateOrderStatus();

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "paid":
      case "completed":
        return "bg-emerald-100 text-emerald-700 font-bold";
      case "shipped":
        return "bg-blue-100 text-blue-700 font-bold";
      case "processing":
        return "bg-orange-100 text-orange-700 font-bold";
      case "pending":
        return "bg-zinc-100 text-zinc-700 font-bold";
      case "cancelled":
        return "bg-red-100 text-red-700 font-bold";
      default:
        return "bg-zinc-100 text-zinc-700 font-bold";
    }
  };

  const handleUpdateStatus = (
    id: string,
    status: string,
    type: "order" | "delivery",
  ) => {
    updateStatus.mutate(
      { id, status, type },
      {
        onSuccess: () => {
          toast.success(
            `${type === "order" ? "Order" : "Delivery"} status updated`,
          );
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Update failed");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-blue-100 animate-pulse"></div>
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 absolute top-0 left-0" />
        </div>
        <p className="text-zinc-500 font-medium animate-pulse text-lg">
          Loading orders...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 bg-red-50/50 rounded-3xl border border-red-100">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 text-red-600" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-zinc-900">
            Failed to load orders
          </h3>
          <p className="text-zinc-500 mt-1 max-w-xs">
            We couldn&apos;t reach the server to fetch your orders.
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

  const { orders = [], pagination } = ordersData?.data || {
    orders: [],
    pagination: { page: 1, total_pages: 1, limit: 10, total: 0 },
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-zinc-900 to-blue-600 bg-clip-text text-transparent">
            Order Management
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">
            Track and fulfill customer orders with ease.
          </p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="hover:bg-transparent border-zinc-100">
              <TableHead className="w-[200px] py-6 px-8 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Order ID
              </TableHead>
              <TableHead className="py-6 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Customer
              </TableHead>
              <TableHead className="py-6 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Date
              </TableHead>
              <TableHead className="py-6 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Total
              </TableHead>
              <TableHead className="py-6 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Order Status
              </TableHead>
              <TableHead className="py-6 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Payment
              </TableHead>
              <TableHead className="text-right py-6 pr-8 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: OrderListItem) => (
              <TableRow
                key={order.id}
                className="group hover:bg-zinc-50/80 transition-all duration-300 border-zinc-100"
              >
                <TableCell className="py-4 px-8 font-bold text-zinc-900">
                  #{order.id.slice(0, 8)}
                </TableCell>
                <TableCell className="py-4">
                  <div className="space-y-0.5">
                    <div className="font-bold text-zinc-900">
                      {order.user.name}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {order.shipping_address}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-zinc-500 font-medium whitespace-nowrap">
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="py-4 font-black text-zinc-900 text-base whitespace-nowrap">
                  Rs.{order.total_amount.toFixed(2)}
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="secondary"
                    className={`${getStatusStyle(
                      order.order_status,
                    )} hover:${getStatusStyle(
                      order.order_status,
                    )} border-none px-3 py-1.5 rounded-full text-[10px] shadow-sm`}
                  >
                    {order.order_status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <div className="space-y-1">
                    <Badge
                      variant="secondary"
                      className={`${getStatusStyle(
                        order.payment_status,
                      )} border-none px-2 py-0.5 rounded-full text-[9px]`}
                    >
                      {order.payment_status}
                    </Badge>
                    <div className="text-[10px] text-zinc-400 font-bold ml-1">
                      {order.payment_method}
                    </div>
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
                      <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-blue-50 focus:text-blue-700 font-semibold">
                        <Eye className="w-4 h-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-zinc-50 font-semibold">
                        <FileText className="w-4 h-4" />
                        Invoice
                      </DropdownMenuItem>
                      <div className="h-px bg-zinc-100 my-2 mx-1" />
                      <div className="px-3 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Update Status
                      </div>
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateStatus(order.id, "PROCESSING", "order")
                        }
                        className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-orange-50 focus:text-orange-700 font-semibold"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Processing
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateStatus(order.id, "SHIPPED", "order")
                        }
                        className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-blue-50 focus:text-blue-700 font-semibold"
                      >
                        <Truck className="w-4 h-4" />
                        Mark Shipped
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination.total_pages > 1 && (
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
                    className={`h-11 px-6 rounded-xl hover:bg-white hover:text-blue-600 font-bold transition-all duration-200 ${
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
                      if (page < pagination.total_pages) setPage(page + 1);
                    }}
                    className={`h-11 px-6 rounded-xl hover:bg-white hover:text-blue-600 font-bold transition-all duration-200 ${
                      page === pagination.total_pages
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
    </div>
  );
}
