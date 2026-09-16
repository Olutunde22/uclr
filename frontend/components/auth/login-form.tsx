'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth';
import { loginAction } from '@/services/auth';

export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = async (values: LoginFormData) => {
    setFormError(null);
    // A successful login calls redirect() inside the action, which throws
    // Next's internal NEXT_REDIRECT signal and never returns here — this
    // component unmounts before the line below would run. A failed login
    // resolves with the failure instead of throwing (see services/auth.ts's
    // comment on loginAction for why: Next.js redacts anything thrown across
    // a Server Action boundary in production builds).
    const result = await loginAction(values.identifier, values.password);
    if (result && !result.ok) {
      setFormError(result.message);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email, matric no. or staff ID</FormLabel>
              <FormControl>
                <Input
                  autoComplete="username"
                  placeholder="you@ulcrs.edu.ng or CSC/24/003"
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {formError ? (
          <p role="alert" className="text-destructive text-sm">
            {formError}
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </Form>
  );
}
