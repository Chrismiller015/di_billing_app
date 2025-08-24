// [SOURCE: apps/web/src/components/DiscrepancyFilters.tsx]
import React, { useState, useEffect } from 'react';
import * as Select from '@radix-ui/react-select';
import { FaChevronDown, FaTimes } from 'react-icons/fa';
import { useDiscrepancyStore } from '../store/discrepancyStore';
import { useDebounce } from '../hooks/useDebounce';
import { MonthPicker } from './MonthPicker'; // Import the new component
import { format } from 'date-fns';

const ALL_VALUE = '__ALL__';

export const DiscrepancyFilters = () => {
  const { filters = {}, setFilters } = useDiscrepancyStore() || {};
  const [bacInput, setBacInput] = useState(filters.bac || '');
  const debouncedBac = useDebounce(bacInput, 300);

  const [periodDate, setPeriodDate] = useState<Date | null>(
    filters.period ? new Date(filters.period + '-02') : null // Re-hydrate date from string
  );

  useEffect(() => {
    if (setFilters) {
      setFilters({ bac: debouncedBac });
    }
  }, [debouncedBac, setFilters]);

  const handleFilterChange = (key: keyof typeof filters, value: string | null) => {
    if (setFilters) {
      const finalValue = value === ALL_VALUE ? null : value;
      setFilters({ [key]: finalValue });
    }
  };
  
  const handleDateChange = (date: Date | null) => {
    setPeriodDate(date);
    if (setFilters) {
      setFilters({ period: date ? format(date, 'yyyy-MM') : null });
    }
  };

  const programs = ['WEBSITE', 'CHAT', 'TRADE'];
  const statuses = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'ARCHIVED'];

  return (
    <div className="flex items-center gap-4 p-4 bg-[#10171B] border-b border-slate-800">
      <FilterSelect
        placeholder="Program"
        value={filters.program}
        onValueChange={(val) => handleFilterChange('program', val)}
        items={programs}
      />
      <MonthPicker selected={periodDate} onChange={handleDateChange} />
      <FilterSelect
        placeholder="Status"
        value={filters.status}
        onValueChange={(val) => handleFilterChange('status', val)}
        items={statuses}
      />
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search by BAC..."
          value={bacInput}
          onChange={(e) => setBacInput(e.target.value)}
          className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg px-3 pr-8"
        />
        {bacInput && (
          <button onClick={() => setBacInput('')} className="absolute top-1/2 right-2 -translate-y-1/2 text-slate-400 hover:text-white">
            <FaTimes />
          </button>
        )}
      </div>
    </div>
  );
};

const FilterSelect = ({ placeholder, value, onValueChange, items }) => (
    <Select.Root value={value || ''} onValueChange={onValueChange}>
      <Select.Trigger className="flex items-center justify-between w-48 h-10 bg-slate-800 border border-slate-700 rounded-lg px-3 text-sm">
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <FaChevronDown />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" sideOffset={5} className="w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
          <Select.Viewport className="p-1">
            <Select.Item value={ALL_VALUE} className="px-3 py-2 text-sm rounded-md hover:bg-slate-700 cursor-pointer outline-none">All</Select.Item>
            {items.map(item => (
              <Select.Item key={item} value={item} className="px-3 py-2 text-sm rounded-md hover:bg-slate-700 cursor-pointer outline-none">
                  <Select.ItemText>{item}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );