import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { GoogleButton } from "@/shared/components/ui/GoogleButton";

export const metadata: Metadata = { title: "Войти — Мебель Studio" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-8">

      <div>
        <p className="text-[9px] tracking-[0.3em] uppercase text-stone-400 mb-3">Вход</p>
        <h1 className="text-3xl font-extralight text-stone-900 leading-tight">
          С возвращением
        </h1>
        <p className="mt-1.5 text-[13px] text-stone-400 font-light">
          Войдите, чтобы сохранять дизайны и заказы
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <GoogleButton />

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-stone-100" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-stone-300">или</span>
          <div className="flex-1 h-px bg-stone-100" />
        </div>

        <LoginForm />
      </div>

      <p className="text-[13px] text-stone-400 font-light">
        Нет аккаунта?{" "}
        <Link
          href="/register"
          className="text-stone-900 font-medium hover:underline underline-offset-2 transition-colors"
        >
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
