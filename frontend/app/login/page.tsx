import type { Metadata } from 'next';
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

export default function LoginPage() {
  return (
    <div className="bg-muted/40 flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
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
          <CardTitle>Log in</CardTitle>
          <CardDescription>
            Use your email, matric no. or staff ID and password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
