'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { SessionsPanel } from '@/components/calendar/sessions-panel';
import { SemestersPanel } from '@/components/calendar/semesters-panel';

export function CalendarView() {
  return (
    <Tabs defaultValue="semesters">
      <TabsList>
        <TabsTrigger value="semesters">Semesters</TabsTrigger>
        <TabsTrigger value="sessions">Sessions</TabsTrigger>
      </TabsList>
      <TabsContent value="semesters" className="pt-4">
        <SemestersPanel />
      </TabsContent>
      <TabsContent value="sessions" className="pt-4">
        <SessionsPanel />
      </TabsContent>
    </Tabs>
  );
}
