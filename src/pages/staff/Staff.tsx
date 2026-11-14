import { useEffect, useState } from "react";
import { ResourceList } from "../../components/ResourceList";
import { FormCard, TextField, useResourceForm } from "../../components/ResourceForm";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../lib/api";
import { type Permission, type RoleDetail, type RoleRow, rolesApi, type StaffUser, staffApi } from "../../lib/admin";
import { formatDate } from "../../lib/store";

export function StaffList() {
  const { admin } = useAuth();
  return (
    <ResourceList<StaffUser>
      title="Staff Users"
      noun="staff accounts"
      basePath="/users"
      newLabel="+ New Staff Account"
      load={(page) => staffApi.list(page)}
      remove={staffApi.remove}
      label={(u) => `${u.name} (${u.email})`}
      columns={[
        { header: "Name", render: (u) => (u.id === admin?.id ? `${u.name} (you)` : u.name) },
        { header: "Email", render: (u) => u.email },
        { header: "Role", render: (u) => u.role?.name ?? <span className="badge badge-inactive">No role</span> },
        { header: "2FA", render: (u) => (u.twoFactorEnabled ? "On" : "Off") },
        { header: "Created", render: (u) => formatDate(u.createdAt) },
      ]}
    />
  );
}

export function StaffForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    staffApi.roleOptions().then(setRoles).catch(() => setRoles([]));
  }, []);

  const form = useResourceForm<StaffUser>({
    noun: "staff account",
    load: staffApi.get,
    fill: (u) => {
      setName(u.name);
      setEmail(u.email);
      setRoleId(u.roleId ? String(u.roleId) : "");
    },
  });

  if (form.loading) return <p>Loading...</p>;

  const input = {
    name,
    email,
    roleId: Number(roleId),
    password: password || null,
    passwordConfirmation: passwordConfirmation || null,
  };

  return (
    <FormCard
      title={form.isEdit ? "Edit Staff Account" : "New Staff Account"}
      error={form.error}
      submitting={form.submitting}
      maxWidth={520}
      onCancel={() => form.navigate("/users")}
      onSubmit={() => form.submit(() => (form.id ? staffApi.update(form.id, input) : staffApi.create(input)), "/users")}
    >
      <TextField id="name" label="Name" required value={name} onChange={setName} />
      <TextField id="email" label="Email (used to log in)" type="email" required value={email} onChange={setEmail} />
      <div className="field">
        <label htmlFor="role">Role</label>
        <select id="role" required value={roleId} onChange={(e) => setRoleId(e.target.value)}>
          <option value="">Select a role</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <TextField
        id="password"
        label={form.isEdit ? "New password" : "Password"}
        type="password"
        required={!form.isEdit}
        value={password}
        onChange={setPassword}
        hint={
          form.isEdit
            ? "Leave blank to keep the current password."
            : "At least 8 characters with upper and lower case, a number and a symbol."
        }
      />
      {(password || !form.isEdit) && (
        <TextField
          id="passwordConfirmation"
          label="Confirm password"
          type="password"
          required={!form.isEdit}
          value={passwordConfirmation}
          onChange={setPasswordConfirmation}
        />
      )}
    </FormCard>
  );
}

export function RolesList() {
  return (
    <ResourceList<RoleRow>
      title="Roles & Permissions"
      noun="roles"
      basePath="/roles"
      newLabel="+ New Role"
      load={(page) => rolesApi.list(page)}
      remove={rolesApi.remove}
      label={(r) => r.name}
      columns={[
        { header: "Role", render: (r) => r.name },
        { header: "Staff", render: (r) => r.usersCount },
        {
          header: "Permissions",
          render: (r) =>
            r.permissions.length ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {r.permissions.map((p) => (
                  <span key={p.id} className="badge badge-inactive">
                    {p.name}
                  </span>
                ))}
              </div>
            ) : (
              "-"
            ),
        },
      ]}
    />
  );
}

export function RoleForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [permissions, setPermissions] = useState<Permission[] | null>(null);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);

  useEffect(() => {
    rolesApi
      .permissions()
      .then(setPermissions)
      .catch((err) => setPermissionsError(err instanceof ApiError ? err.message : "Could not load permissions."));
  }, []);

  const form = useResourceForm<RoleDetail>({
    noun: "role",
    load: rolesApi.get,
    fill: (r) => {
      setName(r.name);
      setSlug(r.slug);
      setSelected(r.permissionIds);
    },
  });

  if (form.loading) return <p>Loading...</p>;

  const input = { name, permissionIds: selected };
  const isSuperAdmin = slug === "super-admin";

  return (
    <FormCard
      title={form.isEdit ? "Edit Role" : "New Role"}
      error={form.error ?? permissionsError}
      submitting={form.submitting}
      maxWidth={520}
      onCancel={() => form.navigate("/roles")}
      onSubmit={() => form.submit(() => (form.id ? rolesApi.update(form.id, input) : rolesApi.create(input)), "/roles")}
    >
      <TextField
        id="name"
        label="Name"
        required
        value={name}
        onChange={setName}
        hint={isSuperAdmin ? "The Super Admin role can't be renamed or deleted." : undefined}
      />
      <div className="field">
        <label>Permissions</label>
        {permissions === null && !permissionsError && <p>Loading...</p>}
        {permissions?.map((p) => (
          <div key={p.id} className="field checkbox-field" style={{ marginBottom: 8 }}>
            <input
              id={`perm-${p.id}`}
              type="checkbox"
              checked={selected.includes(p.id)}
              onChange={(e) => setSelected((s) => (e.target.checked ? [...s, p.id] : s.filter((x) => x !== p.id)))}
            />
            <label htmlFor={`perm-${p.id}`} style={{ margin: 0 }}>
              {p.name}
            </label>
          </div>
        ))}
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--color-muted)" }}>
          Staff with any role can use the admin panel. Only Super Admins can manage staff, roles and the activity log.
        </p>
      </div>
    </FormCard>
  );
}
