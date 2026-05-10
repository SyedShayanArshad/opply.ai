/**
 * Calendar Integration Utility
 * Generates calendar event links for Google Calendar
 * from opportunity deadline data.
 */

/**
 * Parse a deadline from either an ISO string or a human-readable deadline_text.
 * Returns a Date object or null if unparsable.
 */
function parseDeadline(deadlineIso, deadlineText) {
  // Try ISO first
  if (deadlineIso) {
    const d = new Date(deadlineIso);
    if (!isNaN(d.getTime())) return d;
  }

  // Try parsing the human-readable deadline text as a fallback
  if (deadlineText) {
    const d = new Date(deadlineText);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

/**
 * Format a Date into the compact YYYYMMDD format used by Google Calendar.
 * We use an all-day event format since deadlines are typically date-only.
 */
function toGoogleDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * Extract opportunity metadata from either a RankedOpportunity (dashboard drawer)
 * or an EmailRecord (archive page). Handles both data shapes gracefully.
 */
function extractEventData(opportunity) {
  // Handle RankedOpportunity (has .extracted sub-object)
  const ext = opportunity.extracted || {};

  const title =
    opportunity.opportunity_title ||
    ext.title ||
    opportunity.subject ||
    "Opportunity Deadline";

  const organization =
    opportunity.organization ||
    ext.organization ||
    opportunity.sender ||
    "";

  const summary =
    opportunity.summary ||
    ext.summary ||
    opportunity.explanation ||
    "";

  const location =
    opportunity.location ||
    ext.location ||
    "";

  const deadlineIso =
    opportunity.deadline_iso ||
    ext.deadline_iso ||
    null;

  const deadlineText =
    opportunity.deadline_text ||
    ext.deadline_text ||
    null;

  const links = opportunity.links || ext.links || [];

  return { title, organization, summary, location, deadlineIso, deadlineText, links };
}

/**
 * Build a rich description body for the calendar event.
 */
function buildDescription(data) {
  const parts = [];
  if (data.organization) parts.push(`Organization: ${data.organization}`);
  if (data.summary) parts.push(`\nSummary:\n${data.summary}`);
  if (data.links.length > 0) {
    parts.push(`\nLinks:\n${data.links.slice(0, 3).join("\n")}`);
  }
  parts.push("\n— Added via Opply AI");
  return parts.join("\n");
}

/**
 * Check if any calendar link can be generated for this opportunity.
 */
export function hasCalendarData(opportunity) {
  if (!opportunity) return false;
  const data = extractEventData(opportunity);
  return parseDeadline(data.deadlineIso, data.deadlineText) !== null;
}

/**
 * Generate a Google Calendar event URL.
 * Returns empty string if deadline cannot be parsed.
 */
export function getGoogleCalendarUrl(opportunity) {
  if (!opportunity) return "";
  const data = extractEventData(opportunity);
  const date = parseDeadline(data.deadlineIso, data.deadlineText);
  if (!date) return "";

  const dateStr = toGoogleDateStr(date);

  // For all-day events, end date must be the next day
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const endDateStr = toGoogleDateStr(nextDay);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `📌 ${data.title}`,
    dates: `${dateStr}/${endDateStr}`,
    details: buildDescription(data),
    location: data.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
