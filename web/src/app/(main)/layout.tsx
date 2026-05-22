import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/shared/AppSidebar";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  const headersList = await headers();
  const pathname =
    headersList.get("x-invoke-path") ??
    headersList.get("x-pathname") ??
    "";

  const isRoot = pathname === "/" || pathname === "";

  // Landing page is public — serve it without auth checks or layout chrome
  if (isRoot) return <>{children}</>;

  if (!session?.user) redirect("/sign-in");

  // Push new users through onboarding
  const onboardingDone = (session?.user as any)?.onboardingDone as boolean | undefined;
  if (onboardingDone === false && !pathname.includes("/onboarding")) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-[#080810] text-white flex">
      <AppSidebar />
      {/* Content shifts right of sidebar on desktop, below mobile topbar on mobile */}
      <main className="flex-1 min-w-0 lg:ml-60 pt-14 lg:pt-0 transition-all duration-200">
        {children}
      </main>
    </div>
  );
}
