import React, { useMemo, useState } from 'react'
import { FileText, Info, ListChecks, Search, Zap, ExternalLink, Filter, Trash2, AlertTriangle, Mail, Clipboard, Clock, Sparkles, MapPin, Calendar, Target, BadgeCheck, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AddToCalendarButton from '@/components/AddToCalendarButton'

function timeAgo(isoString) {
  if (!isoString) return null
  try {
    // Ensure UTC interpretation — append Z if no timezone info present
    const normalized = /[Z+\-]\d*$/.test(isoString.trim()) ? isoString : isoString + 'Z'
    const date = new Date(normalized)
    if (isNaN(date.getTime())) return null
    const diff = Date.now() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return { relative: 'just now', absolute: date.toLocaleString() }
    if (mins < 60) return { relative: `${mins}m ago`, absolute: date.toLocaleString() }
    const hours = Math.floor(mins / 60)
    if (hours < 24) return { relative: `${hours}h ago`, absolute: date.toLocaleString() }
    // Older than 24h — show full date like "May 5, 2:30 PM"
    const formatted = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
      ', ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    return { relative: formatted, absolute: date.toLocaleString() }
  } catch { return null }
}

function scoreColor(s) {
  if (s >= 85) return 'text-success'
  if (s >= 70) return 'text-info'
  if (s >= 55) return 'text-warning'
  return 'text-[var(--text-muted)]'
}

function scoreBarClass(s) {
  if (s >= 85) return 'bg-success'
  if (s >= 70) return 'bg-info'
  if (s >= 55) return 'bg-warning'
  return 'bg-[var(--border-strong)]'
}

function MiniScoreBar({ label, value, icon: Icon }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1">
          {Icon && <Icon className="h-2.5 w-2.5" />}{label}
        </span>
        <span className={`text-[10px] font-bold ${scoreColor(value)}`}>{Math.round(value)}%</span>
      </div>
      <div className="h-1 rounded-full bg-[var(--surface-0)] overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${scoreBarClass(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function EmailRecordCard({ record, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const isImportant = record.classification === 'important'
  const ago = timeAgo(record.created_at)

  if (!isImportant) {
    return (
      <div className="group rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="secondary" className="bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border-color)] p-1"><Filter className="h-3 w-3" /></Badge>
              {record.source && (
                <Badge variant="outline" className="p-1 border-[var(--border-color)] text-[var(--text-muted)]" title={record.source === 'gmail' ? 'Gmail' : 'Manual'}>
                  {record.source === 'gmail' ? <Mail className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}
                </Badge>
              )}
              {ago && <span title={ago.absolute} className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 font-bold tracking-wider uppercase cursor-default"><Clock className="h-2.5 w-2.5" />{ago.relative}</span>}
            </div>
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)] truncate">{record.subject || 'Email'}</h3>
            <p className="mt-1 text-xs text-[var(--text-muted)] truncate flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] inline-block"></span>{record.sender || 'Unknown'}</p>
          </div>
          {onDelete && <button onClick={() => onDelete(record.email_id)} className="rounded-lg p-2 bg-[var(--surface-1)] border border-transparent text-[var(--text-muted)] hover:text-danger hover:border-danger/30 hover:bg-danger-light transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>}
        </div>
        <div className="mt-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] p-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]"><Info className="h-3 w-3" />Reason</div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{record.explanation}</p>
        </div>
      </div>
    )
  }

  // ── Important Opportunity Card (always fully expanded) ──
  const sb = record.score_breakdown || {}
  const fitVal = sb.fit ?? 0
  const urgencyVal = sb.urgency ?? 0
  const completenessVal = sb.completeness ?? 0

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--surface-2)] to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] opacity-50" />
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[var(--accent-glow)] opacity-0 blur-3xl group-hover:opacity-20 transition-all duration-500" />

      {/* ─── Header ─────────────────────────────────────── */}
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent)] border-[var(--accent)] p-1" title="Opportunity"><Zap className="h-3.5 w-3.5" /></Badge>
            {record.opportunity_type && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-[var(--border-color)] text-[var(--text-muted)] bg-[var(--surface-2)] font-bold">
                {record.opportunity_type}
              </Badge>
            )}
            {record.score != null && (
              <Badge variant="outline" className={`border-[var(--border-color)] ${scoreColor(record.score)} font-bold text-[11px]`}>
                {Math.round(record.score)}% match
              </Badge>
            )}
            {record.source && (
              <Badge variant="outline" className="p-1 border-[var(--border-color)] text-[var(--text-muted)]" title={record.source === 'gmail' ? 'Gmail' : 'Manual'}>
                {record.source === 'gmail' ? <Mail className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}
              </Badge>
            )}
            {ago && <span title={ago.absolute} className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 font-bold tracking-wider uppercase cursor-default"><Clock className="h-2.5 w-2.5" />{ago.relative}</span>}
          </div>
          <h3 className="text-[17px] font-bold text-[var(--text-primary)]">
            {record.opportunity_title || record.subject || 'Email'}
          </h3>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] inline-block" />
            {record.organization || record.sender || 'Unknown'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(record.email_id); }} className="relative rounded-lg p-2 bg-[var(--surface-1)] border border-transparent text-[var(--text-muted)] hover:text-danger hover:border-danger/30 hover:bg-danger-light transition-colors" title="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button 
            onClick={() => setExpanded(!expanded)} 
            className={`relative rounded-lg p-2 border transition-all ${expanded ? 'bg-[var(--surface-2)] text-[var(--text-primary)] border-[var(--border-color)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'}`}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-6 space-y-5 animate-in slide-in-from-top-2 duration-300">

      {/* ─── Score Breakdown ──────────────────────────────── */}
      {record.score_breakdown && (
        <div className="relative mb-5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] p-4">
          <div className="mb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-1.5">
            <Target className="h-3 w-3" /> Score Breakdown
          </div>
          <div className="flex gap-4 flex-wrap">
            <MiniScoreBar label="Fit" value={fitVal} icon={BadgeCheck} />
            <MiniScoreBar label="Urgency" value={urgencyVal} />
            <MiniScoreBar label="Completeness" value={completenessVal} />
          </div>
        </div>
      )}

      {/* ─── Why It Matters (explanation) ────────────────── */}
      <div className="relative mb-5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] p-4">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]"><Info className="h-3 w-3" />Why it matters</div>
        <p className="text-[14px] text-[var(--text-primary)] leading-relaxed">{record.explanation}</p>
      </div>

      {/* ─── Why This Is an Opportunity (fit_reasons) ─────── */}
      {record.fit_reasons?.length > 0 && (
        <div className="relative mb-5 rounded-xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--surface-1)] to-[var(--accent-glow)]/10 p-4">
          <div className="mb-3 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
            <Sparkles className="h-3 w-3" /> Why This Is an Opportunity
          </div>
          <ul className="space-y-2">
            {record.fit_reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px] text-[var(--text-primary)]">
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--accent-glow)] text-[9px] font-bold text-[var(--accent)]">{i + 1}</div>
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── Summary ──────────────────────────────────────── */}
      {record.summary && (
        <div className="relative mb-5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]"><FileText className="h-3.5 w-3.5" />Executive Summary</div>
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">{record.summary}</p>
        </div>
      )}

      {/* ─── Deadline + Location ──────────────────────────── */}
      {(record.deadline_text || record.location) && (
        <div className="relative mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {record.deadline_text && (
            <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] p-3 relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-bold">
                  <Calendar className="h-3 w-3" /> Deadline
                </div>
                <AddToCalendarButton opportunity={record} compact />
              </div>
              <div className="text-[13px] font-medium text-[var(--text-primary)]">{record.deadline_text}</div>
            </div>
          )}
          {record.location && (
            <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] p-3">
              <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1 font-bold"><MapPin className="h-3 w-3" /> Location</div>
              <div className="text-[13px] font-medium text-[var(--text-primary)]">{record.location}</div>
            </div>
          )}
        </div>
      )}

      {/* ─── Eligibility ──────────────────────────────────── */}
      {record.eligibility?.length > 0 && (
        <div className="relative mb-5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] p-4">
          <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Eligibility</div>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{record.eligibility.join(' • ')}</p>
        </div>
      )}

      {/* ─── Benefits ─────────────────────────────────────── */}
      {record.benefits?.length > 0 && (
        <div className="relative mb-5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] p-4">
          <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Benefits</div>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{record.benefits.join(' • ')}</p>
        </div>
      )}

      {/* ─── Action Plan ──────────────────────────────────── */}
      {record.detailed_actions?.length > 0 && (
        <div className="relative mb-5 rounded-xl bg-[var(--surface-1)] border border-[var(--border-color)] p-4 shadow-inner">
          <div className="mb-3 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-success"><ListChecks className="h-3.5 w-3.5" />Action Plan</div>
          <ul className="space-y-2.5">
            {record.detailed_actions.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-[13px] text-[var(--text-primary)]">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] border border-[var(--border-color)] text-[10px] font-bold text-success">{i + 1}</div>
                <span className="leading-relaxed">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── Links ────────────────────────────────────────── */}
      {record.links?.length > 0 && (
        <div className="relative rounded-xl bg-info-light border border-info/20 p-4">
          <div className="mb-2.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-info"><ExternalLink className="h-3 w-3" />Important Links</div>
          <ul className="space-y-2">
            {record.links.slice(0, 6).map((l, i) => (
              <li key={i}>
                <a className="flex items-center gap-2 text-[13px] text-info hover:underline break-all transition-colors" href={l} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />{l}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
        </div>
      )}
    </div>
  )
}


export default function EmailRecordPage({ data, onDeleteEmail, onDeleteAllEmails }) {
  const records = data?.email_records || []
  const [search, setSearch] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return records
    const q = search.toLowerCase()
    return records.filter(r => (r.subject || '').toLowerCase().includes(q) || (r.sender || '').toLowerCase().includes(q) || (r.explanation || '').toLowerCase().includes(q))
  }, [records, search])

  const imp = useMemo(() => 
    filtered.filter(r => r.classification === 'important')
           .sort((a, b) => (b.score || 0) - (a.score || 0)),
  [filtered])

  const unimp = useMemo(() => 
    filtered.filter(r => r.classification === 'not important')
           .sort((a, b) => {
             const dateA = new Date(a.created_at || 0)
             const dateB = new Date(b.created_at || 0)
             return dateB - dateA
           }),
  [filtered])

  return (
    <div className="space-y-8 animate-fade-in pb-12 email-archive-container">
      <style>{`
        .email-archive-container input::placeholder {
          color: #9ca3af;
          opacity: 0.7;
        }
        @media (prefers-color-scheme: light) {
          .email-archive-container input::placeholder {
            color: #6b7280;
            opacity: 0.85;
          }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <Mail className="h-8 w-8 text-[var(--accent)]" />
            Email Archive
          </h2>
          <p className="mt-1.5 text-[var(--text-secondary)] font-medium">Search and review all processed communications.</p>
        </div>
        {records.length > 0 && (
          <div>
            {showClearConfirm ? (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-4 fade-in duration-200 bg-danger-light p-1.5 rounded-xl border border-danger/20">
                <span className="text-xs text-danger font-bold uppercase tracking-wider px-2 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />Delete all?</span>
                <Button variant="destructive" size="sm" className="h-8 rounded-lg shadow-sm" onClick={() => { onDeleteAllEmails(); setShowClearConfirm(false) }}>Confirm</Button>
                <Button variant="ghost" size="sm" className="h-8 text-danger hover:bg-danger/10 rounded-lg" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowClearConfirm(true)} className="bg-[var(--surface-1)] border-[var(--border-color)] text-[var(--text-primary)] hover:text-danger hover:border-danger/30 hover:bg-danger-light transition-all rounded-xl h-10 px-4 shadow-sm">
                <Trash2 className="mr-2 h-3.5 w-3.5" />Clear Archive
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
        </div>
        <Input 
          placeholder="Search by subject, sender, or content..." 
          className="pl-12 h-14 bg-[var(--surface-1)] border-[var(--border-color)] focus-visible:ring-[var(--accent)] text-[15px] shadow-sm rounded-2xl transition-all text-[var(--text-primary)]" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
        {search && (
          <div className="absolute inset-y-0 right-0 pr-5 flex items-center">
            <Badge className="bg-[var(--surface-2)] text-[var(--text-primary)] border-[var(--border-color)] rounded-full px-3 py-1 text-xs">{filtered.length} found</Badge>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-0)] p-2 shadow-sm">
        <Tabs defaultValue="important" className="w-full">
          <TabsList className="mb-5 grid w-full max-w-md mx-auto grid-cols-2 bg-[var(--surface-2)] p-1 rounded-xl">
            <TabsTrigger value="important" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-[var(--accent-foreground)] rounded-lg transition-all">
              <Zap className="mr-2 h-4 w-4" />Opportunities <Badge variant="secondary" className="ml-2 bg-[var(--surface-1)] text-[var(--text-primary)] border-[var(--border-color)] rounded-full">{imp.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="not-important" className="data-[state=active]:bg-[var(--surface-1)] data-[state=active]:text-[var(--text-primary)] rounded-lg transition-all">
              <Filter className="mr-2 h-4 w-4" />Filtered <Badge variant="secondary" className="ml-2 bg-[var(--surface-0)] text-[var(--text-primary)] border-[var(--border-color)] rounded-full">{unimp.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <div className="p-2 sm:p-5">
            <TabsContent value="important" className="space-y-5 m-0 animate-in fade-in-50 duration-300">
              {imp.map((r, i) => <EmailRecordCard key={r.email_id || i} record={r} onDelete={onDeleteEmail} />)}
              {!imp.length && (
                <div className="py-24 text-center flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-1)]">
                  <div className="mb-6 inline-flex rounded-2xl bg-[var(--surface-2)] p-5 border border-[var(--border-color)]"><Zap className="h-10 w-10 text-[var(--accent)]" /></div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No opportunities found</h3>
                  <p className="text-[var(--text-secondary)] font-medium max-w-sm">We haven't found any highly relevant opportunities in your recent emails{search ? ' matching that search' : ''}.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="not-important" className="space-y-5 m-0 animate-in fade-in-50 duration-300">
              {unimp.map((r, i) => <EmailRecordCard key={r.email_id || i} record={r} onDelete={onDeleteEmail} />)}
              {!unimp.length && (
                <div className="py-24 text-center flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-1)]">
                  <div className="mb-6 inline-flex rounded-2xl bg-[var(--surface-2)] border border-[var(--border-color)] p-5"><Filter className="h-10 w-10 text-[var(--text-muted)]" /></div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Archive is clean</h3>
                  <p className="text-[var(--text-secondary)] font-medium max-w-sm">There are no filtered emails{search ? ' matching that search' : ' right now'}.</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}