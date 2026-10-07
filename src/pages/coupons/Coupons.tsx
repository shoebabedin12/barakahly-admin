import { useState } from "react";
import { ActiveBadge, ResourceList } from "../../components/ResourceList";
import { CheckboxField, FormCard, TextField, useResourceForm } from "../../components/ResourceForm";
import { type Coupon, couponsApi, formatDate, formatMoney } from "../../lib/store";

export function CouponsList() {
  return (
    <ResourceList<Coupon>
      title="Coupons"
      noun="coupons"
      basePath="/coupons"
      newLabel="+ New Coupon"
      load={couponsApi.list}
      remove={couponsApi.remove}
      label={(c) => c.code}
      columns={[
        { header: "Code", render: (c) => <strong>{c.code}</strong> },
        {
          header: "Discount",
          render: (c) =>
            c.type === "percentage"
              ? `${Number(c.value)}%${c.maxDiscount ? ` (max ${formatMoney(c.maxDiscount)})` : ""}`
              : formatMoney(c.value),
        },
        { header: "Min order", render: (c) => formatMoney(c.minOrderAmount) },
        {
          header: "Valid",
          render: (c) => (c.startDate || c.endDate ? `${formatDate(c.startDate)} → ${formatDate(c.endDate)}` : "Always"),
        },
        { header: "Status", render: (c) => <ActiveBadge active={c.status} /> },
      ]}
    />
  );
}

export function CouponForm() {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"fixed" | "percentage">("fixed");
  const [value, setValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [status, setStatus] = useState(true);

  const form = useResourceForm<Coupon>({
    noun: "coupon",
    load: couponsApi.get,
    fill: (c) => {
      setCode(c.code);
      setType(c.type);
      setValue(String(Number(c.value)));
      setMinOrderAmount(Number(c.minOrderAmount) ? String(Number(c.minOrderAmount)) : "");
      setMaxDiscount(c.maxDiscount ? String(Number(c.maxDiscount)) : "");
      setStartDate(c.startDate ?? "");
      setEndDate(c.endDate ?? "");
      setUsageLimit(c.usageLimit ? String(c.usageLimit) : "");
      setStatus(c.status);
    },
  });

  if (form.loading) return <p>Loading...</p>;

  const input = { code, type, value, minOrderAmount, maxDiscount, startDate, endDate, usageLimit, status };

  return (
    <FormCard
      title={form.isEdit ? "Edit Coupon" : "New Coupon"}
      error={form.error}
      submitting={form.submitting}
      onCancel={() => form.navigate("/coupons")}
      onSubmit={() =>
        form.submit(() => (form.id ? couponsApi.update(form.id, input) : couponsApi.create(input)), "/coupons")
      }
    >
      <TextField id="code" label="Code" required value={code} onChange={(v) => setCode(v.toUpperCase())} hint="Customers type this at checkout. Saved in capitals." />
      <div className="field">
        <label htmlFor="type">Type</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value as "fixed" | "percentage")}>
          <option value="fixed">Fixed amount (৳)</option>
          <option value="percentage">Percentage (%)</option>
        </select>
      </div>
      <TextField id="value" label={type === "percentage" ? "Discount (%)" : "Discount (৳)"} type="number" step="0.01" required value={value} onChange={setValue} />
      {type === "percentage" && (
        <TextField id="maxDiscount" label="Maximum discount (৳)" type="number" step="0.01" value={maxDiscount} onChange={setMaxDiscount} hint="Leave blank for no cap." />
      )}
      <TextField id="minOrderAmount" label="Minimum order amount (৳)" type="number" step="0.01" value={minOrderAmount} onChange={setMinOrderAmount} />
      <TextField id="startDate" label="Starts on" type="date" value={startDate} onChange={setStartDate} />
      <TextField id="endDate" label="Ends on" type="date" value={endDate} onChange={setEndDate} />
      <TextField id="usageLimit" label="Usage limit" type="number" value={usageLimit} onChange={setUsageLimit} hint="For your records - leave blank for unlimited." />
      <CheckboxField id="status" label="Active" checked={status} onChange={setStatus} />
    </FormCard>
  );
}
