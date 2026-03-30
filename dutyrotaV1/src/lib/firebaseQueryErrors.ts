/**
 * Firestore returns long, developer-oriented messages when a composite index is missing
 * (including a Console URL). Those should be logged for developers, not shown in the app UI.
 */

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "";
}

function errorCode(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const c = (err as { code: unknown }).code;
    return typeof c === "string" ? c : "";
  }
  return "";
}

export function isFirestoreMissingIndexError(err: unknown): boolean {
  const msg = errorMessage(err);
  if (/requires an index/i.test(msg)) return true;
  if (/create a composite index/i.test(msg)) return true;
  const code = errorCode(err);
  if (code === "failed-precondition" && /index/i.test(msg)) return true;
  return false;
}

/**
 * Use in Firestore snapshot/query error callbacks: log index issues to the console only;
 * return null so UI alerts stay empty. Other errors return a string for the UI.
 */
export function userFacingFirestoreSubscriptionError(
  context: string,
  err: unknown
): string | null {
  if (isFirestoreMissingIndexError(err)) {
    console.error(
      `[DutyRota / Firestore] ${context}: this query needs a composite index. Full error (includes link to create the index):`,
      err
    );
    return null;
  }
  const msg = errorMessage(err);
  return msg || "Something went wrong";
}

const GENERIC_ACTION_ERROR = "Something went wrong. Please try again.";

/** For toasts / inline form errors: never show Firebase index URLs; log them instead. */
export function userFacingFirestoreActionError(context: string, err: unknown): string {
  if (isFirestoreMissingIndexError(err)) {
    console.error(`[DutyRota / Firestore] ${context}:`, err);
    return GENERIC_ACTION_ERROR;
  }
  const code = errorCode(err);
  if (code === "permission-denied") {
    return "You do not have permission to create rota schedules.";
  }
  const msg = errorMessage(err);
  return msg || GENERIC_ACTION_ERROR;
}
