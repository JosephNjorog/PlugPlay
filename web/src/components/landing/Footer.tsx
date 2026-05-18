import Link from "next/link";
import { Github, Twitter, ExternalLink } from "lucide-react";

const links = {
  Platform: [
    { label: "Journey", href: "/journey" },
    { label: "Game Library", href: "/library" },
    { label: "Live Events", href: "/events" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Arena", href: "/arena/join" },
  ],
  Learn: [
    { label: "Avalanche Fuji", href: "https://docs.avax.network", external: true },
    { label: "Core Wallet", href: "https://core.app", external: true },
    { label: "Snowtrace", href: "https://testnet.snowtrace.io", external: true },
    { label: "AVAX Faucet", href: "https://faucet.avax.network", external: true },
  ],
  Account: [
    { label: "Sign Up", href: "/sign-up" },
    { label: "Sign In", href: "/sign-in" },
    { label: "Profile", href: "/profile" },
    { label: "My Rewards", href: "/rewards" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#060609]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-avax-red to-arena-purple flex items-center justify-center">
                <span className="text-sm font-bold">P</span>
              </div>
              <span className="font-bold text-lg">
                <span className="text-white">Plug</span>
                <span className="text-avax-red">n'</span>
                <span className="text-white">Play</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xs">
              Gamified Web3 learning on Avalanche. Earn real NFT badges while mastering blockchain concepts.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <Github size={14} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <Twitter size={14} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    {"external" in item && item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1 transition-colors"
                      >
                        {item.label} <ExternalLink size={10} />
                      </a>
                    ) : (
                      <Link href={item.href} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">
            © 2026 Plug n' Play Arena. Built on{" "}
            <span className="text-avax-red">Avalanche</span> Fuji Testnet.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600 text-xs">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
