"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useUserOrders } from "@/hooks/useUserOrders";
import { useAuthStore } from "@/lib/auth-store";
import { OrderListItem } from "@/lib/types";
import {
  Calendar,
  ChevronDown,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserOrdersPage() {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();
  const [page, setPage] = useState(1);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const {
    data: ordersData,
    isLoading,
    isError,
  } = useUserOrders(user?.id || "", page);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (hasHydrated && !user) {
      router.push("/login");
    }
  }, [user, hasHydrated, router]);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "paid":
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "processing":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "pending":
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "processing":
      case "pending":
        return <ShoppingBag className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (!hasHydrated || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-blue-100 animate-pulse"></div>
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 absolute top-0 left-0" />
          </div>
          <p className="text-zinc-500 font-medium animate-pulse text-lg">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 bg-red-50/50 rounded-3xl border border-red-100 p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-red-600" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-zinc-900">
              Failed to load orders
            </h3>
            <p className="text-zinc-500 mt-2 max-w-md">
              We couldn&apos;t fetch your orders. Please try again later.
            </p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="rounded-xl border-zinc-200 hover:bg-zinc-50"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { orders = [], pagination } = ordersData?.data || {
    orders: [],
    pagination: { page: 1, total_pages: 1 },
  };

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 bg-zinc-50/50 rounded-3xl border border-zinc-100 p-8">
          <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-zinc-400" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-zinc-900">No orders yet</h3>
            <p className="text-zinc-500 mt-2 max-w-md">
              You haven&apos;t placed any orders yet. Start shopping to see your
              orders here!
            </p>
          </div>
          <Button
            onClick={() => router.push("/")}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">
            My Orders
          </h1>
          <p className="text-zinc-500 text-lg">
            Track and manage your order history
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order: OrderListItem) => (
            <Card
              key={order.id}
              className="border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <CardHeader className="bg-linear-to-r from-zinc-50 to-white border-b border-zinc-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <CardTitle className="text-lg font-bold text-zinc-900">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className={`${getStatusStyle(
                          order.order_status,
                        )} font-bold text-xs px-3 py-1 rounded-full border flex items-center gap-1.5`}
                      >
                        {getStatusIcon(order.order_status)}
                        {order.order_status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </div>
                      <div className="hidden sm:block w-1 h-1 bg-zinc-300 rounded-full"></div>
                      <div className="font-bold text-zinc-900">
                        Rs.{order.total_amount.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Badge
                      variant="outline"
                      className={`${getStatusStyle(
                        order.payment_status,
                      )} font-semibold text-xs px-3 py-1.5 rounded-lg border`}
                    >
                      <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                      {order.payment_status}
                    </Badge>
                    {order.delivery_status && (
                      <Badge
                        variant="outline"
                        className={`${getStatusStyle(
                          order.delivery_status,
                        )} font-semibold text-xs px-3 py-1.5 rounded-lg border`}
                      >
                        <Truck className="w-3.5 h-3.5 mr-1.5" />
                        {order.delivery_status}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Shipping Address */}
                <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <MapPin className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Shipping Address
                    </p>
                    <p className="text-sm text-zinc-700 font-medium">
                      {order.shipping_address}
                    </p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <CreditCard className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Payment Method
                    </p>
                    <p className="text-sm text-zinc-700 font-medium capitalize">
                      {order.payment_method}
                    </p>
                  </div>
                </div>

                {/* Order Items - Collapsible */}
                <Collapsible
                  open={openOrderId === order.id}
                  onOpenChange={(open) =>
                    setOpenOrderId(open ? order.id : null)
                  }
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between hover:bg-zinc-50 rounded-xl p-4 h-auto"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-zinc-400" />
                        <span className="font-bold text-zinc-900">
                          Order Items ({order.items.length})
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-zinc-400 transition-transform duration-200 ${
                          openOrderId === order.id ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="space-y-2 p-4 bg-white rounded-xl border border-zinc-100">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-zinc-900">
                              {item.product_name}
                            </p>
                            <p className="text-sm text-zinc-500">
                              Quantity: {item.quantity} × Rs.
                              {item.price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-bold text-zinc-900">
                            Rs.{(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-3 border-t-2 border-zinc-200">
                        <p className="font-bold text-zinc-900 text-lg">Total</p>
                        <p className="font-black text-zinc-900 text-xl">
                          Rs.{order.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex justify-center pt-4">
            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl border border-zinc-200 shadow-lg">
              <Pagination>
                <PaginationContent className="gap-2">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={`h-11 px-6 rounded-xl hover:bg-zinc-50 hover:text-blue-600 font-bold transition-all duration-200 ${
                        page === 1
                          ? "pointer-events-none opacity-40"
                          : "border border-zinc-200"
                      }`}
                    />
                  </PaginationItem>
                  <div className="flex items-center px-4 text-sm font-medium text-zinc-600">
                    Page {page} of {pagination.total_pages}
                  </div>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < pagination.total_pages) setPage(page + 1);
                      }}
                      className={`h-11 px-6 rounded-xl hover:bg-zinc-50 hover:text-blue-600 font-bold transition-all duration-200 ${
                        page === pagination.total_pages
                          ? "pointer-events-none opacity-40"
                          : "border border-zinc-200"
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
