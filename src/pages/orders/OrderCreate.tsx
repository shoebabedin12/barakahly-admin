import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormCard, TextField } from "../../components/ResourceForm";
import { ApiError } from "../../lib/api";
import { createOrder, getCreateOrderOptions, type CreateOrderOptions } from "../../lib/orders";
import { formatMoney } from "../../lib/store";

interface LineDraft {
  key: number;
  productId: string;
  variantId: string;
  quantity: string;
  price: string;
}

let nextKey = 1;
const blankLine = (): LineDraft => ({ key: nextKey++, productId: "", variantId: "", quantity: "1", price: "" });

/** An order taken over the phone, WhatsApp or Facebook (Laravel's "Create custom order"). */
export function OrderCreate() {
  const navigate = useNavigate();
  const [options, setOptions] = useState<CreateOrderOptions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingZoneId, setShippingZoneId] = useState("");
  const [shippingCharge, setShippingCharge] = useState("0");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([blankLine()]);

  useEffect(() => {
    getCreateOrderOptions()
      .then((o) => {
        setOptions(o);
        const cod = o.paymentMethods.find((m) => m.code === "cod") ?? o.paymentMethods[0];
        if (cod) setPaymentMethodId(String(cod.id));
        const zone = o.shippingZones[0];
        if (zone) {
          setShippingZoneId(String(zone.id));
          setShippingCharge(String(zone.charge));
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load products."));
  }, []);

  if (!options) return error ? <div className="form-error">{error}</div> : <p>Loading...</p>;

  const products = options.products;

  function updateLine(key: number, patch: Partial<LineDraft>) {
    setLines((ls) =>
      ls.map((l) => {
        if (l.key !== key) return l;
        const next = { ...l, ...patch };
        const product = products.find((p) => String(p.id) === next.productId);
        if (patch.productId !== undefined && patch.productId !== l.productId) {
          next.variantId = "";
          next.price = product ? String(product.price) : "";
        }
        if (patch.variantId) {
          const variant = product?.variants.find((v) => String(v.id) === patch.variantId);
          if (variant) next.price = String(variant.price);
        }
        return next;
      }),
    );
  }

  const subtotal = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.price) || 0), 0);
  const selectedMethod = options.paymentMethods.find((m) => String(m.id) === paymentMethodId);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await createOrder({
        customerName,
        customerPhone,
        customerEmail: customerEmail.trim() || null,
        shippingAddress,
        shippingZoneId: shippingZoneId ? Number(shippingZoneId) : null,
        shippingCharge: Number(shippingCharge) || 0,
        paymentMethodId: Number(paymentMethodId),
        notes: notes.trim() || null,
        items: lines
          .filter((l) => l.productId)
          .map((l) => ({
            productId: Number(l.productId),
            variantId: l.variantId ? Number(l.variantId) : null,
            quantity: Number(l.quantity),
            price: Number(l.price),
          })),
      });
      navigate(`/orders/${res.order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the order.");
      setSubmitting(false);
    }
  }

  return (
    <FormCard
      title="Create Order"
      error={error}
      submitting={submitting}
      maxWidth={860}
      onCancel={() => navigate("/orders")}
      onSubmit={submit}
    >
      <TextField id="customerName" label="Customer name" required value={customerName} onChange={setCustomerName} />
      <TextField
        id="customerPhone"
        label="Phone"
        required
        value={customerPhone}
        onChange={setCustomerPhone}
        placeholder="01XXXXXXXXX"
        hint="An existing customer with this phone is reused; their saved name and email are kept."
      />
      <TextField id="customerEmail" label="Email (optional)" type="email" value={customerEmail} onChange={setCustomerEmail} />
      <TextField id="shippingAddress" label="Delivery address" textarea required value={shippingAddress} onChange={setShippingAddress} />

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
            const product = products.find((p) => String(p.id) === l.productId);
            const variants = product?.variants ?? [];
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
                        {p.variants.length > 0 ? ` · ${p.variants.length} options` : ` · stock ${p.stock}`}
                      </option>
                    ))}
                  </select>
                  {variants.length > 0 && (
                    <select
                      required
                      value={l.variantId}
                      onChange={(e) => updateLine(l.key, { variantId: e.target.value })}
                      aria-label="Colour / size"
                    >
                      <option value="">Select colour / size</option>
                      {variants.map((v) => (
                        <option key={v.id} value={v.id} disabled={v.stock < 1}>
                          {v.label} · stock {v.stock}
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

      <div className="field">
        <label htmlFor="shippingZone">Delivery zone</label>
        <select
          id="shippingZone"
          value={shippingZoneId}
          onChange={(e) => {
            setShippingZoneId(e.target.value);
            const zone = options.shippingZones.find((z) => String(z.id) === e.target.value);
            setShippingCharge(zone ? String(zone.charge) : "0");
          }}
        >
          <option value="">No zone</option>
          {options.shippingZones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name} · ৳{z.charge}
            </option>
          ))}
        </select>
      </div>
      <TextField
        id="shippingCharge"
        label="Delivery charge (৳)"
        type="number"
        step="0.01"
        value={shippingCharge}
        onChange={setShippingCharge}
      />

      <div className="field">
        <label htmlFor="paymentMethod">Payment method</label>
        <select id="paymentMethod" required value={paymentMethodId} onChange={(e) => setPaymentMethodId(e.target.value)}>
          {options.paymentMethods.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        {selectedMethod?.code === "sslcommerz" && (
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--color-muted)" }}>
            After saving, the order page shows a payment link to send the customer.
          </p>
        )}
      </div>

      <TextField id="notes" label="Note (optional)" textarea value={notes} onChange={setNotes} />

      <p style={{ margin: "8px 0 16px", fontWeight: 600 }}>
        Total: {formatMoney(subtotal + (Number(shippingCharge) || 0))}
      </p>
    </FormCard>
  );
}
