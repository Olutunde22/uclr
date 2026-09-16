import type { Registration } from '@/types/registrations';

interface RegisteredCourseListProps {
  registration: Registration;
}

export function RegisteredCourseList({ registration }: RegisteredCourseListProps) {
  if (registration.courses.length === 0) {
    return <p className="text-muted-foreground text-sm">No courses selected.</p>;
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-2 text-left">Code</th>
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-right">Units</th>
          </tr>
        </thead>
        <tbody>
          {registration.courses.map((rc) => (
            <tr key={rc.id} className="border-t">
              <td className="p-2 font-medium">{rc.course.code}</td>
              <td className="p-2">{rc.course.title}</td>
              <td className="p-2 text-right">{rc.course.creditUnits}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t font-medium">
            <td className="p-2" colSpan={2}>
              Total
            </td>
            <td className="p-2 text-right">{registration.totalUnits}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
