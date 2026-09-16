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
// the capability that unlocks it, and this component just filters. Design
// pass, 2026-09-16: added per-item icons (lib/nav.ts's `icon` field), a gold
// active-state indicator instead of a flat colour swap, and a fixed-width
// scrollable nav list so a long item set never pushes off-screen.
export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter(
    (item) =>
      !item.permissions || hasAnyPermission(user.permissions, item.permissions),
  );

  return (
    <aside className="bg-sidebar text-sidebar-foreground flex w-64 shrink-0 flex-col border-r">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-5">
        <span className="bg-brand-gold text-brand-gold-foreground flex size-8 items-center justify-center rounded-md text-sm font-bold">
          UL
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-wide">ULCRS</p>
          <p className="text-sidebar-foreground/50 text-[11px]">
            Course registration
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <span
                key={item.label}
                title="Coming soon"
                className="text-sidebar-foreground/40 flex cursor-not-allowed items-center justify-between gap-2 rounded-md px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="size-4" />
                  {item.label}
                </span>
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
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-sidebar-border text-sidebar-foreground/40 border-t px-5 py-3 text-[11px]">
        University of Lagos
      </div>
    </aside>
  );
}
