import { useState } from "react";
import { Link } from "wouter";
import { formatMoney } from "@/lib/format";
import { useListProducts, useGetStore, type Product } from "@/api/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Package, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

function statusVariant(status: Product["status"]) {
  if (status === "active") return "default";
  if (status === "draft") return "secondary";
  return "destructive";
}

function ProductPreview({
  product,
  currency,
  onClose,
}: {
  product: Product | null;
  currency: string;
  onClose: () => void;
}) {
  if (!product) return null;
  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Image */}
        <div className="w-full h-56 bg-secondary flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-16 h-16 text-muted-foreground opacity-30" />
          )}
        </div>

        <div className="p-6 space-y-4">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <DialogTitle className="text-xl font-serif leading-tight">
                {product.name}
              </DialogTitle>
              <Badge variant={statusVariant(product.status)} className="capitalize shrink-0 mt-0.5">
                {product.status}
              </Badge>
            </div>
          </DialogHeader>

          <p className="text-2xl font-bold text-primary">
            {formatMoney(product.priceCents, currency)}
          </p>

          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="bg-muted/40 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Category</p>
              <p className="text-sm font-medium">{product.category}</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Stock</p>
              <p className={`text-sm font-medium ${product.inventory < 10 ? "text-rose-400" : ""}`}>
                {product.inventory} units
              </p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">SKU</p>
              <p className="text-sm font-mono font-medium">{product.sku}</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              Added {format(new Date(product.createdAt), "MMM d, yyyy")}
            </span>
            <Link href={`/products/${product.id}`} onClick={onClose}>
              <Button size="sm" className="gap-2">
                <Edit className="w-3.5 h-3.5" />
                Edit Product
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Products() {
  const { data: store } = useGetStore();
  const { data: products, isLoading } = useListProducts();
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<Product | null>(null);

  const currency = store?.currency || "NGN";

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Inventory
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your catalog, stock, and pricing.
          </p>
        </div>
        <Link href="/products/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden shadow-lg shadow-black/5">
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU, or category..."
              className="pl-9 bg-background/50 border-border/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Loading inventory...</p>
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Added</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="border-border/50 group hover:bg-muted/10 transition-colors cursor-pointer"
                    onClick={() => setPreview(product)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden border border-border/50 flex-shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-medium text-foreground">
                          {product.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {product.sku}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.category}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariant(product.status)}
                        className="capitalize"
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(product.priceCents, currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          product.inventory < 10 ? "text-rose-400 font-medium" : ""
                        }
                      >
                        {product.inventory}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {format(new Date(product.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setPreview(product)}
                          >
                            <Package className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <Link href={`/products/${product.id}`}>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit product
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-serif font-bold mb-1">
              No products found
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              {search
                ? "We couldn't find any products matching your search."
                : "Your catalog is currently empty. Add your first product to start selling."}
            </p>
            {search ? (
              <Button variant="outline" onClick={() => setSearch("")}>
                Clear search
              </Button>
            ) : (
              <Link href="/products/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add First Product
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Product preview modal */}
      <ProductPreview
        product={preview}
        currency={currency}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
