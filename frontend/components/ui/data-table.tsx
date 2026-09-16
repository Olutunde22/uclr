'use client';

import type { ReactNode } from 'react';
import { cn } from 'cn';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';

// The one shared list-rendering primitive for milestone 9's admin pages (and
// every future list — calendar, fees, records, ...). Not a full data-grid
// (no built-in sorting/column resize): callers own filtering/pagination
// state and just hand this the rows for the current page, per query.md's
// placeholderData pagination idiom. Loading/empty/error states are built in
// so no list re-implements them (the skill's core rule: every read shows
// all three).
export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  skeletonRows?: number;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  skeletonRows = 5,
}: DataTableProps<T>) {
  if (isError) {
    return <ErrorState message={errorMessage} onRetry={onRetry} />;
  }

  return (
    <div className="bg-card overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  'bg-muted/50 h-10 text-xs font-semibold tracking-wide uppercase',
                  column.className,
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableCell key={column.key} className="py-3">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-auto p-0">
                <EmptyState title={emptyTitle} description={emptyDescription} />
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={rowKey(row)}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn('py-3', column.className)}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
