// [SOURCE: apps/web/src/components/PaginationControls.tsx]
import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export const PaginationControls = ({ page, pageSize, total, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize);

  // This is the fix: The component now correctly uses the 'onPageChange' prop.
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-[#10171B] border-t border-slate-800">
      <span className="text-sm text-slate-400">
        Page {page} of {totalPages} ({total} items)
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="px-3 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
        >
          <FaChevronLeft />
        </button>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};