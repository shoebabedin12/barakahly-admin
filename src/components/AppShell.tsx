import { NavLink, Outlet } from "react-router-dom";
import { IconSquares2x2 } from "../icons";
import { useAuth } from "../context/AuthContext";
import { navGroups } from "../lib/navConfig";
import { Header } from "./Header";

export function AppShell() {
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role?.slug === "super-admin";
  const groups = navGroups.filter((g) => !g.superAdminOnly || isSuperAdmin);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>BARAKAHLY</h2>
          <p>Commerce CMS</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            <IconSquares2x2 className="icon-sm" />
            <span>Dashboard</span>
          </NavLink>

          {groups.map((group) => (
            <div key={group.title} className="nav-group">
              <p className="nav-group-title">{group.title}</p>
              {group.children.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                >
                  <item.icon className="icon-sm" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
