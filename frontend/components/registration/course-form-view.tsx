'use client';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useOwnRegistration } from '@/hooks/use-registrations';
import { useSemesters } from '@/hooks/use-calendar';
import { useSession } from '@/hooks/use-auth';

// PLAN.md's `/registration/form`: a printable course form listing the
// approved/finalised courses, with print CSS. Only rendered once a
// registration has actually cleared both approvals — a draft/pending
// registration has nothing official to print yet.
export function CourseFormView() {
  const { data: semestersResult } = useSemesters();
  const currentSemester = (semestersResult?.data ?? []).find((s) => s.isCurrent);
  const { data, isLoading } = useOwnRegistration(currentSemester?.id);
  const { data: sessionResult } = useSession();
  const registration = data?.data ?? null;
  const student = sessionResult?.data;

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (!registration || !['approved', 'finalised'].includes(registration.status)) {
    return (
      <EmptyState
        title="No course form yet"
        description="A course form is only available once your registration is approved by both your adviser and the HOD."
      />
    );
  }

  return (
    <div className="space-y-4">
      <style>{`
        @media print {
          nav, header, .no-print { display: none !important; }
          body { background: white !important; }
          .print-sheet { box-shadow: none !important; border: none !important; }
        }
      `}</style>
      <div className="no-print flex justify-end">
        <Button onClick={() => window.print()}>Print</Button>
      </div>
      <div className="print-sheet space-y-6 rounded-md border p-8">
        <div className="space-y-1 text-center">
          <h2 className="text-xl font-semibold">
            University of Lagos - Course registration form
          </h2>
          <p className="text-muted-foreground text-sm">
            {registration.semester?.session?.name}{' '}
            {registration.semester?.name === 'first' ? 'First' : 'Second'} semester
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <p>
            <span className="font-medium">Name:</span> {student?.firstName}{' '}
            {student?.lastName}
          </p>
          <p>
            <span className="font-medium">Status:</span>{' '}
            {registration.status === 'finalised' ? 'Finalised' : 'Approved'}
          </p>
        </div>

        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="border p-2 text-left">Code</th>
              <th className="border p-2 text-left">Title</th>
              <th className="border p-2 text-left">Level</th>
              <th className="border p-2 text-left">Semester</th>
              <th className="border p-2 text-right">Units</th>
            </tr>
          </thead>
          <tbody>
            {registration.courses.map((rc) => (
              <tr key={rc.id}>
                <td className="border p-2">{rc.course.code}</td>
                <td className="border p-2">{rc.course.title}</td>
                <td className="border p-2">{rc.course.level}</td>
                <td className="border p-2 capitalize">{rc.course.semester}</td>
                <td className="border p-2 text-right">{rc.course.creditUnits}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-medium">
              <td className="border p-2" colSpan={4}>
                Total credit units
              </td>
              <td className="border p-2 text-right">{registration.totalUnits}</td>
            </tr>
          </tfoot>
        </table>

        <div className="grid grid-cols-2 gap-8 pt-8 text-sm">
          <div>
            <p className="border-t pt-1">Student&apos;s signature</p>
          </div>
          <div>
            <p className="border-t pt-1">Academic adviser&apos;s signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}
