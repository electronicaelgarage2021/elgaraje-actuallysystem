"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";

export function ClientsSearch({ currentQuery }: { currentQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(currentQuery || "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    router.push(`/clientes?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="relative flex-1 md:max-w-md">
      <svg
        className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Buscar por nombre o DNI..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-surface-700 border border-surface-600 rounded-lg pl-10 pr-10 py-2.5 text-sm placeholder-gray-500"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            router.push("/clientes");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
