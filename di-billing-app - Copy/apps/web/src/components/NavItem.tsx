import React from "react";
import { NavLink } from "react-router-dom";

const cls = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");

type NavItemProps = {
  to: string;
  icon: React.ComponentType<any>;
  label: string;
};

export function NavItem({ to, icon: Icon, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cls(
          "w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-slate-300 hover:bg-slate-800/60",
          isActive && "bg-slate-800/80 border border-slate-700 text-cyan-300"
        )
      }
    >
      <Icon className="opacity-80" />
      <span className="text-sm">{label}</span>
    </NavLink>
  );
}
