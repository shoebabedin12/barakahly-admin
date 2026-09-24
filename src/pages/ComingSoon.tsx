import { useLocation } from "react-router-dom";

export function ComingSoon() {
  const location = useLocation();
  const title = location.pathname
    .split("/")
    .filter(Boolean)
    .map((s) => s.replace(/-/g, " "))
    .join(" / ");

  return (
    <div>
      <div className="page-header">
        <h1 style={{ textTransform: "capitalize" }}>{title || "Coming soon"}</h1>
      </div>
      <div className="card empty-state" style={{ padding: 48 }}>
        This section hasn't been migrated to the new admin yet - it's still on the Laravel admin
        panel for now.
      </div>
    </div>
  );
}
