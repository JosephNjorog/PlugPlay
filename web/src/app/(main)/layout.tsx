import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppNavbar } from "@/components/shared/AppNavbar";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  const headersList = await headers();
  const pathname =
    headersList.get("x-invoke-path") ??
    headersList.get("x-pathname") ??
    "";

  const isRoot = pathname === "/" || pathname === "";

  // Landing page is public — only guard authenticated routes
  if (!session?.user && !isRoot) {
    redirect("/sign-in");
  }

  // Push new users through onboarding before anything else
  const onboardingDone = (session?.user as any)?.onboardingDone as boolean | undefined;
  if (session?.user && onboardingDone === false && !pathname.includes("/onboarding")) {
    redirect("/onboarding");
  }

  // Landing page has its own nav — don't render AppNavbar
  if (isRoot) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <AppNavbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}
