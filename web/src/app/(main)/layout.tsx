import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppNavbar } from "@/components/shared/AppNavbar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect unauthenticated users to sign-in
  if (!session?.user) {
    redirect("/sign-in");
  }

  // Resolve the current pathname via the x-invoke-path header (set by Next.js internally)
  // so we can avoid an infinite redirect loop on /onboarding itself.
  const headersList = await headers();
  const pathname =
    headersList.get("x-invoke-path") ??
    headersList.get("x-pathname") ??
    "";

  const onboardingDone = (session.user as any).onboardingDone as boolean | undefined;

  // If onboarding is not done and we're not already on the onboarding page, redirect.
  if (onboardingDone === false && !pathname.includes("/onboarding")) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <AppNavbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}
