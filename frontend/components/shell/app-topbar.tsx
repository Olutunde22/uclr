'use client';

import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModeToggle } from '@/components/shell/mode-toggle';
import { useLogout } from '@/hooks/use-auth';
import type { AuthenticatedUser } from '@/types';

function initials(user: AuthenticatedUser) {
  return (
    `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() ||
    'U'
  );
}

function formatRole(role: string) {
  return role
    .split('_')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

interface AppTopbarProps {
  user: AuthenticatedUser;
}

export function AppTopbar({ user }: AppTopbarProps) {
  const logout = useLogout();

  return (
    <header className="bg-card/95 supports-[backdrop-filter]:backdrop-blur sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b px-6">
      <div>
        <p className="text-sm font-medium">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-muted-foreground text-xs">
          {user.roles.map(formatRole).join(', ')}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            className="rounded-full outline-none"
            aria-label="Account menu"
          >
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials(user)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-muted-foreground text-xs font-normal">
                {user.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              <LogOut className="size-4" />
              {logout.isPending ? 'Logging out…' : 'Log out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
