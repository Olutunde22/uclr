'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';
import { NAV_ITEMS } from '@/lib/nav';
import { hasAnyPermission } from '@/lib/permissions';
import type { AuthenticatedUser } from '@/types';

interface AppSidebarProps {
  user: AuthenticatedUser;
}

// Sidebar built from the user's permissions, not role names (permissions.md:
// "never branch on a role name inline") — every item in lib/nav.ts declares
// the capability that unlocks it, and this component just filters.
export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter(
    (item) =>
      !item.permissions || hasAnyPermission(user.permissions, item.permissions),
  );

  return (
    <aside className="bg-sidebar text-sidebar-foreground flex w-64 shrink-0 flex-col border-r">
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="bg-brand-gold text-brand-gold-foreground flex size-8 items-center justify-center rounded-md text-sm font-bold">
          UL
        </span>
        <span className="text-sm font-semibold tracking-wide">ULCRS</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((item) => {
          const active = pathname === item.href;
          if (item.disabled) {
            return (
              <span
                key={item.label}
                title="Coming soon"
                className="text-sidebar-foreground/40 flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-sm"
              >
                {item.label}
                <span className="text-[10px] tracking-wide uppercase">
                  Soon
                </span>
              </span>
            );
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'block rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
