"use client";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-paper">
      {/* Subtle top bar */}
      <header className="border-b border-ink/10">
        <div className="container flex h-12 items-center justify-center">
          <span className="editorial-caption text-xs tracking-widest">
            Ai-Anim
          </span>
        </div>
      </header>

      {/* Page content */}
      <main>{children}</main>
    </div>
  );
}
