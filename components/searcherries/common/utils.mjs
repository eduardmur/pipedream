import constants from "./constants.mjs";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const TOKEN_HINT = `Create a new personal access token on ${constants.TOKENS_URL} (tab "Other clients") and reconnect the Searcherries account.`;

const ERROR_HINTS = {
  unauthenticated: () =>
    `The personal access token is missing, expired or revoked. ${TOKEN_HINT}`,
  insufficient_scope: () =>
    `The token cannot read the API. ${TOKEN_HINT}`,
  paid_plan_required: (envelope) =>
    `The Searcherries account needs a paid plan (Starter or Pro). Choose a plan at ${envelope.plans_url ?? constants.PLANS_URL}.`,
  not_found: () =>
    "The project does not exist or belongs to another account. Use List Projects to find valid project IDs.",
  validation_failed: (envelope) =>
    Object.entries(envelope.errors ?? {})
      .map(([
        field,
        messages,
      ]) => `${field}: ${[].concat(messages).join(" ")}`)
      .join(" "),
  rate_limited: (envelope, response) => {
    const retryAfter = envelope.retry_after ?? response?.headers?.["retry-after"];
    return retryAfter
      ? `Retry after ${retryAfter} seconds.`
      : "Wait a minute before retrying.";
  },
};

/**
 * Builds a readable message from the Searcherries error envelope
 * `{ "error": { "code", "message", "status", ... } }`.
 * Returns `null` when the response is not a Searcherries envelope.
 */
export function describeApiError(error) {
  const response = error?.response;
  const envelope = response?.data?.error;
  if (!envelope || typeof envelope !== "object" || !envelope.code) {
    return null;
  }
  const status = envelope.status ?? response.status;
  const parts = [
    `Searcherries API error ${status} (${envelope.code}): ${envelope.message ?? "The request failed."}`,
  ];
  const hint = ERROR_HINTS[envelope.code]?.(envelope, response);
  if (hint) {
    parts.push(hint);
  }
  return parts.join(" ");
}

export function isIsoDate(value) {
  return ISO_DATE_PATTERN.test(String(value ?? ""));
}

/**
 * Converts an optional numeric prop (string or number) to a number.
 * Returns `undefined` for empty values and `NaN` for values that are not numeric.
 */
export function toNumber(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return Number(value);
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1
    ? singular
    : plural;
}

export function describePage(pagination, noun) {
  if (!pagination) {
    return "";
  }
  const returned = pagination.returned ?? 0;
  const total = pagination.total ?? returned;
  const base = `${returned} of ${total} ${pluralize(total, noun)}`;
  return pagination.has_more
    ? `${base} (more pages available)`
    : base;
}
