/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import CreateProductDialog from "@/components/admin/CreateProductDialog";
import EditProductDialog from "@/components/admin/EditProductDialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminProducts, useDeleteProduct } from "@/hooks/useAdminProducts";
import { useCategories } from "@/hooks/useCategories";
import { useDebounce } from "@/hooks/useDebounce";
import { Product } from "@/lib/types";
import {
  Edit,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ManageProductsPage() {
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { data: categories } = useCategories();

  const {
    data: productsData,
    isLoading,
    isError,
  } = useAdminProducts(page, 10, selectedCategory, debouncedSearch);
  const deleteProduct = useDeleteProduct();

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        class: "bg-red-100 text-red-700 font-bold",
      };
    if (stock < 10)
      return {
        label: "Low Stock",
        class: "bg-orange-100 text-orange-700 font-bold",
      };
    return {
      label: "In Stock",
      class: "bg-emerald-100 text-emerald-700 font-bold",
    };
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    deleteProduct.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Product deleted successfully");
        setDeleteId(null);
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to delete product",
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-100 animate-pulse"></div>
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 absolute top-0 left-0" />
        </div>
        <p className="text-zinc-500 font-medium animate-pulse text-lg">
          Loading inventory...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 bg-red-50/50 rounded-3xl border border-red-100">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <Trash2 className="w-8 h-8 text-red-600" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-zinc-900">Connection Failed</h3>
          <p className="text-zinc-500 mt-1 max-w-xs">
            We couldn&apos;t reach the server to fetch your products.
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

  const { data: products, meta } = productsData || {
    data: [],
    meta: { current_page: 1, total_pages: 1, limit: 10, total_items: 0 },
  };

  const startIdx = (page - 1) * meta.limit + 1;
  const endIdx = Math.min(page * meta.limit, meta.total_items);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 bg-linear-to-r from-zinc-900 to-zinc-500 bg-clip-text">
            Inventory Master
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">
            Manage your catalog with precision and style.
          </p>
        </div>
        <CreateProductDialog />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white/50 p-6 rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/20 backdrop-blur-sm flex-1 w-full lg:w-auto">
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search by name, brand..."
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

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[240px] h-12 rounded-2xl border-zinc-200 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-zinc-100 shadow-2xl glassmorphism p-1">
              <SelectItem
                value="All"
                className="rounded-xl p-3 font-semibold cursor-pointer focus:bg-emerald-50 focus:text-emerald-700"
              >
                All Categories
              </SelectItem>
              {categories?.map((cat) => (
                <SelectItem
                  key={cat.id}
                  value={cat.id!}
                  className="rounded-xl p-3 font-semibold cursor-pointer focus:bg-emerald-50 focus:text-emerald-700"
                >
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {meta.total_items > 0 && (
          <div className="px-6 py-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-emerald-700 font-bold text-sm shadow-sm">
            Showing{" "}
            <span className="text-emerald-900">
              {startIdx}-{endIdx}
            </span>{" "}
            of <span className="text-emerald-900">{meta.total_items}</span>{" "}
            products
          </div>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="hover:bg-transparent border-zinc-100">
              <TableHead className="w-[300px] py-6 px-8 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Product Info
              </TableHead>
              <TableHead className="py-6 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Category
              </TableHead>
              <TableHead className="py-6 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Price
              </TableHead>
              <TableHead className="py-6 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Stock
              </TableHead>
              <TableHead className="py-6 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Ratings
              </TableHead>
              <TableHead className="py-6 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Status
              </TableHead>
              <TableHead className="text-right py-6 pr-8 font-bold text-zinc-900 uppercase text-xs tracking-widest">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const status = getStockStatus(product.stock);
              return (
                <TableRow
                  key={product.id}
                  className="group hover:bg-zinc-50/80 transition-all duration-300 border-zinc-100"
                >
                  <TableCell className="py-3 px-8">
                    <div className="space-y-1">
                      <div className="font-bold text-zinc-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {product.name}
                      </div>
                      <div className="text-xs text-zinc-400 font-medium">
                        ID: {product.id.slice(0, 8)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
                      {product.category?.name || "Uncategorized"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 font-black text-zinc-900 text-base">
                    Rs.{product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-semibold text-zinc-600">
                      {product.stock}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {product.average_rating
                          ? product.average_rating.toFixed(1)
                          : "0.0"}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                        <MessageSquare className="w-3 h-3" />
                        {product.total_reviews} reviews
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="secondary"
                      className={`${status.class} hover:${status.class} border-none px-4 py-1.5 rounded-full text-[10px] shadow-sm`}
                    >
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-3 pr-8">
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
                        className="rounded-[1.5rem] p-2 border-zinc-100 shadow-2xl min-w-[160px] glassmorphism"
                      >
                        <DropdownMenuItem
                          onClick={() => setEditProduct(product)}
                          className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-emerald-50 focus:text-emerald-700 font-semibold"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Record
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(product.id)}
                          className="gap-3 p-3 rounded-xl cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 font-semibold"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Record
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

      <EditProductDialog
        product={editProduct}
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
      />

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
              Destructive Action
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-center text-lg leading-relaxed">
              Are you absolutely sure? This will permanently erase the product
              from your catalog. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="w-full sm:flex-1 h-12 rounded-2xl border-zinc-200 font-bold text-zinc-600 hover:bg-zinc-50 transition-all">
              No, Keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full sm:flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-200 transition-all"
            >
              {deleteProduct.isPending ? "Erasing..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
