import { useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ActiveBadge, ResourceList } from "../../components/ResourceList";
import { CheckboxField, FormCard, TextField, useResourceForm } from "../../components/ResourceForm";
import { StatusBadge } from "../../components/StatusBadge";
import { ApiError } from "../../lib/api";
import {
  type SupplierDetail,
  type SupplierPayment,
  type SupplierRow,
  suppliersApi,
  today,
} from "../../lib/inventory";
import { formatDate, formatMoney } from "../../lib/store";

export function SuppliersList() {
  return (
    <ResourceList<SupplierRow>
      title="Suppliers"
      noun="suppliers"
      basePath="/suppliers"
      newLabel="+ New Supplier"
      load={(page) => suppliersApi.list(page)}
      remove={suppliersApi.remove}
      label={(s) => s.name}
      columns={[
        { header: "Name", render: (s) => <Link to={`/suppliers/${s.id}/edit`}>{s.name}</Link> },
        { header: "Company", render: (s) => s.companyName ?? "-" },
        { header: "Phone", render: (s) => s.phone ?? "-" },
        { header: "Purchased", render: (s) => formatMoney(s.totalPurchaseAmount) },
        { header: "Paid", render: (s) => formatMoney(s.totalPaid) },
        { header: "Due", render: (s) => <DueAmount due={s.totalDue} /> },
        { header: "Status", render: (s) => <ActiveBadge active={s.status} /> },
      ]}
    />
  );
}

export function SupplierForm() {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState(true);
  const [detail, setDetail] = useState<SupplierDetail | null>(null);

  const form = useResourceForm<SupplierDetail>({
    noun: "supplier",
    load: suppliersApi.get,
    fill: (s) => {
      setDetail(s);
      setName(s.name);
      setCompanyName(s.companyName ?? "");
      setPhone(s.phone ?? "");
      setEmail(s.email ?? "");
      setAddress(s.address ?? "");
      setStatus(s.status);
    },
  });

  if (form.loading) return <p>Loading...</p>;

  const input = {
    name,
    companyName: companyName || null,
    phone: phone || null,
    email: email || null,
    address: address || null,
    status,
  };

  return (
    <FormCard
      title={form.isEdit ? "Edit Supplier" : "New Supplier"}
      error={form.error}
      submitting={form.submitting}
      onCancel={() => form.navigate("/suppliers")}
      onSubmit={() =>
        form.submit(() => (form.id ? suppliersApi.update(form.id, input) : suppliersApi.create(input)), "/suppliers")
      }
      aside={detail && <SupplierLedger detail={detail} onChange={setDetail} />}
    >
      <TextField id="name" label="Name" required value={name} onChange={setName} />
      <TextField id="companyName" label="Company name" value={companyName} onChange={setCompanyName} />
      <TextField id="phone" label="Phone" value={phone} onChange={setPhone} />
      <TextField id="email" label="Email" type="email" value={email} onChange={setEmail} />
      <TextField id="address" label="Address" textarea value={address} onChange={setAddress} />
      <CheckboxField id="status" label="Active (selectable on new purchases)" checked={status} onChange={setStatus} />
    </FormCard>
  );
}

function DueAmount({ due }: { due: number }) {
  return due < 0 ? <span title="Paid more than purchased">{formatMoney(-due)} advance</span> : <>{formatMoney(due)}</>;
}

/** Balance, purchases and payments for one supplier, with add/remove payment. */
function SupplierLedger({ detail, onChange }: { detail: SupplierDetail; onChange: (d: SupplierDetail) => void }) {
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(today());
  const [paymentMethod, setPaymentMethod] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SupplierPayment | null>(null);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      onChange(await suppliersApi.get(detail.id));
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function addPayment() {
    const ok = await run(() =>
      suppliersApi.addPayment(detail.id, {
        amount,
        paymentDate,
        paymentMethod: paymentMethod || null,
        note: note || null,
      }),
    );
    if (ok) {
      setAmount("");
      setPaymentMethod("");
      setNote("");
    }
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Purchases</div>
          <div className="value">{detail.purchaseCount}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total purchased</div>
          <div className="value">{formatMoney(detail.totalPurchaseAmount)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Paid</div>
          <div className="value">{formatMoney(detail.totalPaid)}</div>
          <div className="sub">
            {formatMoney(detail.paidOnPurchases)} on purchases · {formatMoney(detail.supplierPayments)} direct
          </div>
        </div>
        <div className="stat-card">
          <div className="label">{detail.totalDue < 0 ? "Advance" : "Due"}</div>
          <div className="value">{formatMoney(Math.abs(detail.totalDue))}</div>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ padding: "16px 16px 0", fontWeight: 600 }}>Purchases</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Purchase</th>
              <th>Date</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {detail.purchases.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link to={`/purchases/${p.id}`}>{p.purchaseNumber}</Link>
                </td>
                <td>{formatDate(p.purchaseDate)}</td>
                <td>{formatMoney(p.totalAmount)}</td>
                <td>{formatMoney(p.paidAmount)}</td>
                <td>
                  <StatusBadge status={p.status} />
                </td>
                <td>
                  <StatusBadge status={p.paymentStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {detail.purchases.length === 0 && <div className="empty-state">No purchases yet.</div>}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h2 className="section-title">Supplier payments</h2>
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            void addPayment();
          }}
        >
          <input type="number" step="0.01" min="1" required placeholder="Amount (৳)" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <input type="date" required value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
          <input type="text" placeholder="Method (bKash, cash...)" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
          <input type="text" placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
          <button type="submit" className="btn-primary" disabled={busy}>
            Add payment
          </button>
        </form>

        <table className="mini-table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {detail.payments.map((p) => (
              <tr key={p.id}>
                <td>{formatDate(p.paymentDate)}</td>
                <td>{formatMoney(p.amount)}</td>
                <td>{p.paymentMethod ?? "-"}</td>
                <td>{p.note ?? "-"}</td>
                <td style={{ textAlign: "right" }}>
                  <button type="button" className="btn-danger" onClick={() => setPendingDelete(p)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {detail.payments.length === 0 && <div className="empty-state">No payments recorded.</div>}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete payment?"
          message={`This will remove the ${formatMoney(pendingDelete.amount)} payment from ${formatDate(pendingDelete.paymentDate)}.`}
          busy={busy}
          onConfirm={async () => {
            await run(() => suppliersApi.removePayment(detail.id, pendingDelete.id));
            setPendingDelete(null);
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
