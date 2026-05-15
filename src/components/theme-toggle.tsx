"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("elgarage_theme");
    if (stored === "light") {
      setDark(false);
      document.documentElement.classList.add("light-mode");
    }
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.remove("light-mode");
      localStorage.setItem("elgarage_theme", "dark");
    } else {
      document.documentElement.classList.add("light-mode");
      localStorage.setItem("elgarage_theme", "light");
    }
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-700 transition-colors"
      title={dark ? "Modo claro" : "Modo oscuro"}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
