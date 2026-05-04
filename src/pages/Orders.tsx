/**
 * Orders.tsx
 * Drop into: src/pages/Orders.tsx
 *
 * Displays all orders placed via CheckoutSheet on the public storefront.
 * Uses useGetStorefrontOrders + useUpdateStorefrontOrderStatus from @/api/mock.
 */

import { useState, useMemo } from "react";
import { formatMoney } from "@/lib/format";
import {
  useGetStorefrontOrders,
  useUpdateStorefrontOrderStatus,
  type StorefrontOrder,
} from "@/api/mock";
import {
  Package, Search, Filter, Eye,
  ChevronDown, ChevronUp, Loader2,
  ShoppingBag, Clock, CheckCircle2,
  XCircle, TrendingUp, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Status config ────────────────────────────────────────────────────────────

type OrderStatus = StorefrontOrder["status"];

const STATUS_CONFIG: Record<OrderStatus, {
  label: string;
  icon: React.ReactNode;
  badgeClass: string;
}> = {
  pending: {
    label: "Pending",
    icon: <Clock className="w-3 h-3" />,
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  confirmed: {
    label: "Confirmed",
    icon: <CheckCircle2 className="w-3 h-3" />,
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="w-3 h-3" />,
    badgeClass: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.badgeClass}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Order detail sheet ───────────────────────────────────────────────────────

function OrderDetailSheet({ order, open, onClose, onStatusChange }: {
  order: StorefrontOrder | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: number, status: OrderStatus) => void;
}) {
  if (!order) return null;
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 py-5 border-b border-border/50 shrink-0">
          <SheetTitle className="font-serif text-xl flex items-center justify-between">
            <span>{order.reference}</span>
            <StatusBadge status={order.status} />
          </SheetTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Placed {timeAgo(order.createdAt)} · {new Date(order.createdAt).toLocaleString()}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {/* Customer */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Customer</h3>
            <div className="bg-muted/20 rounded-xl p-4 space-y-2 border border-border/40">
              <p className="font-semibold">{order.customer.name}</p>
              <p className="text-sm text-muted-foreground">{order.customer.email}</p>
              <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
              <p className="text-sm text-muted-foreground">{order.customer.address}</p>
              {order.customer.note && (
                <div className="pt-2 mt-2 border-t border-border/40">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Note</p>
                  <p className="text-sm italic">"{order.customer.note}"</p>
                </div>
              )}
            </div>
          </section>

          {/* Items */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Items Ordered</h3>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 px-4 bg-card/50 rounded-xl border border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatMoney(item.priceCents * item.quantity, order.currency)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/40 px-1">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-bold text-lg">{formatMoney(order.totalCents, order.currency)}</span>
            </div>
          </section>

          {/* Actions */}
          {order.status === "pending" && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Update Status</h3>
              <div className="flex gap-3">
                <Button
                  className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => { onStatusChange(order.id, "confirmed"); onClose(); }}
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm Order
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={() => { onStatusChange(order.id, "cancelled"); onClose(); }}
                >
                  <XCircle className="w-4 h-4" /> Cancel
                </Button>
              </div>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Order row ────────────────────────────────────────────────────────────────

function OrderRow({ order, onView, onStatusChange }: {
  order: StorefrontOrder;
  onView: () => void;
  onStatusChange: (id: number, status: OrderStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-card/50 rounded-xl border border-border/50 overflow-hidden transition-all">
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Order</p>
            <p className="font-mono font-semibold text-sm">{order.reference}</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Customer</p>
            <p className="text-sm font-medium truncate">{order.customer.name}</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Total</p>
            <p className="text-sm font-semibold">{formatMoney(order.totalCents, order.currency)}</p>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <StatusBadge status={order.status} />
            <span className="text-xs text-muted-foreground hidden sm:block">{timeAgo(order.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs"
            onClick={(e) => { e.stopPropagation(); onView(); }}>
            <Eye className="w-3.5 h-3.5" /> View
          </Button>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-4 pt-0 border-t border-border/30 bg-muted/10 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3 text-sm pt-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Contact</p>
              <p>{order.customer.email}</p>
              <p className="text-muted-foreground">{order.customer.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Address</p>
              <p className="text-muted-foreground">{order.customer.address}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Items</p>
            <p className="text-sm">{order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}</p>
          </div>
          {order.status === "pending" && (
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => onStatusChange(order.id, "confirmed")}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
              </Button>
              <Button size="sm" variant="outline"
                className="gap-1.5 border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={() => onStatusChange(order.id, "cancelled")}>
                <XCircle className="w-3.5 h-3.5" /> Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Orders() {
  const { data, isLoading } = useGetStorefrontOrders();
  const updateStatus = useUpdateStorefrontOrderStatus();

  const orders: StorefrontOrder[] = data ?? [];

  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<StorefrontOrder | null>(null);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !search ||
        o.reference.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  function handleStatusChange(id: number, status: OrderStatus) {
    updateStatus.mutate({ id, status });
    // Update selected order in the sheet too if it's open
    if (selectedOrder?.id === id) {
      setSelectedOrder((o) => o ? { ...o, status } : null);
    }
  }

  const totalRevenue   = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.totalCents, 0);
  const pendingCount   = orders.filter((o) => o.status === "pending").length;
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;
  const currency       = orders[0]?.currency ?? "NGN";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Customer orders from your public storefront
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatMoney(totalRevenue, currency), icon: <TrendingUp className="w-4 h-4" />, color: "text-primary" },
          { label: "Total Orders",  value: orders.length,    icon: <ShoppingBag className="w-4 h-4" />, color: "text-foreground" },
          { label: "Pending",       value: pendingCount,     icon: <Clock className="w-4 h-4" />,       color: "text-amber-400" },
          { label: "Confirmed",     value: confirmedCount,   icon: <Users className="w-4 h-4" />,       color: "text-emerald-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card/50 rounded-xl p-4 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span className={stat.color}>{stat.icon}</span>
              {stat.label}
            </div>
            <p className={`text-2xl font-serif font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, name, email…"
            className="pl-9 bg-card/50" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 min-w-[140px] justify-between bg-card/50">
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {statusFilter === "all" ? "All statuses" : STATUS_CONFIG[statusFilter].label}
              </span>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(["all", "pending", "confirmed", "cancelled"] as const).map((s) => (
              <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
                {s === "all" ? "All statuses" : STATUS_CONFIG[s].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-xl font-serif font-bold text-foreground mb-1">No orders yet</h3>
          <p className="text-sm max-w-xs">
            {search || statusFilter !== "all"
              ? "No orders match your filter."
              : "When customers place orders on your storefront they'll appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              onView={() => setSelectedOrder(order)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <OrderDetailSheet
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
