import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../lib/api";
import { createSize, getSize, updateSize } from "../../lib/sizes";

export function SizeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [status, setStatus] = useState(true);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    getSize(Number(id))
      .then((size) => {
        setName(size.name);
        setStatus(size.status);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load size."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isEdit) {
        await updateSize(Number(id), { name, status });
      } else {
        await createSize({ name, status });
      }
      navigate("/sizes");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save size.");
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
        <h1>{isEdit ? "Edit Size" : "New Size"}</h1>
      </div>

      <div className="card" style={{ padding: 24, maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
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
            <button type="button" className="btn-secondary" onClick={() => navigate("/sizes")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
