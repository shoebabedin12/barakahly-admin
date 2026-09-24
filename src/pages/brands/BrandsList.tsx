import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ApiError } from "../../lib/api";
import { deleteBrand, listBrands } from "../../lib/brands";
import type { Brand } from "../../lib/types";

export function BrandsList() {
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setError(null);
    listBrands(page)
      .then((res) => {
        setBrands(res.data);
        setLastPage(res.meta.lastPage);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load brands."));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteBrand(pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete brand.");
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Brands</h1>
        <Link to="/brands/new" className="btn-secondary">
          + New Brand
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
            {brands?.map((brand) => (
              <tr key={brand.id}>
                <td>{brand.name}</td>
                <td>
                  <span className={`badge ${brand.status ? "badge-active" : "badge-inactive"}`}>
                    {brand.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <Link to={`/brands/${brand.id}/edit`} className="btn-secondary">
                      Edit
                    </Link>
                    <button className="btn-danger" onClick={() => setPendingDelete(brand)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {brands?.length === 0 && <div className="empty-state">No brands yet.</div>}

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
          title="Delete brand?"
          message={`This will permanently delete "${pendingDelete.name}".`}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
