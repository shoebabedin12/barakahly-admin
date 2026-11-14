import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ResourceList } from "../../components/ResourceList";
import { FormCard, TextField, useResourceForm } from "../../components/ResourceForm";
import { StatusBadge } from "../../components/StatusBadge";
import { ApiError } from "../../lib/api";
import {
  type FundingSource,
  type Purchase,
  type PurchaseCost,
  type PurchaseDetail as PurchaseDetailType,
  type PurchaseFormOptions,
  type PurchaseStatus,
  purchasesApi,
  today,
} from "../../lib/inventory";
import { formatDate, formatMoney } from "../../lib/store";

export function PurchasesList() {
  return (
    <ResourceList<Purchase>
      title="Purchases"
      noun="purchases"
      basePath="/purchases"
      newLabel="+ New Purchase"
      load={(page) => purchasesApi.list(page)}
      remove={purchasesApi.remove}
      label={(p) => `${p.purchaseNumber}${p.status === "completed" ? " (its stock will be taken back)" : ""}`}
      columns={[
        {
          header: "Purchase",
          render: (p) => <Link to={`/purchases/${p.id}`}>{p.purchaseNumber}</Link>,
        },
        { header: "Supplier", render: (p) => p.supplier?.name ?? "-" },
        { header: "Date", render: (p) => formatDate(p.purchaseDate) },
        { header: "Total", render: (p) => formatMoney(p.totalAmount) },
        { header: "Due", render: (p) => formatMoney(p.dueAmount) },
        { header: "Status", render: (p) => <StatusBadge status={p.status} /> },
        {
          header: "Payment",
          render: (p) => <StatusBadge status={p.paymentStatus} />,
        },
      ]}
    />
  );
}

interface LineDraft {
  key: number;
  productId: string;
  variantId: string;
  quantity: string;
  price: string;
}

interface CostDraft {
  key: number;
  title: string;
  amount: string;
}

let nextKey = 1;
const blankLine = (): LineDraft => ({
  key: nextKey++,
  productId: "",
  variantId: "",
  quantity: "1",
  price: "",
});
const blankCost = (): CostDraft => ({ key: nextKey++, title: "", amount: "" });

export function PurchaseForm() {
  const [options, setOptions] = useState<PurchaseFormOptions | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [status, setStatus] = useState<PurchaseStatus>("pending");
  const [originalStatus, setOriginalStatus] = useState<PurchaseStatus | null>(null);
  const [fundingSource, setFundingSource] = useState<FundingSource>("business");
  const [investmentId, setInvestmentId] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([blankLine()]);
  const [costs, setCosts] = useState<CostDraft[]>([]);
  const [purchaseNumber, setPurchaseNumber] = useState("");
  const [loaded, setLoaded] = useState<PurchaseDetailType | null>(null);

  useEffect(() => {
    purchasesApi
      .formOptions()
      .then(setOptions)
      .catch((err) =>
        setOptionsError(err instanceof ApiError ? err.message : "Could not load suppliers and products."),
      );
  }, []);

  const form = useResourceForm<PurchaseDetailType>({
    noun: "purchase",
    load: purchasesApi.get,
    fill: (p) => {
      setLoaded(p);
      setPurchaseNumber(p.purchaseNumber);
      setSupplierId(String(p.supplierId));
      setPurchaseDate(p.purchaseDate.slice(0, 10));
      setStatus(p.status);
      setOriginalStatus(p.status);
      setFundingSource(p.fundingSource);
      setInvestmentId(p.investmentId ? String(p.investmentId) : "");
      setLines(
        p.items.map((i) => ({
          key: nextKey++,
          productId: String(i.productId),
          variantId: i.productVariantId ? String(i.productVariantId) : "",
          quantity: String(i.quantity),
          price: String(Number(i.purchasePrice)),
        })),
      );
    },
  });

  if (form.loading || (!options && !optionsError)) return <p>Loading...</p>;
  if (!options) return <div className="form-error">{optionsError}</div>;

  // Keep a supplier/product that has since been deactivated selectable on edit.
  const suppliers =
    loaded && !options.suppliers.some((s) => s.id === loaded.supplierId)
      ? [...options.suppliers, loaded.supplier]
      : options.suppliers;
  const products = [...options.products];
  for (const item of loaded?.items ?? []) {
    if (item.product && !products.some((p) => p.id === item.productId))
      products.push({
        ...item.product,
        costPrice: null,
        variants: item.variant ? [{ ...item.variant, status: true }] : [],
      });
  }
  const subtotal = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.price) || 0), 0);
  const extra = costs.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  function updateLine(key: number, patch: Partial<LineDraft>) {
    setLines((ls) =>
      ls.map((l) => {
        if (l.key !== key) return l;
        const next = { ...l, ...patch };
        if (patch.productId !== undefined && patch.productId !== l.productId) next.variantId = "";
        // Prefill the price from the product's last landed cost when picking a product.
        if (patch.productId && !l.price) {
          const product = products.find((p) => String(p.id) === patch.productId);
          if (product?.costPrice) next.price = String(Number(product.costPrice));
        }
        return next;
      }),
    );
  }

  const input = {
    supplierId: Number(supplierId),
    purchaseDate,
    status,
    fundingSource,
    investmentId: fundingSource === "investment" && investmentId ? Number(investmentId) : null,
    items: lines
      .filter((l) => l.productId)
      .map((l) => ({
        productId: Number(l.productId),
        variantId: l.variantId ? Number(l.variantId) : null,
        quantity: Number(l.quantity),
        price: l.price,
      })),
    ...(form.isEdit
      ? {}
      : {
          costs: costs.filter((c) => c.title && c.amount).map(({ title, amount }) => ({ title, amount })),
        }),
  };

  return (
    <FormCard
      title={form.isEdit ? `Edit Purchase ${purchaseNumber}` : "New Purchase"}
      error={form.error}
      submitting={form.submitting}
      maxWidth={860}
      onCancel={() => form.navigate(form.id ? `/purchases/${form.id}` : "/purchases")}
      onSubmit={() =>
        form.submit(
          () => (form.id ? purchasesApi.update(form.id, input) : purchasesApi.create(input)),
          form.id ? `/purchases/${form.id}` : "/purchases",
        )
      }
    >
      <div className="field">
        <label htmlFor="supplier">Supplier</label>
        <select id="supplier" required value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
          <option value="">Select a supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.companyName && s.companyName !== s.name ? ` (${s.companyName})` : ""}
            </option>
          ))}
        </select>
        {suppliers.length === 0 && (
          <p style={{ margin: "6px 0 0", fontSize: 12 }}>
            No active suppliers. <Link to="/suppliers/new">Add one first.</Link>
          </p>
        )}
      </div>

      <TextField
        id="purchaseDate"
        label="Purchase date"
        type="date"
        required
        value={purchaseDate}
        onChange={setPurchaseDate}
      />

      <div className="field">
        <label htmlFor="status">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value as PurchaseStatus)}>
          <option value="pending">Pending (not received yet)</option>
          <option value="completed">Completed (received - adds to stock)</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {originalStatus === "completed" && (
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 12,
              color: "var(--color-muted)",
            }}
          >
            This purchase is already in stock. Saving takes its old quantities back out and adds the new ones
            {status === "completed" ? "" : " (none, since it will no longer be completed)"}.
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="fundingSource">Funded by</label>
        <select
          id="fundingSource"
          value={fundingSource}
          onChange={(e) => setFundingSource(e.target.value as FundingSource)}
        >
          <option value="business">Business fund</option>
          <option value="investment">Investment</option>
        </select>
      </div>

      {fundingSource === "investment" && (
        <div className="field">
          <label htmlFor="investment">Investment</label>
          <select id="investment" required value={investmentId} onChange={(e) => setInvestmentId(e.target.value)}>
            <option value="">Select an investment</option>
            {options.investments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.investorName} - {formatDate(i.investedDate)} - {formatMoney(i.remainingAmount)} left
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="field">
        <label>Products</label>
        <div className="line-items">
          <div className="line-item line-item-head">
            <span>Product</span>
            <span>Qty</span>
            <span>Unit price (৳)</span>
            <span style={{ textAlign: "right" }}>Line total</span>
            <span style={{ width: 70 }} />
          </div>
          {lines.map((l) => {
            const variants = products.find((p) => String(p.id) === l.productId)?.variants ?? [];
            return (
              <div key={l.key} className="line-item">
                <div style={{ display: "grid", gap: 6 }}>
                  <select
                    required
                    value={l.productId}
                    onChange={(e) => updateLine(l.key, { productId: e.target.value })}
                    aria-label="Product"
                  >
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.sku}
                        {p.variants.length > 0 ? ` · ${p.variants.length} variants` : ` · stock ${p.stock}`}
                      </option>
                    ))}
                  </select>
                  {variants.length > 0 && (
                    <select
                      required
                      value={l.variantId}
                      onChange={(e) => updateLine(l.key, { variantId: e.target.value })}
                      aria-label="Variant"
                    >
                      <option value="">Select colour / size</option>
                      {variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label} · stock {v.stock}
                          {v.status ? "" : " (hidden)"}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  aria-label="Quantity"
                  value={l.quantity}
                  onChange={(e) => updateLine(l.key, { quantity: e.target.value })}
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  aria-label="Unit price"
                  value={l.price}
                  onChange={(e) => updateLine(l.key, { price: e.target.value })}
                />
                <span className="line-total">{formatMoney((Number(l.quantity) || 0) * (Number(l.price) || 0))}</span>
                <button
                  type="button"
                  className="btn-danger"
                  style={{ width: 70 }}
                  disabled={lines.length === 1}
                  onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
        <button type="button" className="btn-secondary" onClick={() => setLines((ls) => [...ls, blankLine()])}>
          + Add product
        </button>
      </div>

      {!form.isEdit && (
        <div className="field">
          <label>Extra costs (shipping, customs...)</label>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 12,
              color: "var(--color-muted)",
            }}
          >
            Spread over the products by value to work out each one's landed cost.
          </p>
          {costs.map((c) => (
            <div key={c.key} className="inline-form" style={{ marginBottom: 8 }}>
              <input
                type="text"
                placeholder="Title"
                value={c.title}
                onChange={(e) =>
                  setCosts((cs) => cs.map((x) => (x.key === c.key ? { ...x, title: e.target.value } : x)))
                }
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount (৳)"
                value={c.amount}
                onChange={(e) =>
                  setCosts((cs) => cs.map((x) => (x.key === c.key ? { ...x, amount: e.target.value } : x)))
                }
              />
              <button
                type="button"
                className="btn-danger"
                onClick={() => setCosts((cs) => cs.filter((x) => x.key !== c.key))}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={() => setCosts((cs) => [...cs, blankCost()])}>
            + Add cost
          </button>
        </div>
      )}

      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          paddingTop: 12,
          marginBottom: 8,
        }}
      >
        <div className="totals-row">
          <span>Products subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        {!form.isEdit && extra > 0 && (
          <div className="totals-row">
            <span>Extra costs</span>
            <span>{formatMoney(extra)}</span>
          </div>
        )}
        <div className="totals-row" style={{ fontWeight: 700 }}>
          <span>{form.isEdit ? "Subtotal (extra costs are managed on the purchase page)" : "Total"}</span>
          <span>{formatMoney(form.isEdit ? subtotal : subtotal + extra)}</span>
        </div>
      </div>
    </FormCard>
  );
}

export function PurchaseDetail() {
  const { id } = useParams();
  const purchaseId = Number(id);
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState<PurchaseDetailType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [payment, setPayment] = useState("");
  const [costTitle, setCostTitle] = useState("");
  const [costAmount, setCostAmount] = useState("");
  const [costDate, setCostDate] = useState(today());
  const [confirm, setConfirm] = useState<"complete" | "delete" | null>(null);
  const [pendingCost, setPendingCost] = useState<PurchaseCost | null>(null);

  useEffect(() => {
    purchasesApi
      .get(purchaseId)
      .then(setPurchase)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load purchase."));
  }, [purchaseId]);

  async function run(action: () => Promise<PurchaseDetailType | unknown>) {
    setBusy(true);
    setError(null);
    try {
      const result = await action();
      if (result && typeof result === "object" && "items" in result) setPurchase(result as PurchaseDetailType);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (error && !purchase) return <div className="form-error">{error}</div>;
  if (!purchase) return <p>Loading...</p>;

  const extraCosts = purchase.costs.reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div>
      <div className="page-header">
        <h1>
          Purchase {purchase.purchaseNumber}
          <span style={{ marginLeft: 12 }}>
            <StatusBadge status={purchase.status} />
          </span>
        </h1>
        <div className="row-actions no-print">
          <button type="button" className="btn-secondary" onClick={() => window.print()}>
            Print
          </button>
          <Link to={`/purchases/${purchase.id}/edit`} className="btn-secondary">
            Edit
          </Link>
          <Link to="/purchases" className="btn-secondary">
            Back to Purchases
          </Link>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="dashboard-grid">
        <div>
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h2 className="section-title">Items</h2>
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit price</th>
                  <th>Landed cost</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {purchase.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.product ? (
                        <Link to={`/products/${item.product.id}/edit`}>{item.product.name}</Link>
                      ) : (
                        `Product #${item.productId}`
                      )}
                      {item.variant ? (
                        <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
                          {item.variant.label} · {item.variant.sku ?? item.product?.sku} · in stock {item.variant.stock}
                        </div>
                      ) : (
                        item.product && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--color-muted)",
                            }}
                          >
                            {item.product.sku} · in stock {item.product.stock}
                          </div>
                        )
                      )}
                    </td>
                    <td>{item.quantity}</td>
                    <td>{formatMoney(item.purchasePrice)}</td>
                    <td>{formatMoney(item.landedCost)}</td>
                    <td>{formatMoney(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              style={{
                padding: 16,
                borderTop: "1px solid var(--color-border)",
                marginTop: 8,
              }}
            >
              <div className="totals-row">
                <span>Subtotal</span>
                <span>{formatMoney(purchase.subtotal)}</span>
              </div>
              <div className="totals-row">
                <span>Extra costs</span>
                <span>{formatMoney(extraCosts)}</span>
              </div>
              <div className="totals-row" style={{ fontWeight: 700, fontSize: 16 }}>
                <span>Total</span>
                <span>{formatMoney(purchase.totalAmount)}</span>
              </div>
              <div className="totals-row">
                <span>Paid</span>
                <span>{formatMoney(purchase.paidAmount)}</span>
              </div>
              <div className="totals-row" style={{ fontWeight: 600 }}>
                <span>Due</span>
                <span>{formatMoney(purchase.dueAmount)}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h2 className="section-title">Extra costs</h2>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 12,
                color: "var(--color-muted)",
              }}
            >
              Shipping, customs, handling... Spread over the items by value to give each one's landed cost
              {purchase.status === "completed" ? ", which also becomes the product's cost price." : "."}
            </p>
            <form
              className="inline-form no-print"
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await run(() =>
                  purchasesApi.addCost(purchase.id, {
                    title: costTitle,
                    amount: costAmount,
                    costDate,
                  }),
                );
                if (ok) {
                  setCostTitle("");
                  setCostAmount("");
                }
              }}
            >
              <input
                type="text"
                required
                placeholder="Title"
                value={costTitle}
                onChange={(e) => setCostTitle(e.target.value)}
              />
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="Amount (৳)"
                value={costAmount}
                onChange={(e) => setCostAmount(e.target.value)}
              />
              <input type="date" required value={costDate} onChange={(e) => setCostDate(e.target.value)} />
              <button type="submit" className="btn-primary" disabled={busy}>
                Add cost
              </button>
            </form>
            <table className="mini-table" style={{ marginTop: 12 }}>
              <tbody>
                {purchase.costs.map((c) => (
                  <tr key={c.id}>
                    <td>{c.title}</td>
                    <td>{formatDate(c.costDate)}</td>
                    <td>{formatMoney(c.amount)}</td>
                    <td style={{ textAlign: "right" }} className="no-print">
                      <button type="button" className="btn-danger" disabled={busy} onClick={() => setPendingCost(c)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {purchase.costs.length === 0 && <div className="empty-state">No extra costs.</div>}
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h2 className="section-title">Details</h2>
            <div className="totals-row">
              <span>Supplier</span>
              <Link to={`/suppliers/${purchase.supplier.id}/edit`}>{purchase.supplier.name}</Link>
            </div>
            {purchase.supplier.phone && (
              <div className="totals-row">
                <span>Phone</span>
                <span>{purchase.supplier.phone}</span>
              </div>
            )}
            <div className="totals-row">
              <span>Date</span>
              <span>{formatDate(purchase.purchaseDate)}</span>
            </div>
            <div className="totals-row">
              <span>Funded by</span>
              <span>
                {purchase.fundingSource === "investment"
                  ? `Investment - ${purchase.investment?.investorName ?? "?"}`
                  : "Business fund"}
              </span>
            </div>
            <div className="totals-row">
              <span>Payment</span>
              <StatusBadge status={purchase.paymentStatus} />
            </div>
          </div>

          {purchase.status === "pending" && (
            <div className="card no-print" style={{ padding: 20, marginBottom: 20 }}>
              <h2 className="section-title">Receive stock</h2>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 13,
                  color: "var(--color-muted)",
                }}
              >
                Marks the purchase completed and adds every item's quantity to its product's stock.
              </p>
              <button type="button" className="btn-primary" disabled={busy} onClick={() => setConfirm("complete")}>
                Complete purchase
              </button>
            </div>
          )}

          {Number(purchase.dueAmount) > 0 && (
            <div className="card no-print" style={{ padding: 20, marginBottom: 20 }}>
              <h2 className="section-title">Record payment</h2>
              <form
                className="inline-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (await run(() => purchasesApi.addPayment(purchase.id, payment))) setPayment("");
                }}
              >
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  placeholder={`Up to ${formatMoney(purchase.dueAmount)}`}
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                />
                <button type="submit" className="btn-primary" disabled={busy}>
                  Add
                </button>
              </form>
            </div>
          )}

          <div className="card no-print" style={{ padding: 20 }}>
            <button type="button" className="btn-danger" disabled={busy} onClick={() => setConfirm("delete")}>
              Delete purchase
            </button>
          </div>
        </div>
      </div>

      {confirm === "complete" && (
        <ConfirmDialog
          title="Complete purchase?"
          message="Every item's quantity will be added to stock. This can't be undone except by editing or deleting the purchase."
          confirmLabel="Complete"
          busy={busy}
          onConfirm={async () => {
            await run(() => purchasesApi.complete(purchase.id));
            setConfirm(null);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {confirm === "delete" && (
        <ConfirmDialog
          title="Delete purchase?"
          message={`This will permanently delete ${purchase.purchaseNumber}${purchase.status === "completed" ? " and take its quantities back out of stock" : ""}.`}
          busy={busy}
          onConfirm={async () => {
            if (await run(() => purchasesApi.remove(purchase.id))) navigate("/purchases");
            setConfirm(null);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {pendingCost && (
        <ConfirmDialog
          title="Remove cost?"
          message={`Remove "${pendingCost.title}" (${formatMoney(pendingCost.amount)})? Landed costs will be recalculated.`}
          confirmLabel="Remove"
          busy={busy}
          onConfirm={async () => {
            await run(() => purchasesApi.removeCost(purchase.id, pendingCost.id));
            setPendingCost(null);
          }}
          onCancel={() => setPendingCost(null)}
        />
      )}
    </div>
  );
}
