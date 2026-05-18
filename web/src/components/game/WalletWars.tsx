"use client";

import { useState } from "react";
import { Trophy, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WalletWarsProps {
  onComplete: (score: number, accuracy: number) => void;
}

interface Scenario {
  title: string;
  situation: string;
  options: { text: string; safe: boolean; explanation: string }[];
}

const SCENARIOS: Scenario[] = [
  {
    title: "The DM Offer",
    situation: "A stranger DMs you: 'Hey, I need help with my wallet. I'll pay you 1 ETH if you share your seed phrase so I can send you the funds.'",
    options: [
      { text: "Share your seed phrase — free ETH!", safe: false, explanation: "NEVER share your seed phrase. Anyone with it owns all your funds forever." },
      { text: "Ignore and block them", safe: true, explanation: "Correct. No legitimate transfer requires your seed phrase." },
      { text: "Ask for their address first", safe: false, explanation: "Even asking for more info keeps you engaged in a scam." },
      { text: "Share only the first 6 words", safe: false, explanation: "Any part of a seed phrase is dangerous to share." },
    ],
  },
  {
    title: "Suspicious Token Airdrop",
    situation: "A new token worth $500 appeared in your wallet. The token's website says 'Visit our site and connect wallet to claim rewards.'",
    options: [
      { text: "Connect wallet immediately", safe: false, explanation: "Drainer contracts steal everything when you approve the transaction." },
      { text: "Check token contract on Snowtrace first", safe: true, explanation: "Always verify contract addresses before any interaction." },
      { text: "Approve the claim transaction", safe: false, explanation: "Approval transactions can grant unlimited spending rights to attackers." },
      { text: "Swap the airdrop token for AVAX", safe: false, explanation: "Swapping a honeypot token often executes malicious contract code." },
    ],
  },
  {
    title: "Official-Looking Email",
    situation: "You receive an email from 'security@avalanche-team.net' saying your wallet was compromised and you must re-verify by entering your seed phrase on their site.",
    options: [
      { text: "Enter seed phrase on their site", safe: false, explanation: "Avalanche will NEVER ask for your seed phrase. This is phishing." },
      { text: "Check avalanche.network official site directly", safe: true, explanation: "Always navigate to official sites directly, never via email links." },
      { text: "Click the email link to check", safe: false, explanation: "Phishing links can look identical to real sites. Always type the URL." },
      { text: "Forward to friends to warn them", safe: false, explanation: "Forwarding spreads the scam and you might expose your contact list." },
    ],
  },
  {
    title: "Hardware Wallet Purchase",
    situation: "You find a Ledger hardware wallet on eBay for 50% off, still in original packaging, seller says it's 'factory sealed and pre-configured.'",
    options: [
      { text: "Buy it — great deal!", safe: false, explanation: "Pre-configured hardware wallets are a major scam. The seller keeps the seed phrase." },
      { text: "Only buy from official retailers", safe: true, explanation: "Always buy hardware wallets from official sources or authorized retailers only." },
      { text: "Ask seller for the seed phrase they set up", safe: false, explanation: "This confirms the scam. Never accept a pre-configured device." },
      { text: "Reset and generate a new seed on arrival", safe: false, explanation: "While resetting is smart, you've still sent money to a likely scammer." },
    ],
  },
  {
    title: "Public WiFi Transaction",
    situation: "You're at a coffee shop and need to send a large AVAX transfer urgently. You're on public WiFi.",
    options: [
      { text: "Use a VPN and proceed carefully", safe: true, explanation: "A VPN encrypts your traffic and reduces man-in-the-middle risks significantly." },
      { text: "Send directly over public WiFi", safe: false, explanation: "Public WiFi can be monitored. Credentials and session tokens can be intercepted." },
      { text: "Ask the barista for the password — it'll be more secure", safe: false, explanation: "Password-protected WiFi still poses the same risks to local network attacks." },
      { text: "Wait until you're on mobile data", safe: true, explanation: "Mobile data (4G/5G) is generally safer than public WiFi for financial transactions." },
    ],
  },
];

export default function WalletWars({ onComplete }: WalletWarsProps) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const scenario = SCENARIOS[roundIdx];

  const handlePick = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    const option = scenario.options[idx];
    const newScore = totalScore + (option.safe ? 200 : 0);
    const newCorrect = correctCount + (option.safe ? 1 : 0);
    setTotalScore(newScore);
    setCorrectCount(newCorrect);

    setTimeout(() => {
      if (roundIdx + 1 >= SCENARIOS.length) {
        onComplete(newScore, Math.round((newCorrect / SCENARIOS.length) * 100));
        setDone(true);
      } else {
        setRoundIdx((i) => i + 1);
        setPicked(null);
      }
    }, 2500);
  };

  if (done) {
    return (
      <div className="text-center py-8">
        <Trophy size={48} className="text-arena-gold mx-auto mb-3" />
        <h3 className="text-white font-black text-2xl mb-1">Security Expert!</h3>
        <p className="text-slate-400 mb-2">{correctCount}/{SCENARIOS.length} safe choices</p>
        <p className="text-arena-gold font-bold text-xl">+{totalScore} XP</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-black flex items-center gap-2"><Shield size={16} className="text-arena-cyan" /> Wallet Wars</h3>
          <p className="text-slate-400 text-xs">Choose the safest option</p>
        </div>
        <span className="text-slate-500 text-xs">{roundIdx + 1}/{SCENARIOS.length}</span>
      </div>

      {/* Scenario */}
      <div className="glass-card p-5 rounded-2xl border border-arena-cyan/20">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-amber-400" />
          <h4 className="text-white font-bold">{scenario.title}</h4>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{scenario.situation}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {scenario.options.map((opt, i) => {
          const isPicked = picked === i;
          const isRevealed = picked !== null;
          const showResult = isPicked;

          return (
            <button
              key={i}
              onClick={() => handlePick(i)}
              disabled={picked !== null}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all",
                isPicked && opt.safe ? "border-emerald-400/50 bg-emerald-400/10" :
                isPicked && !opt.safe ? "border-red-400/50 bg-red-400/10" :
                isRevealed && opt.safe ? "border-emerald-400/20 bg-emerald-400/5 opacity-60" :
                "border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03]"
              )}
            >
              <p className={cn("text-sm font-medium", isPicked && opt.safe ? "text-emerald-300" : isPicked && !opt.safe ? "text-red-300" : "text-slate-200")}>
                {opt.safe && isRevealed && i !== picked ? "✓ " : ""}{opt.text}
              </p>
              {showResult && (
                <p className={cn("text-xs mt-2 leading-relaxed", opt.safe ? "text-emerald-400" : "text-red-400")}>
                  {opt.safe ? "✅ Safe: " : "❌ Danger: "}{opt.explanation}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
