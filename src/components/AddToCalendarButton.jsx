import React, { useState, useRef, useEffect } from "react";
import { CalendarPlus, CalendarCheck, Download, ChevronDown } from "lucide-react";
import {
  hasCalendarData,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  downloadIcsFile,
} from "@/lib/calendar";

/**
 * A polished dropdown button that lets users add opportunity deadlines
 * to Google Calendar, Outlook, or download as .ics file.
 *
 * @param {{ opportunity: object, compact?: boolean }} props
 */
export default function AddToCalendarButton({ opportunity, compact = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  if (!hasCalendarData(opportunity)) return null;

  const googleUrl = getGoogleCalendarUrl(opportunity);
  const outlookUrl = getOutlookCalendarUrl(opportunity);

  const menuItems = [
    {
      label: "Google Calendar",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 3v6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M15 3v6" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="15" r="2" fill="currentColor" />
        </svg>
      ),
      href: googleUrl,
    },
    {
      label: "Outlook Calendar",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 3v6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M15 3v6" stroke="currentColor" strokeWidth="1.5" />
          <rect x="7" y="13" width="4" height="3" rx="0.5" fill="currentColor" />
        </svg>
      ),
      href: outlookUrl,
    },
    {
      label: "Download .ics",
      icon: <Download className="h-4 w-4" />,
      onClick: () => {
        downloadIcsFile(opportunity);
        setOpen(false);
      },
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={`
          inline-flex items-center gap-1.5 rounded-lg font-bold uppercase tracking-wider transition-all duration-200
          ${
            compact
              ? "text-[9px] px-2 py-1 text-[var(--accent)] hover:text-[var(--accent-hover)] hover:bg-[var(--accent-glow)]"
              : "text-[10px] px-3 py-1.5 bg-[var(--accent-glow)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] border border-[var(--accent)]/30 hover:border-[var(--accent)]"
          }
        `}
        title="Add deadline to calendar"
      >
        <CalendarPlus className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        {compact ? "Add" : "Add to Calendar"}
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 w-52 origin-top-right animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150
            rounded-xl border border-[var(--border-color)] bg-[var(--surface-1)] p-1.5 shadow-xl backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Add to Calendar
          </div>
          {menuItems.map((item) =>
            item.href ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
              >
                <span className="text-[var(--accent)]">{item.icon}</span>
                {item.label}
              </a>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
              >
                <span className="text-[var(--accent)]">{item.icon}</span>
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
