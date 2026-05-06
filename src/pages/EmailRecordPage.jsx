import React, { useMemo, useState } from 'react'
import { FileText, Info, ListChecks, Search, Zap, ExternalLink, Filter, ChevronDown, ChevronUp, Trash2, AlertTriangle, Mail, Clipboard, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function timeAgo(isoString) {
  if (!isoString) return null
  try {
    const diff = Date.now() - new Date(isoString).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  } catch { return null }
}

function scoreColor(s) {
  if (s >= 85) return 'text-success'
  if (s >= 70) return 'text-info'
  if (s >= 55) return 'text-warning'
  return 'text-[var(--text-muted)]'
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
              <Badge variant="secondary" className="bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border-color)] hover:bg-[var(--surface-0)]">Filtered</Badge>
              {record.source && <Badge variant="outline" className="text-[9px] border-[var(--border-color)] text-[var(--text-muted)]">{record.source === 'gmail' ? <><Mail className="mr-1 h-2.5 w-2.5" />Gmail</> : <><Clipboard className="mr-1 h-2.5 w-2.5" />Manual</>}</Badge>}
              {ago && <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 font-bold tracking-wider uppercase"><Clock className="h-2.5 w-2.5" />{ago}</span>}
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

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--surface-2)] to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] opacity-50" />
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[var(--accent-glow)] opacity-0 blur-3xl group-hover:opacity-20 transition-all duration-500" />
      
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent)] hover:opacity-90 border-[var(--accent)]"><Zap className="mr-1 h-3 w-3" />Opportunity</Badge>
            {record.score != null && <Badge variant="outline" className={`border-[var(--border-color)] ${scoreColor(record.score)} font-bold`}>{Math.round(record.score)}% Match</Badge>}
            {record.source && <Badge variant="outline" className="text-[9px] border-[var(--border-color)] text-[var(--text-muted)]">{record.source === 'gmail' ? <><Mail className="mr-1 h-2.5 w-2.5" />Gmail</> : <><Clipboard className="mr-1 h-2.5 w-2.5" />Manual</>}</Badge>}
            {ago && <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 font-bold tracking-wider uppercase"><Clock className="h-2.5 w-2.5" />{ago}</span>}
          </div>
          <h3 className="mt-3 text-[17px] font-bold text-[var(--text-primary)] transition-colors">{record.subject || 'Email'}</h3>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)] flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] inline-block"></span>{record.sender || 'Unknown'}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {onDelete && <button onClick={() => onDelete(record.email_id)} className="rounded-lg p-2 bg-[var(--surface-1)] border border-transparent text-[var(--text-muted)] hover:text-danger hover:border-danger/30 hover:bg-danger-light transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>}
          <button onClick={() => setExpanded(!expanded)} className={`rounded-lg p-2 border transition-all ${expanded ? 'bg-[var(--surface-2)] text-[var(--text-primary)] border-[var(--border-color)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'}`}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="relative mt-5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] p-4">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]"><Info className="h-3 w-3" />Why it matters</div>
        <p className="text-[14px] text-[var(--text-primary)] leading-relaxed">{record.explanation}</p>
      </div>
      {expanded && (
        <div className="relative mt-5 space-y-5 animate-in slide-in-from-top-2 fade-in duration-200">
          {record.summary && (
            <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] p-5">
              <div className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]"><FileText className="h-3.5 w-3.5" />Executive Summary</div>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">{record.summary}</p>
            </div>
          )}
          {record.detailed_actions?.length > 0 && (
            <div className="rounded-xl bg-[var(--surface-1)] border border-[var(--border-color)] p-5 shadow-inner">
              <div className="mb-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-success"><ListChecks className="h-3.5 w-3.5" />Action Plan</div>
              <ul className="space-y-3">
                {record.detailed_actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] text-[var(--text-primary)]">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] border border-[var(--border-color)] text-[10px] font-bold text-success">{i + 1}</div>
                    <span className="leading-relaxed">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {record.links?.length > 0 && (
            <div className="rounded-xl bg-info-light border border-info/20 p-5">
              <div className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-info"><ExternalLink className="h-3.5 w-3.5" />Important Links</div>
              <ul className="space-y-2.5">
                {record.links.slice(0, 6).map((l, i) => (
                  <li key={i}>
                    <a className="flex items-center gap-2 text-[14px] text-info hover:underline break-all transition-colors" href={l} target="_blank" rel="noreferrer">
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

  const imp = filtered.filter(r => r.classification === 'important')
  const unimp = filtered.filter(r => r.classification === 'not important')

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