import { IconArrowRightStartOnRectangle, IconBell, IconMoon, IconSun } from "../icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { currentSubscription, disablePush, enablePush, pushSupported } from "../lib/push";

export function Header() {
  const { admin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    currentSubscription()
      .then((sub) => setPushOn(Boolean(sub) && Notification.permission === "granted"))
      .catch(() => {});
  }, []);

  async function togglePush() {
    setPushBusy(true);
    try {
      if (pushOn) {
        await disablePush();
        setPushOn(false);
      } else {
        const ok = await enablePush();
        setPushOn(ok);
        if (!ok) alert("Notifications are blocked for this site. Allow them in your browser settings.");
      }
    } catch {
      alert("Could not change notification settings. Please try again.");
    } finally {
      setPushBusy(false);
    }
  }

  return (
    <header className="topbar">
      <div />

      <div className="topbar-actions">
        <button type="button" className="icon-btn" onClick={toggleTheme} title="Toggle dark mode">
          {theme === "dark" ? <IconSun className="icon-sm" /> : <IconMoon className="icon-sm" />}
        </button>

        {pushSupported() && (
          <button
            type="button"
            className="icon-btn"
            onClick={togglePush}
            disabled={pushBusy}
            aria-pressed={pushOn}
            title={pushOn ? "New-order notifications on (click to turn off)" : "Turn on new-order notifications"}
            style={pushOn ? { color: "var(--color-primary)" } : undefined}
          >
            <IconBell className="icon-sm" />
          </button>
        )}

        <Link to="/security" className="topbar-user" title="Account security (two-factor authentication)" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="topbar-user-name">{admin?.name}</div>
          <div className="topbar-user-role">{admin?.role?.name ?? "No role"}</div>
        </Link>

        <div className="topbar-avatar">{admin?.name?.charAt(0).toUpperCase()}</div>

        <button type="button" className="logout-btn" onClick={logout} title="Logout">
          <IconArrowRightStartOnRectangle className="icon-sm logout-icon" />
          <span className="logout-label">Logout</span>
        </button>
      </div>
    </header>
  );
}
