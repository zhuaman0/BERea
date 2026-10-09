import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { GoogleButton } from "@/shared/components/ui/GoogleButton";

export const metadata: Metadata = { title: "Создать аккаунт — Мебель Studio" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-8">

      <div>
        <p className="text-[9px] tracking-[0.3em] uppercase text-stone-400 mb-3">Регистрация</p>
        <h1 className="text-3xl font-extralight text-stone-900 leading-tight">
          Создать аккаунт
        </h1>
        <p className="mt-1.5 text-[13px] text-stone-400 font-light">
          Присоединяйтесь и создайте мебель своей мечты
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <GoogleButton />

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-stone-100" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-stone-300">или</span>
          <div className="flex-1 h-px bg-stone-100" />
        </div>

        <RegisterForm />
      </div>

      <p className="text-[13px] text-stone-400 font-light">
        Уже есть аккаунт?{" "}
        <Link
          href="/login"
          className="text-stone-900 font-medium hover:underline underline-offset-2 transition-colors"
        >
          Войти
        </Link>
      </p>
    </div>
  );
}
