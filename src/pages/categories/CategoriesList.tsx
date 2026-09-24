import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ApiError } from "../../lib/api";
import { deleteCategory, listCategories } from "../../lib/categories";
import type { Category } from "../../lib/types";

export function CategoriesList() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setError(null);
    listCategories(page)
      .then((res) => {
        setCategories(res.data);
        setLastPage(res.meta.lastPage);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load categories."));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteCategory(pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete category.");
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Categories</h1>
        <Link to="/categories/new" className="btn-secondary">
          + New Category
        </Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Parent</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((category) => (
              <tr key={category.id}>
                <td style={{ paddingLeft: category.parentId ? 32 : 16 }}>
                  {category.parentId ? "⤷ " : ""}
                  {category.name}
                </td>
                <td>{category.parent?.name ?? "—"}</td>
                <td>
                  <span className={`badge ${category.status ? "badge-active" : "badge-inactive"}`}>
                    {category.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <Link to={`/categories/${category.id}/edit`} className="btn-secondary">
                      Edit
                    </Link>
                    <button className="btn-danger" onClick={() => setPendingDelete(category)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories?.length === 0 && <div className="empty-state">No categories yet.</div>}

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
          title="Delete category?"
          message={`This will permanently delete "${pendingDelete.name}"${
            pendingDelete.parentId
              ? "."
              : " and every product inside it (deleting a category cascades to its products)."
          }`}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
