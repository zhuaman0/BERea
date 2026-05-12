import type { Metadata } from "next";

export const metadata: Metadata = { title: "Telegram sign-in" };

export default function TelegramCallbackPage() {
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"
        role="status"
        aria-label="Loading"
      />
      <div className="text-center">
        <h1 className="text-lg font-semibold text-text-primary">Completing Telegram sign-in</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Verifying your identity, please wait…
        </p>
      </div>
    </div>
  );
}
