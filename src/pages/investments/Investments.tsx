import { useState } from "react";
import { ResourceList } from "../../components/ResourceList";
import { FormCard, TextField, useResourceForm } from "../../components/ResourceForm";
import { type Investment, type InvestmentRow, type InvestmentSummary, investmentsApi, today } from "../../lib/inventory";
import { formatDate, formatMoney } from "../../lib/store";

export function InvestmentsList() {
  const [summary, setSummary] = useState<InvestmentSummary | null>(null);

  return (
    <ResourceList<InvestmentRow>
      title="Investments"
      noun="investments"
      basePath="/investments"
      newLabel="+ New Investment"
      load={(page) =>
        investmentsApi.list(page).then((res) => {
          setSummary(res.summary);
          return res;
        })
      }
      remove={investmentsApi.remove}
      label={(i) => `${i.investorName} - ${formatMoney(i.amount)}`}
      toolbar={
        summary && (
          <div className="stat-grid">
            <div className="stat-card">
              <div className="label">Total invested</div>
              <div className="value">{formatMoney(summary.totalInvested)}</div>
            </div>
            <div className="stat-card">
              <div className="label">Used on purchases</div>
              <div className="value">{formatMoney(summary.totalUsed)}</div>
            </div>
            <div className="stat-card">
              <div className="label">Remaining</div>
              <div className="value">{formatMoney(summary.totalRemaining)}</div>
            </div>
          </div>
        )
      }
      columns={[
        { header: "Investor", render: (i) => i.investorName },
        { header: "Date", render: (i) => formatDate(i.investedDate) },
        { header: "Amount", render: (i) => formatMoney(i.amount) },
        { header: "Used", render: (i) => formatMoney(i.usedAmount) },
        { header: "Remaining", render: (i) => formatMoney(i.remainingAmount) },
        { header: "Note", render: (i) => i.note ?? "-" },
      ]}
    />
  );
}

export function InvestmentForm() {
  const [investorName, setInvestorName] = useState("");
  const [amount, setAmount] = useState("");
  const [investedDate, setInvestedDate] = useState(today());
  const [note, setNote] = useState("");

  const form = useResourceForm<Investment>({
    noun: "investment",
    load: investmentsApi.get,
    fill: (i) => {
      setInvestorName(i.investorName);
      setAmount(String(Number(i.amount)));
      setInvestedDate(i.investedDate.slice(0, 10));
      setNote(i.note ?? "");
    },
  });

  if (form.loading) return <p>Loading...</p>;

  const input = { investorName, amount, investedDate, note: note || null };

  return (
    <FormCard
      title={form.isEdit ? "Edit Investment" : "New Investment"}
      error={form.error}
      submitting={form.submitting}
      maxWidth={480}
      onCancel={() => form.navigate("/investments")}
      onSubmit={() =>
        form.submit(() => (form.id ? investmentsApi.update(form.id, input) : investmentsApi.create(input)), "/investments")
      }
    >
      <TextField id="investorName" label="Investor name" required value={investorName} onChange={setInvestorName} />
      <TextField id="amount" label="Amount (৳)" type="number" step="0.01" required value={amount} onChange={setAmount} />
      <TextField id="investedDate" label="Invested date" type="date" required value={investedDate} onChange={setInvestedDate} />
      <TextField id="note" label="Note" textarea value={note} onChange={setNote} />
    </FormCard>
  );
}
