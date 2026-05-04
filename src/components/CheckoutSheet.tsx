/**
 * CheckoutSheet.tsx
 * Drop into: src/components/CheckoutSheet.tsx
 *
 * In PublicStore.tsx, replace CartSheet with:
 *
 *   import CheckoutSheet from "@/components/CheckoutSheet";
 *
 *   <CheckoutSheet
 *     open={cartOpen}
 *     onClose={() => setCartOpen(false)}
 *     cart={cart}
 *     onUpdateQty={updateQty}
 *     onRemove={removeFromCart}
 *     currency={currency}
 *     storeName={store.name}
 *     storeId={store.id}
 *   />
 */

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/format";
import { useCreateOrder } from "@/api/mock";
import {
  ShoppingCart,
  Package,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  id: number;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  note: string;
}

type Step = "cart" | "checkout" | "success";

interface Props {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  currency: string;
  storeName: string;
  storeId: number | string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutSheet({
  open,
  onClose,
  cart,
  onUpdateQty,
  onRemove,
  currency,
  storeName,
  storeId,
}: Props) {
  const [step, setStep]   = useState<Step>("cart");
  const [orderRef, setOrderRef] = useState("");
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});

  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "", email: "", phone: "", address: "", note: "",
  });

  // ── useCreateOrder from mock.ts ───────────────────────────────────────────
  const createOrder = useCreateOrder();

  const subtotal   = cart.reduce((s, i) => s + i.priceCents * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  function field(key: keyof CustomerInfo) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCustomer((c) => ({ ...c, [key]: e.target.value }));
      setErrors((er) => ({ ...er, [key]: "" }));
    };
  }

  function validate(): boolean {
    const e: Partial<CustomerInfo> = {};
    if (!customer.name.trim())    e.name    = "Full name is required";
    if (!customer.email.trim())   e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(customer.email)) e.email = "Enter a valid email";
    if (!customer.phone.trim())   e.phone   = "Phone number is required";
    if (!customer.address.trim()) e.address = "Delivery address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handlePlaceOrder() {
    if (!validate()) return;

    createOrder.mutate(
      {
        data: {
          storeId,
          customer,
          items: cart.map((i) => ({
            productId:  i.id,
            name:       i.name,
            priceCents: i.priceCents,
            quantity:   i.quantity,
          })),
          totalCents: subtotal,
          currency,
        },
      },
      {
        onSuccess: ({ order }) => {
          setOrderRef(order.reference);
          setStep("success");
          // Clear cart items
          cart.forEach((i) => onRemove(i.id));
        },
        onError: () => {
          setErrors({ note: "Something went wrong. Please try again." });
        },
      }
    );
  }

  function handleClose() {
    setTimeout(() => {
      setStep("cart");
      setCustomer({ name: "", email: "", phone: "", address: "", note: "" });
      setErrors({});
      setOrderRef("");
      createOrder.reset();
    }, 300);
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0 overflow-hidden"
      >
        {/* ── CART ──────────────────────────────────────────────────── */}
        {step === "cart" && (
          <>
            <SheetHeader className="px-6 py-5 border-b border-border/50 shrink-0">
              <SheetTitle className="font-serif text-xl flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Your Cart
                {totalItems > 0 && (
                  <span className="ml-auto text-sm font-normal text-muted-foreground">
                    {totalItems} item{totalItems !== 1 ? "s" : ""}
                  </span>
                )}
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center text-muted-foreground">
                  <ShoppingCart className="w-14 h-14 mb-4 opacity-20" />
                  <p className="font-medium">Your cart is empty</p>
                  <p className="text-sm mt-1">Add some products to get started.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    currency={currency}
                    onUpdateQty={onUpdateQty}
                    onRemove={onRemove}
                  />
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-border/50 px-6 py-5 space-y-4 bg-card/30 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-base">
                    {formatMoney(subtotal, currency)}
                  </span>
                </div>
                <Button className="w-full gap-2" size="lg" onClick={() => setStep("checkout")}>
                  Checkout <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleClose}>
                  Continue Shopping
                </Button>
              </div>
            )}
          </>
        )}

        {/* ── CHECKOUT FORM ─────────────────────────────────────────── */}
        {step === "checkout" && (
          <>
            <SheetHeader className="px-6 py-5 border-b border-border/50 shrink-0">
              <SheetTitle className="font-serif text-xl flex items-center gap-2">
                <button
                  onClick={() => setStep("cart")}
                  className="mr-1 p-1 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                Your Details
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Order summary pill */}
              <div className="bg-muted/30 rounded-xl px-4 py-3 flex items-center justify-between border border-border/40">
                <span className="text-sm text-muted-foreground">
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </span>
                <span className="font-semibold text-sm">{formatMoney(subtotal, currency)}</span>
              </div>

              <FormField label="Full name" icon={<User className="w-3.5 h-3.5" />} error={errors.name}>
                <Input value={customer.name} onChange={field("name")} placeholder="Ada Obi"
                  className={errors.name ? "border-destructive" : ""} />
              </FormField>

              <FormField label="Email address" icon={<Mail className="w-3.5 h-3.5" />} error={errors.email}>
                <Input type="email" value={customer.email} onChange={field("email")}
                  placeholder="ada@example.com"
                  className={errors.email ? "border-destructive" : ""} />
              </FormField>

              <FormField label="Phone number" icon={<Phone className="w-3.5 h-3.5" />} error={errors.phone}>
                <Input type="tel" value={customer.phone} onChange={field("phone")}
                  placeholder="+234 800 000 0000"
                  className={errors.phone ? "border-destructive" : ""} />
              </FormField>

              <FormField label="Delivery address" icon={<MapPin className="w-3.5 h-3.5" />} error={errors.address}>
                <Input value={customer.address} onChange={field("address")}
                  placeholder="12 Adeola Odeku St, Lagos"
                  className={errors.address ? "border-destructive" : ""} />
              </FormField>

              <FormField label="Order note (optional)" icon={<MessageSquare className="w-3.5 h-3.5" />} error={errors.note}>
                <Textarea value={customer.note} onChange={field("note")}
                  placeholder="Any special instructions for your order?"
                  rows={3} className="resize-none" />
              </FormField>

              <p className="text-xs text-muted-foreground">
                Your details are shared only with <strong>{storeName}</strong> to fulfil your order.
              </p>
            </div>

            <div className="border-t border-border/50 px-6 py-5 space-y-3 bg-card/30 shrink-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-base">{formatMoney(subtotal, currency)}</span>
              </div>
              <Button
                className="w-full gap-2" size="lg"
                onClick={handlePlaceOrder}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><ArrowRight className="w-4 h-4" /> Place Order</>
                }
              </Button>
            </div>
          </>
        )}

        {/* ── SUCCESS ───────────────────────────────────────────────── */}
        {step === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center py-16 gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">Order placed!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Thanks{customer.name ? `, ${customer.name.split(" ")[0]}` : ""}!
                Your order has been sent to <strong>{storeName}</strong>.
                They'll be in touch at <strong>{customer.email}</strong>.
              </p>
            </div>
            {orderRef && (
              <div className="bg-muted/30 rounded-xl px-5 py-3 border border-border/40 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Reference</p>
                <p className="font-mono font-bold text-lg">{orderRef}</p>
              </div>
            )}
            <Button className="w-full mt-4" onClick={handleClose}>Done</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CartItemRow({ item, currency, onUpdateQty, onRemove }: {
  item: CartItem; currency: string;
  onUpdateQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="flex gap-4 p-3 rounded-xl bg-card/50 border border-border/40">
      <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          : <Package className="w-6 h-6 text-muted-foreground opacity-40" />}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-medium text-sm leading-tight line-clamp-2">{item.name}</p>
        <p className="text-primary font-semibold text-sm">
          {formatMoney(item.priceCents * item.quantity, currency)}
        </p>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => item.quantity === 1 ? onRemove(item.id) : onUpdateQty(item.id, item.quantity - 1)}
            className="w-6 h-6 rounded-md border border-border/60 flex items-center justify-center hover:bg-muted/50 transition-colors"
          ><Minus className="w-3 h-3" /></button>
          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQty(item.id, item.quantity + 1)}
            className="w-6 h-6 rounded-md border border-border/60 flex items-center justify-center hover:bg-muted/50 transition-colors"
          ><Plus className="w-3 h-3" /></button>
          <button onClick={() => onRemove(item.id)}
            className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
          ><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, icon, error, children }: {
  label: string; icon: React.ReactNode; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}{label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
