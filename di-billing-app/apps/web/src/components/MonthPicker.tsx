// [SOURCE: apps/web/src/components/MonthPicker.tsx]
import React from 'react';
import DatePicker from 'react-datepicker';
// We need to import the CSS for the datepicker to work correctly.
import 'react-datepicker/dist/react-datepicker.css';

// This is a custom input component that matches the style of your other inputs.
const CustomMonthInput = React.forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
  ({ value, onClick }, ref) => (
    <button
      onClick={onClick}
      ref={ref}
      className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg px-3 text-left text-sm"
    >
      {value || <span className="text-slate-400">Select Period...</span>}
    </button>
  )
);

export const MonthPicker = ({ selected, onChange }) => {
  return (
    <div className="w-48">
      <DatePicker
        selected={selected}
        onChange={onChange}
        customInput={<CustomMonthInput />}
        dateFormat="yyyy-MM"
        showMonthYearPicker
        popperPlacement="bottom-start"
      />
    </div>
  );
};