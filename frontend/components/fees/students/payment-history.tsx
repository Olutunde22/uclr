'use client';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { usePayments } from '@/hooks/use-fees';
import type { FeePayment } from '@/types/fees';
import type { User } from '@/types/users';

function formatAmount(amount: string) {
  const value = Number(amount);
  return Number.isFinite(value)
    ? `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
    : amount;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', { dateStyle: 'medium' });
}

interface PaymentHistoryProps {
  student: User;
}

export function PaymentHistory({ student }: PaymentHistoryProps) {
  const { data, isLoading, isError, refetch } = usePayments({
    studentId: student.id,
  });
  const payments = data?.data ?? [];

  const columns: DataTableColumn<FeePayment>[] = [
    { key: 'session', header: 'Session', cell: (row) => row.session?.name ?? '-' },
    { key: 'amount', header: 'Amount', cell: (row) => formatAmount(row.amount) },
    { key: 'receiptNo', header: 'Receipt no.', cell: (row) => row.receiptNo },
    {
      key: 'paymentDate',
      header: 'Date',
      cell: (row) => formatDate(row.paymentDate),
    },
    {
      key: 'recordedBy',
      header: 'Recorded by',
      cell: (row) =>
        row.recordedByUser
          ? `${row.recordedByUser.firstName} ${row.recordedByUser.lastName}`
          : '-',
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={payments}
      rowKey={(row) => row.id}
      isLoading={isLoading}
      isError={isError}
      errorMessage={data?.message}
      onRetry={() => refetch()}
      emptyTitle="No payments recorded"
      emptyDescription="Record this student's first payment to start their history."
    />
  );
}
