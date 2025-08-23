import React from 'react';

const cls = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");

type TabButtonProps = {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
};

export const TabButton = ({ children, active, onClick }: TabButtonProps) => {
  return <button onClick={onClick} className={cls("px-4 h-10 rounded-t-lg border-b-2", active ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-400 hover:text-slate-200")}>{children}</button>;
};
// --- END OF FILE ---