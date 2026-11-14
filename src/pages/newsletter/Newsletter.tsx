import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ActiveBadge, ResourceList } from "../../components/ResourceList";
import { RichTextEditor } from "../../components/RichTextEditor";
import { StatusBadge } from "../../components/StatusBadge";
import { ApiError } from "../../lib/api";
import { type NewsletterBatch, type NewsletterLog, newsletterApi, type Subscriber } from "../../lib/newsletter";
import type { Paginated } from "../../lib/types";

const formatDateTime = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export function NewsletterList() {
  const [breakdown, setBreakdown] = useState<{ location: string; total: number }[]>([]);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <ResourceList<Subscriber>
      title="Newsletter Subscribers"
      noun="subscribers"
      basePath="/newsletter"
      editable={false}
      load={(page) =>
        newsletterApi.list(page).then((res) => {
          setBreakdown(res.locationBreakdown);
          setActiveCount(res.activeCount);
          return res;
        })
      }
      remove={newsletterApi.remove}
      label={(s) => s.email}
      headerActions={
        <div className="row-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              newsletterApi
                .exportCsv()
                .catch((err) => setError(err instanceof ApiError ? err.message : "Export failed."))
            }
          >
            Export CSV
          </button>
          <Link to="/newsletter/logs" className="btn-secondary">
            Send history
          </Link>
          <Link to="/newsletter/compose" className="btn-primary" style={{ width: "auto", textDecoration: "none" }}>
            Email all subscribers
          </Link>
        </div>
      }
      toolbar={
        <>
          {error && <div className="form-error">{error}</div>}
          {activeCount !== null && (
            <div className="stat-grid">
              <div className="stat-card">
                <div className="label">Active subscribers</div>
                <div className="value">{activeCount}</div>
              </div>
              {breakdown.slice(0, 4).map((b) => (
                <div key={b.location} className="stat-card">
                  <div className="label">{b.location}</div>
                  <div className="value">{b.total}</div>
                </div>
              ))}
            </div>
          )}
        </>
      }
      rowActions={(s) => (
        <Link to={`/newsletter/${s.id}/compose`} className="btn-secondary">
          Email
        </Link>
      )}
      columns={[
        { header: "Email", render: (s) => s.email },
        { header: "Location", render: (s) => s.location || "Unknown" },
        { header: "Device", render: (s) => [s.device, s.browser].filter(Boolean).join(" · ") || "-" },
        { header: "Source", render: (s) => s.source ?? "-" },
        { header: "Subscribed", render: (s) => formatDateTime(s.subscribedAt ?? s.createdAt) },
        { header: "Status", render: (s) => <ActiveBadge active={s.status} off="Unsubscribed" /> },
      ]}
    />
  );
}

/** Compose to every active subscriber (/newsletter/compose) or to one (/newsletter/:id/compose). */
export function NewsletterCompose() {
  const { id } = useParams();
  const subscriberId = id ? Number(id) : null;
  const navigate = useNavigate();
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [recipients, setRecipients] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = subscriberId
      ? newsletterApi.get(subscriberId).then(setSubscriber)
      : newsletterApi.list(1).then((res) => setRecipients(res.activeCount));
    load.catch((err) => setError(err instanceof ApiError ? err.message : "Could not load recipients."));
  }, [subscriberId]);

  async function send() {
    setSending(true);
    setError(null);
    try {
      if (subscriberId) {
        const res = await newsletterApi.sendOne(subscriberId, { subject, body });
        if (res.sent) navigate("/newsletter");
        else setError(res.message);
      } else {
        const res = await newsletterApi.broadcast({ subject, body });
        navigate(`/newsletter/logs/${res.batchId}`, { state: { queued: res.count } });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send.");
    } finally {
      setSending(false);
      setConfirming(false);
    }
  }

  const to = subscriberId
    ? (subscriber?.email ?? "...")
    : recipients === null
      ? "..."
      : `${recipients} active subscriber${recipients === 1 ? "" : "s"}`;

  return (
    <div>
      <div className="page-header">
        <h1>{subscriberId ? "Email Subscriber" : "Email All Subscribers"}</h1>
        <Link to="/newsletter" className="btn-secondary">
          Back to Subscribers
        </Link>
      </div>

      <div className="card" style={{ padding: 24, maxWidth: 760 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!body.replace(/<[^>]*>/g, "").trim()) {
              setError("The body field is required.");
              return;
            }
            if (subscriberId) void send();
            else setConfirming(true);
          }}
        >
          <div className="field">
            <label>To</label>
            <div>{to}</div>
          </div>
          <div className="field">
            <label htmlFor="subject">Subject</label>
            <input id="subject" required maxLength={255} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="field">
            <label>Message</label>
            <RichTextEditor value={body} onChange={setBody} />
          </div>

          {error && <div className="form-error">{error}</div>}

          {confirming ? (
            <div className="form-actions">
              <span style={{ alignSelf: "center" }}>Send this to {to}? This can't be undone.</span>
              <button type="button" className="btn-primary" style={{ width: "auto" }} disabled={sending} onClick={send}>
                {sending ? "Sending..." : "Yes, send"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={sending || (!subscriberId && recipients === 0)}>
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Pager({ meta, onPage }: { meta: Paginated<unknown>["meta"]; onPage: (page: number) => void }) {
  if (meta.lastPage <= 1) return null;
  return (
    <div className="pagination">
      <button disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
        Previous
      </button>
      <span style={{ alignSelf: "center", fontSize: 13, color: "var(--color-muted)" }}>
        Page {meta.page} of {meta.lastPage}
      </span>
      <button disabled={meta.page >= meta.lastPage} onClick={() => onPage(meta.page + 1)}>
        Next
      </button>
    </div>
  );
}

export function NewsletterLogs() {
  const [batchesPage, setBatchesPage] = useState(1);
  const [individualPage, setIndividualPage] = useState(1);
  const [data, setData] = useState<{ batches: Paginated<NewsletterBatch>; individual: Paginated<NewsletterLog> } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    newsletterApi
      .logs(batchesPage, individualPage)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load send history."));
  }, [batchesPage, individualPage]);

  return (
    <div>
      <div className="page-header">
        <h1>Newsletter Send History</h1>
        <Link to="/newsletter" className="btn-secondary">
          Back to Subscribers
        </Link>
      </div>

      {error && <div className="form-error">{error}</div>}
      {!data && !error && <p>Loading...</p>}

      {data && (
        <>
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ padding: "16px 16px 0", fontWeight: 600 }}>Broadcasts</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Sent</th>
                  <th>Delivered</th>
                  <th>Failed</th>
                </tr>
              </thead>
              <tbody>
                {data.batches.data.map((b) => (
                  <tr key={b.batchId}>
                    <td>
                      <Link to={`/newsletter/logs/${b.batchId}`}>{b.subject}</Link>
                    </td>
                    <td>{formatDateTime(b.sentAt)}</td>
                    <td>{b.sentCount}</td>
                    <td>{b.failedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.batches.data.length === 0 && <div className="empty-state">No broadcasts yet.</div>}
            <Pager meta={data.batches.meta} onPage={setBatchesPage} />
          </div>

          <div className="card">
            <div style={{ padding: "16px 16px 0", fontWeight: 600 }}>Individual emails</div>
            <LogTable logs={data.individual.data} />
            {data.individual.data.length === 0 && <div className="empty-state">No individual emails yet.</div>}
            <Pager meta={data.individual.meta} onPage={setIndividualPage} />
          </div>
        </>
      )}
    </div>
  );
}

function LogTable({ logs }: { logs: NewsletterLog[] }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Subject</th>
          <th>Status</th>
          <th>Error</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((l) => (
          <tr key={l.id}>
            <td>{l.email}</td>
            <td>{l.subject}</td>
            <td>
              <StatusBadge status={l.status} />
            </td>
            <td style={{ maxWidth: 280, fontSize: 12, color: "var(--color-muted)" }}>{l.error ?? "-"}</td>
            <td>{formatDateTime(l.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function NewsletterBatch() {
  const { batchId = "" } = useParams();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Awaited<ReturnType<typeof newsletterApi.batch>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Arriving straight from Send, the broadcast is still going out in the
  // background - keep refreshing until every queued recipient is logged.
  const queued = (useLocation().state as { queued?: number } | null)?.queued ?? null;
  const done = data ? data.sentCount + data.failedCount : 0;
  const stillSending = queued !== null && (data === null || done < queued);

  useEffect(() => {
    const load = () =>
      newsletterApi
        .batch(batchId, page)
        .then(setData)
        .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load this broadcast."));
    void load();
    if (!stillSending) return;
    const timer = window.setInterval(load, 3000);
    return () => window.clearInterval(timer);
  }, [batchId, page, stillSending]);

  return (
    <div>
      <div className="page-header">
        <h1>{data?.subject ?? "Broadcast"}</h1>
        <Link to="/newsletter/logs" className="btn-secondary">
          Back to Send History
        </Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      {data && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="label">Delivered</div>
              <div className="value">{data.sentCount}</div>
            </div>
            <div className="stat-card">
              <div className="label">Failed</div>
              <div className="value">{data.failedCount}</div>
            </div>
            {stillSending && (
              <div className="stat-card">
                <div className="label">Sending</div>
                <div className="value">
                  {done} / {queued}
                </div>
                <div className="sub">Updates automatically</div>
              </div>
            )}
          </div>

          <div className="card">
            <LogTable logs={data.data} />
            {data.data.length === 0 && <div className="empty-state">Sending... results will appear here shortly.</div>}
            <Pager meta={data.meta} onPage={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
