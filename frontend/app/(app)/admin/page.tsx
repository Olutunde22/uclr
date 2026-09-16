import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { NoAccess } from '@/components/shared/no-access';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';

export const metadata: Metadata = {
  title: 'Admin',
  robots: 'noindex, nofollow',
};

// The sidebar's "Admin" item (lib/nav.ts) links here rather than to a
// specific sub-page, since it's shown to anyone with ANY of the four admin
// permissions (users/academics/settings/audit), not necessarily all of them.
// This route just forwards to the first sub-page the caller can actually
// open, in the same priority PLAN.md lists them.
export default async function AdminIndexPage() {
  if (await canAccess(PERMISSIONS.USERS_MANAGE)) redirect('/admin/users');
  if (await canAccess(PERMISSIONS.ACADEMICS_MANAGE)) redirect('/admin/academics');
  if (await canAccess(PERMISSIONS.SETTINGS_MANAGE)) redirect('/admin/settings');
  if (await canAccess(PERMISSIONS.AUDIT_READ)) redirect('/admin/audit');
  return <NoAccess />;
}
