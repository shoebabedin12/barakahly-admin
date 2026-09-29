import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../lib/api";
import {
  getLanding,
  LANDING_ICONS,
  LANDING_PATTERNS,
  type LandingContent,
  type LandingEditorData,
  type LandingIconName,
  saveLanding,
  STOREFRONT_URL,
  THEME_PRESETS,
  uploadLandingImage,
} from "../../lib/categoryLandings";
import { LandingIcon } from "./LandingIcon";
import { LandingPreview } from "./LandingPreview";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="landing-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="landing-toggle-track" aria-hidden />
      <span>{label}</span>
    </label>
  );
}

function Section({
  title,
  hint,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  hint?: string;
  enabled?: boolean;
  onToggle?: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <section className={`card landing-section ${enabled === false ? "is-off" : ""}`}>
      <header className="landing-section-head">
        <div>
          <h2>{title}</h2>
          {hint && <p>{hint}</p>}
        </div>
        {onToggle && <Toggle checked={!!enabled} onChange={onToggle} label={enabled ? "Shown" : "Hidden"} />}
      </header>
      {enabled !== false && <div className="landing-section-body">{children}</div>}
    </section>
  );
}

function ImageField({
  label,
  url,
  uploading,
  onPick,
  onRemove,
  hint,
}: {
  label: string;
  url: string | null;
  uploading: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
  hint: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="landing-image-field">
        {url ? <img src={url} alt="" /> : <div className="landing-image-empty">No image</div>}
        <div>
          <label className="btn-secondary landing-upload-btn">
            {uploading ? "Uploading..." : url ? "Replace image" : "Upload image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPick(file);
                e.target.value = "";
              }}
            />
          </label>
          {url && (
            <button type="button" className="btn-danger" onClick={onRemove}>
              Remove
            </button>
          )}
          <p className="landing-hint">{hint}</p>
        </div>
      </div>
    </div>
  );
}

export function LandingEditor() {
  const { categoryId } = useParams();
  const id = Number(categoryId);

  const [data, setData] = useState<LandingEditorData | null>(null);
  const [content, setContent] = useState<LandingContent | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [imageUrls, setImageUrls] = useState<{ hero: string | null; promo: string | null }>({ hero: null, promo: null });
  const [uploading, setUploading] = useState<"hero" | "promo" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    getLanding(id)
      .then((res) => {
        setData(res);
        setContent(res.content);
        setIsActive(res.isActive);
        setImageUrls(res.imageUrls);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load this landing page."));
  }, [id]);

  if (!content || !data) {
    return error ? <div className="form-error">{error}</div> : <p>Loading...</p>;
  }

  function update<K extends keyof LandingContent>(section: K, patch: Partial<LandingContent[K]>) {
    setContent((prev) => (prev ? { ...prev, [section]: { ...prev[section], ...patch } } : prev));
    setDirty(true);
  }

  function updateItem(index: number, patch: Partial<LandingContent["highlights"]["items"][number]>) {
    update("highlights", {
      items: content!.highlights.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
  }

  function toggleProduct(productId: number) {
    const ids = content!.featured.productIds;
    update("featured", {
      productIds: ids.includes(productId) ? ids.filter((x) => x !== productId) : [...ids, productId].slice(0, 12),
    });
  }

  async function handleUpload(section: "hero" | "promo", file: File) {
    setUploading(section);
    setError(null);
    try {
      const res = await uploadLandingImage(file);
      update(section, { image: res.path });
      setImageUrls((prev) => ({ ...prev, [section]: res.url }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not upload the image.");
    } finally {
      setUploading(null);
    }
  }

  function removeImage(section: "hero" | "promo") {
    update(section, { image: null });
    setImageUrls((prev) => ({ ...prev, [section]: null }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await saveLanding(id, isActive, content!);
      setContent(res.content);
      setImageUrls(res.imageUrls);
      setSavedAt(new Date());
      setDirty(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the landing page.");
    } finally {
      setSaving(false);
    }
  }

  const { theme, hero, highlights, featured, promo, story } = content;
  const storefrontUrl = `${STOREFRONT_URL}/products?category=${data.category.slug}`;

  return (
    <div>
      <div className="page-header landing-editor-header">
        <div>
          <Link to="/landing-pages" className="landing-back">
            ← All landing pages
          </Link>
          <h1>{data.category.name}</h1>
        </div>
        <div className="landing-header-actions">
          {savedAt && !dirty && <span className="landing-saved">Saved ✓</span>}
          {dirty && <span className="landing-unsaved">Unsaved changes</span>}
          <a href={storefrontUrl} target="_blank" rel="noreferrer" className="btn-secondary">
            View on website
          </a>
          <button type="button" className="btn-primary landing-save" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="landing-editor">
        <div className="landing-form">
          <section className={`card landing-publish ${isActive ? "is-live" : ""}`}>
            <div>
              <h2>{isActive ? "Live on the website" : "Not live yet"}</h2>
              <p>
                {isActive
                  ? "Shoppers see this design at the top of the category page."
                  : "Turn this on and save to show the design on the website."}
              </p>
            </div>
            <Toggle
              checked={isActive}
              onChange={(v) => {
                setIsActive(v);
                setDirty(true);
              }}
              label={isActive ? "Live" : "Off"}
            />
          </section>

          <Section title="Theme" hint="Colours and background pattern for this category.">
            <div className="landing-presets">
              {THEME_PRESETS.map((preset) => {
                const selected = preset.accent === theme.accent && preset.soft === theme.soft;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    className={`landing-preset ${selected ? "is-selected" : ""}`}
                    onClick={() => update("theme", { accent: preset.accent, soft: preset.soft, ink: preset.ink })}
                  >
                    <span className="landing-preset-chip" style={{ background: preset.soft }}>
                      <span style={{ background: preset.accent }} />
                    </span>
                    {preset.name}
                  </button>
                );
              })}
            </div>

            <div className="landing-colors">
              {(
                [
                  ["accent", "Accent (buttons, icons)"],
                  ["soft", "Background tint"],
                  ["ink", "Heading colour"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="landing-color">
                  <input type="color" value={theme[key]} onChange={(e) => update("theme", { [key]: e.target.value.toUpperCase() })} />
                  <span>
                    {label}
                    <code>{theme[key]}</code>
                  </span>
                </label>
              ))}
            </div>

            <div className="field">
              <label>Background pattern</label>
              <div className="landing-chips">
                {LANDING_PATTERNS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`landing-chip ${theme.pattern === p ? "is-selected" : ""}`}
                    onClick={() => update("theme", { pattern: p })}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Hero" hint="The big banner at the top of the category page.">
            <div className="landing-grid-2">
              <div className="field">
                <label>Small label above title</label>
                <input value={hero.eyebrow} maxLength={60} placeholder="e.g. New season" onChange={(e) => update("hero", { eyebrow: e.target.value })} />
              </div>
              <div className="field">
                <label>Button text</label>
                <input value={hero.ctaLabel} maxLength={30} onChange={(e) => update("hero", { ctaLabel: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Title</label>
              <input value={hero.title} maxLength={90} placeholder={data.category.name} onChange={(e) => update("hero", { title: e.target.value })} />
            </div>
            <div className="field">
              <label>Subtitle</label>
              <textarea rows={2} value={hero.subtitle} maxLength={240} onChange={(e) => update("hero", { subtitle: e.target.value })} />
            </div>
            <ImageField
              label="Hero image"
              url={imageUrls.hero}
              uploading={uploading === "hero"}
              onPick={(f) => handleUpload("hero", f)}
              onRemove={() => removeImage("hero")}
              hint="Optional. Without an image, a collage of this category's product photos is shown. Wide JPG/PNG/WebP, max 4 MB."
            />
          </Section>

          <Section
            title="Highlights"
            hint="Up to 4 short selling points shown under the hero."
            enabled={highlights.enabled}
            onToggle={(v) => update("highlights", { enabled: v })}
          >
            <div className="landing-items">
              {highlights.items.map((item, index) => (
                <div key={index} className="landing-item">
                  <div className="landing-icon-pick">
                    <LandingIcon name={item.icon} className="landing-icon-preview" />
                    <select value={item.icon} onChange={(e) => updateItem(index, { icon: e.target.value as LandingIconName })}>
                      {LANDING_ICONS.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input value={item.title} maxLength={40} placeholder="Title" onChange={(e) => updateItem(index, { title: e.target.value })} />
                  <input value={item.text} maxLength={80} placeholder="Short text" onChange={(e) => updateItem(index, { text: e.target.value })} />
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => update("highlights", { items: highlights.items.filter((_, i) => i !== index) })}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {highlights.items.length < 4 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => update("highlights", { items: [...highlights.items, { icon: "sparkles", title: "", text: "" }] })}
              >
                + Add highlight
              </button>
            )}
          </Section>

          <Section
            title="Featured products"
            hint="A row of product cards under the highlights."
            enabled={featured.enabled}
            onToggle={(v) => update("featured", { enabled: v })}
          >
            <div className="landing-grid-2">
              <div className="field">
                <label>Section title</label>
                <input value={featured.title} maxLength={60} onChange={(e) => update("featured", { title: e.target.value })} />
              </div>
              <div className="field">
                <label>Subtitle</label>
                <input value={featured.subtitle} maxLength={140} onChange={(e) => update("featured", { subtitle: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Which products?</label>
              <div className="landing-chips">
                <button
                  type="button"
                  className={`landing-chip ${featured.mode === "auto" ? "is-selected" : ""}`}
                  onClick={() => update("featured", { mode: "auto" })}
                >
                  Best sellers (automatic)
                </button>
                <button
                  type="button"
                  className={`landing-chip ${featured.mode === "manual" ? "is-selected" : ""}`}
                  onClick={() => update("featured", { mode: "manual" })}
                >
                  I'll pick them
                </button>
              </div>
            </div>

            {featured.mode === "auto" ? (
              <div className="field landing-limit">
                <label>How many</label>
                <select value={featured.limit} onChange={(e) => update("featured", { limit: Number(e.target.value) })}>
                  {[4, 8, 12].map((n) => (
                    <option key={n} value={n}>
                      {n} products
                    </option>
                  ))}
                </select>
              </div>
            ) : data.products.length === 0 ? (
              <p className="landing-hint">This category has no products yet.</p>
            ) : (
              <>
                <p className="landing-hint">
                  Click to select, in the order you want them shown ({featured.productIds.length}/12 selected).
                </p>
                <div className="landing-products">
                  {data.products.map((product) => {
                    const position = featured.productIds.indexOf(product.id);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        className={`landing-product ${position >= 0 ? "is-selected" : ""}`}
                        onClick={() => toggleProduct(product.id)}
                        disabled={!product.active}
                        title={product.active ? product.name : "Inactive product"}
                      >
                        {product.image ? <img src={product.image} alt="" /> : <span className="landing-image-empty" />}
                        <span className="landing-product-name">{product.name}</span>
                        {position >= 0 && <span className="landing-product-pos">{position + 1}</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </Section>

          <Section
            title="Promo banner"
            hint="A wide banner for an offer or collection."
            enabled={promo.enabled}
            onToggle={(v) => update("promo", { enabled: v })}
          >
            <div className="landing-grid-2">
              <div className="field">
                <label>Small label</label>
                <input value={promo.eyebrow} maxLength={40} placeholder="e.g. Limited offer" onChange={(e) => update("promo", { eyebrow: e.target.value })} />
              </div>
              <div className="field">
                <label>Title</label>
                <input value={promo.title} maxLength={80} onChange={(e) => update("promo", { title: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Text</label>
              <textarea rows={2} value={promo.text} maxLength={200} onChange={(e) => update("promo", { text: e.target.value })} />
            </div>
            <div className="landing-grid-2">
              <div className="field">
                <label>Button text</label>
                <input value={promo.ctaLabel} maxLength={30} onChange={(e) => update("promo", { ctaLabel: e.target.value })} />
              </div>
              <div className="field">
                <label>Button link</label>
                <input
                  value={promo.ctaHref}
                  maxLength={300}
                  placeholder={`/products?category=${data.category.slug}`}
                  onChange={(e) => update("promo", { ctaHref: e.target.value })}
                />
                <p className="landing-hint">A page on this website, starting with “/”.</p>
              </div>
            </div>
            <ImageField
              label="Banner image"
              url={imageUrls.promo}
              uploading={uploading === "promo"}
              onPick={(f) => handleUpload("promo", f)}
              onRemove={() => removeImage("promo")}
              hint="Optional. Shown on the right side of the banner."
            />
          </Section>

          <Section
            title="About this category"
            hint="A short paragraph at the bottom. Good for Google search too."
            enabled={story.enabled}
            onToggle={(v) => update("story", { enabled: v })}
          >
            <div className="field">
              <label>Heading</label>
              <input value={story.title} maxLength={90} onChange={(e) => update("story", { title: e.target.value })} />
            </div>
            <div className="field">
              <label>Text</label>
              <textarea rows={5} value={story.text} maxLength={1500} onChange={(e) => update("story", { text: e.target.value })} />
            </div>
          </Section>
        </div>

        <aside className="landing-preview-wrap">
          <div className="landing-preview-label">Live preview</div>
          <LandingPreview
            categoryName={data.category.name}
            content={content}
            imageUrls={imageUrls}
            products={data.products}
          />
        </aside>
      </div>
    </div>
  );
}
