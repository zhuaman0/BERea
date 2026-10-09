"use client";

import { useState } from "react";
import { authApi } from "@/features/auth/api";

export function GoogleButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { url } = await authApi.googleAuthorize();
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 h-11 border border-stone-200 bg-white text-[12px] font-medium tracking-wide text-stone-700 hover:bg-stone-50 hover:border-stone-400 active:bg-stone-100 transition-colors disabled:opacity-50 disabled:pointer-events-none"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-stone-300 border-t-stone-700 animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      Войти через Google
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8064.54-1.8382.8591-3.0477.8591-2.3441 0-4.3282-1.5836-5.036-3.7105H.9574v2.3318A8.9965 8.9965 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.5918.1018-1.1673.282-1.71V4.9582H.9574A8.9965 8.9965 0 0 0 0 9c0 1.4518.3477 2.8264.9574 4.0418L3.964 10.71Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.891 11.426 0 9 0 5.4818 0 2.4468 2.0168.9573 4.9582L3.964 7.29C4.6718 5.163 6.6559 3.5795 9 3.5795Z"
        fill="#EA4335"
      />
    </svg>
  );
}
