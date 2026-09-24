import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ApiError } from "../../lib/api";
import { assetUrl } from "../../lib/assetUrl";
import { deleteColor, listColors } from "../../lib/colors";
import type { Color } from "../../lib/types";

export function ColorsList() {
  const [colors, setColors] = useState<Color[] | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Color | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setError(null);
    listColors(page)
      .then((res) => {
        setColors(res.data);
        setLastPage(res.meta.lastPage);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load colors."));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteColor(pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete color.");
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Colors</h1>
        <Link to="/colors/new" className="btn-secondary">
          + New Color
        </Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Swatch</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {colors?.map((color) => (
              <tr key={color.id}>
                <td>
                  {color.image ? (
                    <img
                      src={assetUrl(color.image) ?? undefined}
                      alt=""
                      style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }}
                    />
                  ) : (
                    "—"
                  )}
                </td>
                <td>{color.name}</td>
                <td>
                  {color.hexCode && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: color.hexCode,
                        border: "1px solid var(--color-border)",
                        verticalAlign: "middle",
                        marginRight: 6,
                      }}
                    />
                  )}
                  {color.hexCode ?? "—"}
                </td>
                <td>
                  <span className={`badge ${color.status ? "badge-active" : "badge-inactive"}`}>
                    {color.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <Link to={`/colors/${color.id}/edit`} className="btn-secondary">
                      Edit
                    </Link>
                    <button className="btn-danger" onClick={() => setPendingDelete(color)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {colors?.length === 0 && <div className="empty-state">No colors yet.</div>}

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
          title="Delete color?"
          message={`This will permanently delete "${pendingDelete.name}".`}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
