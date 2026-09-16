// Mirrors backend/src/modules/settings/entities/system-setting.entity.ts.
// PLAN.md's system_settings table has exactly three rows and no others exist
// or are expected — SETTING_KEYS is the closed set the settings page edits
// as a form, not a generic key/value editor.
export interface SystemSetting {
  key: string;
  value: string;
  updatedAt: string;
}

export const SETTING_KEYS = {
  MIN_CREDIT_UNITS: 'min_credit_units',
  MAX_CREDIT_UNITS: 'max_credit_units',
  PASS_MARK: 'pass_mark',
} as const;
