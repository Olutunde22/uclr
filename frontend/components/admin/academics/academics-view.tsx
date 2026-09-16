'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { FacultiesPanel } from '@/components/admin/academics/faculties-panel';
import { DepartmentsPanel } from '@/components/admin/academics/departments-panel';

export function AcademicsView() {
  return (
    <Tabs defaultValue="departments">
      <TabsList>
        <TabsTrigger value="departments">Departments</TabsTrigger>
        <TabsTrigger value="faculties">Faculties</TabsTrigger>
      </TabsList>
      <TabsContent value="departments" className="pt-4">
        <DepartmentsPanel />
      </TabsContent>
      <TabsContent value="faculties" className="pt-4">
        <FacultiesPanel />
      </TabsContent>
    </Tabs>
  );
}
