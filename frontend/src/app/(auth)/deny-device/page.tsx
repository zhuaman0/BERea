import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Device denied" };

export default function DenyDevicePage() {
  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-5xl" aria-hidden="true">🚫</span>
        <h1 className="text-2xl font-bold text-text-primary">Device access denied</h1>
        <p className="text-sm text-text-secondary">
          This device was not trusted. Sign in again from a recognised device.
        </p>
      </div>

      <Link
        href="/login"
        className="bg-brand-500 text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-brand-600 transition-colors"
      >
        Back to sign in
      </Link>
    </div>
  );
}
