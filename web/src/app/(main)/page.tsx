import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";

export default async function RootPage() {
  const session = await auth();
  if (session?.user) {
    if ((session.user as any).isAdmin) redirect("/admin");
    redirect("/journey");
  }
  return <LandingPage />;
}
