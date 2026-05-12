import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Confirm device" };

export default function ConfirmDevicePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center flex flex-col items-center gap-3">
        <span className="text-5xl" aria-hidden="true">🖥️</span>
        <h1 className="text-2xl font-bold text-text-primary">New device detected</h1>
        <p className="text-sm text-text-secondary">
          Do you want to trust this device for future sign-ins?
        </p>
      </div>

      <div className="bg-surface rounded-card shadow-card border border-gray-100 p-6 flex flex-col gap-4">
        <p className="text-sm text-text-muted text-center">
          ConfirmDeviceForm — coming in feature build
        </p>
      </div>

      <p className="text-center text-sm text-text-secondary">
        <Link href="/login" className="text-brand-600 font-medium hover:underline">
          Cancel
        </Link>
      </p>
    </div>
  );
}
