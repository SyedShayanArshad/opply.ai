/**
 * Calendar Integration Utility
 * Generates calendar event links (Google, Outlook) and .ics downloads
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
 * Format a Date into ISO string for Outlook (YYYY-MM-DD).
 */
function toOutlookDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

/**
 * Generate an Outlook Calendar event URL.
 * Returns empty string if deadline cannot be parsed.
 */
export function getOutlookCalendarUrl(opportunity) {
  if (!opportunity) return "";
  const data = extractEventData(opportunity);
  const date = parseDeadline(data.deadlineIso, data.deadlineText);
  if (!date) return "";

  const dateStr = toOutlookDateStr(date);

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    startdt: dateStr,
    enddt: dateStr,
    subject: `📌 ${data.title}`,
    body: buildDescription(data),
    location: data.location,
    allday: "true",
  });

  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}

/**
 * Generate and trigger download of an .ics file.
 * This works with Apple Calendar, Google Calendar desktop, Outlook desktop, etc.
 */
export function downloadIcsFile(opportunity) {
  if (!opportunity) return;
  const data = extractEventData(opportunity);
  const date = parseDeadline(data.deadlineIso, data.deadlineText);
  if (!date) return;

  const dateStr = toGoogleDateStr(date);

  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const endDateStr = toGoogleDateStr(nextDay);

  // Escape special chars for ICS format
  const esc = (str) =>
    (str || "")
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Opply AI//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${dateStr}`,
    `DTEND;VALUE=DATE:${endDateStr}`,
    `SUMMARY:📌 ${esc(data.title)}`,
    `DESCRIPTION:${esc(buildDescription(data))}`,
    `LOCATION:${esc(data.location)}`,
    `STATUS:CONFIRMED`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40)}_deadline.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
