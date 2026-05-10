export function getGoogleCalendarUrl(opportunity) {
  if (!opportunity) return "";

  // Support both DBEmailRecord (from archive) and RankedOpportunity (from dashboard) formats
  const title = opportunity.opportunity_title || opportunity.extracted?.title || opportunity.subject || "Opportunity Deadline";
  const organization = opportunity.organization || opportunity.extracted?.organization || opportunity.sender || "";
  const details = opportunity.summary || opportunity.extracted?.summary || "";
  const location = opportunity.location || opportunity.extracted?.location || "";
  const deadlineIso = opportunity.deadline_iso || opportunity.extracted?.deadline_iso;

  if (!deadlineIso) return "";

  try {
    // Format: YYYYMMDDTHHMMSSZ
    const date = new Date(deadlineIso);
    if (isNaN(date.getTime())) return "";
    
    const formattedDate = date.toISOString().replace(/-|:|\.\d+/g, "");
    
    const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const params = new URLSearchParams({
      text: `[Opply] ${title} - ${organization}`,
      dates: `${formattedDate}/${formattedDate}`,
      details: `${details}\n\nOrganization: ${organization}`,
      location: location,
    });

    return `${baseUrl}&${params.toString()}`;
  } catch (e) {
    console.error("Error generating calendar URL:", e);
    return "";
  }
}
