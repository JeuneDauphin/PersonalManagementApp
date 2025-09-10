import React from 'react';
import {
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    MoreHorizontal,
} from 'lucide-react';

type PaginationPosition = 'top' | 'bottom' | 'both';

interface PaginationProps {
    // Controlled pagination
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;

    // Optional extras
    className?: string;
    siblingCount?: number; // how many pages to show on each side of current
    showFirstLast?: boolean;
    showGoTo?: boolean;
    compact?: boolean; // fewer paddings, smaller buttons

    // Layout mode: wrap children and render pagination controls as a footer
    children?: React.ReactNode;
    position?: PaginationPosition; // where to render the controls relative to children

    // Info line (when you know items and page size)
    totalItems?: number;
    pageSize?: number;
}

const DOTS = '…';

function usePageRange(totalPages: number, currentPage: number, siblingCount: number) {
    // Builds a page number range with ellipses
    if (totalPages <= 0) return [] as (number | string)[];

    const totalNumbers = siblingCount * 2 + 5; // first, last, current, 2*siblings, and 2 DOTS potentially

    if (totalNumbers >= totalPages) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!showLeftDots && showRightDots) {
        const leftItemCount = 3 + 2 * siblingCount;
        const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
        return [...leftRange, DOTS, totalPages];
    }

    if (showLeftDots && !showRightDots) {
        const rightItemCount = 3 + 2 * siblingCount;
        const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + 1 + i);
        return [firstPageIndex, DOTS, ...rightRange];
    }

    if (showLeftDots && showRightDots) {
        const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
        return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    // Fallback (shouldn't hit)
    return Array.from({ length: totalPages }, (_, i) => i + 1);
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
    siblingCount = 1,
    showFirstLast = true,
    showGoTo = false,
    compact = false,
    children,
    position = 'bottom',
    totalItems,
    pageSize,
}) => {
    const pageRange = usePageRange(totalPages, currentPage, siblingCount);

    const btnBase = `inline-flex items-center justify-center rounded-md border text-sm transition-colors
		focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
		${compact ? 'h-8 min-w-8 px-2' : 'h-9 min-w-9 px-3'}
		bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white focus:ring-gray-500`;

    const btnActive = 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700';

    const container = `flex items-center gap-2 ${compact ? 'py-2' : 'py-3'} ${className}`;

    const handleGoTo = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.elements.namedItem('goto') as HTMLInputElement | null;
        const val = input ? parseInt(input.value, 10) : NaN;
        if (!isNaN(val)) onPageChange(Math.max(1, Math.min(val, totalPages)));
    };

    const infoText = (() => {
        if (!totalItems || !pageSize || totalPages === 0) return null;
        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, totalItems);
        return (
            <div className={`text-xs ${compact ? 'mt-0' : 'mt-0'} text-gray-400`}>Showing {start}-{end} of {totalItems}</div>
        );
    })();

    const Controls = (
        <div className="w-full flex flex-col gap-2">
            <div className={container}>
                {showFirstLast && (
                    <button
                        type="button"
                        aria-label="First page"
                        className={btnBase}
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1 || totalPages === 0}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </button>
                )}

                <button
                    type="button"
                    aria-label="Previous page"
                    className={btnBase}
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || totalPages === 0}
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-1">
                    {pageRange.map((item, idx) =>
                        item === DOTS ? (
                            <span key={`dots-${idx}`} className={`inline-flex items-center justify-center ${compact ? 'h-8 min-w-8' : 'h-9 min-w-9'} text-gray-500`}>
                                <MoreHorizontal className="h-4 w-4" />
                            </span>
                        ) : (
                            <button
                                key={`page-${item}`}
                                type="button"
                                aria-label={`Page ${item}`}
                                className={`${btnBase} ${item === currentPage ? btnActive : ''}`}
                                onClick={() => onPageChange(item as number)}
                            >
                                {item}
                            </button>
                        )
                    )}
                </div>

                <button
                    type="button"
                    aria-label="Next page"
                    className={btnBase}
                    onClick={() => onPageChange(Math.min(totalPages || 1, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    <ChevronRight className="h-4 w-4" />
                </button>

                {showFirstLast && (
                    <button
                        type="button"
                        aria-label="Last page"
                        className={btnBase}
                        onClick={() => onPageChange(totalPages || 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </button>
                )}

                {showGoTo && totalPages > 0 && (
                    <form onSubmit={handleGoTo} className="ml-2 flex items-center gap-2">
                        <label htmlFor="goto" className="text-xs text-gray-400">Go to</label>
                        <input
                            id="goto"
                            name="goto"
                            type="number"
                            min={1}
                            max={totalPages}
                            defaultValue={currentPage}
                            className={`bg-gray-900 border border-gray-700 text-gray-200 rounded-md ${compact ? 'h-8 px-2 w-16' : 'h-9 px-3 w-20'} focus:outline-none focus:ring-2 focus:ring-gray-500`}
                        />
                        <button type="submit" className={`${btnBase}`}>Go</button>
                    </form>
                )}
            </div>

            {infoText}
        </div>
    );

    // Layout mode: optionally render around children (acts like a section with footer)
    if (children) {
        return (
            <section className="w-full">
                {(position === 'top' || position === 'both') && (
                    <div className="border-t border-b border-gray-800 bg-gray-900/30 px-4">
                        {Controls}
                    </div>
                )}
                <div className="min-h-[2rem]">{children}</div>
                {(position === 'bottom' || position === 'both') && (
                    <footer className="mt-4 border-t border-gray-800 bg-gray-900/30 px-4">
                        {Controls}
                    </footer>
                )}
            </section>
        );
    }

    // Standalone control
    return <div className="w-full">{Controls}</div>;
};

export default Pagination;
