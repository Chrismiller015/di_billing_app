import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

type PaginationControlsProps = {
    page: number;
    pageSize: number;
    total: number;
    setPage: (page: number) => void;
};

export const PaginationControls = ({ page, pageSize, total, setPage }: PaginationControlsProps) => {
    const totalPages = Math.ceil(total / pageSize);
    const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, total);

    return (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
            <div>
                Showing <span className="font-medium text-slate-200">{startItem}</span> - <span className="font-medium text-slate-200">{endItem}</span> of <span className="font-medium text-slate-200">{total}</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaChevronLeft />
                    <span>Previous</span>
                </button>
                <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>Next</span>
                    <FaChevronRight />
                </button>
            </div>
        </div>
    );
};
// --- END OF FILE ---