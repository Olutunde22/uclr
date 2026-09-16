import { describe, expect, it } from 'vitest';
import { handleAPIErrors } from '@/lib/api-helpers';

describe('handleAPIErrors', () => {
  it('returns the API message when present', () => {
    const error = {
      response: {
        data: {
          success: false,
          statusCode: 401,
          message: 'Invalid credentials',
        },
      },
    };
    expect(handleAPIErrors(error, 'fallback')).toBe('Invalid credentials');
  });

  it('returns the first item of a validation array', () => {
    const error = {
      response: {
        data: {
          success: false,
          statusCode: 400,
          message: ['email must be an email', 'password is required'],
        },
      },
    };
    expect(handleAPIErrors(error, 'fallback')).toBe('email must be an email');
  });

  it('returns network copy when there is no response', () => {
    const error = { code: 'ERR_NETWORK' };
    expect(handleAPIErrors(error, 'fallback')).toBe(
      "Can't reach the server. Check your connection and try again.",
    );
  });

  it('returns timeout copy on ECONNABORTED', () => {
    const error = { code: 'ECONNABORTED' };
    expect(handleAPIErrors(error, 'fallback')).toBe(
      'This is taking longer than expected. Please try again.',
    );
  });

  it('falls back when the response carries no message', () => {
    const error = { response: { data: { success: false, statusCode: 500 } } };
    expect(handleAPIErrors(error, 'fallback')).toBe('fallback');
  });

  it('treats a response-less error as a network error', () => {
    expect(handleAPIErrors(new Error('boom'), 'fallback')).toBe(
      "Can't reach the server. Check your connection and try again.",
    );
  });
});
