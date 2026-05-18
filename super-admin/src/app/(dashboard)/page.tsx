import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { Crown, Users, Calendar, Gamepad2, Trophy, Zap } from "lucide-react";

async function getStats() {
  try {
    const [players, games, events, missions, superAdmins, admins] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) as count FROM profiles`),
      db.execute(sql`SELECT COUNT(*) as count FROM games`),
      db.execute(sql`SELECT COUNT(*) as count FROM events`),
      db.execute(sql`SELECT COUNT(*) as count FROM mission_attempts WHERE status = 'completed'`),
      db.execute(sql`SELECT COUNT(*) as count FROM profiles WHERE is_super_admin = true`),
      db.execute(sql`SELECT COUNT(*) as count FROM profiles WHERE is_admin = true`),
    ]);

    const get = (r: any) => Number((r as any).rows?.[0]?.count ?? (r as any)[0]?.count ?? 0);

    return {
      totalPlayers: get(players),
      totalGames: get(games),
      totalEvents: get(events),
      completedMissions: get(missions),
      superAdmins: get(superAdmins),
      admins: get(admins),
    };
  } catch {
    return { totalPlayers: 0, totalGames: 0, totalEvents: 0, completedMissions: 0, superAdmins: 0, admins: 0 };
  }
}

async function getRecentActivity() {
  try {
    const rows = await db.execute(sql`
      SELECT p.username, p.emoji, ma.completed_at, g.title as game_title, ma.score
      FROM mission_attempts ma
      JOIN profiles p ON p.id = ma.player_id
      LEFT JOIN games g ON g.id = ma.game_id
      WHERE ma.status = 'completed'
      ORDER BY ma.completed_at DESC
      LIMIT 10
    `);
    return (rows as any).rows ?? rows ?? [];
  } catch {
    return [];
  }
}

export default async function SuperAdminDashboard() {
  const [session, stats, activity] = await Promise.all([auth(), getStats(), getRecentActivity()]);

  const statCards = [
    { label: "Total Players", value: stats.totalPlayers, icon: Users, color: "from-avax-red to-rose-600" },
    { label: "Total Games", value: stats.totalGames, icon: Gamepad2, color: "from-arena-purple to-violet-600" },
    { label: "Events Created", value: stats.totalEvents, icon: Calendar, color: "from-arena-cyan to-blue-600" },
    { label: "Missions Done", value: stats.completedMissions, icon: Trophy, color: "from-arena-gold to-orange-600" },
    { label: "Super Admins", value: stats.superAdmins, icon: Crown, color: "from-arena-gold to-amber-600" },
    { label: "Admins", value: stats.admins, icon: Zap, color: "from-avax-red to-arena-purple" },
  ];

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-gold to-amber-600 flex items-center justify-center shadow-glow-gold">
            <Crown size={20} className="text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Welcome back, {session?.user?.name}</h1>
            <p className="text-arena-gold text-sm">Supreme Owner Dashboard</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                <Icon size={18} className="text-white" />
              </div>
              <div className="text-2xl font-black text-white">{card.value.toLocaleString()}</div>
              <p className="text-slate-500 text-xs mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <Zap size={16} className="text-avax-red" /> Recent Activity
        </h2>
        <div className="space-y-3">
          {activity.length === 0 ? (
            <p className="text-slate-500 text-sm">No activity yet</p>
          ) : activity.map((a: any, i: number) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-base">{a.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">
                  <span className="font-medium">{a.username}</span>
                  <span className="text-slate-400"> completed </span>
                  <span className="font-medium">{a.game_title || "a game"}</span>
                </p>
                <p className="text-slate-500 text-xs">Score: {a.score?.toLocaleString() || "—"}</p>
              </div>
              <span className="text-slate-600 text-xs flex-shrink-0">
                {a.completed_at ? new Date(a.completed_at).toLocaleDateString() : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
