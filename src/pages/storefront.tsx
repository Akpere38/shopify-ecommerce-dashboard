import { useGetStore } from "@/api/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, ExternalLink, QrCode, Store, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Storefront() {
  const { data: store, isLoading } = useGetStore();
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store?.slug) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
          <Store className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-2">Set up your storefront</h2>
        <p className="text-muted-foreground mb-6">
          You need to choose a URL slug for your store before you can share it with customers.
        </p>
        <Link href="/settings">
          <Button>Go to Settings</Button>
        </Link>
      </div>
    );
  }

  const baseUrl = window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, "");
  const storeUrl = `${baseUrl}/s/${store.slug}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Share Your Store</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your public storefront is live. Share this link with your customers.
        </p>
      </div>

      <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/50">
          <CardTitle>Your Public Link</CardTitle>
          <CardDescription>Anyone with this link can view your active products</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Input 
                readOnly 
                value={storeUrl} 
                className="bg-background/50 font-mono text-sm pl-4 pr-24 h-12" 
              />
              <Button 
                size="sm" 
                variant="secondary" 
                className="absolute right-1 top-1 h-10 w-20"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <a href={storeUrl} target="_blank" rel="noopener noreferrer">
              <Button className="h-12 w-full sm:w-auto px-6 gap-2">
                Open Link
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-border/50">
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Quick Actions</h3>
              <div className="grid gap-2">
                <Button variant="outline" className="justify-start h-auto py-3 px-4" onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out my store!&url=${encodeURIComponent(storeUrl)}`, '_blank')}>
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.96H5.078z" /></svg>
                  Share on X (Twitter)
                </Button>
                <Button variant="outline" className="justify-start h-auto py-3 px-4" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`, '_blank')}>
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                  Share on Facebook
                </Button>
                <Button variant="outline" className="justify-start h-auto py-3 px-4">
                  <QrCode className="w-5 h-5 mr-3 text-muted-foreground" />
                  Download QR Code
                </Button>
              </div>
            </div>
            <div className="bg-secondary/30 rounded-xl p-6 border border-border/50 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Store className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-serif font-bold text-lg">{store.name}</h4>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{store.tagline || "Your curated storefront"}</p>
              <Link href={`/s/${store.slug}`}>
                <Button variant="link" className="text-primary h-auto py-1">Preview Storefront</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
