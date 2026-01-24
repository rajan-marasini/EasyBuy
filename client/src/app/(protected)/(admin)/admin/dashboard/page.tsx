import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
    Users,
} from "lucide-react";

export default function AdminDashboardPage() {
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

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                    Dashboard Overiew
                </h1>
                <p className="text-zinc-500 mt-2">
                    Welcome back! Here&apos;s what&apos;s happening with your
                    store today.
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
                        <CardTitle className="text-lg font-bold">
                            Recent Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-zinc-400 italic">
                            [Revenue Chart Placeholder]
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">
                            Recent Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4"
                                >
                                    <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 text-xs font-bold">
                                        JD
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-zinc-900">
                                            John Doe
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            john.doe@example.com
                                        </p>
                                    </div>
                                    <div className="text-sm font-bold text-emerald-600">
                                        +$1,999.00
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
