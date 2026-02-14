"use client";

import { CheckoutDialog } from "@/components/cart/CheckoutDialog";
import { Button } from "@/components/ui/button";
import { useCreateOrder } from "@/hooks/useOrder";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { EsewaForm } from "@/components/cart/EsewaForm";
import { KhaltiForm } from "@/components/cart/KhaltiForm";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const generateTransactionId = () => `ORDER-${Date.now()}`;

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } =
    useCartStore();
  const user = useAuthStore((state) => state.user);

  // React Query Mutation
  const { mutate: createOrder, isPending: isLoading } = useCreateOrder();

  const [isHydrated, setIsHydrated] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [showEsewaForm, setShowEsewaForm] = useState(false);
  const [showKhaltiForm, setShowKhaltiForm] = useState(false);
  const [esewaData, setEsewaData] = useState<{
    amount: string;
    tax_amount: string;
    total_amount: string;
    product_delivery_charge: string;
    transaction_uuid: string;
  } | null>(null);
  const [khaltiData, setKhaltiData] = useState<{
    amount: string;
    purchase_order_id: string;
  } | null>(null);
  useEffect(() => {
    (() => {
      setIsHydrated(true);
    })();
  }, []);

  const totalPrice = getTotalPrice();
  const tax = totalPrice * 0.1; // 10% tax
  const shipping = totalPrice > 100 ? 0 : 10; // Free shipping over $100
  const finalTotal = totalPrice + tax + shipping;

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login to place an order");
      router.push("/login");
      return;
    }
    setIsCheckoutDialogOpen(true);
  };

  const handleConfirmCheckout = (orderData: {
    paymentMethod: string;
    shippingAddress: string;
  }) => {
    const fullOrderData = {
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      ...orderData,
    };

    if (orderData.paymentMethod === "ESEWA") {
      const transaction_uuid = generateTransactionId();
      // Store pending order
      localStorage.setItem("pending_order", JSON.stringify(fullOrderData));

      setEsewaData({
        amount: totalPrice.toFixed(2),
        tax_amount: tax.toFixed(2),
        total_amount: finalTotal.toFixed(2),
        product_delivery_charge: shipping.toFixed(2),
        transaction_uuid: transaction_uuid,
      });
      setShowEsewaForm(true);
      setIsCheckoutDialogOpen(false);
    } else if (orderData.paymentMethod === "KHALTI") {
      const transaction_uuid = generateTransactionId();
      localStorage.setItem("pending_order", JSON.stringify(fullOrderData));

      setKhaltiData({
        amount: finalTotal.toFixed(2),
        purchase_order_id: transaction_uuid,
      });
      setShowKhaltiForm(true);
      setIsCheckoutDialogOpen(false);
    } else {
      createOrder(fullOrderData, {
        onSuccess: () => {
          toast.success("Order placed successfully!");
          clearCart();
          setIsCheckoutDialogOpen(false);
        },
        onError: (error: AxiosError<{ message: string }>) => {
          toast.error(
            error?.response?.data?.message || "Failed to place order",
          );
        },
      });
    }
  };

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-pulse bg-zinc-100 rounded-3xl h-[400px]" />
        </div>
      </div>
    );
  }

  if (showEsewaForm && esewaData) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowEsewaForm(false)}
            className="mb-4 hover:bg-emerald-50 text-emerald-600 font-bold"
          >
            &larr; Back to Cart
          </Button>
          <EsewaForm
            amount={esewaData.amount}
            tax_amount={esewaData.tax_amount}
            total_amount={esewaData.total_amount}
            product_delivery_charge={esewaData.product_delivery_charge}
            transaction_uuid={esewaData.transaction_uuid}
          />
        </div>
      </div>
    );
  }

  if (showKhaltiForm && khaltiData) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowKhaltiForm(false)}
            className="mb-4 hover:bg-emerald-50 text-emerald-600 font-bold"
          >
            &larr; Back to Cart
          </Button>
          <KhaltiForm
            amount={khaltiData.amount}
            purchase_order_id={khaltiData.purchase_order_id}
          />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-linear-to-br from-emerald-50 via-teal-50 to-emerald-50/30 rounded-3xl p-16 border-2 border-emerald-100">
            <div className="mb-8 flex justify-center">
              <div className="h-32 w-32 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                <ShoppingBag className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-black mb-4 bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Your Cart is Empty
            </h1>
            <p className="text-zinc-600 mb-8 text-lg">
              Looks like you haven&apos;t added anything to your cart yet. Start
              shopping to fill it up!
            </p>
            <Button
              size="lg"
              onClick={() => router.push("/")}
              className="rounded-2xl h-14 px-8 text-lg font-bold bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105"
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-black bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Shopping Cart
        </h1>
        <Button
          variant="ghost"
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl font-semibold"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="bg-white rounded-2xl p-6 border-2 border-zinc-100 hover:border-emerald-200 transition-all duration-300 hover:shadow-lg group"
            >
              <div className="flex gap-6">
                {/* Product Image */}
                <div className="relative h-32 w-32 shrink-0 rounded-xl overflow-hidden bg-linear-to-br from-zinc-50 to-emerald-50/30 border border-zinc-200 group-hover:border-emerald-300 transition-all duration-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      item.product.images?.[0] ||
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200"
                    }
                    alt={item.product.name}
                    className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <Link
                        href={`/product/${item.product.id}`}
                        className="font-bold text-lg text-zinc-900 hover:text-emerald-600 transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-zinc-500 mt-1">
                        {item.product.brand}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.product.id)}
                      className="text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-300 hover:scale-110"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center bg-linear-to-r from-zinc-100 to-zinc-50 rounded-full p-1 shadow-inner">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8 hover:bg-white hover:shadow-md transition-all duration-300"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8 hover:bg-white hover:shadow-md transition-all duration-300"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            Math.min(item.product.stock, item.quantity + 1),
                          )
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-2xl font-black bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Rs.
                        {(
                          (item.product.price || 0) * item.quantity
                        ).toLocaleString()}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Rs.{item.product.price || 0} each
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-linear-to-br from-emerald-50 via-teal-50 to-emerald-50/30 rounded-2xl p-6 border-2 border-emerald-100 sticky top-24">
            <h2 className="text-2xl font-black mb-6 bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-zinc-700">
                <span className="font-semibold">Subtotal</span>
                <span className="font-bold">Rs.{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-700">
                <span className="font-semibold">Tax (10%)</span>
                <span className="font-bold">Rs.{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-700">
                <span className="font-semibold">Shipping</span>
                <span
                  className={cn(
                    "font-bold",
                    shipping === 0 && "text-green-600",
                  )}
                >
                  {shipping === 0 ? "FREE" : `Rs.${shipping}`}
                </span>
              </div>
              {totalPrice < 100 && (
                <p className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                  Add Rs.{(100 - totalPrice).toFixed(2)} more for free shipping!
                </p>
              )}
              <div className="h-px bg-linear-to-r from-transparent via-zinc-300 to-transparent" />
              <div className="flex justify-between text-xl font-black">
                <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Total
                </span>
                <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Rs.{finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full rounded-2xl h-14 text-lg font-bold bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 mb-3 cursor-pointer"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Proceed to Checkout"}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/")}
              className="w-full rounded-2xl h-12 font-semibold border-2 hover:bg-white transition-all duration-300 cursor-pointer"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>

      <CheckoutDialog
        isOpen={isCheckoutDialogOpen}
        onClose={() => setIsCheckoutDialogOpen(false)}
        onConfirm={handleConfirmCheckout}
        isLoading={isLoading}
      />
    </div>
  );
}
