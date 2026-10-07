import { useState } from "react";
import { ActiveBadge, ResourceList } from "../../components/ResourceList";
import { CheckboxField, FormCard, TextField, useResourceForm } from "../../components/ResourceForm";
import { formatMoney, type ShippingZone, shippingZonesApi } from "../../lib/store";

export function ShippingZonesList() {
  return (
    <ResourceList<ShippingZone>
      title="Shipping Zones"
      noun="shipping zones"
      basePath="/shipping-zones"
      newLabel="+ New Shipping Zone"
      load={() => shippingZonesApi.list()}
      remove={shippingZonesApi.remove}
      label={(z) => z.name}
      columns={[
        { header: "Name", render: (z) => z.name },
        { header: "Charge", render: (z) => formatMoney(z.charge) },
        { header: "Status", render: (z) => <ActiveBadge active={z.status} /> },
      ]}
    />
  );
}

export function ShippingZoneForm() {
  const [name, setName] = useState("");
  const [charge, setCharge] = useState("");
  const [status, setStatus] = useState(true);

  const form = useResourceForm<ShippingZone>({
    noun: "shipping zone",
    load: shippingZonesApi.get,
    fill: (z) => {
      setName(z.name);
      setCharge(String(Number(z.charge)));
      setStatus(z.status);
    },
  });

  if (form.loading) return <p>Loading...</p>;

  const input = { name, charge, status };

  return (
    <FormCard
      title={form.isEdit ? "Edit Shipping Zone" : "New Shipping Zone"}
      error={form.error}
      submitting={form.submitting}
      maxWidth={480}
      onCancel={() => form.navigate("/shipping-zones")}
      onSubmit={() =>
        form.submit(
          () => (form.id ? shippingZonesApi.update(form.id, input) : shippingZonesApi.create(input)),
          "/shipping-zones",
        )
      }
    >
      <TextField id="name" label="Name" required value={name} onChange={setName} placeholder="e.g. Inside Dhaka" />
      <TextField id="charge" label="Delivery charge (৳)" type="number" step="0.01" required value={charge} onChange={setCharge} />
      <CheckboxField id="status" label="Active (shown at checkout)" checked={status} onChange={setStatus} />
    </FormCard>
  );
}
