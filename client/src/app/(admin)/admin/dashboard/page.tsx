"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { OrderListItem } from "@/lib/types";
import {
  DollarSign,
  Loader2,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 4500 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 5900 },
  { month: "Jun", revenue: 7200 },
  { month: "Jul", revenue: 6800 },
];

export default function AdminDashboardPage() {
  const { data: ordersData, isLoading } = useAdminOrders(1, 5);
  const recentOrders = ordersData?.data?.orders || [];

  const stats = [
    {
      title: "Total Revenue",
      value: "Rs.45,231.89",
      icon: DollarSign,
      trend: "+20.1% from last month",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Total Orders",
      value: "+2350",
      icon: ShoppingCart,
      trend: "+180.1% from last month",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Products",
      value: "12,234",
      icon: Package,
      trend: "+19% from last month",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Active Users",
      value: "+573",
      icon: Users,
      trend: "+201 since last hour",
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Dashboard Overview
        </h1>
        <p className="text-zinc-500 mt-2">
          Welcome back! Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">
                {stat.title}
              </CardTitle>
              <div
                className={`p-2 rounded-xl ${stat.bg} ${stat.color} transition-transform duration-300 group-hover:scale-110`}
              >
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">
                {stat.value}
              </div>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Recent Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickFormatter={(value) => `Rs.${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [
                      `Rs.${value.toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 border-none shadow-sm h-full">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
                <p className="text-sm text-zinc-400 font-medium">
                  Fetching orders...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order: OrderListItem) => (
                    <div
                      key={order.id}
                      className="flex items-center gap-4 group"
                    >
                      <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 text-xs font-bold ring-2 ring-white shadow-sm">
                        {getInitials(order.user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate">
                          {order.user.name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          Order #{order.id.slice(0, 8)} •{" "}
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm font-bold text-zinc-900">
                        Rs.
                        {order.total_amount.toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-zinc-100 mx-auto mb-4" />
                    <p className="text-sm text-zinc-400">
                      No recent orders found
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
