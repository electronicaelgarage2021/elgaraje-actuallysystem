"use client";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { circle: "w-10 h-10", electro: "text-[0.3rem]", brand: "text-[0.5rem]" },
    md: { circle: "w-14 h-14", electro: "text-[0.4rem]", brand: "text-[0.7rem]" },
    lg: { circle: "w-20 h-20", electro: "text-[0.5rem]", brand: "text-[0.9rem]" },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-4">
      <div
        className={`${s.circle} rounded-full bg-brand-teal flex flex-col items-center justify-center shrink-0 shadow-lg shadow-brand-teal/20`}
      >
        <span
          className={`${s.electro} font-bold text-brand-red tracking-[0.12em] uppercase leading-none mt-0.5`}
        >
          Electrónica
        </span>
        <span
          className={`${s.brand} text-surface-900 leading-tight tracking-wide font-brand`}
        >
          El Garage
        </span>
      </div>
      <div>
        <div className="text-[0.55rem] font-bold text-brand-red tracking-[0.25em] uppercase">
          Electrónica
        </div>
        <div className="font-brand text-lg leading-tight tracking-wide">
          El Garage
        </div>
      </div>
    </div>
  );
}
