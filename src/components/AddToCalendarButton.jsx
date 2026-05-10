import React from "react";
import { CalendarPlus } from "lucide-react";
import { hasCalendarData, getGoogleCalendarUrl } from "@/lib/calendar";

/**
 * A polished button that lets users add opportunity deadlines
 * to Google Calendar.
 *
 * @param {{ opportunity: object, compact?: boolean }} props
 */
export default function AddToCalendarButton({ opportunity, compact = false }) {
  if (!hasCalendarData(opportunity)) return null;

  const googleUrl = getGoogleCalendarUrl(opportunity);
  if (!googleUrl) return null;

  return (
    <a
      href={googleUrl}
      target="_blank"
      rel="noreferrer"
      className={`
        inline-flex items-center gap-1.5 rounded-lg font-bold uppercase tracking-wider transition-all duration-200
        ${
          compact
            ? "text-[9px] px-2 py-1 text-[var(--accent)] hover:text-[var(--accent-hover)] hover:bg-[var(--accent-glow)]"
            : "text-[10px] px-3 py-1.5 bg-[var(--accent-glow)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] border border-[var(--accent)]/30 hover:border-[var(--accent)]"
        }
      `}
      title="Add deadline to Google Calendar"
    >
      <CalendarPlus className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {compact ? "Add" : "Add to Calendar"}
    </a>
  );
}
