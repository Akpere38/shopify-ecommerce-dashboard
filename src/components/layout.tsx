import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useGetStore } from "@/api/mock";
import { LayoutDashboard, Package, Settings, Share2, Store as StoreIcon, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { data: store } = useGetStore();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/products", label: "Products", icon: Package },
    { href: "/storefront", label: "Storefront", icon: Share2 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-sidebar/50 backdrop-blur-xl flex flex-col sticky top-0 md:h-screen">
        {/* App brand — always "Dart Digital Store Front" */}
        <div className="p-6 flex items-center gap-3 border-b border-border/50">
<div className="w-20 h-20 rounded-xl bg-[#1a1a1a] flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
  <img src="/Dart Digital_Icon (1).png" alt="Dart Digital" className="w-18 h-18 object-contain" />
</div>
          <div className="flex-1 min-w-0">
            <h2 className="font-serif font-bold text-m leading-tight">
              Dart Digital
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              Store Front
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
          {links.map((link) => {
            const isActive =
              location === link.href ||
              (link.href !== "/" && location.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} className="min-w-fit">
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 transition-all duration-300",
                    isActive
                      ? "shadow-sm shadow-black/20"
                      : "opacity-70 hover:opacity-100"
                  )}
                >
                  <link.icon
                    className={cn(
                      "w-4 h-4",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span>{link.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {store?.slug && (
          <div className="p-4 border-t border-border/50 hidden md:block">
            <Link href={`/s/${store.slug}`}>
              <Button
                variant="outline"
                className="w-full gap-2 text-primary border-primary/20 hover:bg-primary/10"
              >
                <StoreIcon className="w-4 h-4" />
                View Live Store
              </Button>
            </Link>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
