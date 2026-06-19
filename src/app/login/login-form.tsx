"use client";

import { useState, useRef, useEffect, useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { Logo } from "@/components/logo";

const LEN = 6;

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [pin, setPin] = useState<string[]>(Array(LEN).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-enviar cuando los 6 dígitos están completos
  useEffect(() => {
    if (pin.every((d) => d !== "")) {
      formRef.current?.requestSubmit();
    }
  }, [pin]);

  // Limpiar tras un error
  useEffect(() => {
    if (state?.error) {
      setPin(Array(LEN).fill(""));
      inputRefs.current[0]?.focus();
    }
  }, [state]);

  function handleChange(i: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...pin];
    next[i] = value.slice(-1);
    setPin(next);
    if (value && i < LEN - 1) inputRefs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !pin[i] && i > 0) inputRefs.current[i - 1]?.focus();
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-surface-900 flex items-center justify-center p-4">
      <form ref={formRef} action={action} className="text-center space-y-8">
        <input type="hidden" name="pin" value={pin.join("")} />
        <Logo size="lg" />
        <div>
          <p className="text-gray-400 text-sm mb-6">Ingresá el PIN para acceder</p>
          <div className="flex gap-2.5 justify-center">
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                disabled={pending}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                autoFocus={i === 0}
                className={`w-12 h-14 text-center text-2xl font-bold bg-surface-800 border-2 rounded-xl outline-none transition-all disabled:opacity-50 ${
                  state?.error
                    ? "border-brand-red animate-shake"
                    : digit
                      ? "border-brand-teal"
                      : "border-surface-600 focus:border-brand-teal"
                }`}
              />
            ))}
          </div>
          {state?.error && <p className="text-brand-red text-xs mt-3">{state.error}</p>}
          {pending && <p className="text-gray-500 text-xs mt-3">Verificando...</p>}
        </div>
      </form>
    </div>
  );
}
