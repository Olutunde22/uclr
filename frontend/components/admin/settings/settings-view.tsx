'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { settingsSchema, type SettingsFormData } from '@/lib/schemas/settings';

// zod's z.coerce.number() has an `unknown` INPUT type (the raw <input> string)
// distinct from its `number` OUTPUT type after parsing — react-hook-form's
// third generic is exactly for this: the form manages the input shape, and
// the resolver's already-coerced output is what onSubmit receives.
type SettingsFormInput = z.input<typeof settingsSchema>;
import { useSettings, useUpdateSetting } from '@/hooks/use-settings';
import { SETTING_KEYS } from '@/types/settings';

function readSetting(rows: { key: string; value: string }[], key: string) {
  return rows.find((row) => row.key === key)?.value;
}

// The three system_settings rows (PLAN.md) as one form, not a generic
// key/value editor - CLAUDE.md's product rule for this page.
export function SettingsView() {
  const { data, isLoading, isError, refetch } = useSettings();
  const updateSetting = useUpdateSetting();

  const rows = data?.data ?? [];

  const form = useForm<SettingsFormInput, undefined, SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: data?.data
      ? {
          minCreditUnits: Number(
            readSetting(rows, SETTING_KEYS.MIN_CREDIT_UNITS) ?? 15,
          ),
          maxCreditUnits: Number(
            readSetting(rows, SETTING_KEYS.MAX_CREDIT_UNITS) ?? 24,
          ),
          passMark: Number(readSetting(rows, SETTING_KEYS.PASS_MARK) ?? 40),
        }
      : undefined,
  });

  // Reset dirty state to the freshly-loaded values once, rather than fighting
  // the user's in-progress edits on every background refetch.
  useEffect(() => {
    if (data?.data && !form.formState.isDirty) {
      form.reset({
        minCreditUnits: Number(
          readSetting(rows, SETTING_KEYS.MIN_CREDIT_UNITS) ?? 15,
        ),
        maxCreditUnits: Number(
          readSetting(rows, SETTING_KEYS.MAX_CREDIT_UNITS) ?? 24,
        ),
        passMark: Number(readSetting(rows, SETTING_KEYS.PASS_MARK) ?? 40),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.data]);

  if (isLoading) {
    return <Skeleton className="h-72 w-full max-w-lg" />;
  }

  if (isError || !data?.data) {
    return (
      <ErrorState message={data?.message} onRetry={() => refetch()} />
    );
  }

  const onSubmit = async (values: SettingsFormData) => {
    const updates: [string, string][] = [
      [SETTING_KEYS.MIN_CREDIT_UNITS, String(values.minCreditUnits)],
      [SETTING_KEYS.MAX_CREDIT_UNITS, String(values.maxCreditUnits)],
      [SETTING_KEYS.PASS_MARK, String(values.passMark)],
    ];

    for (const [key, value] of updates) {
      const result = await updateSetting.mutateAsync({ key, value });
      if (!result.data) {
        toast.error(result.message || `Failed to update "${key}".`);
        return;
      }
    }
    toast.success('Settings saved.');
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Registration rules</CardTitle>
        <CardDescription>
          These values gate every student&rsquo;s registration submission.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="minCreditUnits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum credit units</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={(field.value as number | string | undefined) ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    The fewest credit units a registration may carry.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxCreditUnits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum credit units</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={(field.value as number | string | undefined) ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    The most credit units a registration may carry.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passMark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pass mark</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={(field.value as number | string | undefined) ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    The minimum score counted as a pass for prerequisites.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving…' : 'Save settings'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
