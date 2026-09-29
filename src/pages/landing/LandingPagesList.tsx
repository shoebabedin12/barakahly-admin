import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../lib/api";
import { type LandingListRow, listLandings, STOREFRONT_URL } from "../../lib/categoryLandings";

export function LandingPagesList() {
  const [rows, setRows] = useState<LandingListRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listLandings()
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load landing pages."));
  }, []);

  const liveCount = rows?.filter((r) => r.isActive).length ?? 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Category Landing Pages</h1>
          <p className="page-subtitle">
            Give each category its own look on the website. The product grid and filters below it stay the same everywhere.
          </p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {rows && (
        <p className="landing-list-summary">
          <strong>{liveCount}</strong> of {rows.length} categories have a live landing page.
        </p>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Theme</th>
              <th>Landing page</th>
              <th>Last updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows === null && !error && (
              <tr>
                <td colSpan={5}>Loading...</td>
              </tr>
            )}
            {rows?.map((row) => (
              <tr key={row.category.id}>
                <td style={{ paddingLeft: row.category.parentId ? 32 : 16 }}>
                  {row.category.parentId ? "⤷ " : ""}
                  <strong>{row.category.name}</strong>
                  {!row.category.status && <span className="landing-muted"> (category inactive)</span>}
                </td>
                <td>
                  {row.accent ? (
                    <span className="landing-swatch" style={{ background: row.accent }} title={row.accent} />
                  ) : (
                    <span className="landing-muted">—</span>
                  )}
                </td>
                <td>
                  {row.isActive ? (
                    <span className="badge badge-active">Live</span>
                  ) : row.hasLanding ? (
                    <span className="badge badge-pending">Draft</span>
                  ) : (
                    <span className="landing-muted">Not designed</span>
                  )}
                </td>
                <td className="landing-muted">
                  {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "—"}
                </td>
                <td>
                  <div className="row-actions">
                    {row.isActive && (
                      <a
                        href={`${STOREFRONT_URL}/products?category=${row.category.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                      >
                        View
                      </a>
                    )}
                    <Link to={`/landing-pages/${row.category.id}`} className="btn-secondary">
                      {row.hasLanding ? "Edit design" : "Design"}
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
