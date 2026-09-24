import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Link } from "react-router-dom";
import {
  IconArchiveBox,
  IconArrowTrendingDown,
  IconArrowTrendingUp,
  IconBanknotes,
  IconBuildingStorefront,
  IconCalendarDays,
  IconChartPie,
  IconCube,
  IconExclamationCircle,
  IconExclamationTriangle,
  IconReceiptPercent,
  IconShoppingBag,
  IconUsers,
} from "../icons";
import { ApiError } from "../lib/api";
import { getDashboardStats } from "../lib/dashboard";
import type { DashboardStats } from "../lib/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function money(value: number) {
  return `৳${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_BOXES: { name: string; key: keyof DashboardStats["orderStatus"] | string; colorClass: string }[] = [
  { name: "Pending", key: "pending", colorClass: "status-box-yellow" },
  { name: "Processing", key: "processing", colorClass: "status-box-blue" },
  { name: "Shipped", key: "shipped", colorClass: "status-box-purple" },
  { name: "Delivered", key: "delivered", colorClass: "status-box-green" },
  { name: "Cancelled", key: "cancelled", colorClass: "status-box-red" },
];

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load dashboard."));
  }, []);

  if (error) {
    return <div className="form-error">{error}</div>;
  }

  if (!stats) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {/* Primary KPI cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div>
            <p className="kpi-label">Total Sales</p>
            <h2 className="kpi-value">{money(stats.totalSales)}</h2>
            <p className="kpi-sub kpi-sub-green">{stats.deliveredOrders} delivered orders</p>
            <p className="kpi-sub">Profit: {money(stats.totalProfit)}</p>
          </div>
          <div className="kpi-icon kpi-icon-green">
            <IconBanknotes className="icon-md" />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <p className="kpi-label">Total Orders</p>
            <h2 className="kpi-value">{stats.totalOrders}</h2>
            <p className="kpi-sub kpi-sub-yellow">{stats.pendingOrders} pending</p>
          </div>
          <div className="kpi-icon kpi-icon-yellow">
            <IconShoppingBag className="icon-md" />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <p className="kpi-label">Total Products</p>
            <h2 className="kpi-value">{stats.totalProducts}</h2>
            <p className="kpi-sub kpi-sub-blue">{stats.activeProducts} active</p>
          </div>
          <div className="kpi-icon kpi-icon-blue">
            <IconCube className="icon-md" />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <p className="kpi-label">Customers</p>
            <h2 className="kpi-value">{stats.totalCustomers}</h2>
            <p className="kpi-sub">Registered customers</p>
          </div>
          <div className="kpi-icon kpi-icon-purple">
            <IconUsers className="icon-md" />
          </div>
        </div>
      </div>

      {/* Sales & Profit */}
      <p className="section-label">Sales &amp; Profit</p>
      <div className="kpi-grid kpi-grid-3">
        <div className="kpi-card kpi-card-sm">
          <div>
            <p className="kpi-label">Today's Sales</p>
            <h3 className="kpi-value-sm kpi-sub-green">{money(stats.todaySales)}</h3>
            <p className="kpi-sub">Profit: {money(stats.todayProfit)}</p>
          </div>
          <div className="kpi-icon-sm kpi-icon-green">
            <IconCalendarDays className="icon-sm" />
          </div>
        </div>

        <div className="kpi-card kpi-card-sm">
          <div>
            <p className="kpi-label">This Month's Sales</p>
            <h3 className="kpi-value-sm kpi-sub-blue">{money(stats.monthlySales)}</h3>
            <p className="kpi-sub">Profit: {money(stats.monthlyProfit)}</p>
          </div>
          <div className="kpi-icon-sm kpi-icon-blue">
            <IconChartPie className="icon-sm" />
          </div>
        </div>

        <div className="kpi-card kpi-card-sm">
          <div>
            <p className="kpi-label">Pending Payment (Delivered)</p>
            <h3 className="kpi-value-sm kpi-sub-red">{money(stats.pendingPaymentDeliveredAmount)}</h3>
            <p className="kpi-sub">{stats.pendingPaymentDeliveredOrders} delivered orders unpaid</p>
          </div>
          <div className="kpi-icon-sm kpi-icon-red">
            <IconExclamationCircle className="icon-sm" />
          </div>
        </div>
      </div>

      {/* Inventory Overview */}
      <p className="section-label">Inventory Overview</p>
      <div className="kpi-grid kpi-grid-3">
        <div className="kpi-card kpi-card-sm">
          <div>
            <p className="kpi-label">Total Purchase (Inventory)</p>
            <h3 className="kpi-value-sm">{money(stats.totalPurchaseAmount)}</h3>
          </div>
          <div className="kpi-icon-sm kpi-icon-gray">
            <IconArchiveBox className="icon-sm" />
          </div>
        </div>

        <div className="kpi-card kpi-card-sm">
          <div>
            <p className="kpi-label">Low Stock Alerts</p>
            <h3 className={`kpi-value-sm ${stats.lowStockProducts.length ? "kpi-sub-red" : ""}`}>
              {stats.lowStockProducts.length}
            </h3>
          </div>
          <div className={`kpi-icon-sm ${stats.lowStockProducts.length ? "kpi-icon-red" : "kpi-icon-gray"}`}>
            <IconExclamationTriangle className="icon-sm" />
          </div>
        </div>

        <div className="kpi-card kpi-card-sm">
          <div>
            <p className="kpi-label">Total Profit</p>
            <h3 className="kpi-value-sm" style={{ color: "var(--color-primary)" }}>
              {money(stats.totalProfit)}
            </h3>
            <p className="kpi-sub">Based on recorded purchase cost</p>
          </div>
          <div className="kpi-icon-sm kpi-icon-primary">
            <IconReceiptPercent className="icon-sm" />
          </div>
        </div>
      </div>

      {/* Funding Overview */}
      <p className="section-label">Funding Overview</p>
      <div className="kpi-grid">
        <div className="kpi-card kpi-card-sm">
          <div>
            <p className="kpi-label">Total Invested</p>
            <h3 className="kpi-value-sm">{money(stats.totalInvested)}</h3>
          </div>
          <div className="kpi-icon-sm kpi-icon-purple">
            <IconBanknotes className="icon-sm" />
          </div>
        </div>

        <div className="kpi-card kpi-card-sm">
          <div>
            <p className="kpi-label">Investment Used</p>
            <h3 className="kpi-value-sm kpi-sub-red">{money(stats.investmentUsed)}</h3>
          </div>
          <div className="kpi-icon-sm kpi-icon-red">
            <IconArrowTrendingDown className="icon-sm" />
          </div>
        </div>

        <div className="kpi-card kpi-card-sm">
          <div>
            <p className="kpi-label">Investment Remaining</p>
            <h3 className="kpi-value-sm kpi-sub-green">{money(stats.investmentRemaining)}</h3>
          </div>
          <div className="kpi-icon-sm kpi-icon-green">
            <IconArrowTrendingUp className="icon-sm" />
          </div>
        </div>

        <div className="kpi-card kpi-card-sm">
          <div>
            <p className="kpi-label">Spent from Business Fund</p>
            <h3 className="kpi-value-sm kpi-sub-blue">{money(stats.totalFromBusinessFund)}</h3>
          </div>
          <div className="kpi-icon-sm kpi-icon-blue">
            <IconBuildingStorefront className="icon-sm" />
          </div>
        </div>
      </div>

      {/* Sales chart */}
      <div className="card" style={{ padding: 24, marginTop: 8 }}>
        <h3 className="section-title">Sales Overview</h3>
        <p className="kpi-sub" style={{ marginBottom: 16 }}>
          Last 30 days performance
        </p>
        <div style={{ height: 300 }}>
          <Bar
            data={{
              labels: stats.salesChart.map((d) => d.date),
              datasets: [
                {
                  label: "Sales BDT",
                  data: stats.salesChart.map((d) => d.sales),
                  backgroundColor: "#0b3d2e",
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
      </div>

      {/* Order status */}
      <div className="card" style={{ padding: 24, marginTop: 20 }}>
        <h3 className="section-title" style={{ marginBottom: 20 }}>
          Orders by Status
        </h3>
        <div className="status-box-grid">
          {STATUS_BOXES.map((box) => (
            <div key={box.key} className={`status-box ${box.colorClass}`}>
              <p className="status-box-label">{box.name}</p>
              <h2 className="status-box-value">{stats.orderStatus[box.key] ?? 0}</h2>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header-row">
          <div>
            <h3 className="section-title">Recent Orders</h3>
            <p className="kpi-sub">Latest customer orders</p>
          </div>
          <Link to="/orders" className="view-all-link">
            View All
          </Link>
        </div>
        <table className="mini-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <p style={{ fontWeight: 600, margin: 0 }}>{order.orderNumber}</p>
                  <p className="kpi-sub" style={{ margin: 0 }}>
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </td>
                <td>{order.customerName ?? "Guest"}</td>
                <td style={{ fontWeight: 600 }}>{order.totalAmount} ৳</td>
                <td>
                  <span className={`badge badge-${order.paymentStatus}`}>{order.paymentStatus}</span>
                </td>
                <td>
                  <span className={`badge badge-${order.orderStatus}`}>{order.orderStatus}</span>
                </td>
                <td>
                  <Link to={`/orders/${order.id}`} className="view-all-link">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stats.recentOrders.length === 0 && <div className="empty-state">No orders found</div>}
      </div>

      {/* Low stock + recent customers */}
      <div className="dashboard-grid" style={{ marginTop: 20, gridTemplateColumns: "1fr 1fr" }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 className="section-title" style={{ marginBottom: 20 }}>
            Low Stock Products
          </h3>
          {stats.lowStockProducts.map((p) => (
            <div key={p.id} className="list-row">
              <div>
                <p style={{ fontWeight: 500, margin: 0 }}>{p.name}</p>
                <p className="kpi-sub" style={{ margin: 0 }}>
                  SKU: {p.sku ?? "N/A"}
                </p>
              </div>
              <span className="badge badge-cancelled">Stock: {p.effectiveStock}</span>
            </div>
          ))}
          {stats.lowStockProducts.length === 0 && <p className="kpi-sub">No low stock products.</p>}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 className="section-title" style={{ marginBottom: 20 }}>
            Recent Customers
          </h3>
          {stats.recentCustomers.map((c) => (
            <div key={c.id} className="list-row">
              <div>
                <p style={{ fontWeight: 500, margin: 0 }}>{c.name}</p>
                <p className="kpi-sub" style={{ margin: 0 }}>
                  {c.email ?? "-"}
                </p>
              </div>
            </div>
          ))}
          {stats.recentCustomers.length === 0 && <p className="kpi-sub">No customers found.</p>}
        </div>
      </div>

      {/* Top selling products */}
      <div className="card" style={{ padding: 24, marginTop: 20 }}>
        <h3 className="section-title">Top Selling Products</h3>
        <p className="kpi-sub" style={{ marginBottom: 16 }}>
          Best performing products
        </p>
        <table className="mini-table">
          <thead>
            <tr>
              <th>Product</th>
              <th style={{ textAlign: "center" }}>Sold Quantity</th>
              <th style={{ textAlign: "center" }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {stats.topProducts.map((p) => (
              <tr key={p.sku}>
                <td>
                  <p style={{ fontWeight: 500, margin: 0 }}>{p.productName}</p>
                  <p className="kpi-sub" style={{ margin: 0 }}>
                    SKU: {p.sku ?? "N/A"}
                  </p>
                </td>
                <td style={{ textAlign: "center" }}>
                  <span className="badge badge-active">{p.totalSold}</span>
                </td>
                <td style={{ textAlign: "center", fontWeight: 600 }}>{money(p.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {stats.topProducts.length === 0 && <div className="empty-state">No sales yet</div>}
      </div>
    </div>
  );
}
