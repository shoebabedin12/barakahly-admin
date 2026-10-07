import { useState } from "react";
import { Link } from "react-router-dom";
import { ActiveBadge, ResourceList } from "../../components/ResourceList";
import { CheckboxField, FormCard, TextField, useResourceForm } from "../../components/ResourceForm";
import { StatusBadge } from "../../components/StatusBadge";
import { type CustomerDetail, type CustomerRow, customersApi, formatDate, formatMoney } from "../../lib/store";

export function CustomersList() {
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");

  return (
    <ResourceList<CustomerRow>
      title="Customers"
      noun="customers"
      basePath="/customers"
      newLabel="+ New Customer"
      load={(page) => customersApi.list(page, search)}
      remove={customersApi.remove}
      label={(c) => c.name}
      reloadKey={search}
      toolbar={
        <form
          className="toolbar"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(draft.trim());
          }}
        >
          <input type="text" placeholder="Search name, phone or email" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button type="submit">Search</button>
        </form>
      }
      columns={[
        { header: "Name", render: (c) => c.name },
        { header: "Phone", render: (c) => c.phone },
        { header: "Email", render: (c) => c.email ?? "-" },
        { header: "Orders", render: (c) => c.ordersCount },
        { header: "Spent", render: (c) => formatMoney(c.totalSpent) },
        { header: "Joined", render: (c) => formatDate(c.createdAt) },
        { header: "Status", render: (c) => <ActiveBadge active={c.status} /> },
      ]}
    />
  );
}

export function CustomerForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [detail, setDetail] = useState<CustomerDetail | null>(null);

  const form = useResourceForm<CustomerDetail>({
    noun: "customer",
    load: customersApi.get,
    fill: (c) => {
      setDetail(c);
      setName(c.name);
      setPhone(c.phone);
      setEmail(c.email ?? "");
      setAddress(c.address ?? "");
      setCity(c.city ?? "");
      setStatus(c.status);
    },
  });

  if (form.loading) return <p>Loading...</p>;

  const input = {
    name,
    phone,
    email: email || null,
    address: address || null,
    city: city || null,
    status,
    password: password || null,
    passwordConfirmation: passwordConfirmation || null,
  };

  return (
    <FormCard
      title={form.isEdit ? "Edit Customer" : "New Customer"}
      error={form.error}
      submitting={form.submitting}
      onCancel={() => form.navigate("/customers")}
      onSubmit={() =>
        form.submit(() => (form.id ? customersApi.update(form.id, input) : customersApi.create(input)), "/customers")
      }
      aside={
        detail && (
          <div className="card" style={{ marginTop: 24 }}>
            <div style={{ padding: "16px 16px 0", fontWeight: 600 }}>
              Orders ({detail.ordersCount}) · Delivered total {formatMoney(detail.totalSpent)}
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {detail.orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link to={`/orders/${o.id}`}>{o.orderNumber}</Link>
                    </td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td>{formatMoney(o.totalAmount)}</td>
                    <td>
                      <StatusBadge status={o.orderStatus} />
                    </td>
                    <td>
                      <StatusBadge status={o.paymentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {detail.orders.length === 0 && <div className="empty-state">No orders yet.</div>}
          </div>
        )
      }
    >
      <TextField id="name" label="Name" required value={name} onChange={setName} />
      <TextField id="phone" label="Phone" required value={phone} onChange={setPhone} />
      <TextField id="email" label="Email" type="email" value={email} onChange={setEmail} />
      <TextField id="address" label="Address" textarea value={address} onChange={setAddress} />
      <TextField id="city" label="City" value={city} onChange={setCity} />
      <TextField
        id="password"
        label={detail?.hasPassword ? "New login password" : "Login password"}
        type="password"
        value={password}
        onChange={setPassword}
        hint={
          detail?.hasPassword
            ? "Leave blank to keep the current password."
            : "Optional. At least 8 characters with upper and lower case, a number and a symbol."
        }
      />
      {password && (
        <TextField id="passwordConfirmation" label="Confirm password" type="password" value={passwordConfirmation} onChange={setPasswordConfirmation} />
      )}
      <CheckboxField id="status" label="Active" checked={status} onChange={setStatus} />
    </FormCard>
  );
}
