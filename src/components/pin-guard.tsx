"use client";

import { useState, useEffect, useRef } from "react";
import { Logo } from "./logo";

const CORRECT_PIN = "1111";

export function PinGuard({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("elgarage_unlocked");
    if (stored === "true") {
      setUnlocked(true);
    }
    setChecking(false);
  }, []);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError(false);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newPin.every((d) => d !== "")) {
      const entered = newPin.join("");
      if (entered === CORRECT_PIN) {
        sessionStorage.setItem("elgarage_unlocked", "true");
        setUnlocked(true);
      } else {
        setError(true);
        setTimeout(() => {
          setPin(["", "", "", ""]);
          inputRefs.current[0]?.focus();
        }, 500);
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  if (checking) {
    return (
      <div className="fixed inset-0 z-[9999] bg-surface-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[9999] bg-surface-900 flex items-center justify-center">
      <div className="text-center space-y-8">
        <Logo size="lg" />
        <div>
          <p className="text-gray-400 text-sm mb-6">Ingresá el PIN para acceder</p>
          <div className="flex gap-3 justify-center">
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                autoFocus={i === 0}
                className={`w-14 h-14 text-center text-2xl font-bold bg-surface-800 border-2 rounded-xl outline-none transition-all ${
                  error
                    ? "border-brand-red animate-shake"
                    : digit
                      ? "border-brand-teal"
                      : "border-surface-600 focus:border-brand-teal"
                }`}
              />
            ))}
          </div>
          {error && (
            <p className="text-brand-red text-xs mt-3">PIN incorrecto</p>
          )}
        </div>
      </div>
    </div>
  );
}
