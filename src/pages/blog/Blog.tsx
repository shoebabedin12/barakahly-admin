import { useRef, useState } from "react";
import { ActiveBadge, ResourceList } from "../../components/ResourceList";
import { CheckboxField, FormCard, TextField, useResourceForm } from "../../components/ResourceForm";
import { RichTextEditor } from "../../components/RichTextEditor";
import { type BlogPost, blogApi } from "../../lib/admin";
import { formatDate } from "../../lib/store";

export function BlogList() {
  return (
    <ResourceList<BlogPost>
      title="Blog Posts"
      noun="blog posts"
      basePath="/blog"
      newLabel="+ New Post"
      load={(page) => blogApi.list(page)}
      remove={blogApi.remove}
      label={(p) => p.title}
      columns={[
        {
          header: "",
          render: (p) =>
            p.featuredImageUrl ? (
              <img src={p.featuredImageUrl} alt="" style={{ width: 64, height: 40, objectFit: "cover", borderRadius: 6 }} />
            ) : (
              <div className="product-thumb-placeholder" />
            ),
        },
        { header: "Title", render: (p) => p.title },
        { header: "Author", render: (p) => p.user?.name ?? "-" },
        {
          header: "Status",
          render: (p) =>
            p.status && p.publishedAt && new Date(p.publishedAt) > new Date() ? (
              <span className="badge badge-pending">Scheduled</span>
            ) : (
              <ActiveBadge active={p.status} on="Published" off="Draft" />
            ),
        },
        { header: "Published", render: (p) => formatDate(p.publishedAt) },
      ]}
    />
  );
}

/** "2026-10-13T17:46:00Z" -> "2026-10-13T23:46" for a datetime-local input, in the browser's time. */
const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function BlogForm() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const form = useResourceForm<BlogPost>({
    noun: "blog post",
    load: blogApi.get,
    fill: (p) => {
      setTitle(p.title);
      setExcerpt(p.excerpt ?? "");
      setContent(p.content);
      setMetaTitle(p.metaTitle ?? "");
      setMetaDescription(p.metaDescription ?? "");
      setStatus(p.status);
      setPublishedAt(toLocalInput(p.publishedAt));
      setExistingImage(p.featuredImageUrl);
      setSlug(p.slug);
    },
  });

  if (form.loading) return <p>Loading...</p>;

  const preview = image ? URL.createObjectURL(image) : existingImage;

  function payload() {
    const data = new FormData();
    data.append("title", title);
    data.append("excerpt", excerpt);
    data.append("content", content);
    data.append("metaTitle", metaTitle);
    data.append("metaDescription", metaDescription);
    data.append("status", String(status));
    data.append("publishedAt", publishedAt ? new Date(publishedAt).toISOString() : "");
    if (image) data.append("featuredImage", image);
    return data;
  }

  return (
    <FormCard
      title={form.isEdit ? "Edit Post" : "New Post"}
      error={form.error}
      submitting={form.submitting}
      maxWidth={860}
      onCancel={() => form.navigate("/blog")}
      onSubmit={() =>
        form.submit(() => (form.id ? blogApi.update(form.id, payload()) : blogApi.create(payload())), "/blog")
      }
    >
      <TextField
        id="title"
        label="Title"
        required
        value={title}
        onChange={setTitle}
        hint={slug ? `URL: /blog/${slug} (changes if you rename the post)` : undefined}
      />
      <div className="field">
        <label>Featured image</label>
        {preview && (
          <img src={preview} alt="" style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
        )}
        <button type="button" className="btn-secondary" onClick={() => fileInput.current?.click()}>
          {preview ? "Replace image" : "Choose image"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          style={{ display: "none" }}
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        />
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--color-muted)" }}>JPG, PNG, WEBP or GIF, up to 2 MB.</p>
      </div>
      <TextField id="excerpt" label="Excerpt" textarea value={excerpt} onChange={setExcerpt} hint="Short summary for the blog list (max 500 characters)." />
      <div className="field">
        <label>Content</label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>
      <TextField id="metaTitle" label="SEO title" value={metaTitle} onChange={setMetaTitle} hint="Leave blank to use the post title." />
      <TextField id="metaDescription" label="SEO description" textarea value={metaDescription} onChange={setMetaDescription} />
      <CheckboxField id="status" label="Published" checked={status} onChange={setStatus} />
      <TextField
        id="publishedAt"
        label="Publish date"
        type="datetime-local"
        value={publishedAt}
        onChange={setPublishedAt}
        hint="Leave blank to publish now. A future date schedules the post."
      />
    </FormCard>
  );
}
