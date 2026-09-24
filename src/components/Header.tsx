import { IconArrowRightStartOnRectangle, IconBell, IconMoon, IconSun } from "../icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export function Header() {
  const { admin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <div />

      <div className="topbar-actions">
        <button type="button" className="icon-btn" onClick={toggleTheme} title="Toggle dark mode">
          {theme === "dark" ? <IconSun className="icon-sm" /> : <IconMoon className="icon-sm" />}
        </button>

        <button type="button" className="icon-btn" title="Notifications">
          <IconBell className="icon-sm" />
        </button>

        <div className="topbar-user">
          <div className="topbar-user-name">{admin?.name}</div>
          <div className="topbar-user-role">{admin?.role?.name ?? "No role"}</div>
        </div>

        <div className="topbar-avatar">{admin?.name?.charAt(0).toUpperCase()}</div>

        <button type="button" className="logout-btn" onClick={logout} title="Logout">
          <IconArrowRightStartOnRectangle className="icon-sm logout-icon" />
          <span className="logout-label">Logout</span>
        </button>
      </div>
    </header>
  );
}
