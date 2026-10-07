import { useEffect, useState } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ActiveBadge } from "../../components/ResourceList";
import { ApiError } from "../../lib/api";
import { formatDate, type ReviewRow, reviewsApi } from "../../lib/store";

export function ReviewsList() {
  const [rows, setRows] = useState<ReviewRow[] | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ReviewRow | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    setError(null);
    reviewsApi
      .list(page, rating, status)
      .then((res) => {
        setRows(res.data);
        setLastPage(res.meta.lastPage);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load reviews."));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rating, status]);

  async function toggle(review: ReviewRow) {
    try {
      const res = await reviewsApi.toggle(review.id);
      setRows((current) => current?.map((r) => (r.id === review.id ? { ...r, status: res.status } : r)) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update review.");
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await reviewsApi.remove(pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete review.");
      setPendingDelete(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Reviews</h1>
      </div>

      <div className="toolbar">
        <select value={rating} onChange={(e) => { setRating(e.target.value); setPage(1); }}>
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All</option>
          <option value="approved">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows?.map((r) => (
              <tr key={r.id}>
                <td>{r.product?.name ?? "-"}</td>
                <td>{r.customer ? `${r.customer.name} (${r.customer.phone})` : "-"}</td>
                <td style={{ color: "#d97706", whiteSpace: "nowrap" }}>{"★".repeat(r.rating)}</td>
                <td style={{ maxWidth: 320 }}>{r.comment ?? "-"}</td>
                <td>{formatDate(r.createdAt)}</td>
                <td>
                  <ActiveBadge active={r.status} on="Visible" off="Hidden" />
                </td>
                <td>
                  <div className="row-actions">
                    <button className="btn-secondary" onClick={() => toggle(r)}>
                      {r.status ? "Hide" : "Show"}
                    </button>
                    <button className="btn-danger" onClick={() => setPendingDelete(r)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows?.length === 0 && <div className="empty-state">No reviews found.</div>}

        {lastPage > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span style={{ alignSelf: "center", fontSize: 13, color: "var(--color-muted)" }}>
              Page {page} of {lastPage}
            </span>
            <button disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        )}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete review?"
          message="This review will be removed permanently."
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
