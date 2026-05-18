"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Crown, Users, Search, ShieldCheck, Shield, ShieldOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Role = "player" | "admin" | "super_admin";

export default function RolesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | Role>("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["super-users", search, roleFilter],
    queryFn: () => {
      const p = new URLSearchParams();
      if (search) p.set("search", search);
      if (roleFilter) p.set("role", roleFilter);
      return fetch(`/api/super/roles?${p}`).then((r) => r.json());
    },
  });

  const promoteMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      fetch("/api/super/roles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      }).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["super-users"] });
      toast.success(`User role updated to ${vars.role.replace("_", " ")}`);
    },
    onError: () => toast.error("Failed to update role"),
  });

  function getRoleIcon(user: any) {
    if (user.isSuperAdmin) return <Crown size={14} className="text-arena-gold" />;
    if (user.isAdmin) return <ShieldCheck size={14} className="text-avax-red" />;
    return <Shield size={14} className="text-slate-500" />;
  }

  function getRoleBadge(user: any) {
    if (user.isSuperAdmin) return "text-arena-gold bg-arena-gold/10 border-arena-gold/20";
    if (user.isAdmin) return "text-avax-red bg-avax-red/10 border-avax-red/20";
    return "text-slate-500 bg-slate-500/10 border-slate-500/20";
  }

  function getRoleLabel(user: any) {
    if (user.isSuperAdmin) return "Super Admin";
    if (user.isAdmin) return "Admin";
    return "Player";
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-avax-red to-arena-purple flex items-center justify-center">
          <Users size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Roles & Admins</h1>
          <p className="text-slate-400 text-sm">Promote or demote platform users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 glass px-3 py-2 rounded-xl">
          <Search size={13} className="text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username or email..."
            className="bg-transparent text-white text-sm w-48 outline-none placeholder:text-slate-600"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="glass border border-white/[0.06] text-slate-300 text-sm px-3 py-2 rounded-xl bg-transparent focus:outline-none"
        >
          <option value="">All roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="player">Player</option>
        </select>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Super Admins", icon: Crown, color: "text-arena-gold", filter: users.filter((u: any) => u.isSuperAdmin).length },
          { label: "Admins", icon: ShieldCheck, color: "text-avax-red", filter: users.filter((u: any) => u.isAdmin && !u.isSuperAdmin).length },
          { label: "Players", icon: Shield, color: "text-slate-400", filter: users.filter((u: any) => !u.isAdmin).length },
        ].map(({ label, icon: Icon, color, filter }) => (
          <div key={label} className="glass rounded-xl p-3">
            <Icon size={14} className={cn("mb-1", color)} />
            <div className="text-lg font-black text-white">{filter}</div>
            <div className="text-slate-500 text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["User", "Email", "Current Role", "Actions"].map((h) => (
                <th key={h} className="text-left text-slate-500 font-medium text-xs px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {[...Array(4)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>)}
                  </tr>
                ))
              : users.map((user: any) => (
                  <tr key={user.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-base">{user.emoji}</div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            {getRoleIcon(user)}
                            <span className="text-white font-medium text-xs">{user.username}</span>
                          </div>
                          <span className="text-slate-600 text-xs capitalize">{user.persona || "no persona"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs border px-2 py-0.5 rounded-full", getRoleBadge(user))}>
                        {getRoleLabel(user)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!user.isSuperAdmin && !user.isAdmin && (
                          <button
                            onClick={() => promoteMutation.mutate({ userId: user.id, role: "admin" })}
                            disabled={promoteMutation.isPending}
                            className="text-xs text-avax-red bg-avax-red/10 border border-avax-red/20 px-2.5 py-1 rounded-lg hover:bg-avax-red/20 transition-all disabled:opacity-50 flex items-center gap-1"
                          >
                            {promoteMutation.isPending ? <Loader2 size={10} className="animate-spin" /> : <ShieldCheck size={10} />}
                            Make Admin
                          </button>
                        )}
                        {user.isAdmin && !user.isSuperAdmin && (
                          <>
                            <button
                              onClick={() => promoteMutation.mutate({ userId: user.id, role: "super_admin" })}
                              disabled={promoteMutation.isPending}
                              className="text-xs text-arena-gold bg-arena-gold/10 border border-arena-gold/20 px-2.5 py-1 rounded-lg hover:bg-arena-gold/20 transition-all disabled:opacity-50 flex items-center gap-1"
                            >
                              <Crown size={10} /> Promote to Super
                            </button>
                            <button
                              onClick={() => promoteMutation.mutate({ userId: user.id, role: "player" })}
                              disabled={promoteMutation.isPending}
                              className="text-xs text-slate-500 bg-slate-500/10 border border-slate-500/20 px-2.5 py-1 rounded-lg hover:bg-slate-500/20 transition-all disabled:opacity-50 flex items-center gap-1"
                            >
                              <ShieldOff size={10} /> Demote
                            </button>
                          </>
                        )}
                        {user.isSuperAdmin && (
                          <button
                            onClick={() => promoteMutation.mutate({ userId: user.id, role: "admin" })}
                            disabled={promoteMutation.isPending}
                            className="text-xs text-slate-500 bg-slate-500/10 border border-slate-500/20 px-2.5 py-1 rounded-lg hover:bg-slate-500/20 transition-all disabled:opacity-50 flex items-center gap-1"
                          >
                            <ShieldOff size={10} /> Revoke Super
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && users.length === 0 && (
          <div className="text-center py-12 text-slate-500">No users found</div>
        )}
      </div>
    </div>
  );
}
