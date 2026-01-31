/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProduct } from "@/hooks/useAdminProducts";
import { useCategories } from "@/hooks/useCategories";
import { Product } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import ImageUpload from "./ImageUpload";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string(),
  stock: z.string(),
  category_id: z.string().min(1, "Please select a category"),
  brand: z.string().min(1, "Brand is required"),
  images: z.array(z.any()).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProductDialog({
  product,
  open,
  onOpenChange,
}: EditProductDialogProps) {
  const { data: categories } = useCategories();
  const updateProduct = useUpdateProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock: "",
      category_id: "",
      brand: "",
      images: [],
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category_id: product.category_id,
        brand: product.brand,
        images: product.images || [],
      });
    }
  }, [product, form]);

  const onSubmit = async (data: ProductFormValues) => {
    if (!product) return;

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("stock", data.stock);
    formData.append("category_id", data.category_id);
    formData.append("brand", data.brand);

    // Separate existing URLs and new Files
    if (data.images && data.images.length > 0) {
      data.images.forEach((image: string | File) => {
        if (typeof image === "string") {
          formData.append("images", image);
        } else {
          formData.append("images_new", image);
        }
      });
    }

    updateProduct.mutate(
      { id: product.id, data: formData },
      {
        onSuccess: () => {
          toast.success("Product updated successfully!");
          onOpenChange(false);
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.message || "Failed to update product";
          toast.error(message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-zinc-900 text-center">
            Edit Product
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value || []}
                      onChange={(files) => field.onChange(files)}
                      onRemove={(file) =>
                        field.onChange(
                          field.value?.filter((f: any) => f !== file),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="iPhone 15 Pro"
                      {...field}
                      className="rounded-xl border-zinc-200 focus:ring-emerald-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Apple"
                        {...field}
                        className="rounded-xl border-zinc-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-zinc-200">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id!}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about the product..."
                      className="min-h-[100px] rounded-xl border-zinc-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        className="rounded-xl border-zinc-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="rounded-xl border-zinc-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-bold shadow-lg shadow-emerald-100"
                disabled={updateProduct.isPending}
              >
                {updateProduct.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Updating...
                  </>
                ) : (
                  "Update Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
