'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { serverApi } from '@/lib/api-client';
import { unwrap } from '@/lib/unwrap';
import { handleAPIErrors } from '@/lib/api-helpers';
import type { ApiEnvelope, ApiResponse } from '@/types/api';
import type { Decision, Registration } from '@/types/registrations';
import type { UserDetail } from '@/types/users';

// Approvals share the registrations module on the backend (no separate
// approvals module — backend/CLAUDE.md): adviser/HOD queues and decisions
// live in ApprovalsController, driven by the same RegistrationsService.

export async function getAdviserQueue(): Promise<ApiResponse<Registration[] | null>> {
  try {
    const response = await serverApi.get<ApiEnvelope<Registration[]>>(
      '/approvals/adviser-queue',
    );
    return unwrap(response, 'Failed to load your approvals queue');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load your approvals queue'),
    };
  }
}

export async function adviserDecide(
  id: string,
  decision: Decision,
  comment?: string,
): Promise<ApiResponse<Registration | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<Registration>>(
      `/approvals/${id}/adviser-decision`,
      { decision, comment },
    );
    return unwrap(response, 'Failed to record your decision');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to record your decision'),
    };
  }
}

export async function getHodQueue(): Promise<ApiResponse<Registration[] | null>> {
  try {
    const response = await serverApi.get<ApiEnvelope<Registration[]>>(
      '/approvals/hod-queue',
    );
    return unwrap(response, 'Failed to load your approvals queue');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load your approvals queue'),
    };
  }
}

export async function hodDecide(
  id: string,
  decision: Decision,
  comment?: string,
): Promise<ApiResponse<Registration | null>> {
  try {
    const response = await serverApi.post<ApiEnvelope<Registration>>(
      `/approvals/${id}/hod-decision`,
      { decision, comment },
    );
    return unwrap(response, 'Failed to record your decision');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to record your decision'),
    };
  }
}

// The adviser's own advisees ("students needing attention" per PLAN.md's
// actor table). There is no backend endpoint for this at all — not even a
// filter on GET /users (see backend/src/modules/users/dto/list-users-query.dto.ts:
// role/departmentId/isActive/search only, nothing keyed on adviserId), so
// this is derived: list every student (GET /users?role=student, needs
// users:read — granted to academic_adviser this milestone, see PROGRESS.md
// Decisions), then read each one's detail (GET /users/:id, also
// users:read-gated) to find studentProfile.adviserId === the caller. For the
// seed's ~30 students this is a acceptable number of extra requests for a
// once-per-page-load read; it would not scale to a large student body without
// a real "my advisees" endpoint (documented as a known gap, not fixed here —
// see PROGRESS.md's Known issues).
//
// "Needing attention" itself is also simplified from PLAN.md's fuller
// definition (not submitted, rejected, or pending > N days): the adviser can
// only ever see registrations in their own adviser-queue (pending_adviser),
// never an advisee's rejected/approved/draft status for someone not
// currently in that queue (no endpoint exposes another student's
// registration to their adviser outside the queue). So this only flags
// "pending your decision right now" from the adviser-queue; the other two
// categories are left undetectable and are not claimed.
export interface AdviseeSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  matricNo: string;
  department?: { id: string; code: string; name: string };
  level: number;
  pendingYourDecision: boolean;
  pendingRegistrationId?: string;
}

export async function getAdvisees(
  adviserId: string,
): Promise<ApiResponse<AdviseeSummary[] | null>> {
  try {
    const listResponse = await serverApi.get<ApiEnvelope<UserDetail[]>>(
      '/users?role=student&pageSize=200',
    );
    const listBody = listResponse.data;
    if (!listBody.success) {
      const message = Array.isArray(listBody.message)
        ? listBody.message[0]
        : listBody.message;
      return { data: null, message: message || 'Failed to load your advisees' };
    }
    const students = listBody.data;
    const details = await Promise.all(
      students.map((s) =>
        serverApi.get<ApiEnvelope<UserDetail>>(`/users/${s.id}`),
      ),
    );
    const mine = details
      .map((r) => r.data)
      .filter((b): b is Extract<typeof b, { success: true }> => b.success)
      .map((b) => b.data)
      .filter((u) => u.studentProfile?.adviserId === adviserId);

    const queueResponse = await serverApi.get<ApiEnvelope<Registration[]>>(
      '/approvals/adviser-queue',
    );
    const queueBody = queueResponse.data;
    const pendingByStudentId = new Map(
      queueBody.success ? queueBody.data.map((r) => [r.studentId, r.id]) : [],
    );

    const advisees: AdviseeSummary[] = mine.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      matricNo: u.studentProfile?.matricNo ?? '-',
      department: u.studentProfile?.department,
      level: u.studentProfile?.level ?? 0,
      pendingYourDecision: pendingByStudentId.has(u.id),
      pendingRegistrationId: pendingByStudentId.get(u.id),
    }));
    return { data: advisees };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      data: null,
      message: handleAPIErrors(error, 'Failed to load your advisees'),
    };
  }
}
