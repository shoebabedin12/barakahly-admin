import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../lib/api";
import {
  createCategory,
  getCategory,
  listTopLevelCategories,
  updateCategory,
} from "../../lib/categories";
import type { Category } from "../../lib/types";

export function CategoryForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);
  const [parentId, setParentId] = useState<string>("");
  const [parentOptions, setParentOptions] = useState<Category[]>([]);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTopLevelCategories(isEdit ? Number(id) : undefined).then(setParentOptions);
  }, [id, isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    getCategory(Number(id))
      .then((category) => {
        setName(category.name);
        setDescription(category.description ?? "");
        setStatus(category.status);
        setParentId(category.parentId ? String(category.parentId) : "");
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load category."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const input = {
      name,
      description: description || null,
      status,
      parentId: parentId ? Number(parentId) : null,
    };

    try {
      if (isEdit) {
        await updateCategory(Number(id), input);
      } else {
        await createCategory(input);
      }
      navigate("/categories");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save category.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? "Edit Category" : "New Category"}</h1>
      </div>

      <div className="card" style={{ padding: 24, maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="parent">Parent category</label>
            <select id="parent" value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">None (top-level)</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
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
            <button type="button" className="btn-secondary" onClick={() => navigate("/categories")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
