import { HeroSection } from "@/components/landing/HeroSection";
import { PersonaShowcase } from "@/components/landing/PersonaShowcase";
import { GameShowcase } from "@/components/landing/GameShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LiveStats } from "@/components/landing/LiveStats";
import { EventsPreview } from "@/components/landing/EventsPreview";
import { BlockchainSection } from "@/components/landing/BlockchainSection";
import { CTASection } from "@/components/landing/CTASection";
import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#080810] text-white overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <LiveStats />
      <PersonaShowcase />
      <HowItWorks />
      <GameShowcase />
      <EventsPreview />
      <BlockchainSection />
      <CTASection />
      <Footer />
    </main>
  );
}
