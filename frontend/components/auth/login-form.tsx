'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
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
    try {
      // loginAction throws rather than resolving with the envelope — a
      // deliberate exception (auth.md), so the catch here drives the error
      // state directly. A successful call redirects server-side and never
      // returns.
      await loginAction(values.identifier, values.password);
    } catch (error) {
      // A successful login throws Next's internal NEXT_REDIRECT signal to
      // drive the post-login navigation — let it propagate instead of
      // surfacing it as a form error.
      if (isRedirectError(error)) throw error;
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to log in. Please try again.',
      );
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
