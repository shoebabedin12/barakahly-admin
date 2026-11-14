import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../lib/api";
import { twoFactorDisable, twoFactorEnable, twoFactorSetup, twoFactorStatus } from "../../lib/adminAuth";

type Setup = Awaited<ReturnType<typeof twoFactorSetup>>;

/** Two-factor authentication for the signed-in admin (Laravel's admin/security page). */
export function Security() {
  const { admin } = useAuth();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    twoFactorStatus()
      .then((s) => setEnabled(s.enabled))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load security settings."));
  }, []);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (enabled === null) return error ? <div className="form-error">{error}</div> : <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 620 }}>
      <div className="page-header">
        <h1>Security</h1>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Two-factor authentication</h2>
        <p style={{ marginTop: 0, color: "var(--color-muted)", fontSize: 14 }}>
          {enabled
            ? `On for ${admin?.email}. Signing in asks for a code from your authenticator app.`
            : "Protect this account with a code from an authenticator app (Google Authenticator, Microsoft Authenticator, Authy) as well as your password."}
        </p>

        {recoveryCodes && (
          <div className="card" style={{ padding: 16, margin: "16px 0", background: "var(--color-background)" }}>
            <p style={{ margin: "0 0 8px", fontWeight: 600 }}>Save these recovery codes now</p>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--color-muted)" }}>
              Each one signs you in once if you lose your phone. They won't be shown again.
            </p>
            <pre style={{ margin: 0, fontSize: 15, lineHeight: 1.8, columns: 2 }}>{recoveryCodes.join("\n")}</pre>
          </div>
        )}

        {!enabled && !setup && (
          <button type="button" className="btn-primary" disabled={busy} onClick={() => run(async () => setSetup(await twoFactorSetup()))}>
            Set up two-factor authentication
          </button>
        )}

        {!enabled && setup && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                const res = await twoFactorEnable(setup.setupToken, code);
                setRecoveryCodes(res.recoveryCodes);
                setEnabled(true);
                setSetup(null);
                setCode("");
              });
            }}
          >
            <p style={{ fontSize: 14 }}>1. Scan this QR code with your authenticator app:</p>
            <img src={setup.qrCode} alt="Two-factor QR code" width={220} height={220} style={{ background: "#fff", borderRadius: 8 }} />
            <p style={{ fontSize: 13, color: "var(--color-muted)" }}>
              Can't scan? Enter this key instead: <code style={{ userSelect: "all" }}>{setup.secret}</code>
            </p>
            <div className="field">
              <label htmlFor="code">2. Enter the 6-digit code it shows</label>
              <input id="code" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            {error && <div className="form-error">{error}</div>}
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={busy}>
                Turn on
              </button>
              <button type="button" className="btn-secondary" onClick={() => setSetup(null)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {enabled && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                await twoFactorDisable(password);
                setEnabled(false);
                setPassword("");
                setRecoveryCodes(null);
              });
            }}
          >
            <div className="field">
              <label htmlFor="password">Confirm your password to turn it off</label>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-danger" disabled={busy}>
              Turn off two-factor authentication
            </button>
          </form>
        )}

        {!setup && !enabled && error && <div className="form-error" style={{ marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}
