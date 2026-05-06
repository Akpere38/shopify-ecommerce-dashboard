import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ── CONFIG ─────────────────────────────────────────────────────────────

const GATEWAY = "https://gateway.mydartdigital.com";
const ACCOUNTS_URL = "https://account.mydartdigital.com";
const API_KEY = import.meta.env.VITE_API_KEY ?? "";
const TOKEN_KEY = "dart_jwt";

/**
 * AUTH MODES:
 * dev  → bypass real backend (UI testing only)
 * prod → real gateway validation
 */
const AUTH_MODE = import.meta.env.VITE_AUTH_MODE ?? "prod";

// ── TYPES ──────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuthStore {
  id: string;
  name: string;
  slug: string;
  [key: string]: unknown;
}

interface AuthState {
  user: AuthUser | null;
  store: AuthStore | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  logout: () => void;
  setStore: (store: AuthStore) => void;
}

// ── CONTEXT ────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ── PROVIDER ───────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    store: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    validateOnLoad();
  }, []);

  async function validateOnLoad() {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("auth_token_validation");
    const storedToken = localStorage.getItem(TOKEN_KEY);

    const tokenToValidate = urlToken ?? storedToken;

    // ─────────────────────────────────────────────
    // 🧪 DEV MODE (NO BACKEND REQUIRED)
    // ─────────────────────────────────────────────
    if (AUTH_MODE === "dev") {
      console.warn("[Auth] DEV MODE ACTIVE");

      setState({
        user: {
          id: "dev_user_1",
          firstName: "Raphael",
          lastName: "Dev",
          email: "dev@local.com",
        },
        store: {
          id: "store_1",
          name: "Tech Haven",
          slug: "tech-haven",
        },
        token: "dev_token",
        loading: false,
      });

      return;
    }

    // ─────────────────────────────────────────────
    // NO TOKEN → redirect
    // ─────────────────────────────────────────────
    if (!tokenToValidate) {
      redirectToAccounts();
      return;
    }

    try {
      const res = await fetch(`${GATEWAY}/auth/validate-token-access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          Authorization: `Bearer ${tokenToValidate}`,
        },
      });

      const data = await res.json();

      console.log("Auth Status:", res.status);
      console.log("Auth Response:", data);

      if (!res.ok) {
        localStorage.removeItem(TOKEN_KEY);
        redirectToAccounts();
        return;
      }

      // ── SAVE TOKEN ─────────────────────────────
      localStorage.setItem(TOKEN_KEY, tokenToValidate);

      // ── CLEAN URL ──────────────────────────────
      if (urlToken) {
        window.history.replaceState({}, "", window.location.pathname);
      }

      // ── SET STATE ──────────────────────────────
      setState({
        user: data.user ?? null,
        store: data.store ?? null,
        token: tokenToValidate,
        loading: false,
      });

    } catch (err) {
      console.error("[Auth] validation error:", err);
      localStorage.removeItem(TOKEN_KEY);
      redirectToAccounts();
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    redirectToAccounts();
  }

  function setStore(store: AuthStore) {
    setState((prev) => ({ ...prev, store }));
  }

  function redirectToAccounts() {
    // 🚫 prevent redirect in dev
    if (AUTH_MODE === "dev") {
      console.warn("[Auth] Redirect blocked (dev mode)");
      return;
    }

    window.location.href = ACCOUNTS_URL;
  }

  return (
    <AuthContext.Provider value={{ ...state, logout, setStore }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── AUTH GATE ──────────────────────────────────────────────────────────

export function AuthGate({ children }: { children: ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Verifying session...</p>
      </div>
    );
  }

  return <>{children}</>;
}

// ── API FETCH HELPER ───────────────────────────────────────────────────

export function useApiFetch() {
  const { token } = useAuth();

  return async function apiFetch(path: string, options: RequestInit = {}) {
    return fetch(`${GATEWAY}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  };
}