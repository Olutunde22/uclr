import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { SettingsView } from '@/components/admin/settings/settings-view';
import { settingsKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getSettings } from '@/services/settings';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'System-wide registration settings',
  robots: 'noindex, nofollow',
};

export default async function AdminSettingsPage() {
  if (!(await canAccess(PERMISSIONS.SETTINGS_MANAGE))) {
    return <NoAccess />;
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: settingsKeys.list(),
    queryFn: () => getSettings(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground text-sm">
            System-wide values used by the registration rules.
          </p>
        </div>
        <SettingsView />
      </div>
    </HydrationBoundary>
  );
}
