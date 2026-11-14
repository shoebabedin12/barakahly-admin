import { Fragment, useEffect, useState } from "react";
import { ApiError } from "../../lib/api";
import { type ActivityEntry, type ActivityFilters, activityApi } from "../../lib/admin";

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const EMPTY: ActivityFilters = { userId: "", action: "", dateFrom: "", dateTo: "" };

export function ActivityLog() {
  const [draft, setDraft] = useState<ActivityFilters>(EMPTY);
  const [filters, setFilters] = useState<ActivityFilters>(EMPTY);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Awaited<ReturnType<typeof activityApi.list>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    activityApi
      .list(page, filters)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load the activity log."));
  }, [page, filters]);

  const set = (patch: Partial<ActivityFilters>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div>
      <div className="page-header">
        <h1>Activity Log</h1>
      </div>

      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setFilters(draft);
        }}
      >
        <select value={draft.userId} onChange={(e) => set({ userId: e.target.value })} aria-label="Staff member">
          <option value="">All staff</option>
          {data?.users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <select value={draft.action} onChange={(e) => set({ action: e.target.value })} aria-label="Action">
          <option value="">All actions</option>
          {data?.actions.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <input type="date" value={draft.dateFrom} onChange={(e) => set({ dateFrom: e.target.value })} aria-label="From" />
        <input type="date" value={draft.dateTo} onChange={(e) => set({ dateTo: e.target.value })} aria-label="To" />
        <button type="submit">Filter</button>
        {Object.values(filters).some(Boolean) && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setDraft(EMPTY);
              setFilters(EMPTY);
              setPage(1);
            }}
          >
            Clear
          </button>
        )}
      </form>

      {error && <div className="form-error">{error}</div>}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Who</th>
              <th>Action</th>
              <th>What happened</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((l: ActivityEntry) => (
              <Fragment key={l.id}>
                <tr>
                  <td style={{ whiteSpace: "nowrap" }}>{formatDateTime(l.createdAt)}</td>
                  <td>{l.user?.name ?? "System"}</td>
                  <td>
                    <span className="badge badge-inactive">{l.action.replace(/_/g, " ")}</span>
                  </td>
                  <td>{l.description}</td>
                  <td>
                    {l.changes && (
                      <button type="button" className="btn-secondary" onClick={() => setOpen(open === l.id ? null : l.id)}>
                        {open === l.id ? "Hide" : "Changes"}
                      </button>
                    )}
                  </td>
                </tr>
                {open === l.id && l.changes && (
                  <tr>
                    <td colSpan={5}>
                      <table className="mini-table">
                        <tbody>
                          {Object.entries(l.changes).map(([field, value]) => (
                            <tr key={field}>
                              <td style={{ width: 200, color: "var(--color-muted)" }}>{field.replace(/_/g, " ")}</td>
                              <td style={{ wordBreak: "break-word" }}>
                                {value === null || value === "" ? "-" : typeof value === "object" ? JSON.stringify(value) : String(value)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {data === null && !error && <div className="empty-state">Loading...</div>}
        {data?.data.length === 0 && <div className="empty-state">No activity matches.</div>}
        {data && data.meta.lastPage > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span style={{ alignSelf: "center", fontSize: 13, color: "var(--color-muted)" }}>
              Page {page} of {data.meta.lastPage}
            </span>
            <button disabled={page >= data.meta.lastPage} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
