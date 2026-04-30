import { useState } from "react";
import { Link } from "wouter";
import { formatMoney } from "@/lib/format";
import {
  useGetStatsSummary,
  useGetRevenueTrend,
  useGetTopProducts,
  useGetCategoryBreakdown,
  useGetRecentOrders,
  useGetStore,
} from "@/api/mock";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Package, DollarSign, Eye, ShoppingCart, Loader2 } from "lucide-react";
import { format } from "date-fns";

function KPICard({ title, value, change, icon: Icon, isLoading }: any) {
  return (
    <Card className="bg-card/50 backdrop-blur-xl border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-7 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {!isLoading && change !== undefined && (
          <p className="text-xs flex items-center mt-1">
            {change >= 0 ? (
              <span className="text-emerald-500 flex items-center font-medium">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                {change}%
              </span>
            ) : (
              <span className="text-rose-500 flex items-center font-medium">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                {Math.abs(change)}%
              </span>
            )}
            <span className="text-muted-foreground ml-2">vs last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: store } = useGetStore();
  const { data: stats, isLoading: isStatsLoading } = useGetStatsSummary();
  const { data: trend, isLoading: isTrendLoading } = useGetRevenueTrend();
  const { data: topProducts, isLoading: isTopProductsLoading } = useGetTopProducts();
  const { data: categories, isLoading: isCategoriesLoading } = useGetCategoryBreakdown();
  const { data: orders, isLoading: isOrdersLoading } = useGetRecentOrders();

  const currency = store?.currency || "USD";

  const CHART_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Here's what's happening in your store today.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={formatMoney(stats?.totalRevenueCents || 0, currency)}
          change={stats?.revenueChangePct}
          icon={DollarSign}
          isLoading={isStatsLoading}
        />
        <KPICard
          title="Total Orders"
          value={(stats?.totalOrders || 0).toLocaleString()}
          change={stats?.ordersChangePct}
          icon={ShoppingCart}
          isLoading={isStatsLoading}
        />
        <KPICard
          title="Store Views"
          value={(stats?.totalViews || 0).toLocaleString()}
          change={stats?.viewsChangePct}
          icon={Eye}
          isLoading={isStatsLoading}
        />
        <KPICard
          title="Active Products"
          value={(stats?.activeProducts || 0).toLocaleString()}
          icon={Package}
          isLoading={isStatsLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-full md:col-span-4 lg:col-span-5 bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Daily revenue for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {isTrendLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : trend && trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => format(new Date(val), "MMM d")}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => formatMoney(val, currency).replace(/\.\d+/, "")}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-border p-3 rounded-lg shadow-xl">
                            <p className="text-sm font-medium mb-1">{format(new Date(label), "MMM d, yyyy")}</p>
                            <p className="text-primary font-bold">{formatMoney(payload[0].value as number, currency)}</p>
                            <p className="text-xs text-muted-foreground mt-1">{payload[0].payload.orders} orders</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenueCents"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <DollarSign className="w-10 h-10 mb-2 opacity-20" />
                <p>No revenue data yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-full md:col-span-3 lg:col-span-2 bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Revenue by product category</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {isCategoriesLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : categories && categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="revenueCents"
                    stroke="none"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-border p-2 rounded shadow-lg text-sm">
                            <p className="font-medium">{payload[0].payload.category}</p>
                            <p className="text-primary">{formatMoney(payload[0].value as number, currency)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <Package className="w-10 h-10 mb-2 opacity-20" />
                <p>No categories yet.</p>
              </div>
            )}
            {!isCategoriesLoading && categories && categories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {categories.map((cat, i) => (
                  <div key={cat.category} className="flex items-center text-xs text-muted-foreground">
                    <div
                      className="w-3 h-3 rounded-full mr-1.5"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    {cat.category}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performing products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {isTopProductsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted animate-pulse rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topProducts && topProducts.length > 0 ? (
              <div className="space-y-6">
                {topProducts.slice(0, 5).map((product) => (
                  <Link href={`/products/${product.productId}`} key={product.productId}>
                    <div className="flex items-center gap-4 group cursor-pointer transition-all p-2 -mx-2 rounded-lg hover:bg-white/5">
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden border border-border/50 flex-shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <Package className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-medium text-sm text-foreground">{formatMoney(product.revenueCents, currency)}</p>
                        <p className="text-xs text-muted-foreground">{product.unitsSold} sold</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No products sold yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer purchases</CardDescription>
          </CardHeader>
          <CardContent>
            {isOrdersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-6">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b border-border/30 last:border-0 pb-4 last:pb-0">
                    <div>
                      <p className="font-medium text-sm text-foreground flex items-center gap-2">
                        {order.customerName}
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {order.status}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.quantity}x {order.productName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-foreground">{formatMoney(order.totalCents, currency)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(order.createdAt), "MMM d")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent orders.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
