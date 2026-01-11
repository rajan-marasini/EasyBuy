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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Eye, FileText, MoreHorizontal } from "lucide-react";

const mockOrders = [
    {
        id: "ORD-001",
        customer: "John Doe",
        date: "2024-03-20",
        total: 1249.0,
        status: "Delivered",
        payment: "Paid",
    },
    {
        id: "ORD-002",
        customer: "Jane Smith",
        date: "2024-03-19",
        total: 89.99,
        status: "Processing",
        payment: "Paid",
    },
    {
        id: "ORD-003",
        customer: "Robert Brown",
        date: "2024-03-18",
        total: 450.0,
        status: "Shipped",
        payment: "Paid",
    },
    {
        id: "ORD-004",
        customer: "Emily Davis",
        date: "2024-03-18",
        total: 129.99,
        status: "Pending",
        payment: "Awaiting Payment",
    },
    {
        id: "ORD-005",
        customer: "Michael Wilson",
        date: "2024-03-17",
        total: 999.0,
        status: "Cancelled",
        payment: "Refunded",
    },
];

export default function ManageOrdersPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                    Manage Orders
                </h1>
                <p className="text-zinc-500 mt-2">
                    Track and manage customer orders and fulfillment.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50/50">
                        <TableRow>
                            <TableHead className="font-bold text-zinc-900">
                                Order ID
                            </TableHead>
                            <TableHead className="font-bold text-zinc-900">
                                Customer
                            </TableHead>
                            <TableHead className="font-bold text-zinc-900">
                                Date
                            </TableHead>
                            <TableHead className="font-bold text-zinc-900">
                                Total
                            </TableHead>
                            <TableHead className="font-bold text-zinc-900">
                                Status
                            </TableHead>
                            <TableHead className="font-bold text-zinc-900">
                                Payment
                            </TableHead>
                            <TableHead className="text-right font-bold text-zinc-900">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockOrders.map((order) => (
                            <TableRow
                                key={order.id}
                                className="hover:bg-zinc-50/50 transition-colors"
                            >
                                <TableCell className="font-bold text-zinc-900">
                                    {order.id}
                                </TableCell>
                                <TableCell className="text-zinc-600 font-medium">
                                    {order.customer}
                                </TableCell>
                                <TableCell className="text-zinc-500">
                                    {order.date}
                                </TableCell>
                                <TableCell className="font-bold text-zinc-900">
                                    ${order.total.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={
                                            order.status === "Delivered"
                                                ? "bg-emerald-100 text-emerald-700 border-none px-3 py-1 rounded-lg"
                                                : order.status === "Shipped"
                                                ? "bg-blue-100 text-blue-700 border-none px-3 py-1 rounded-lg"
                                                : order.status === "Processing"
                                                ? "bg-orange-100 text-orange-700 border-none px-3 py-1 rounded-lg"
                                                : order.status === "Pending"
                                                ? "bg-zinc-100 text-zinc-700 border-none px-3 py-1 rounded-lg"
                                                : "bg-red-100 text-red-700 border-none px-3 py-1 rounded-lg"
                                        }
                                    >
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-zinc-500">
                                        {order.payment}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0 hover:bg-zinc-100 rounded-full"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="rounded-xl border shadow-xl"
                                        >
                                            <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-zinc-50">
                                                <Eye className="w-4 h-4 text-zinc-600" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-zinc-50">
                                                <FileText className="w-4 h-4 text-zinc-600" />
                                                Invoice
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
