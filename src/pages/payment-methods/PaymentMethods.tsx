import { useState } from "react";
import { ActiveBadge, ResourceList } from "../../components/ResourceList";
import { CheckboxField, FormCard, TextField, useResourceForm } from "../../components/ResourceForm";
import { type PaymentMethod, paymentMethodsApi } from "../../lib/store";

export function PaymentMethodsList() {
  return (
    <ResourceList<PaymentMethod>
      title="Payment Methods"
      noun="payment methods"
      basePath="/payment-methods"
      newLabel="+ New Payment Method"
      load={() => paymentMethodsApi.list()}
      remove={paymentMethodsApi.remove}
      label={(m) => m.name}
      columns={[
        { header: "Name", render: (m) => m.name },
        { header: "Code", render: (m) => <code>{m.code}</code> },
        { header: "Receiving number", render: (m) => m.receivingNumber ?? "-" },
        { header: "Transaction ID", render: (m) => (m.requiresTransactionId ? "Required" : "-") },
        { header: "Order", render: (m) => m.sortOrder },
        { header: "Status", render: (m) => <ActiveBadge active={m.status} /> },
      ]}
    />
  );
}

export function PaymentMethodForm() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [instructions, setInstructions] = useState("");
  const [receivingNumber, setReceivingNumber] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [requiresTransactionId, setRequiresTransactionId] = useState(false);
  const [status, setStatus] = useState(true);

  const form = useResourceForm<PaymentMethod>({
    noun: "payment method",
    load: paymentMethodsApi.get,
    fill: (m) => {
      setName(m.name);
      setCode(m.code);
      setInstructions(m.instructions ?? "");
      setReceivingNumber(m.receivingNumber ?? "");
      setSortOrder(String(m.sortOrder));
      setRequiresTransactionId(m.requiresTransactionId);
      setStatus(m.status);
    },
  });

  if (form.loading) return <p>Loading...</p>;

  const input = { name, code, instructions, receivingNumber, sortOrder, requiresTransactionId, status };

  return (
    <FormCard
      title={form.isEdit ? "Edit Payment Method" : "New Payment Method"}
      error={form.error}
      submitting={form.submitting}
      onCancel={() => form.navigate("/payment-methods")}
      onSubmit={() =>
        form.submit(
          () => (form.id ? paymentMethodsApi.update(form.id, input) : paymentMethodsApi.create(input)),
          "/payment-methods",
        )
      }
    >
      <TextField id="name" label="Name" required value={name} onChange={setName} />
      <TextField id="code" label="Code" required value={code} onChange={setCode} hint='Letters, numbers, "-" and "_" only (e.g. cod, bkash). "sslcommerz" turns on online card payment.' />
      <TextField id="instructions" label="Instructions" textarea value={instructions} onChange={setInstructions} hint="Shown to the customer at checkout." />
      <TextField id="receivingNumber" label="Receiving number / account" textarea value={receivingNumber} onChange={setReceivingNumber} />
      <TextField id="sortOrder" label="Sort order" type="number" value={sortOrder} onChange={setSortOrder} />
      <CheckboxField id="requiresTransactionId" label="Customer must enter a transaction ID and payment date" checked={requiresTransactionId} onChange={setRequiresTransactionId} />
      <CheckboxField id="status" label="Active" checked={status} onChange={setStatus} />
    </FormCard>
  );
}
