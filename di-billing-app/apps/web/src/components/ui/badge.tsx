import React from 'react';

const cls = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");

type BadgeProps = {
  children: React.ReactNode;
  color?: "slate" | "green" | "red" | "yellow" | "blue" | "purple";
};

export const Badge = ({ children, color = "slate" }: BadgeProps) => {
  const map = {
    slate: "bg-slate-800 text-slate-200 border-slate-700",
    green: "bg-emerald-900/50 text-emerald-300 border-emerald-800",
    red: "bg-rose-900/50 text-rose-300 border-rose-800",
    yellow: "bg-amber-900/50 text-amber-300 border-amber-800",
    blue: "bg-cyan-900/50 text-cyan-300 border-cyan-800",
    purple: "bg-violet-900/50 text-violet-300 border-violet-800",
  } as const;
  return <span className={cls("px-2 py-1 rounded-full text-xs border", map[color])}>{children}</span>;
};
// --- END OF FILE ---