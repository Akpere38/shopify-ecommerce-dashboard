/**
 * App.tsx
 * Updated to wrap the entire app with AuthProvider + AuthGate.
 * No other files need to change for auth to work.
 */

import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Dashboard    from "@/pages/dashboard";
import Products     from "@/pages/products";
import ProductEdit  from "@/pages/product-edit";
import Settings     from "@/pages/settings";
import PublicStore  from "@/pages/public-store";
import Orders       from "@/pages/Orders";

// ── NEW: Auth imports ─────────────────────────────────────────────────────────
import { AuthProvider, AuthGate } from "@/context/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Switch>
      {/* Public store — no auth needed, customers visit this */}
      <Route path="/s/:slug" component={PublicStore} />

      {/* All dashboard routes — protected by AuthGate above */}
      <Route>
        <ProtectedLayout>
          <Switch>
            <Route path="/"              component={Dashboard} />
            <Route path="/products"      component={Products} />
            <Route path="/products/new"  component={ProductEdit} />
            <Route path="/products/:id"  component={ProductEdit} />
            <Route path="/orders"        component={Orders} />
            <Route path="/settings"      component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </ProtectedLayout>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>

          {/*
           * AuthProvider — validates the token on load.
           *   - Reads ?auth_token_validation=<jwt> from the URL
           *   - Calls POST /auth/validate-token-access
           *   - Valid   → stores JWT, hydrates user + store, cleans URL
           *   - Invalid → redirects to accounts.mydartdigital.com
           *
           * AuthGate — shows a loading spinner while validation is in flight.
           *   - Once done, renders the app normally.
           *   - The public store /s/:slug is OUTSIDE AuthGate so customers
           *     can browse without being redirected.
           */}
          <AuthProvider>
            <Switch>
              {/* Public store bypasses auth entirely */}
              <Route path="/s/:slug" component={PublicStore} />

              {/* Everything else requires a valid session */}
              <Route>
                <AuthGate>
                  <Router />
                </AuthGate>
              </Route>
            </Switch>
          </AuthProvider>

        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}