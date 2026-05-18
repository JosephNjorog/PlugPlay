import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SuperAdminNav from "@/components/SuperAdminNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-[#060610] flex">
      <SuperAdminNav user={session.user} />
      <main className="flex-1 lg:ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
