"use client";

import { useState } from "react";

interface Props {
  name: string;
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export function RepuestoSearchInput({ name, placeholder, defaultValue = "", onChange }: Props) {
  const [value, setValue] = useState(defaultValue);

  return (
    <input
      name={name}
      type="text"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange?.(e.target.value);
      }}
      placeholder={placeholder || "Ej: Modulo Samsung A54"}
      className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500"
      autoComplete="off"
    />
  );
}
