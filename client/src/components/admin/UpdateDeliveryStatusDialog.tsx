"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateOrderStatus } from "@/hooks/useAdminOrders";
import { OrderListItem } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const deliveryStatusSchema = z.object({
  delivery_status: z.string().min(1, "Please select a delivery status"),
});

type DeliveryStatusFormValues = z.infer<typeof deliveryStatusSchema>;

interface UpdateDeliveryStatusDialogProps {
  order: OrderListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DELIVERY_STATUSES = [
  { label: "Not Shipped", value: "NOT_SHIPPED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "In Transit", value: "IN_TRANSIT" },
  { label: "Out For Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Returned", value: "RETURNED" },
];

export default function UpdateDeliveryStatusDialog({
  order,
  open,
  onOpenChange,
}: UpdateDeliveryStatusDialogProps) {
  const updateStatus = useUpdateOrderStatus();

  const form = useForm<DeliveryStatusFormValues>({
    resolver: zodResolver(deliveryStatusSchema),
    defaultValues: {
      delivery_status: "",
    },
  });

  useEffect(() => {
    if (order) {
      form.reset({
        delivery_status: order.delivery_status,
      });
    }
  }, [order, form]);

  const onSubmit = async (data: DeliveryStatusFormValues) => {
    if (!order) return;
    updateStatus.mutate(
      { id: order.id, status: data.delivery_status, type: "delivery" },
      {
        onSuccess: () => {
          toast.success("Delivery status updated successfully!");
          onOpenChange(false);
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.message || "Failed to update delivery status";
          toast.error(message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl glassmorphism">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-linear-to-r from-zinc-900 to-blue-600 bg-clip-text text-transparent">
            Update Delivery
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 w-full">
          <div className="bg-zinc-50 rounded-2xl p-4 mb-6 border border-zinc-100">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">
              Order ID
            </p>
            <p className="font-mono font-bold text-zinc-900 truncate">
              #{order?.id.slice(0, 13)}...
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 w-full"
            >
              <FormField
                control={form.control}
                name="delivery_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-zinc-700 w-full">
                      New Delivery Status
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl className="w-full">
                        <SelectTrigger className="h-12 rounded-xl border-zinc-200 focus:ring-blue-500 bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-zinc-100 shadow-xl overflow-hidden w-full">
                        {DELIVERY_STATUSES.map((status) => (
                          <SelectItem
                            key={status.value}
                            value={status.value}
                            className="py-3 focus:bg-blue-50 focus:text-blue-700 font-medium cursor-pointer"
                          >
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full bg-linear-to-r from-zinc-900 to-zinc-800 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl h-12 font-bold shadow-lg transition-all duration-300"
                  disabled={updateStatus.isPending}
                >
                  {updateStatus.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
