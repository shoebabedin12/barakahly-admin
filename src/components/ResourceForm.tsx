import { type ReactNode, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../lib/api";

interface UseResourceFormOptions<T> {
  /** Loads the record being edited (skipped on /new). */
  load: (id: number) => Promise<T>;
  /** Copies the loaded record into the form's state. */
  fill: (record: T) => void;
  noun: string;
}

/** Edit-or-create plumbing shared by the admin forms: loading, submitting, errors, navigation. */
export function useResourceForm<T>({ load, fill, noun }: UseResourceFormOptions<T>) {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    load(Number(id))
      .then(fill)
      .catch((err) => setError(err instanceof ApiError ? err.message : `Could not load ${noun}.`))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  async function submit(save: () => Promise<unknown>, backTo: string) {
    setSubmitting(true);
    setError(null);
    try {
      await save();
      navigate(backTo);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Could not save ${noun}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return { id: id ? Number(id) : null, isEdit, loading, submitting, error, submit, navigate };
}

interface FormCardProps {
  title: string;
  error: string | null;
  submitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  children: ReactNode;
  maxWidth?: number;
  aside?: ReactNode;
}

export function FormCard({ title, error, submitting, onSubmit, onCancel, children, maxWidth = 560, aside }: FormCardProps) {
  return (
    <div>
      <div className="page-header">
        <h1>{title}</h1>
      </div>

      <div className="card" style={{ padding: 24, maxWidth }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {children}

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {aside}
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  textarea?: boolean;
  step?: string;
}

export function TextField({ id, label, value, onChange, type = "text", required, placeholder, hint, textarea, step }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {textarea ? (
        <textarea id={id} rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input
          id={id}
          type={type}
          step={step}
          required={required}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--color-muted)" }}>{hint}</p>}
    </div>
  );
}

export function CheckboxField({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="field checkbox-field">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id} style={{ margin: 0 }}>
        {label}
      </label>
    </div>
  );
}
