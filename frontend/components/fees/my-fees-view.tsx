'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { useOwnFeeStatus } from '@/hooks/use-fees';
import type { FeeClearance, FeePayment } from '@/types/fees';

function formatAmount(amount: string) {
  const value = Number(amount);
  return Number.isFinite(value)
    ? `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
    : amount;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', { dateStyle: 'medium' });
}

// Read-only per CLAUDE.md's milestone brief: no form, no mutation, just the
// permission-less GET /fees/me self-read (services/fees.ts's
// getOwnFeeStatus), same guard pattern as the dashboard stub.
export function MyFeesView() {
  const { data, isLoading, isError, refetch } = useOwnFeeStatus();

  const clearances = data?.data?.clearances ?? [];
  const payments = data?.data?.payments ?? [];

  const paymentColumns: DataTableColumn<FeePayment>[] = [
    { key: 'session', header: 'Session', cell: (row) => row.session?.name ?? '-' },
    { key: 'amount', header: 'Amount', cell: (row) => formatAmount(row.amount) },
    { key: 'receiptNo', header: 'Receipt no.', cell: (row) => row.receiptNo },
    {
      key: 'paymentDate',
      header: 'Date',
      cell: (row) => formatDate(row.paymentDate),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clearance status</CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <p className="text-destructive text-sm">
              {data?.message || 'Failed to load your fee status.'}
            </p>
          ) : isLoading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : clearances.length === 0 ? (
            <EmptyState
              title="No clearance record yet"
              description="Bursary hasn't recorded a clearance decision for you in any session yet."
            />
          ) : (
            <ul className="space-y-2">
              {clearances.map((clearance: FeeClearance) => (
                <li
                  key={clearance.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <span className="text-sm font-medium">
                    {clearance.session?.name ?? 'Unknown session'}
                  </span>
                  <Badge variant={clearance.cleared ? 'secondary' : 'destructive'}>
                    {clearance.cleared ? 'Cleared' : 'Not cleared'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Payment history</h2>
        <DataTable
          columns={paymentColumns}
          rows={payments}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          isError={isError}
          errorMessage={data?.message}
          onRetry={() => refetch()}
          emptyTitle="No payments recorded yet"
          emptyDescription="Bursary records your payments here as they're received."
        />
      </div>
    </div>
  );
}
