import React from "react";
import DOMPurify from "dompurify";
import {
  BadgeCheck,
  Clock3,
  FileText,
  Info,
  ListChecks,
  Target,
  X,
  ExternalLink,
  Sparkles,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function ScoreGauge({ label, value, icon: Icon }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (value / 100) * circumference;
  // Adapted to lime theme with appropriate levels
  let strokeColor, textColorClass, glowColor;
  if (value >= 85) {
    strokeColor = "#84cc16"; // lime-500
    textColorClass = "text-lime-400";
    glowColor = "rgba(132, 204, 22, 0.25)";
  } else if (value >= 70) {
    strokeColor = "#a3e635"; // lime-400
    textColorClass = "text-lime-300";
    glowColor = "rgba(163, 230, 53, 0.2)";
  } else if (value >= 55) {
    strokeColor = "#eab308"; // amber-500 for medium
    textColorClass = "text-amber-400";
    glowColor = "rgba(234, 179, 8, 0.15)";
  } else {
    strokeColor = "#64748b"; // slate-500
    textColorClass = "text-slate-500";
    glowColor = "rgba(100, 116, 139, 0.1)";
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative"
        style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
      >
        <svg width="88" height="88" className="-rotate-90">
          <circle
            cx="44"
            cy="44"
            r="36"
            stroke="var(--border-strong)"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="44"
            cy="44"
            r="36"
            stroke={strokeColor}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-lg font-bold ${textColorClass}`}>
            {Math.round(value)}%
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
        <Icon className="h-3 w-3" />
        {label}
      </div>
    </div>
  );
}

export default function OpportunityDrawer({ item, onClose }) {
  if (!item) return null;
  const title = item.extracted.title || item.subject || "Untitled opportunity";
  const org = item.extracted.organization || item.sender || "Unknown source";

  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <button
        className="h-full flex-1 bg-black/40 backdrop-blur-sm transition-opacity cursor-default"
        onClick={onClose}
        aria-label="Close drawer"
      />

      {/* Drawer panel */}
      <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-[var(--border-color)] bg-[var(--surface-0)] p-6 shadow-xl custom-scrollbar">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="animate-fade-in min-w-0 flex-1">
            <div className="mb-2">
              <Badge className="text-[10px] uppercase tracking-widest bg-[var(--surface-2)] text-[var(--text-primary)] border-[var(--border-color)]">
                {item.extracted.opportunity_type || "opportunity"}
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-tight break-words">
              {title}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)] break-words">{org}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Score Gauges */}
        <div
          className="mb-8 flex flex-wrap items-center justify-around gap-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-color)] p-6 animate-fade-in delay-150"
          style={{ animationFillMode: "backwards" }}
        >
          <ScoreGauge label="Total" value={item.score.total} icon={Target} />
          <ScoreGauge label="Fit" value={item.score.fit} icon={BadgeCheck} />
          <ScoreGauge
            label="Urgency"
            value={item.score.urgency}
            icon={Clock3}
          />
        </div>

        <div className="space-y-5">
          {/* Why This Is an Opportunity — AI Fit Reasons */}
          {item.extracted.fit_reasons?.length > 0 && (
            <div
              className="rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--surface-1)] to-[var(--accent-glow)]/20 p-5 animate-fade-in delay-200"
              style={{ animationFillMode: "backwards" }}
            >
              <div className="mb-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[var(--accent)] font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                Why This Is an Opportunity
              </div>
              <ul className="space-y-2.5">
                {item.extracted.fit_reasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-primary)]">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-glow)] text-[10px] font-bold text-[var(--accent)]">
                      {i + 1}
                    </div>
                    <span className="leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          {item.extracted.summary && (
            <div
              className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border-color)] p-5 animate-fade-in delay-200"
              style={{ animationFillMode: "backwards" }}
            >
              <div className="mb-2 flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[var(--accent)] font-bold">
                <FileText className="h-3.5 w-3.5" />
                Summary
              </div>
              <div
                className="text-sm leading-relaxed text-[var(--text-secondary)] break-words"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(item.extracted.summary),
                }}
              />
            </div>
          )}

          {/* Action checklist */}
          {(item.action_checklist || []).length > 0 && (
            <div
              className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border-color)] p-5 animate-fade-in delay-300"
              style={{ animationFillMode: "backwards" }}
            >
              <div className="mb-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[var(--accent)] font-bold">
                <ListChecks className="h-3.5 w-3.5" />
                Recommended Actions
              </div>
              <ul className="space-y-2.5">
                {(item.action_checklist || []).slice(0, 8).map((action, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-[var(--text-primary)]"
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-glow)] text-[10px] font-bold text-[var(--accent)]">
                      {i + 1}
                    </div>
                    <span className="leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Extracted details */}
          {item.extracted &&
            (item.extracted.deadline_text ||
              item.extracted.eligibility?.length > 0 ||
              item.extracted.benefits?.length > 0) && (
              <div
                className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border-color)] p-5 animate-fade-in delay-400"
                style={{ animationFillMode: "backwards" }}
              >
                <div className="mb-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-bold">
                  <Info className="h-3.5 w-3.5" />
                  Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {item.extracted.deadline_text && (
                    <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] p-3">
                      <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1 font-bold">
                        <Calendar className="h-3 w-3" /> Deadline
                      </div>
                      <div className="text-[var(--text-primary)] font-medium break-words">
                        {item.extracted.deadline_text}
                      </div>
                    </div>
                  )}
                  {item.extracted.location && (
                    <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] p-3">
                      <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1 font-bold">
                        <MapPin className="h-3 w-3" /> Location
                      </div>
                      <div className="text-[var(--text-primary)] font-medium break-words">
                        {item.extracted.location}
                      </div>
                    </div>
                  )}
                  {item.extracted.eligibility?.length > 0 && (
                    <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] p-3 sm:col-span-2">
                      <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1 font-bold">
                        Eligibility
                      </div>
                      <div className="text-[var(--text-secondary)] break-words">
                        {item.extracted.eligibility.join(", ")}
                      </div>
                    </div>
                  )}
                  {item.extracted.benefits?.length > 0 && (
                    <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] p-3 sm:col-span-2">
                      <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1 font-bold">
                        Benefits
                      </div>
                      <div className="text-[var(--text-secondary)] break-words">
                        {item.extracted.benefits.join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Links */}
          {item.extracted.links?.length > 0 && (
            <div
              className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border-color)] p-5 animate-fade-in delay-500"
              style={{ animationFillMode: "backwards" }}
            >
              <div className="mb-3 text-[9px] uppercase tracking-[0.2em] text-[var(--accent)] font-bold">
                Useful Links
              </div>
              <ul className="space-y-2">
                {item.extracted.links.slice(0, 6).map((link, i) => (
                  <li key={i}>
                    <a
                      className="flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors break-all"
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
