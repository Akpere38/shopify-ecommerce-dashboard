import { useParams } from "wouter";
import { useGetPublicStore, getGetPublicStoreQueryKey } from "@/api/mock";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Loader2, Package, ShoppingBag, Store, MapPin, Mail } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function PublicStore() {
  const params = useParams();
  const slug = params.slug as string;
  const { data, isLoading, error } = useGetPublicStore(slug, {
    query: {
      enabled: !!slug,
      queryKey: getGetPublicStoreQueryKey(slug),
    }
  });
  const { toast } = useToast();
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center animate-pulse text-primary">
          <Store className="w-12 h-12 mb-4 opacity-50" />
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Store className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-20" />
          <h1 className="text-3xl font-serif font-bold mb-2">Store not found</h1>
          <p className="text-muted-foreground">The boutique you are looking for does not exist or has been closed.</p>
        </div>
      </div>
    );
  }

  const { store, products } = data;
  const currency = store.currency || "USD";

  const handleAddToCart = (productId: number) => {
    setAddingToCart(productId);
    setTimeout(() => {
      setAddingToCart(null);
      toast({
        title: "Added to cart",
        description: "Your item has been added to your shopping bag.",
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Store className="w-5 h-5" />
              </div>
            )}
            <span className="font-serif font-bold text-xl tracking-tight">{store.name}</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full relative group">
            <ShoppingBag className="w-5 h-5 group-hover:text-primary transition-colors" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full opacity-0 scale-0 transition-all group-hover:opacity-100 group-hover:scale-100" />
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32 px-4 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
            <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-secondary/20 blur-[100px]" />
          </div>

          <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-foreground mb-6 leading-tight">
              {store.tagline || store.name}
            </h1>
            {store.description && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
                {store.description}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground font-medium uppercase tracking-widest">
              {store.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {store.location}
                </div>
              )}
              {store.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {store.contactEmail}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 max-w-6xl mx-auto">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  className="group flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-[4/5] rounded-2xl bg-secondary/30 mb-6 overflow-hidden relative border border-border/20">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
                        <Package className="w-16 h-16 mb-4 opacity-50" />
                        <span className="text-sm font-medium tracking-widest uppercase">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                      <Button 
                        className="w-full bg-primary/90 hover:bg-primary text-primary-foreground backdrop-blur-md border border-primary-foreground/10 shadow-xl"
                        onClick={() => handleAddToCart(product.id)}
                        disabled={addingToCart === product.id || product.inventory === 0}
                      >
                        {addingToCart === product.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : product.inventory === 0 ? (
                          "Out of Stock"
                        ) : (
                          "Add to Bag"
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-serif font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <span className="font-medium text-foreground tracking-tight whitespace-nowrap">
                        {formatMoney(product.priceCents, currency)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground mt-auto pt-4 border-t border-border/30">
                      <span>{product.category}</span>
                      {product.inventory > 0 && product.inventory < 10 && (
                        <span className="text-accent">Only {product.inventory} left</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center text-muted-foreground flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
                <Package className="w-10 h-10 opacity-50" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-2 text-foreground">Coming Soon</h3>
              <p className="max-w-md mx-auto">This boutique is currently curating their collection. Check back later for exquisite goods.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="py-12 border-t border-border/50 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} {store.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
