import { ShieldAlert } from 'lucide-react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Rendered by every page.tsx whose lib/page-access.ts's canAccess() check
// fails (permissions.md: "authorization renders no-access; authentication
// redirects"). Shared across all admin pages rather than one-off per route.
interface NoAccessProps {
  title?: string;
  description?: string;
}

export function NoAccess({
  title = "You don't have access to this page",
  description = 'Contact the ICT admin if you think this is a mistake.',
}: NoAccessProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="max-w-sm text-center">
        <CardHeader>
          <div className="bg-muted mx-auto mb-2 flex size-10 items-center justify-center rounded-full">
            <ShieldAlert className="text-muted-foreground size-5" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
