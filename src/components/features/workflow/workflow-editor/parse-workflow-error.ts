import { HTTPError } from 'ky';

interface ValidationDetailItem {
  msg?: unknown;
  loc?: unknown;
}

const formatValidationDetails = (details: unknown[]): string =>
  details
    .map((item) => {
      if (typeof item !== 'object' || item === null) return null;
      const { msg, loc } = item as ValidationDetailItem;
      if (typeof msg !== 'string') return null;
      const path =
        Array.isArray(loc) && loc.length > 0 ? loc.filter((p) => p !== 'body').join('.') : '';
      return path ? `${path}: ${msg}` : msg;
    })
    .filter((s): s is string => Boolean(s))
    .join('\n');

export const parseWorkflowError = async (error: unknown, fallback: string): Promise<string> => {
  if (!(error instanceof HTTPError)) return error instanceof Error ? error.message : fallback;

  try {
    const body = (await error.response.clone().json()) as { detail?: unknown };
    if (Array.isArray(body.detail)) {
      const formatted = formatValidationDetails(body.detail);
      if (formatted) return formatted;
    }
    if (typeof body.detail === 'string' && body.detail) return body.detail;
  } catch {
    // fall through
  }

  return error.message || fallback;
};
