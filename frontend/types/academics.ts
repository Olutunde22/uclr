// Mirrors backend/src/modules/academics/entities/*.ts and its DTOs.
import type { User } from './users';

export interface Faculty {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  facultyId: string;
  faculty?: Faculty;
  code: string;
  name: string;
  hodId?: string | null;
  hod?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFacultyRequest {
  code: string;
  name: string;
}

export type UpdateFacultyRequest = Partial<CreateFacultyRequest>;

export interface CreateDepartmentRequest {
  facultyId: string;
  code: string;
  name: string;
}

export type UpdateDepartmentRequest = Partial<CreateDepartmentRequest>;
