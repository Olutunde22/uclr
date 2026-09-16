import type { Metadata } from 'next';
import { GraduationCap } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to ULCRS',
  robots: 'noindex, nofollow',
};

// Design pass, 2026-09-16: the login page is the first impression of the
// whole product, so it now carries the UNILAG navy/gold identity as a full
// branded panel on wide screens (a plain centred card on narrow ones) rather
// than a bare card floating on a grey background.
export default function LoginPage() {
  return (
    <div className="bg-muted/30 flex min-h-screen">
      <div className="bg-primary text-primary-foreground relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        <div
          aria-hidden
          className="bg-brand-gold/10 pointer-events-none absolute -top-24 -right-24 size-96 rounded-full blur-3xl"
        />
        <div
          aria-hidden
          className="bg-brand-gold/10 pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <span className="bg-brand-gold text-brand-gold-foreground flex size-10 items-center justify-center rounded-lg text-base font-bold">
            UL
          </span>
          <span className="text-sm font-semibold tracking-wide">ULCRS</span>
        </div>

        <div className="relative max-w-md space-y-4">
          <GraduationCap className="text-brand-gold size-10" />
          <h1 className="text-3xl font-semibold text-balance">
            University of Lagos course registration system
          </h1>
          <p className="text-primary-foreground/70 text-sm text-pretty">
            Register courses, track approvals, manage fee clearance and view
            transcripts, all in one place for students, advisers, HODs,
            registry, bursary and lecturers.
          </p>
        </div>

        <p className="text-primary-foreground/50 relative text-xs">
          © {new Date().getFullYear()} University of Lagos
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="mb-8 flex flex-col items-center gap-2 text-center lg:hidden">
          <span className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full text-lg font-semibold">
            UL
          </span>
          <h1 className="text-xl font-semibold">ULCRS</h1>
          <p className="text-muted-foreground text-sm">
            University of Lagos course registration system
          </p>
        </div>

        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl">Log in</CardTitle>
            <CardDescription>
              Use your email, matric no. or staff ID and password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
