import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../../components/StatusBadge";
import { ApiError } from "../../lib/api";
import { bulkUpdateOrderStatus, listOrders } from "../../lib/orders";
import type { OrderStats, OrderStatus, OrderSummary } from "../../lib/types";

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

export function OrdersList() {
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    setError(null);
    listOrders({
      page,
      search: search || undefined,
      status: status || undefined,
      paymentStatus: paymentStatus || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
      .then((res) => {
        setOrders(res.data);
        setStats(res.stats);
        setLastPage(res.meta.lastPage);
        setSelected(new Set());
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load orders."));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, paymentStatus]);

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  function toggleSelected(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkStatus(newStatus: OrderStatus) {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      await bulkUpdateOrderStatus(Array.from(selected), newStatus);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Bulk update failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
      </div>

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="label">Total</div>
            <div className="value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="label">Pending</div>
            <div className="value">{stats.pending}</div>
          </div>
          <div className="stat-card">
            <div className="label">Processing</div>
            <div className="value">{stats.processing}</div>
          </div>
          <div className="stat-card">
            <div className="label">Shipped</div>
            <div className="value">{stats.shipped}</div>
          </div>
          <div className="stat-card">
            <div className="label">Delivered</div>
            <div className="value">{stats.delivered}</div>
          </div>
          <div className="stat-card">
            <div className="label">Cancelled</div>
            <div className="value">{stats.cancelled}</div>
          </div>
          <div className="stat-card">
            <div className="label">Today</div>
            <div className="value">{stats.today}</div>
          </div>
          <div className="stat-card">
            <div className="label">This Month</div>
            <div className="value">{stats.thisMonth}</div>
          </div>
          <div className="stat-card">
            <div className="label">Paid Revenue</div>
            <div className="value">{stats.revenue.toFixed(0)} ৳</div>
          </div>
        </div>
      )}

      <form className="toolbar" onSubmit={handleFilterSubmit}>
        <input
          type="text"
          placeholder="Order #, coupon, transaction, or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          <option value="">All payment statuses</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <button type="submit" className="btn-secondary">
          Filter
        </button>
      </form>

      {error && <div className="form-error">{error}</div>}

      <div className="card">
        {selected.size > 0 && (
          <div className="bulk-bar">
            <span>{selected.size} selected</span>
            {STATUSES.map((s) => (
              <button key={s} className="btn-secondary" disabled={busy} onClick={() => handleBulkStatus(s)}>
                Mark {s}
              </button>
            ))}
          </div>
        )}

        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 32 }}></th>
              <th>Order #</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Order Status</th>
              <th>Payment</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.has(order.id)}
                    onChange={() => toggleSelected(order.id)}
                  />
                </td>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{order.orderNumber}</td>
                <td>{order.customer?.name ?? "—"}</td>
                <td>{order.totalAmount} ৳</td>
                <td>
                  <StatusBadge status={order.orderStatus} />
                </td>
                <td>
                  <StatusBadge status={order.paymentStatus} />
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <Link to={`/orders/${order.id}`} className="btn-secondary">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders?.length === 0 && <div className="empty-state">No orders found.</div>}

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
    </div>
  );
}
