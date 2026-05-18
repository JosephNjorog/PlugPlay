import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Plug n' Play Arena",
  description: "Sign in or create your account to start your Web3 learning journey.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080810] text-white antialiased">
      {children}
    </div>
  );
}
