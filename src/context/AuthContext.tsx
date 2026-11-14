import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { login as loginRequest, me as meRequest, twoFactorChallenge } from "../lib/adminAuth";
import { getToken, setToken } from "../lib/auth";
import type { AdminUser } from "../lib/types";

interface AuthContextValue {
  admin: AdminUser | null;
  loading: boolean;
  /** Resolves to a challenge token when the account has 2FA on; finish with verifyTwoFactor. */
  login: (email: string, password: string) => Promise<{ challengeToken: string } | null>;
  verifyTwoFactor: (challengeToken: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setAdmin(null);
      setLoading(false);
      return;
    }
    try {
      const user = await meRequest();
      setAdmin(user);
    } catch {
      setToken(null);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function login(email: string, password: string) {
    const res = await loginRequest(email, password);
    if (res.twoFactorRequired) return { challengeToken: res.challengeToken };
    setToken(res.token);
    setAdmin(res.user);
    return null;
  }

  async function verifyTwoFactor(challengeToken: string, code: string) {
    const { token, user } = await twoFactorChallenge(challengeToken, code);
    setToken(token);
    setAdmin(user);
  }

  function logout() {
    setToken(null);
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, verifyTwoFactor, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
