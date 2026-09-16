'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StudentSearch } from '@/components/fees/students/student-search';
import { PaymentHistory } from '@/components/fees/students/payment-history';
import { RecordPaymentDialog } from '@/components/fees/students/record-payment-dialog';
import { ClearancePanel } from '@/components/fees/students/clearance-panel';
import type { User } from '@/types/users';

export function FeesStudentsView() {
  const [selected, setSelected] = useState<User | null>(null);

  return (
    <div className="space-y-6">
      <StudentSearch onSelect={setSelected} selectedId={selected?.id} />

      {selected ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>
                  {selected.firstName} {selected.lastName}
                </CardTitle>
                <CardDescription>{selected.email}</CardDescription>
              </div>
              <RecordPaymentDialog
                student={selected}
                trigger={<Button>Record payment</Button>}
              />
            </CardHeader>
            <CardContent>
              <PaymentHistory student={selected} />
            </CardContent>
          </Card>

          <ClearancePanel student={selected} />
        </div>
      ) : null}
    </div>
  );
}
