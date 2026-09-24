import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { StatusBadge } from "../../components/StatusBadge";
import { ApiError } from "../../lib/api";
import { assetUrl } from "../../lib/assetUrl";
import {
  getOrder,
  mergeOrder,
  removeShippingCharge,
  updateOrderStatus,
  updatePaymentStatus,
} from "../../lib/orders";
import type { OrderDetail as OrderDetailType, OrderStatus, PaymentStatus } from "../../lib/types";

const ORDER_STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const orderId = Number(id);

  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [mergeCandidates, setMergeCandidates] = useState<OrderDetailType[]>([]);
  const [mergeTarget, setMergeTarget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    getOrder(orderId)
      .then((res) => {
        setOrder(res.order);
        setMergeCandidates(res.mergeCandidates);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load order."));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function handleStatusChange(newStatus: OrderStatus) {
    setBusy(true);
    setError(null);
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      setOrder(res.order);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update status.");
    } finally {
      setBusy(false);
    }
  }

  async function handlePaymentStatusChange(newStatus: PaymentStatus) {
    setBusy(true);
    setError(null);
    try {
      const res = await updatePaymentStatus(orderId, newStatus);
      setOrder(res.order);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update payment status.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveShipping() {
    setBusy(true);
    setError(null);
    try {
      const res = await removeShippingCharge(orderId);
      setOrder(res.order);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove shipping charge.");
    } finally {
      setBusy(false);
    }
  }

  async function handleMerge() {
    if (!mergeTarget) return;
    setBusy(true);
    setError(null);
    try {
      await mergeOrder(orderId, Number(mergeTarget));
      navigate(`/orders/${orderId}`, { replace: true });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not merge orders.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !order) {
    return <div className="form-error">{error}</div>;
  }

  if (!order) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          Order {order.orderNumber}
          <span style={{ marginLeft: 12 }}>
            <StatusBadge status={order.orderStatus} />
          </span>
        </h1>
        <Link to="/orders" className="btn-secondary">
          Back to Orders
        </Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="dashboard-grid">
        <div>
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h2 className="section-title">Items</h2>
            <table className="mini-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => {
                  const primaryImage = item.product?.images.find((i) => i.isPrimary) ?? item.product?.images[0];
                  return (
                    <tr key={item.id}>
                      <td>
                        {primaryImage ? (
                          <img className="product-thumb" src={assetUrl(primaryImage.image) ?? undefined} alt="" />
                        ) : (
                          <div className="product-thumb-placeholder" />
                        )}
                      </td>
                      <td>
                        {item.productName}
                        {(item.variantColor || item.variantSize) && (
                          <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
                            {[item.variantColor, item.variantSize].filter(Boolean).join(" / ")}
                          </div>
                        )}
                      </td>
                      <td>{item.price} ৳</td>
                      <td>{item.quantity}</td>
                      <td>{item.subtotal} ৳</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ padding: 16, borderTop: "1px solid var(--color-border)", marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>Subtotal</span>
                <span>{order.subtotal} ৳</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>
                  Shipping
                  {Number(order.shippingCharge) > 0 && (
                    <button
                      type="button"
                      onClick={handleRemoveShipping}
                      disabled={busy}
                      className="btn-danger"
                      style={{ marginLeft: 8, fontSize: 11, padding: "2px 8px" }}
                    >
                      Remove
                    </button>
                  )}
                </span>
                <span>{order.shippingCharge} ৳</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>-{order.discountAmount} ৳</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16 }}>
                <span>Total</span>
                <span>{order.totalAmount} ৳</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h2 className="section-title">Status History</h2>
            {order.statusHistories.length === 0 && <p style={{ color: "var(--color-muted)" }}>No history yet.</p>}
            {order.statusHistories.map((h) => (
              <div key={h.id} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13 }}>
                <StatusBadge status={h.status} />
                <span style={{ color: "var(--color-muted)" }}>{new Date(h.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h2 className="section-title">Update Status</h2>
            <div className="field">
              <label htmlFor="orderStatus">Order Status</label>
              <select
                id="orderStatus"
                value={order.orderStatus}
                disabled={busy}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="paymentStatus">Payment Status</label>
              <select
                id="paymentStatus"
                value={order.paymentStatus}
                disabled={busy}
                onChange={(e) => handlePaymentStatusChange(e.target.value as PaymentStatus)}
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h2 className="section-title">Customer</h2>
            {order.customer ? (
              <div style={{ fontSize: 14 }}>
                <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{order.customer.name}</p>
                <p style={{ margin: "0 0 4px", color: "var(--color-muted)" }}>{order.customer.phone}</p>
                {order.customer.email && (
                  <p style={{ margin: "0 0 4px", color: "var(--color-muted)" }}>{order.customer.email}</p>
                )}
              </div>
            ) : (
              <p style={{ color: "var(--color-muted)" }}>Guest checkout</p>
            )}
            <p style={{ marginTop: 12, fontSize: 13, whiteSpace: "pre-line" }}>{order.shippingAddress}</p>
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h2 className="section-title">Payment</h2>
            <p style={{ fontSize: 13, margin: "0 0 4px" }}>
              Method: <strong>{order.paymentMethod ?? "—"}</strong>
            </p>
            {order.transactionId && (
              <p style={{ fontSize: 13, margin: "0 0 4px" }}>
                Transaction ID: <span style={{ fontFamily: "monospace" }}>{order.transactionId}</span>
              </p>
            )}
            {order.paymentDate && (
              <p style={{ fontSize: 13, margin: 0 }}>
                Paid on: {new Date(order.paymentDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {mergeCandidates.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <h2 className="section-title">Merge Order</h2>
              <p style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 10 }}>
                This customer has other unpaid orders. Merge one into this order.
              </p>
              <select value={mergeTarget} onChange={(e) => setMergeTarget(e.target.value)} style={{ marginBottom: 10 }}>
                <option value="">Select an order...</option>
                {mergeCandidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.orderNumber} ({c.totalAmount} ৳)
                  </option>
                ))}
              </select>
              <button className="btn-primary" disabled={!mergeTarget || busy} onClick={handleMerge}>
                Merge
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
