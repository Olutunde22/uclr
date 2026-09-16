'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ROLE_OPTIONS } from '@/types/users';

interface RoleCheckboxesProps {
  value: string[];
  onChange: (roles: string[]) => void;
  disabled?: boolean;
}

// Shared by the create and edit user forms - a user's `roles` array can hold
// more than one role (PLAN.md: e.g. an academic adviser who is also a
// lecturer), so this is a checkbox group, not a single select.
export function RoleCheckboxes({
  value,
  onChange,
  disabled,
}: RoleCheckboxesProps) {
  function toggle(role: string, checked: boolean) {
    onChange(checked ? [...value, role] : value.filter((r) => r !== role));
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {ROLE_OPTIONS.map((role) => (
        <Label
          key={role.value}
          className="flex items-center gap-2 text-sm font-normal"
        >
          <Checkbox
            checked={value.includes(role.value)}
            disabled={disabled}
            onCheckedChange={(checked) => toggle(role.value, checked === true)}
          />
          {role.label}
        </Label>
      ))}
    </div>
  );
}
