"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Save, Cpu, Zap, FileText, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"app" | "nft" | "contract">("app");

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ["super-settings"],
    queryFn: () => fetch("/api/super/settings").then((r) => r.json()),
  });

  const [appForm, setAppForm] = useState<Record<string, string>>({});
  const [nftForm, setNftForm] = useState({ name: "PlugPlay Arena Badge", symbol: "PPAB", baseUri: "https://metadata.plugplay.arena/badges/" });
  const [deployResult, setDeployResult] = useState<{ address: string; txHash: string } | null>(null);
  const [deploying, setDeploying] = useState(false);

  const saveSettings = useMutation({
    mutationFn: (updates: Record<string, string>) =>
      fetch("/api/super/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      }).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["super-settings"] });
      toast.success("Settings saved");
      setAppForm({});
    },
    onError: () => toast.error("Failed to save settings"),
  });

  async function deployContract() {
    setDeploying(true);
    try {
      const r = await fetch("/api/super/deploy-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nftForm),
      });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      setDeployResult(data);
      qc.invalidateQueries({ queryKey: ["super-settings"] });
      toast.success("NFT contract deployed!");
    } catch (e: any) {
      toast.error(e.message || "Deploy failed");
    } finally {
      setDeploying(false);
    }
  }

  const APP_SETTINGS = [
    { key: "platform_name", label: "Platform Name", placeholder: "Plug n' Play Arena" },
    { key: "xp_multiplier", label: "Global XP Multiplier", placeholder: "1.0" },
    { key: "maintenance_mode", label: "Maintenance Mode", placeholder: "false" },
    { key: "max_players_per_event", label: "Max Players Per Event", placeholder: "500" },
    { key: "luma_api_key", label: "Luma API Key", placeholder: "luma_..." },
    { key: "nft_contract_address", label: "NFT Contract Address (read-only if deployed)", placeholder: "0x..." },
  ];

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-purple to-violet-600 flex items-center justify-center">
          <Settings size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Settings & NFT</h1>
          <p className="text-slate-400 text-sm">Platform configuration and smart contract management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 glass p-1 rounded-xl w-fit border border-white/[0.06]">
        {[
          { key: "app", label: "App Settings", icon: Settings },
          { key: "nft", label: "Deploy NFT Contract", icon: Cpu },
          { key: "contract", label: "Current Contract", icon: FileText },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              activeTab === key ? "bg-arena-gold/20 text-arena-gold" : "text-slate-400 hover:text-white"
            )}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* App settings */}
      {activeTab === "app" && (
        <div className="glass rounded-2xl p-6 max-w-xl">
          <h2 className="text-white font-bold mb-5">Platform Settings</h2>
          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-white/[0.04] rounded-xl animate-pulse" />)}</div>
          ) : (
            <div className="space-y-4">
              {APP_SETTINGS.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-slate-400 block mb-1">{label}</label>
                  <input
                    value={appForm[key] ?? (settings[key] || "")}
                    onChange={(e) => setAppForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-arena-gold/40 transition-colors"
                  />
                </div>
              ))}
              <button
                onClick={() => saveSettings.mutate(appForm)}
                disabled={saveSettings.isPending || Object.keys(appForm).length === 0}
                className="flex items-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 text-sm mt-2"
              >
                {saveSettings.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Save Settings
              </button>
            </div>
          )}
        </div>
      )}

      {/* Deploy NFT */}
      {activeTab === "nft" && (
        <div className="glass rounded-2xl p-6 max-w-xl">
          <h2 className="text-white font-bold mb-2">Deploy NFT Contract</h2>
          <p className="text-slate-400 text-sm mb-5">Deploys a new ERC-721 badge contract to Avalanche Fuji testnet. The contract address is saved to app settings automatically.</p>

          <div className="space-y-4 mb-5">
            {[
              { k: "name", l: "Collection Name" },
              { k: "symbol", l: "Token Symbol" },
              { k: "baseUri", l: "Metadata Base URI" },
            ].map(({ k, l }) => (
              <div key={k}>
                <label className="text-xs text-slate-400 block mb-1">{l}</label>
                <input
                  value={(nftForm as any)[k]}
                  onChange={(e) => setNftForm((f) => ({ ...f, [k]: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-avax-red/40 transition-colors"
                />
              </div>
            ))}
          </div>

          <div className="p-3 mb-5 bg-amber-400/5 border border-amber-400/20 rounded-xl text-xs text-amber-300">
            ⚠️ This will use your <code className="text-amber-400">FUJI_MINTER_PRIVATE_KEY</code> to deploy. Ensure you have AVAX on Fuji for gas fees.
          </div>

          {deployResult && (
            <div className="p-4 mb-4 bg-emerald-400/5 border border-emerald-400/20 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle size={16} /> Contract Deployed!
              </div>
              <p className="text-slate-300 text-xs font-mono break-all">Address: {deployResult.address}</p>
              <a href={`https://testnet.snowtrace.io/tx/${deployResult.txHash}`} target="_blank" rel="noopener noreferrer" className="text-arena-cyan text-xs hover:underline">View on Snowtrace →</a>
            </div>
          )}

          <button
            onClick={deployContract}
            disabled={deploying}
            className="flex items-center gap-2 bg-gradient-to-r from-avax-red to-arena-purple text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
          >
            {deploying ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {deploying ? "Deploying…" : "Deploy to Fuji"}
          </button>
        </div>
      )}

      {/* Current contract */}
      {activeTab === "contract" && (
        <div className="glass rounded-2xl p-6 max-w-xl">
          <h2 className="text-white font-bold mb-5">Current NFT Contract</h2>
          {isLoading ? (
            <div className="h-24 bg-white/[0.04] rounded-xl animate-pulse" />
          ) : settings.nft_contract_address ? (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-400/5 border border-emerald-400/20 rounded-xl">
                <p className="text-slate-400 text-xs mb-1">Contract Address (Fuji)</p>
                <p className="text-white font-mono text-sm break-all">{settings.nft_contract_address}</p>
                <a
                  href={`https://testnet.snowtrace.io/address/${settings.nft_contract_address}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-arena-cyan text-xs mt-2 inline-block hover:underline"
                >
                  View on Snowtrace →
                </a>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Standard</span><span className="text-white">ERC-721</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Network</span><span className="text-white">Avalanche Fuji C-Chain</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Chain ID</span><span className="text-white font-mono">43113</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Cpu size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No contract deployed yet</p>
              <p className="text-slate-600 text-xs mt-1">Go to "Deploy NFT Contract" to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
