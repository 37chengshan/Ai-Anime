"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md">
        {/* Decorative top border */}
        <div className="mb-8 border-t-2 border-ink pt-6 text-center">
          <h1 className="editorial-title text-2xl">欢迎回来</h1>
          <p className="editorial-caption mt-2">登录您的账户</p>
        </div>

        {/* Clerk SignIn component */}
        <div className="clerk-auth-container border border-ink/15 bg-paper-light shadow-md">
          <SignIn
            appearance={{
              baseTheme: undefined,
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-0 rounded-none",
                headerTitle: "editorial-title text-xl",
                headerSubtitle: "editorial-caption",
                socialButtonsBlockButton:
                  "border border-ink/20 bg-paper text-ink hover:bg-ink hover:text-paper transition-colors rounded-none",
                socialButtonsBlockButtonText: "font-medium",
                dividerLine: "bg-ink/15",
                dividerText: "editorial-caption text-xs",
                formFieldLabel: "editorial-caption text-ink-light",
                formFieldInput:
                  "border-ink/30 bg-transparent text-ink rounded-none focus:border-ink",
                formFieldInputShowPassword:
                  "text-ink-light hover:text-ink",
                formButtonPrimary:
                  "bg-editorialAccent text-paper hover:bg-editorialAccent/90 font-semibold rounded-none transition-colors",
                formButtonReset:
                  "text-ink-light hover:text-ink rounded-none",
                footerActionLink:
                  "text-editorialAccent hover:text-editorialAccent/80 font-medium",
                identityPreviewText: "text-ink",
                identityPreviewEditButton:
                  "text-editorialAccent hover:text-editorialAccent/80",
              },
            }}
          />
        </div>

        {/* Bottom decorative element */}
        <div className="mt-6 text-center">
          <div className="inline-block h-px w-16 bg-ink/20" />
        </div>
      </div>
    </div>
  );
}
