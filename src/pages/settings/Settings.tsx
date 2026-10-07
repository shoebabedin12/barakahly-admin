import { type ReactNode, useEffect, useState } from "react";
import { CheckboxField, TextField } from "../../components/ResourceForm";
import { ApiError } from "../../lib/api";
import { settingsApi, type StoreSettings } from "../../lib/store";

const TEXT_FIELDS = [
  "siteName",
  "contactEmail",
  "contactPhone",
  "address",
  "currency",
  "shippingCharge",
  "facebook",
  "instagram",
  "youtube",
  "whatsapp",
  "facebookPixelId",
  "gtmId",
  "clarityProjectId",
  "metaTitle",
  "metaDescription",
  "mailHost",
  "mailPort",
  "mailEncryption",
  "mailUsername",
  "mailFromAddress",
  "mailFromName",
] as const;

type TextFieldName = (typeof TEXT_FIELDS)[number];

/** "2026-10-07T17:00:00.000Z" -> "2026-10-07T23:00" in the admin's local time, for datetime-local inputs. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card" style={{ padding: 24, marginBottom: 20 }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 16 }}>{title}</h2>
      {children}
    </div>
  );
}

export function Settings() {
  const [values, setValues] = useState<Record<TextFieldName, string>>(
    () => Object.fromEntries(TEXT_FIELDS.map((f) => [f, ""])) as Record<TextFieldName, string>,
  );
  const [flashDealEndsAt, setFlashDealEndsAt] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [mailPassword, setMailPassword] = useState("");
  const [hasMailPassword, setHasMailPassword] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function fill(s: StoreSettings) {
    setValues(
      Object.fromEntries(
        TEXT_FIELDS.map((f) => [f, f === "shippingCharge" ? String(Number(s.shippingCharge)) : (s[f] ?? "")]),
      ) as Record<TextFieldName, string>,
    );
    setFlashDealEndsAt(toLocalInput(s.flashDealEndsAt));
    setMaintenanceMode(s.maintenanceMode);
    setHasMailPassword(s.hasMailPassword);
    setLogoUrl(s.logoUrl);
    setFaviconUrl(s.faviconUrl);
    setMailPassword("");
    setLogo(null);
    setFavicon(null);
  }

  useEffect(() => {
    settingsApi
      .get()
      .then(fill)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load settings."))
      .finally(() => setLoading(false));
  }, []);

  const field = (name: TextFieldName, label: string, extra: Partial<Parameters<typeof TextField>[0]> = {}) => (
    <TextField id={name} label={label} value={values[name]} onChange={(v) => setValues((cur) => ({ ...cur, [name]: v }))} {...extra} />
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const form = new FormData();
    TEXT_FIELDS.forEach((f) => form.append(f, values[f]));
    form.append("flashDealEndsAt", flashDealEndsAt ? new Date(flashDealEndsAt).toISOString() : "");
    form.append("maintenanceMode", String(maintenanceMode));
    if (mailPassword) form.append("mailPassword", mailPassword);
    if (logo) form.append("logo", logo);
    if (favicon) form.append("favicon", favicon);

    try {
      fill(await settingsApi.update(form));
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  const imagePicker = (label: string, current: string | null, file: File | null, onPick: (f: File | null) => void) => (
    <div className="field">
      <label>{label}</label>
      {(file || current) && (
        <img src={file ? URL.createObjectURL(file) : (current as string)} alt="" style={{ maxHeight: 64, display: "block", marginBottom: 8 }} />
      )}
      <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
    </div>
  );

  return (
    <form onSubmit={save} style={{ maxWidth: 760 }}>
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <Section title="Store">
        {field("siteName", "Store name", { required: true })}
        {field("contactEmail", "Contact email", { type: "email", hint: "New-order notifications are sent here." })}
        {field("contactPhone", "Contact phone")}
        {field("address", "Address", { textarea: true })}
        {field("currency", "Currency", { required: true })}
        {field("shippingCharge", "Default shipping charge (৳)", { type: "number", step: "0.01", required: true })}
      </Section>

      <Section title="Branding">
        {imagePicker("Logo", logoUrl, logo, setLogo)}
        {imagePicker("Favicon", faviconUrl, favicon, setFavicon)}
      </Section>

      <Section title="Social links">
        {field("facebook", "Facebook page URL", { placeholder: "https://facebook.com/..." })}
        {field("instagram", "Instagram URL", { placeholder: "https://instagram.com/..." })}
        {field("youtube", "YouTube URL", { placeholder: "https://youtube.com/..." })}
        {field("whatsapp", "WhatsApp number")}
      </Section>

      <Section title="Marketing & tracking">
        {field("facebookPixelId", "Facebook Pixel ID", { hint: "Tracks PageView, AddToCart and Purchase on the storefront." })}
        {field("gtmId", "Google Tag Manager ID", { placeholder: "GTM-XXXXXXX" })}
        {field("clarityProjectId", "Microsoft Clarity project ID")}
        <TextField id="flashDealEndsAt" label="Flash deal ends at" type="datetime-local" value={flashDealEndsAt} onChange={setFlashDealEndsAt} hint="Drives the countdown on the home page. Leave blank to hide it." />
      </Section>

      <Section title="SEO">
        {field("metaTitle", "Meta title")}
        {field("metaDescription", "Meta description", { textarea: true })}
      </Section>

      <Section title="Email (SMTP)">
        <p style={{ marginTop: 0, fontSize: 13, color: "var(--color-muted)" }}>
          Used for checkout verification codes and order emails. Guests can't check out until this works.
        </p>
        {field("mailHost", "SMTP host", { placeholder: "smtp.example.com" })}
        {field("mailPort", "Port", { placeholder: "587" })}
        <div className="field">
          <label htmlFor="mailEncryption">Encryption</label>
          <select id="mailEncryption" value={values.mailEncryption} onChange={(e) => setValues((cur) => ({ ...cur, mailEncryption: e.target.value }))}>
            <option value="">None</option>
            <option value="tls">TLS (port 587)</option>
            <option value="ssl">SSL (port 465)</option>
          </select>
        </div>
        {field("mailUsername", "Username")}
        <TextField
          id="mailPassword"
          label="Password"
          type="password"
          value={mailPassword}
          onChange={setMailPassword}
          hint={hasMailPassword ? "A password is saved. Leave blank to keep it." : undefined}
        />
        {field("mailFromAddress", "From address", { type: "email" })}
        {field("mailFromName", "From name")}
      </Section>

      <Section title="Maintenance">
        <CheckboxField id="maintenanceMode" label="Maintenance mode (storefront shows a 'back soon' page)" checked={maintenanceMode} onChange={setMaintenanceMode} />
      </Section>

      {error && <div className="form-error">{error}</div>}
      {saved && <div className="badge badge-active" style={{ display: "inline-block", marginBottom: 12 }}>Settings saved.</div>}

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save settings"}
        </button>
      </div>
    </form>
  );
}
