import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../lib/api";
import type { Paginated } from "../lib/types";
import { ConfirmDialog } from "./ConfirmDialog";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
}

interface ResourceListProps<T extends { id: number }> {
  title: string;
  /** Plural noun for messages, e.g. "coupons". */
  noun: string;
  basePath: string;
  /** Omit for lists you can't add to by hand. */
  newLabel?: string;
  /** Replaces the "new" link in the header, e.g. with export/compose buttons. */
  headerActions?: ReactNode;
  /** Extra buttons per row, before Edit/Delete. */
  rowActions?: (row: T) => ReactNode;
  /** False hides the Edit link for read-only rows. */
  editable?: boolean;
  columns: Column<T>[];
  load: (page: number) => Promise<Paginated<T>>;
  remove: (id: number) => Promise<unknown>;
  /** Name shown in the delete confirmation. */
  label: (row: T) => string;
  /** Extra filters rendered above the table; change `reloadKey` to refetch. */
  toolbar?: ReactNode;
  reloadKey?: string;
}

/** List page with pagination, edit links and a confirmed delete - the shared shape of every simple admin screen. */
export function ResourceList<T extends { id: number }>({
  title,
  noun,
  basePath,
  newLabel,
  headerActions,
  rowActions,
  editable = true,
  columns,
  load,
  remove,
  label,
  toolbar,
  reloadKey = "",
}: ResourceListProps<T>) {
  const [rows, setRows] = useState<T[] | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPage = useCallback(() => {
    setError(null);
    load(page)
      .then((res) => {
        setRows(res.data);
        setLastPage(res.meta.lastPage);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : `Could not load ${noun}.`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, reloadKey]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  useEffect(() => {
    setPage(1);
  }, [reloadKey]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await remove(pendingDelete.id);
      setPendingDelete(null);
      fetchPage();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete.");
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>{title}</h1>
        {headerActions ??
          (newLabel && (
            <Link to={`${basePath}/new`} className="btn-secondary">
              {newLabel}
            </Link>
          ))}
      </div>

      {toolbar}
      {error && <div className="form-error">{error}</div>}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.header}>{column.header}</th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows?.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.header}>{column.render(row)}</td>
                ))}
                <td>
                  <div className="row-actions">
                    {rowActions?.(row)}
                    {editable && (
                      <Link to={`${basePath}/${row.id}/edit`} className="btn-secondary">
                        Edit
                      </Link>
                    )}
                    <button className="btn-danger" onClick={() => setPendingDelete(row)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows === null && !error && <div className="empty-state">Loading...</div>}
        {rows?.length === 0 && <div className="empty-state">No {noun} yet.</div>}

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
          title="Delete?"
          message={`This will permanently delete "${label(pendingDelete)}".`}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

export function ActiveBadge({ active, on = "Active", off = "Inactive" }: { active: boolean; on?: string; off?: string }) {
  return <span className={`badge ${active ? "badge-active" : "badge-inactive"}`}>{active ? on : off}</span>;
}
