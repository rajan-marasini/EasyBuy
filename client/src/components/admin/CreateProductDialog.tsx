"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProduct } from "@/hooks/useAdminProducts";
import { useCategories } from "@/hooks/useCategories";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const productSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
    price: z.string(),
    stock: z.string(),
    category_id: z.string().min(1, "Please select a category"),
    brand: z.string().min(1, "Brand is required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function CreateProductDialog() {
    const [open, setOpen] = useState(false);
    const { data: categories } = useCategories();
    const createProduct = useCreateProduct();

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            price: "",
            stock: "",
            category_id: "",
            brand: "",
        },
    });

    const onSubmit = async (data: ProductFormValues) => {
        createProduct.mutate(data, {
            onSuccess: () => {
                toast.success("Product created successfully!");
                setOpen(false);
                form.reset();
            },
            onError: (error: any) => {
                const message =
                    error.response?.data?.message || "Failed to create product";
                toast.error(message);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-100">
                    <PlusCircle className="w-4 h-4" />
                    Create Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] rounded-2xl border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-zinc-900 text-center">
                        Create New Product
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 pt-4"
                    >
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
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl border-zinc-200">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl">
                                                {categories?.map((category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={category.id!}
                                                    >
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
                                disabled={createProduct.isPending}
                            >
                                {createProduct.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                                        Creating...
                                    </>
                                ) : (
                                    "Create Product"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
