import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../lib/api";
import { assetUrl } from "../../lib/assetUrl";
import { createColor, getColor, updateColor } from "../../lib/colors";

export function ColorForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [hexCode, setHexCode] = useState("#000000");
  const [status, setStatus] = useState(true);

  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [newImage, setNewImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    getColor(Number(id))
      .then((color) => {
        setName(color.name);
        setHexCode(color.hexCode ?? "#000000");
        setStatus(color.status);
        setExistingImage(color.image);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load color."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setNewImage(file);
    setRemoveImage(false);
    e.target.value = "";
  }

  function handleRemoveImage() {
    setNewImage(null);
    if (existingImage) setRemoveImage(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const input = { name, hexCode: hexCode || null, status, removeImage };

    try {
      if (isEdit) {
        await updateColor(Number(id), input, newImage);
      } else {
        await createColor(input, newImage);
      }
      navigate("/colors");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save color.");
    } finally {
      setSubmitting(false);
    }
  }

  const previewSrc = newImage ? URL.createObjectURL(newImage) : !removeImage ? assetUrl(existingImage) : null;

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? "Edit Color" : "New Color"}</h1>
      </div>

      <div className="card" style={{ padding: 24, maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="hexCode">Color</label>
            <input
              id="hexCode"
              type="color"
              value={hexCode}
              onChange={(e) => setHexCode(e.target.value)}
              style={{ height: 40, padding: 4 }}
            />
          </div>

          <div className="field">
            <label>Image</label>
            <div className="image-grid">
              {previewSrc && (
                <div className="image-tile">
                  <img src={previewSrc} alt="" />
                  <div className="image-tile-actions">
                    <button type="button" onClick={handleRemoveImage}>
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {!previewSrc && (
                <div className="upload-tile" onClick={() => fileInputRef.current?.click()}>
                  + Add image
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={handleFileSelect}
              />
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted, #6b7280)", marginTop: 8 }}>
              Shown as the product's main image on the storefront when this color is selected.
            </p>
          </div>

          <div className="field checkbox-field">
            <input
              id="status"
              type="checkbox"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
            />
            <label htmlFor="status" style={{ margin: 0 }}>
              Active
            </label>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate("/colors")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
