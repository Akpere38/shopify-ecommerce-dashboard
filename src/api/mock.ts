/**
 * Local mock API — replaces the generated @/api/mock package.
 * Returns realistic seed data immediately, with the exact same hook shapes
 * the original components expect, so no other code needs to change.
 *
 * If you later want to wire this to a real backend, swap the implementations
 * here for real `fetch` calls — the hook signatures are stable.
 */
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

// ------------------------------ Types ------------------------------

export interface Store {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl: string | null;
  accentColor: string;
  currency: string;
  contactEmail: string;
  location: string;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  inventory: number;
  imageUrl: string | null;
  category: string;
  status: "active" | "draft" | "archived";
  sku: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string | null;
  customerName: string;
  customerEmail: string;
  quantity: number;
  totalCents: number;
  status: "pending" | "paid" | "shipped" | "fulfilled" | "refunded";
  createdAt: string;
}

// ── NEW: Full order as created by CheckoutSheet ──────────────────────────────

export interface CheckoutOrderItem {
  productId: number;
  name: string;
  priceCents: number;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  note?: string;
}

/** A full order placed by a customer on the public storefront */
export interface StorefrontOrder {
  id: number;
  reference: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  totalCents: number;
  currency: string;
  customer: CustomerInfo;
  items: CheckoutOrderItem[];
}

export interface CreateOrderBody {
  storeId: number | string;
  customer: CustomerInfo;
  items: CheckoutOrderItem[];
  totalCents: number;
  currency: string;
}

export interface StatsSummary {
  totalRevenueCents: number;
  totalOrders: number;
  totalProducts: number;
  activeProducts: number;
  totalCustomers: number;
  totalViews: number;
  revenueChangePct: number;
  ordersChangePct: number;
  viewsChangePct: number;
  conversionRate: number;
}

export interface RevenuePoint {
  date: string;
  revenueCents: number;
  orders: number;
  views: number;
}

export interface TopProduct {
  productId: number;
  name: string;
  imageUrl: string | null;
  category: string;
  unitsSold: number;
  revenueCents: number;
}

export interface CategorySlice {
  category: string;
  revenueCents: number;
  unitsSold: number;
}

export interface PublicStorefront {
  store: Store;
  products: Product[];
}

export interface CreateProductBody {
  name: string;
  description: string;
  priceCents: number;
  inventory: number;
  imageUrl?: string | null;
  category: string;
  status: "active" | "draft" | "archived";
  sku: string;
}
export type UpdateProductBody = Partial<CreateProductBody>;
export type UpdateStoreBody = Partial<Omit<Store, "id" | "createdAt">>;

// ------------------------------ In-memory seed store ------------------------------

const now = new Date();
const DAY = 24 * 60 * 60 * 1000;
const iso = (d: Date) => d.toISOString();

const state = {
  store: {
    id: 1,
    name: "Lumen & Co.",
    slug: "lumen-co",
    tagline: "Quiet objects for considered homes",
    description:
      "Lumen & Co. is a small studio crafting limited-run homewares from solid brass, walnut, and hand-glazed stoneware. Made in small batches in Brooklyn — designed to outlast a decade.",
    logoUrl: null,
    accentColor: "#0b3d91",
    currency: "NGN",
    contactEmail: "hello@lumenco.shop",
    location: "Brooklyn, NY",
    createdAt: iso(new Date(now.getTime() - 365 * DAY)),
  } as Store,

  products: [
    {
      id: 1, name: "Brass Forest Candleholder",
      description: "Solid cast brass with a hand-rubbed patina. Holds a single taper candle. Each piece is unique.",
      priceCents: 14800, inventory: 24,
      imageUrl: "https://images.unsplash.com/photo-1602874801007-aa295f7c54f0?w=800",
      category: "Lighting", status: "active", sku: "LMN-BRC-01",
      createdAt: iso(new Date(now.getTime() - 90 * DAY)), updatedAt: iso(new Date(now.getTime() - 7 * DAY)),
    },
    {
      id: 2, name: "Walnut Tea Tray",
      description: "Hand-finished American black walnut, oiled. Sized for a small teapot and two cups.",
      priceCents: 9200, inventory: 12,
      imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800",
      category: "Tableware", status: "active", sku: "LMN-WTT-02",
      createdAt: iso(new Date(now.getTime() - 80 * DAY)), updatedAt: iso(new Date(now.getTime() - 5 * DAY)),
    },
    {
      id: 3, name: "Stoneware Carafe — Midnight",
      description: "Wheel-thrown stoneware in a deep cobalt glaze. Holds 1L. Dishwasher safe.",
      priceCents: 6800, inventory: 38,
      imageUrl: "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800",
      category: "Tableware", status: "active", sku: "LMN-CAR-03",
      createdAt: iso(new Date(now.getTime() - 70 * DAY)), updatedAt: iso(new Date(now.getTime() - 3 * DAY)),
    },
    {
      id: 4, name: "Forest Green Linen Throw",
      description: "Heavy-weight Belgian linen, garment-washed. 130x180cm. Made in Lithuania.",
      priceCents: 18400, inventory: 9,
      imageUrl: "https://images.unsplash.com/photo-1555212697-194d092e3b8f?w=800",
      category: "Textiles", status: "active", sku: "LMN-LTH-04",
      createdAt: iso(new Date(now.getTime() - 60 * DAY)), updatedAt: iso(new Date(now.getTime() - 2 * DAY)),
    },
    {
      id: 5, name: "Cedar & Vetiver Candle",
      description: "Hand-poured coconut wax in a reusable stoneware vessel. 60-hour burn.",
      priceCents: 4400, inventory: 84,
      imageUrl: "https://images.unsplash.com/photo-1602523498317-6e3e3a3a3a3a?w=800",
      category: "Home Fragrance", status: "active", sku: "LMN-CDL-05",
      createdAt: iso(new Date(now.getTime() - 50 * DAY)), updatedAt: iso(new Date(now.getTime() - 1 * DAY)),
    },
    {
      id: 6, name: "Brass Picture Hook (Set of 4)",
      description: "Solid brass picture hooks, machined in Pennsylvania. Holds 8kg.",
      priceCents: 3200, inventory: 120,
      imageUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
      category: "Hardware", status: "active", sku: "LMN-HK4-06",
      createdAt: iso(new Date(now.getTime() - 45 * DAY)), updatedAt: iso(new Date(now.getTime() - 4 * DAY)),
    },
    {
      id: 7, name: "Heirloom Cutting Board",
      description: "Edge-grain walnut, hand-finished with mineral oil. 40x28cm.",
      priceCents: 11200, inventory: 18,
      imageUrl: "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800",
      category: "Kitchen", status: "active", sku: "LMN-CTB-07",
      createdAt: iso(new Date(now.getTime() - 38 * DAY)), updatedAt: iso(new Date(now.getTime() - 6 * DAY)),
    },
    {
      id: 8, name: "Olive Wood Spoons (Pair)",
      description: "Hand-carved Italian olive wood. Each pair is unique. 22cm.",
      priceCents: 3800, inventory: 46,
      imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800",
      category: "Kitchen", status: "active", sku: "LMN-SPN-08",
      createdAt: iso(new Date(now.getTime() - 30 * DAY)), updatedAt: iso(new Date(now.getTime() - 2 * DAY)),
    },
    {
      id: 9, name: "Hand-thrown Bud Vase — Sage",
      description: "Wheel-thrown porcelain in a soft sage celadon. 12cm tall.",
      priceCents: 5400, inventory: 27,
      imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800",
      category: "Floral", status: "active", sku: "LMN-BUD-09",
      createdAt: iso(new Date(now.getTime() - 22 * DAY)), updatedAt: iso(new Date(now.getTime() - 1 * DAY)),
    },
    {
      id: 10, name: "Linen Apron — Indigo",
      description: "Heavy-weight Belgian linen with brass hardware. One size.",
      priceCents: 8900, inventory: 15,
      imageUrl: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800",
      category: "Textiles", status: "active", sku: "LMN-APR-10",
      createdAt: iso(new Date(now.getTime() - 14 * DAY)), updatedAt: iso(new Date(now.getTime() - 1 * DAY)),
    },
    {
      id: 11, name: "Brass Match Striker",
      description: "Cast brass match striker with a ceramic strike pad. Holds a full box of strike-anywhere matches.",
      priceCents: 5800, inventory: 0,
      imageUrl: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800",
      category: "Home Fragrance", status: "draft", sku: "LMN-MTH-11",
      createdAt: iso(new Date(now.getTime() - 9 * DAY)), updatedAt: iso(new Date(now.getTime() - 1 * DAY)),
    },
    {
      id: 12, name: "Forest Throw Pillow",
      description: "Stonewashed linen with feather-down insert. 50x50cm.",
      priceCents: 7400, inventory: 22,
      imageUrl: "https://images.unsplash.com/photo-1555212697-194d092e3b8f?w=800",
      category: "Textiles", status: "archived", sku: "LMN-PIL-12",
      createdAt: iso(new Date(now.getTime() - 120 * DAY)), updatedAt: iso(new Date(now.getTime() - 30 * DAY)),
    },
  ] as Product[],

  nextProductId: 13,

  // ── NEW: storefront orders placed via CheckoutSheet ──────────────────────
  storefrontOrders: [] as StorefrontOrder[],
  nextOrderId: 1,
};

// Generate 30 days of revenue + view trend
function generateTrend(): RevenuePoint[] {
  const out: RevenuePoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY);
    d.setUTCHours(0, 0, 0, 0);
    const base = 8 + (29 - i) * 0.3;
    const orders = Math.max(0, Math.round(base + Math.sin(i / 3) * 3 + (Math.random() * 2 - 1)));
    const revenue = orders * (4000 + Math.round(Math.random() * 8000));
    const views = orders * (8 + Math.round(Math.random() * 6));
    out.push({
      date: d.toISOString().slice(0, 10),
      revenueCents: revenue,
      orders,
      views,
    });
  }
  return out;
}

const trend = generateTrend();

function getStats(): StatsSummary {
  const totalRevenue = trend.reduce((s, p) => s + p.revenueCents, 0);
  const totalOrders = trend.reduce((s, p) => s + p.orders, 0);
  const totalViews = trend.reduce((s, p) => s + p.views, 0);
  const last7 = trend.slice(-7);
  const prev7 = trend.slice(-14, -7);
  const sum = (arr: RevenuePoint[], k: keyof RevenuePoint) =>
    arr.reduce((s, p) => s + (p[k] as number), 0);
  const pct = (a: number, b: number) =>
    b === 0 ? (a === 0 ? 0 : 100) : Math.round(((a - b) / b) * 1000) / 10;

  return {
    totalRevenueCents: totalRevenue,
    totalOrders,
    totalProducts: state.products.length,
    activeProducts: state.products.filter((p) => p.status === "active").length,
    totalCustomers: 47,
    totalViews,
    revenueChangePct: pct(sum(last7, "revenueCents"), sum(prev7, "revenueCents")),
    ordersChangePct: pct(sum(last7, "orders"), sum(prev7, "orders")),
    viewsChangePct: pct(sum(last7, "views"), sum(prev7, "views")),
    conversionRate: totalViews > 0 ? Math.round((totalOrders / totalViews) * 1000) / 10 : 0,
  };
}

function getTopProducts(): TopProduct[] {
  return state.products
    .filter((p) => p.status === "active")
    .map((p) => {
      const unitsSold = ((p.id * 7) % 30) + 8;
      return {
        productId: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        category: p.category,
        unitsSold,
        revenueCents: unitsSold * p.priceCents,
      };
    })
    .sort((a, b) => b.revenueCents - a.revenueCents)
    .slice(0, 5);
}

function getCategoryBreakdown(): CategorySlice[] {
  const map = new Map<string, CategorySlice>();
  for (const tp of getTopProducts()) {
    const existing = map.get(tp.category) ?? {
      category: tp.category, revenueCents: 0, unitsSold: 0,
    };
    existing.revenueCents += tp.revenueCents;
    existing.unitsSold += tp.unitsSold;
    map.set(tp.category, existing);
  }
  for (const p of state.products.filter((p) => p.status === "active")) {
    if (!map.has(p.category)) {
      const units = (p.id % 10) + 3;
      map.set(p.category, {
        category: p.category, revenueCents: units * p.priceCents, unitsSold: units,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.revenueCents - a.revenueCents);
}

function getRecentOrders(): Order[] {
  const customers: [string, string][] = [
    ["Maya Patel", "maya.patel@gmail.com"],
    ["Daniel Cho", "daniel.cho@hey.com"],
    ["Iris Bennett", "iris.b@fastmail.com"],
    ["Tomás Reyes", "tomas.r@proton.me"],
    ["Kira Nakamura", "kira.n@hey.com"],
    ["Owen Hartley", "owen@hartley.studio"],
    ["Esme Whitford", "esme.w@gmail.com"],
    ["Felix Larsen", "felix.larsen@me.com"],
    ["Joon Park", "joon@parkdesign.co"],
    ["Sasha Ivanova", "sasha.iv@yandex.com"],
    ["Marcus Webb", "mwebb@duck.com"],
    ["Elena Brun", "elena@brunatelier.fr"],
  ];
  const statuses: Order["status"][] = ["paid", "paid", "shipped", "fulfilled", "pending"];
  const out: Order[] = [];
  for (let i = 0; i < 12; i++) {
    const product = state.products[i % state.products.length];
    const [customerName, customerEmail] = customers[i % customers.length];
    const quantity = 1 + (i % 3);
    out.push({
      id: 1000 + i,
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl,
      customerName,
      customerEmail,
      quantity,
      totalCents: quantity * product.priceCents,
      status: statuses[i % statuses.length],
      createdAt: iso(new Date(now.getTime() - i * 6 * 60 * 60 * 1000)),
    });
  }
  return out;
}

// ------------------------------ Helpers ------------------------------

const SIM_DELAY = 250;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ------------------------------ Query keys ------------------------------

export const getGetStoreQueryKey = () => ["/api/store"] as const;
export const getListProductsQueryKey = () => ["/api/products"] as const;
export const getGetProductQueryKey = (id: number) => ["/api/products", id] as const;
export const getGetStatsSummaryQueryKey = () => ["/api/stats/summary"] as const;
export const getGetRevenueTrendQueryKey = () => ["/api/stats/revenue-trend"] as const;
export const getGetTopProductsQueryKey = () => ["/api/stats/top-products"] as const;
export const getGetCategoryBreakdownQueryKey = () => ["/api/stats/category-breakdown"] as const;
export const getGetRecentOrdersQueryKey = () => ["/api/orders/recent"] as const;
export const getGetPublicStoreQueryKey = (slug: string) => ["/api/public", slug] as const;

// ── NEW query keys ────────────────────────────────────────────────────────────
export const getGetStorefrontOrdersQueryKey = () => ["/api/storefront-orders"] as const;

// ------------------------------ Hooks ------------------------------

export function useGetStore<TError = Error>(opts?: { query?: Partial<UseQueryOptions<Store, TError>> }) {
  return useQuery<Store, TError>({
    queryKey: getGetStoreQueryKey(),
    queryFn: async () => { await sleep(SIM_DELAY); return { ...state.store }; },
    ...opts?.query,
  });
}

export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }: { data: UpdateStoreBody }) => {
      await sleep(SIM_DELAY);
      state.store = { ...state.store, ...data } as Store;
      return { ...state.store };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetStoreQueryKey() }),
  });
}

export function useListProducts<TError = Error>(opts?: { query?: Partial<UseQueryOptions<Product[], TError>> }) {
  return useQuery<Product[], TError>({
    queryKey: getListProductsQueryKey(),
    queryFn: async () => { await sleep(SIM_DELAY); return [...state.products]; },
    ...opts?.query,
  });
}

export function useGetProduct<TError = Error>(
  id: number,
  opts?: { query?: Partial<UseQueryOptions<Product, TError>> },
) {
  return useQuery<Product, TError>({
    queryKey: getGetProductQueryKey(id),
    queryFn: async () => {
      await sleep(SIM_DELAY);
      const p = state.products.find((x) => x.id === id);
      if (!p) throw new Error("Product not found");
      return { ...p };
    },
    ...opts?.query,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }: { data: CreateProductBody }) => {
      await sleep(SIM_DELAY);
      const product: Product = {
        id: state.nextProductId++,
        name: data.name,
        description: data.description,
        priceCents: data.priceCents,
        inventory: data.inventory,
        imageUrl: data.imageUrl ?? null,
        category: data.category,
        status: data.status,
        sku: data.sku,
        createdAt: iso(new Date()),
        updatedAt: iso(new Date()),
      };
      state.products.unshift(product);
      return { ...product };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListProductsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateProductBody }) => {
      await sleep(SIM_DELAY);
      const idx = state.products.findIndex((p) => p.id === id);
      if (idx < 0) throw new Error("Product not found");
      state.products[idx] = {
        ...state.products[idx],
        ...data,
        updatedAt: iso(new Date()),
      } as Product;
      return { ...state.products[idx] };
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: getListProductsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetProductQueryKey(vars.id) });
      qc.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      await sleep(SIM_DELAY);
      state.products = state.products.filter((p) => p.id !== id);
      return undefined;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListProductsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
    },
  });
}

export function useGetStatsSummary<TError = Error>(opts?: { query?: Partial<UseQueryOptions<StatsSummary, TError>> }) {
  return useQuery<StatsSummary, TError>({
    queryKey: getGetStatsSummaryQueryKey(),
    queryFn: async () => { await sleep(SIM_DELAY); return getStats(); },
    ...opts?.query,
  });
}

export function useGetRevenueTrend<TError = Error>(opts?: { query?: Partial<UseQueryOptions<RevenuePoint[], TError>> }) {
  return useQuery<RevenuePoint[], TError>({
    queryKey: getGetRevenueTrendQueryKey(),
    queryFn: async () => { await sleep(SIM_DELAY); return [...trend]; },
    ...opts?.query,
  });
}

export function useGetTopProducts<TError = Error>(opts?: { query?: Partial<UseQueryOptions<TopProduct[], TError>> }) {
  return useQuery<TopProduct[], TError>({
    queryKey: getGetTopProductsQueryKey(),
    queryFn: async () => { await sleep(SIM_DELAY); return getTopProducts(); },
    ...opts?.query,
  });
}

export function useGetCategoryBreakdown<TError = Error>(opts?: { query?: Partial<UseQueryOptions<CategorySlice[], TError>> }) {
  return useQuery<CategorySlice[], TError>({
    queryKey: getGetCategoryBreakdownQueryKey(),
    queryFn: async () => { await sleep(SIM_DELAY); return getCategoryBreakdown(); },
    ...opts?.query,
  });
}

export function useGetRecentOrders<TError = Error>(opts?: { query?: Partial<UseQueryOptions<Order[], TError>> }) {
  return useQuery<Order[], TError>({
    queryKey: getGetRecentOrdersQueryKey(),
    queryFn: async () => { await sleep(SIM_DELAY); return getRecentOrders(); },
    ...opts?.query,
  });
}

export function useGetPublicStore<TError = Error>(
  slug: string,
  opts?: { query?: Partial<UseQueryOptions<PublicStorefront, TError>> },
) {
  return useQuery<PublicStorefront, TError>({
    queryKey: getGetPublicStoreQueryKey(slug),
    queryFn: async () => {
      await sleep(SIM_DELAY);
      if (slug !== state.store.slug) throw new Error("Store not found");
      return {
        store: { ...state.store },
        products: state.products.filter((p) => p.status === "active"),
      };
    },
    ...opts?.query,
  });
}

// ── NEW: Storefront orders (placed via CheckoutSheet) ─────────────────────────

/**
 * useGetStorefrontOrders
 * Used in Orders.tsx to display all customer orders on the dashboard.
 */
export function useGetStorefrontOrders<TError = Error>(
  opts?: { query?: Partial<UseQueryOptions<StorefrontOrder[], TError>> },
) {
  return useQuery<StorefrontOrder[], TError>({
    queryKey: getGetStorefrontOrdersQueryKey(),
    queryFn: async () => {
      await sleep(SIM_DELAY);
      return [...state.storefrontOrders];
    },
    ...opts?.query,
  });
}

/**
 * useCreateOrder
 * Used in CheckoutSheet.tsx when a customer places an order.
 * Saves to in-memory state and invalidates the orders query so
 * the dashboard Orders page updates immediately.
 */
export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }: { data: CreateOrderBody }) => {
      await sleep(SIM_DELAY);

      const id = state.nextOrderId++;
      // Generate a short human-readable reference
      const reference = `ORD-${String(id).padStart(4, "0")}`;

      const order: StorefrontOrder = {
        id,
        reference,
        status: "pending",
        createdAt: iso(new Date()),
        totalCents: data.totalCents,
        currency: data.currency,
        customer: { ...data.customer },
        items: data.items.map((i) => ({ ...i })),
      };

      // Prepend so newest orders appear first
      state.storefrontOrders.unshift(order);

      return { order };
    },
    onSuccess: () => {
      // Refresh the orders list on the dashboard
      qc.invalidateQueries({ queryKey: getGetStorefrontOrdersQueryKey() });
      // Also refresh stats since a new order affects totals
      qc.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
    },
  });
}

/**
 * useUpdateStorefrontOrderStatus
 * Used in Orders.tsx when the merchant confirms or cancels an order.
 */
export function useUpdateStorefrontOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: StorefrontOrder["status"];
    }) => {
      await sleep(SIM_DELAY);
      const idx = state.storefrontOrders.findIndex((o) => o.id === id);
      if (idx < 0) throw new Error("Order not found");
      state.storefrontOrders[idx] = { ...state.storefrontOrders[idx], status };
      return { ...state.storefrontOrders[idx] };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetStorefrontOrdersQueryKey() });
    },
  });
}
