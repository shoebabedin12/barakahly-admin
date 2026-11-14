import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from "chart.js";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { StatusBadge } from "../../components/StatusBadge";
import { ApiError } from "../../lib/api";
import { type ReportOverview, reportsApi, type SalesFilters, type SalesRow, type SalesTotals } from "../../lib/admin";
import { formatDate, formatMoney } from "../../lib/store";
import type { Paginated } from "../../lib/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const EMPTY: SalesFilters = { status: "", paymentStatus: "", coupon: "", from: "", to: "" };

/** The last 30 days ending today (Dhaka), with days that had no orders filled in as zero. */
function last30Days(chart: ReportOverview["salesChart"]) {
  const byDate = new Map(chart.map((d) => [d.date, d]));
  const today = new Date(Date.now() + 6 * 3600_000);
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - (29 - i));
    const date = d.toISOString().slice(0, 10);
    return byDate.get(date) ?? { date, total: 0, orders: 0 };
  });
}

export function SalesReport() {
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [draft, setDraft] = useState<SalesFilters>(EMPTY);
  const [filters, setFilters] = useState<SalesFilters>(EMPTY);
  const [page, setPage] = useState(1);
  const [sales, setSales] = useState<(Paginated<SalesRow> & { totals: SalesTotals }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reportsApi
      .overview()
      .then(setOverview)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load the report."));
  }, []);

  useEffect(() => {
    reportsApi
      .sales(page, filters)
      .then(setSales)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load sales."));
  }, [page, filters]);

  const set = (patch: Partial<SalesFilters>) => setDraft((d) => ({ ...d, ...patch }));
  const days = overview ? last30Days(overview.salesChart) : [];
  const c = overview?.cards;

  return (
    <div>
      <div className="page-header">
        <h1>Sales Report</h1>
        <div className="row-actions no-print">
          <button type="button" className="btn-secondary" onClick={() => window.print()}>
            Print / PDF
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              reportsApi.exportCsv(filters).catch((err) => setError(err instanceof ApiError ? err.message : "Export failed."))
            }
          >
            Export CSV
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {c && overview && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="label">Today's sales</div>
              <div className="value">{formatMoney(c.todaySales)}</div>
              <div className="sub">{c.todayOrders} orders placed today</div>
            </div>
            <div className="stat-card">
              <div className="label">This month</div>
              <div className="value">{formatMoney(c.monthlyRevenue)}</div>
              <div className="sub">{c.monthlyOrders} orders placed · delivered revenue</div>
            </div>
            <div className="stat-card">
              <div className="label">Month excl. delivery</div>
              <div className="value">{formatMoney(c.monthlyNetRevenue)}</div>
              <div className="sub">
                {formatMoney(c.monthlyShipping)} delivery · {formatMoney(c.monthlyDiscount)} discounts given
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Average order</div>
              <div className="value">{formatMoney(c.averageOrderValue)}</div>
              <div className="sub">delivered orders</div>
            </div>
            <div className="stat-card">
              <div className="label">Orders</div>
              <div className="value">{c.deliveredOrders}</div>
              <div className="sub">
                delivered · {c.pendingOrders} pending · {c.cancelledOrders} cancelled
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 className="section-title">Last 30 days</h3>
            <p className="kpi-sub" style={{ marginBottom: 16 }}>
              Value of all orders placed each day
            </p>
            <div style={{ height: 260 }}>
              <Bar
                data={{
                  labels: days.map((d) => d.date.slice(5)),
                  datasets: [{ label: "Sales BDT", data: days.map((d) => d.total), backgroundColor: "#0b3d2e", borderRadius: 6 }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => `${formatMoney(Number(ctx.raw))} · ${days[ctx.dataIndex]?.orders ?? 0} orders`,
                      },
                    },
                  },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>

          <div className="report-grid">
            <div className="card" style={{ padding: 20 }}>
              <h3 className="section-title">Top products</h3>
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Units</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.topProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link to={`/products/${p.id}/edit`}>{p.name}</Link>
                      </td>
                      <td>{p.units}</td>
                      <td>{formatMoney(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {overview.topProducts.length === 0 && <div className="empty-state">No sales yet.</div>}
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 className="section-title">Top customers</h3>
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Orders</th>
                    <th>Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.topCustomers.map((cu) => (
                    <tr key={cu.id}>
                      <td>
                        <Link to={`/customers/${cu.id}/edit`}>{cu.name}</Link>
                        <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{cu.phone}</div>
                      </td>
                      <td>{cu.orders}</td>
                      <td>{formatMoney(cu.spent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {overview.topCustomers.length === 0 && <div className="empty-state">No customers yet.</div>}
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 className="section-title">Orders by status</h3>
              <table className="mini-table">
                <tbody>
                  {overview.orderStatus.map((s) => (
                    <tr key={s.status}>
                      <td>
                        <StatusBadge status={s.status} />
                      </td>
                      <td style={{ textAlign: "right" }}>{s.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3 className="section-title" style={{ marginTop: 16 }}>
                By payment
              </h3>
              <table className="mini-table">
                <tbody>
                  {overview.paymentStatus.map((s) => (
                    <tr key={s.status}>
                      <td>
                        <StatusBadge status={s.status} />
                      </td>
                      <td style={{ textAlign: "right" }}>{s.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 className="section-title">Largest categories</h3>
              <table className="mini-table">
                <tbody>
                  {overview.topCategories.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.name}</td>
                      <td style={{ textAlign: "right" }}>{cat.products} products</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <h2 className="section-title" style={{ marginTop: 28, fontSize: 18 }}>
        Orders
      </h2>
      <form
        className="toolbar no-print"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setFilters(draft);
        }}
      >
        <select value={draft.status} onChange={(e) => set({ status: e.target.value })} aria-label="Order status">
          <option value="">All statuses</option>
          {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={draft.paymentStatus} onChange={(e) => set({ paymentStatus: e.target.value })} aria-label="Payment status">
          <option value="">All payments</option>
          {["pending", "paid", "failed", "refunded"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={draft.coupon} onChange={(e) => set({ coupon: e.target.value })} aria-label="Coupon">
          <option value="">Any coupon</option>
          <option value="1">Used a coupon</option>
        </select>
        <input type="date" value={draft.from} onChange={(e) => set({ from: e.target.value })} aria-label="From" />
        <input type="date" value={draft.to} onChange={(e) => set({ to: e.target.value })} aria-label="To" />
        <button type="submit">Filter</button>
      </form>

      {sales && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="label">Orders</div>
            <div className="value">{sales.totals.orders}</div>
          </div>
          <div className="stat-card">
            <div className="label">Sales</div>
            <div className="value">{formatMoney(sales.totals.sales)}</div>
          </div>
          <div className="stat-card">
            <div className="label">Discounts</div>
            <div className="value">{formatMoney(sales.totals.discount)}</div>
          </div>
          <div className="stat-card">
            <div className="label">Delivery charges</div>
            <div className="value">{formatMoney(sales.totals.shipping)}</div>
          </div>
          <div className="stat-card">
            <div className="label">Average</div>
            <div className="value">{formatMoney(sales.totals.average)}</div>
          </div>
        </div>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Order</th>
              <th>Customer</th>
              <th>Subtotal</th>
              <th>Discount</th>
              <th>Delivery</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sales?.data.map((o) => (
              <tr key={o.id}>
                <td>{formatDate(o.createdAt)}</td>
                <td>
                  <Link to={`/orders/${o.id}`}>{o.orderNumber}</Link>
                </td>
                <td>
                  {o.customer?.name ?? "Guest"}
                  {o.customer && <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{o.customer.phone}</div>}
                </td>
                <td>{formatMoney(o.subtotal)}</td>
                <td>{formatMoney(o.discountAmount)}</td>
                <td>{formatMoney(o.shippingCharge)}</td>
                <td>{formatMoney(o.totalAmount)}</td>
                <td>
                  <StatusBadge status={o.paymentStatus} />
                </td>
                <td>
                  <StatusBadge status={o.orderStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sales === null && <div className="empty-state">Loading...</div>}
        {sales?.data.length === 0 && <div className="empty-state">No orders match these filters.</div>}
        {sales && sales.meta.lastPage > 1 && (
          <div className="pagination no-print">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span style={{ alignSelf: "center", fontSize: 13, color: "var(--color-muted)" }}>
              Page {page} of {sales.meta.lastPage}
            </span>
            <button disabled={page >= sales.meta.lastPage} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
