import { useRef, useState } from "react";
import { ActiveBadge, ResourceList } from "../../components/ResourceList";
import { CheckboxField, FormCard, TextField, useResourceForm } from "../../components/ResourceForm";
import { type Banner, bannersApi } from "../../lib/store";

export function BannersList() {
  return (
    <ResourceList<Banner>
      title="Banners"
      noun="banners"
      basePath="/banners"
      newLabel="+ New Banner"
      load={() => bannersApi.list()}
      remove={bannersApi.remove}
      label={(b) => b.title}
      columns={[
        {
          header: "Image",
          render: (b) => (
            <img src={b.imageUrl} alt="" style={{ width: 120, height: 48, objectFit: "cover", borderRadius: 6 }} />
          ),
        },
        { header: "Title", render: (b) => b.title },
        { header: "Position", render: (b) => (b.position === "hero" ? "Home slider" : "Promo") },
        { header: "Order", render: (b) => b.sortOrder },
        { header: "Status", render: (b) => <ActiveBadge active={b.status} /> },
      ]}
    />
  );
}

export function BannerForm() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [position, setPosition] = useState<"hero" | "promo">("hero");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [status, setStatus] = useState(true);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const form = useResourceForm<Banner>({
    noun: "banner",
    load: bannersApi.get,
    fill: (b) => {
      setTitle(b.title);
      setSubtitle(b.subtitle ?? "");
      setPosition(b.position);
      setButtonText(b.buttonText ?? "");
      setButtonLink(b.buttonLink ?? "");
      setSortOrder(String(b.sortOrder));
      setStatus(b.status);
      setExistingImage(b.imageUrl);
    },
  });

  if (form.loading) return <p>Loading...</p>;

  const input = { title, subtitle, position, buttonText, buttonLink, sortOrder, status };
  const preview = image ? URL.createObjectURL(image) : existingImage;

  return (
    <FormCard
      title={form.isEdit ? "Edit Banner" : "New Banner"}
      error={form.error}
      submitting={form.submitting}
      onCancel={() => form.navigate("/banners")}
      onSubmit={() =>
        form.submit(
          () => (form.id ? bannersApi.update(form.id, input, image) : bannersApi.create(input, image)),
          "/banners",
        )
      }
    >
      <div className="field">
        <label>Image</label>
        {preview && (
          <img src={preview} alt="" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
        )}
        <button type="button" className="btn-secondary" onClick={() => fileInput.current?.click()}>
          {preview ? "Replace image" : "Choose image"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          style={{ display: "none" }}
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        />
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--color-muted)" }}>JPG, PNG or WEBP, up to 2 MB. Wide images (about 1600×600) look best.</p>
      </div>
      <TextField id="title" label="Title" required value={title} onChange={setTitle} />
      <TextField id="subtitle" label="Subtitle" value={subtitle} onChange={setSubtitle} />
      <div className="field">
        <label htmlFor="position">Position</label>
        <select id="position" value={position} onChange={(e) => setPosition(e.target.value as "hero" | "promo")}>
          <option value="hero">Home slider</option>
          <option value="promo">Promo</option>
        </select>
      </div>
      <TextField id="buttonText" label="Button text" value={buttonText} onChange={setButtonText} placeholder="e.g. Shop now" />
      <TextField id="buttonLink" label="Button link" value={buttonLink} onChange={setButtonLink} placeholder="e.g. /products?category=kitchen" />
      <TextField id="sortOrder" label="Sort order" type="number" value={sortOrder} onChange={setSortOrder} />
      <CheckboxField id="status" label="Active" checked={status} onChange={setStatus} />
    </FormCard>
  );
}
