import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const cls = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");

type IconBtnProps = {
  title: string;
  icon: React.ComponentType<any>;
  onClick?: () => void;
  disabled?: boolean;
};

export const IconBtn = ({ title, icon: Icon, onClick, disabled }: IconBtnProps) => {
  return (
    <button title={title} onClick={onClick} disabled={disabled} className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700/70 transition disabled:opacity-50 disabled:cursor-not-allowed">
      {disabled ? <FaSpinner className="animate-spin" /> : <Icon />}
      <span className="text-sm">{title}</span>
    </button>
  );
};
// --- END OF FILE ---