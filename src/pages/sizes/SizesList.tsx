import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ApiError } from "../../lib/api";
import { deleteSize, listSizes } from "../../lib/sizes";
import type { Size } from "../../lib/types";

export function SizesList() {
  const [sizes, setSizes] = useState<Size[] | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Size | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setError(null);
    listSizes(page)
      .then((res) => {
        setSizes(res.data);
        setLastPage(res.meta.lastPage);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load sizes."));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteSize(pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete size.");
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Sizes</h1>
        <Link to="/sizes/new" className="btn-secondary">
          + New Size
        </Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sizes?.map((size) => (
              <tr key={size.id}>
                <td>{size.name}</td>
                <td>
                  <span className={`badge ${size.status ? "badge-active" : "badge-inactive"}`}>
                    {size.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <Link to={`/sizes/${size.id}/edit`} className="btn-secondary">
                      Edit
                    </Link>
                    <button className="btn-danger" onClick={() => setPendingDelete(size)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sizes?.length === 0 && <div className="empty-state">No sizes yet.</div>}

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
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete size?"
          message={`This will permanently delete "${pendingDelete.name}".`}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
