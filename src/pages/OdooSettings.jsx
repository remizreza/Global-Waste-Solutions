import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Database, KeyRound, Link2, ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import { apiRequest, getApiBaseUrl } from "@/lib/api";
import { PageIntro } from "@/pages/_helpers";

const odooFields = [
  { name: "url", label: "Odoo URL", icon: Link2, placeholder: "https://your-company.odoo.com" },
  { name: "database", label: "Database Name", icon: Database, placeholder: "redoxyae" },
  { name: "username", label: "Username / Email", icon: UserRound, placeholder: "admin@redoxyksa.com" },
  { name: "password", label: "Odoo API Key", icon: KeyRound, placeholder: "Paste your Odoo API key", type: "password" },
  { name: "reportPassword", label: "Report Session Password", icon: KeyRound, placeholder: "Optional: actual Odoo password for PDF auth", type: "password" },
];

const emptyUser = {
  name: "",
  email: "",
  password: "",
  role: "viewer",
};

const emptyPasswordForm = {
  currentPassword: "",
  newPassword: "",
};

export default function OdooSettings() {
  const queryClient = useQueryClient();
  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [form, setForm] = useState({
    url: "",
    database: "",
    username: "",
    password: "",
    reportPassword: "",
  });
  const [newUser, setNewUser] = useState(emptyUser);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [saveMessage, setSaveMessage] = useState("");

  const settingsQuery = useQuery({
    queryKey: ["odoo-settings"],
    enabled: isAdmin,
    queryFn: () => apiRequest("/api/settings/odoo", { token }),
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    enabled: isAdmin,
    queryFn: () => apiRequest("/api/users", { token }),
  });

  useEffect(() => {
    if (settingsQuery.data?.settings) {
      setForm((current) => ({
        ...current,
        url: settingsQuery.data.settings.url || "",
        database: settingsQuery.data.settings.database || "",
        username: settingsQuery.data.settings.username || "",
        password: "",
        reportPassword: "",
      }));
    }
  }, [settingsQuery.data]);

  const testMutation = useMutation({
    mutationFn: (payload) => apiRequest("/api/settings/odoo/test", { method: "POST", token, body: payload }),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => apiRequest("/api/settings/odoo", { method: "PUT", token, body: payload }),
    onSuccess: () => {
      setSaveMessage("Server-side Odoo settings updated.");
      queryClient.invalidateQueries({ queryKey: ["odoo-settings"] });
      queryClient.invalidateQueries({ queryKey: ["app-meta"] });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (payload) => apiRequest("/api/users", { method: "POST", token, body: payload }),
    onSuccess: () => {
      setNewUser(emptyUser);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload) => apiRequest("/api/auth/change-password", { method: "POST", token, body: payload }),
    onSuccess: () => {
      setPasswordForm(emptyPasswordForm);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, body }) => apiRequest(`/api/users/${id}`, { method: "PATCH", token, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const resetUserPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }) => apiRequest(`/api/users/${id}/reset-password`, { method: "POST", token, body: { newPassword } }),
  });

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSaveMessage("");
  };

  const handleUserFieldChange = (event) => {
    const { name, value } = event.target;
    setNewUser((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className="page-shell">
      <PageIntro
        eyebrow="Configuration"
        title="ERP Control Room"
        description="Manage passwords, the Odoo engine connection, local app users, and backend runtime for REDOXY."
      />

      <Card>
        <CardHeader>
          <CardTitle>Change your password</CardTitle>
          <CardDescription>Use this after first login or whenever you need to rotate credentials.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={() => changePasswordMutation.mutate(passwordForm)} disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
          </div>
          {changePasswordMutation.error ? (
            <div className="md:col-span-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{changePasswordMutation.error.message}</div>
          ) : null}
          {changePasswordMutation.isSuccess ? (
            <div className="md:col-span-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Password updated successfully.</div>
          ) : null}
        </CardContent>
      </Card>

      {!isAdmin ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-6 text-sm text-amber-900">Admin-only settings are hidden for your role. You can change your own password here.</CardContent>
        </Card>
      ) : null}

      {isAdmin ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-sky-200/70">
          <CardHeader>
            <CardTitle>Odoo engine</CardTitle>
            <CardDescription>These values are saved on the backend, not in the browser.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {odooFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <div className="relative">
                    <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type={field.type ?? "text"}
                      value={form[field.name]}
                      placeholder={field.placeholder}
                      onChange={handleFieldChange}
                      className="pl-12"
                    />
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => testMutation.mutate(form)} disabled={testMutation.isPending}>
                {testMutation.isPending ? "Testing..." : "Test Connection"}
              </Button>
              <Button type="button" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>

            {testMutation.isSuccess ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Connection successful. The backend can authenticate against Odoo.
              </div>
            ) : null}
            {testMutation.error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{testMutation.error.message}</div>
            ) : null}
            {saveMutation.error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveMutation.error.message}</div>
            ) : null}
            {saveMessage ? (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">{saveMessage}</div>
            ) : null}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Use the API key for normal Odoo data calls. If PDF view/download fails on Odoo Online, set the real Odoo user password in
              {" "}
              <span className="font-semibold">Report Session Password</span>
              {" "}
              so browser-style report authentication can use it without changing the API key.
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-sky-300" />
              Runtime status
            </CardTitle>
            <CardDescription className="text-slate-300">How the REDOXY ERP app is operating right now.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">App API</p>
              <p className="mt-1 break-all text-slate-300">{getApiBaseUrl()}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">Active source region</p>
              <p className="mt-1 text-slate-300 uppercase">{settingsQuery.data?.settings?.region || "default"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">Server-side credentials</p>
              <p className="mt-1 text-slate-300">Odoo secrets live on the backend and are never sent to regular app users.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 font-semibold text-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Admin-first control
              </div>
              <p className="mt-2 text-slate-300">Admins manage settings and users. Accountants can write accounting data. Viewers stay read-only.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            App users
          </CardTitle>
          <CardDescription>Create login accounts for REDOXY ERP.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              createUserMutation.mutate(newUser);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="user-name">Name</Label>
              <Input id="user-name" name="name" value={newUser.name} onChange={handleUserFieldChange} placeholder="Finance User" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input id="user-email" name="email" type="email" value={newUser.email} onChange={handleUserFieldChange} placeholder="user@redoxyksa.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password">Temporary Password</Label>
              <Input id="user-password" name="password" type="password" value={newUser.password} onChange={handleUserFieldChange} placeholder="Create an initial password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role">Role</Label>
              <select
                id="user-role"
                name="role"
                value={newUser.role}
                onChange={handleUserFieldChange}
                className="flex h-14 w-full rounded-2xl border bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="viewer">Viewer</option>
                <option value="accountant">Accountant</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {createUserMutation.error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{createUserMutation.error.message}</div>
            ) : null}
            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {usersQuery.data?.users?.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="px-3 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-3 py-3">{item.email}</td>
                    <td className="px-3 py-3 uppercase">{item.role}</td>
                    <td className="px-3 py-3">{item.active ? "Active" : "Inactive"}</td>
                    <td className="px-3 py-3">{item.mustChangePassword ? "Required" : "No"}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const nextRole = item.role === "viewer" ? "accountant" : item.role === "accountant" ? "admin" : "viewer";
                            updateUserMutation.mutate({ id: item.id, body: { role: nextRole } });
                          }}
                        >
                          Cycle Role
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => updateUserMutation.mutate({ id: item.id, body: { active: !item.active } })}
                        >
                          {item.active ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const nextPassword = window.prompt(`Set a temporary password for ${item.email}`);
                            if (nextPassword) {
                              resetUserPasswordMutation.mutate({ id: item.id, newPassword: nextPassword });
                            }
                          }}
                        >
                          Reset Password
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
        </>
      ) : null}
    </div>
  );
}
