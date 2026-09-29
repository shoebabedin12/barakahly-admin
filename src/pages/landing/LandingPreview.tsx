import { type LandingContent, type LandingProductOption, patternImage } from "../../lib/categoryLandings";
import { LandingIcon } from "./LandingIcon";

/** A scaled-down sketch of the storefront's CategoryLanding, so admins see
 * colour/layout changes as they type. Product cards are simplified. */
export function LandingPreview({
  categoryName,
  content,
  imageUrls,
  products,
}: {
  categoryName: string;
  content: LandingContent;
  imageUrls: { hero: string | null; promo: string | null };
  products: LandingProductOption[];
}) {
  const { theme, hero, highlights, featured, promo, story } = content;
  const withImages = products.filter((p) => p.active && p.image);
  const collage = withImages.slice(0, 3);

  const featuredProducts =
    featured.mode === "manual"
      ? featured.productIds.map((id) => products.find((p) => p.id === id)).filter((p): p is LandingProductOption => !!p)
      : products.filter((p) => p.active).slice(0, featured.limit);

  return (
    <div className="lp">
      <div className="lp-hero" style={{ background: theme.soft, backgroundImage: patternImage(theme.pattern, theme.accent) }}>
        <div className="lp-hero-text">
          {hero.eyebrow && <span className="lp-eyebrow" style={{ color: theme.accent }}>{hero.eyebrow}</span>}
          <h3 style={{ color: theme.ink }}>{hero.title || categoryName}</h3>
          {hero.subtitle && <p>{hero.subtitle}</p>}
          <span className="lp-btn" style={{ background: theme.accent }}>
            {hero.ctaLabel || "Shop now"} →
          </span>
        </div>
        <div className="lp-hero-media">
          {imageUrls.hero ? (
            <img src={imageUrls.hero} alt="" className="lp-hero-img" />
          ) : collage.length ? (
            <div className={`lp-collage lp-collage-${collage.length}`}>
              {collage.map((p) => (
                <img key={p.id} src={p.image!} alt="" style={{ borderColor: theme.soft }} />
              ))}
            </div>
          ) : (
            <div className="lp-hero-placeholder" style={{ background: theme.accent }} />
          )}
        </div>
      </div>

      {highlights.enabled && highlights.items.length > 0 && (
        <div className="lp-highlights">
          {highlights.items.map((item, i) => (
            <div key={i} className="lp-highlight">
              <span className="lp-highlight-icon" style={{ color: theme.accent, background: theme.soft }}>
                <LandingIcon name={item.icon} />
              </span>
              <div>
                <strong>{item.title || "Title"}</strong>
                <small>{item.text}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {featured.enabled && (
        <div className="lp-featured">
          <div className="lp-section-title" style={{ color: theme.ink }}>
            {featured.title || "Featured"}
          </div>
          {featured.subtitle && <small className="lp-muted">{featured.subtitle}</small>}
          <div className="lp-cards">
            {(featuredProducts.length ? featuredProducts : Array.from({ length: 4 }, () => null))
              .slice(0, 4)
              .map((p, i) => (
                <div key={p?.id ?? i} className="lp-card">
                  {p?.image ? <img src={p.image} alt="" /> : <span />}
                  <small>{p?.name ?? "Product"}</small>
                </div>
              ))}
          </div>
        </div>
      )}

      {promo.enabled && (
        <div className="lp-promo" style={{ background: theme.accent }}>
          <div>
            {promo.eyebrow && <span className="lp-eyebrow lp-eyebrow-light">{promo.eyebrow}</span>}
            <strong>{promo.title || "Promo title"}</strong>
            {promo.text && <small>{promo.text}</small>}
            {promo.ctaLabel && <span className="lp-btn lp-btn-light" style={{ color: theme.accent }}>{promo.ctaLabel}</span>}
          </div>
          {imageUrls.promo && <img src={imageUrls.promo} alt="" />}
        </div>
      )}

      <div className="lp-grid-note">↓ Filters and full product grid (same on every category)</div>

      {story.enabled && (story.title || story.text) && (
        <div className="lp-story">
          <strong style={{ color: theme.ink }}>{story.title}</strong>
          <small>{story.text}</small>
        </div>
      )}
    </div>
  );
}
