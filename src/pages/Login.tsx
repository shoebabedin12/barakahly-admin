import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

export function Login() {
  const { login, verifyTwoFactor } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [code, setCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (challengeToken) {
        await verifyTwoFactor(challengeToken, code);
        navigate("/", { replace: true });
        return;
      }
      const challenge = await login(email, password);
      if (challenge) {
        setChallengeToken(challenge.challengeToken);
        return;
      }
      navigate("/", { replace: true });
    } catch (err) {
      if (challengeToken && err instanceof ApiError && err.status === 401) {
        // The 5-minute step expired: back to email + password.
        setChallengeToken(null);
        setCode("");
      }
      setError(err instanceof ApiError ? err.message : "Could not sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Barakahly Admin</h1>
        <p className="subtitle">Sign in to manage the store.</p>

        <form onSubmit={handleSubmit}>
          {challengeToken ? (
            <div className="field">
              <label htmlFor="code">Authentication code</label>
              <input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--color-muted)" }}>
                Enter the 6-digit code from your authenticator app, or one of your recovery codes.
              </p>
            </div>
          ) : (
            <>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          )}

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Signing in..." : challengeToken ? "Verify" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
