import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">No encontrado</h2>
        <p className="text-gray-500">La página que buscás no existe</p>
        <Link
          href="/"
          className="inline-block bg-brand-teal hover:bg-brand-teal-dark text-surface-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          Volver al dashboard
        </Link>
      </div>
    </div>
  );
}
