import React, { useState, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { BrainCircuit, Gem, Inbox, Loader2, Search, Sparkles, X, Zap, ArrowUpRight, Send, FileText, Activity, MailPlus, RefreshCw, CheckCircle2, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

function scoreColor(s) {
  if (s >= 85) return 'text-success'
  if (s >= 70) return 'text-info'
  if (s >= 55) return 'text-warning'
  return 'text-[var(--text-muted)]'
}

function scoreBarClass(s) {
  if (s >= 85) return 'bg-success shadow-sm'
  if (s >= 70) return 'bg-info shadow-sm'
  if (s >= 55) return 'bg-warning shadow-sm'
  return 'bg-[var(--border-strong)]'
}

function scoreBgHover(s) {
  if (s >= 85) return 'hover:border-success/30 hover:shadow-success/5'
  if (s >= 70) return 'hover:border-info/30 hover:shadow-info/5'
  if (s >= 55) return 'hover:border-warning/30 hover:shadow-warning/5'
  return 'hover:border-[var(--border-strong)] hover:shadow-sm'
}

const metricConfigs = [
  { key: 'total_emails', label: 'Emails Processed', icon: Inbox, iconColor: 'text-[var(--accent)]', trend: '+12% this week', trendUp: true },
  { key: 'important', label: 'Opportunities Found', icon: Gem, iconColor: 'text-success', trend: '+5% this week', trendUp: true },
  { key: 'urgent', label: 'Urgent Actions', icon: Zap, iconColor: 'text-danger', trend: 'Needs attention', trendUp: false, isCustom: true },
  { key: 'auto_sync', label: 'Sync Status', icon: RefreshCw, iconColor: 'text-info', isStatus: true },
]

function MetricCard({ config, value, index }) {
  const Icon = config.icon
  return (
    <div 
      className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-fade-in"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-xl bg-[var(--surface-2)] p-2.5 border border-[var(--border-color)]">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        {config.trend && (
          <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${config.trendUp ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
            {config.trend}
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">{value}</div>
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1.5">{config.label}</div>
      </div>
    </div>
  )
}

function OpportunityRow({ item, index, onOpen }) {
  const title = item.extracted.title || item.subject || 'Untitled opportunity'
  const org = item.extracted.organization || item.sender || 'Unknown source'
  const totalScore = Math.round(item.score.total)
  
  return (
    <button 
      type="button" 
      onClick={() => onOpen(item)} 
      className={`group w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-1)] p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${scoreBgHover(totalScore)} relative overflow-hidden`}
    >
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-[var(--border-color)] text-[var(--text-muted)] bg-[var(--surface-2)] font-bold">#{index + 1}</Badge>
            <Badge className="text-[10px] uppercase tracking-widest bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-0)] border-[var(--border-color)] font-bold">
              {item.extracted.opportunity_type || 'opportunity'}
            </Badge>
            {item.score.urgency > 80 && (
              <Badge className="text-[10px] uppercase tracking-widest bg-danger-light text-danger hover:bg-danger/20 border-none flex items-center gap-1 font-bold">
                <Zap className="h-3 w-3" /> Urgent
              </Badge>
            )}
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] truncate transition-colors">{title}</h3>
          <p className="text-sm text-[var(--text-secondary)] truncate mt-1.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] inline-block"></span>
            {org}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={`text-3xl font-bold tracking-tighter ${scoreColor(totalScore)}`}>
            {totalScore}<span className="text-lg opacity-50">%</span>
          </div>
          <div className="flex items-center text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            View Details <ArrowUpRight className="ml-0.5 h-3 w-3" />
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3 relative z-10 pt-4 border-t border-[var(--border-color)]">
        {[
          { label: 'Fit', value: item.score.fit },
          { label: 'Urgency', value: item.score.urgency },
          { label: 'Completeness', value: item.score.completeness }
        ].map((s) => (
          <div key={s.label}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">{s.label}</span>
              <span className={`text-[11px] font-bold ${scoreColor(s.value)}`}>{Math.round(s.value)}%</span>
            </div>
            <Progress value={s.value} className="h-1.5 bg-[var(--surface-2)]" indicatorClassName={scoreBarClass(s.value)} />
          </div>
        ))}
      </div>
    </button>
  )
}

function SingleEmailForm({ onAnalyze, busy, setOpen }) {
  const [subject, setSubject] = useState('')
  const [sender, setSender] = useState('')
  const [body, setBody] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!body.trim()) return
    onAnalyze({ subject: subject.trim() || null, sender: sender.trim() || null, body: body.trim() })
    setOpen(false)
    setSubject('')
    setSender('')
    setBody('')
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-[var(--text-primary)] font-medium">Subject</Label>
          <Input 
            placeholder="e.g. Summer Internship" 
            value={subject} 
            onChange={e => setSubject(e.target.value)} 
            className="bg-[var(--surface-2)] border-[var(--border-color)] focus-visible:ring-[var(--accent)] rounded-lg" 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[var(--text-primary)] font-medium">From</Label>
          <Input 
            placeholder="e.g. careers@google.com" 
            value={sender} 
            onChange={e => setSender(e.target.value)} 
            className="bg-[var(--surface-2)] border-[var(--border-color)] focus-visible:ring-[var(--accent)] rounded-lg" 
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-[var(--text-primary)] font-medium">Email Body <span className="text-danger">*</span></Label>
        <Textarea 
          placeholder="Paste the full email content here..." 
          value={body} 
          onChange={e => setBody(e.target.value)} 
          className="h-32 font-mono text-xs bg-[var(--surface-2)] border-[var(--border-color)] focus-visible:ring-[var(--accent)] rounded-lg" 
        />
      </div>
      <Button 
        type="submit" 
        disabled={busy || !body.trim()} 
        className="w-full btn-accent rounded-xl h-11 shadow-md"
      >
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
        Analyze Opportunity
      </Button>
    </form>
  )
}

export default function DashboardPage({ data, busy, emailsText, setEmailsText, onManualAnalyze, onSingleAnalyze, onOpenOpportunity, hasProfile, lastSynced }) {
  const parentRef = React.useRef(null)
  const [filterMode, setFilterMode] = useState('all') // 'all', 'high_fit', 'urgent'
  const [searchQuery, setSearchQuery] = useState('')
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)

  const rankedData = data?.ranked || []
  
  const filteredData = useMemo(() => {
    let list = [...rankedData]
    
    // Mode Filter
    if (filterMode === 'high_fit') {
      list = list.filter(item => item.score.total >= 80)
    } else if (filterMode === 'urgent') {
      list = list.filter(item => item.score.urgency >= 80)
    }
    
    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(item => {
        const title = (item.extracted.title || item.subject || '').toLowerCase()
        const org = (item.extracted.organization || item.sender || '').toLowerCase()
        return title.includes(q) || org.includes(q)
      })
    }
    
    return list
  }, [rankedData, filterMode, searchQuery])

  const rowVirtualizer = useVirtualizer({ 
    count: filteredData.length, 
    getScrollElement: () => parentRef.current, 
    estimateSize: () => 180, 
    overscan: 5 
  })

  const urgentCount = rankedData.filter(item => item.score.urgency >= 80).length;

  return (
    <div className="space-y-8 animate-fade-in pb-12 dashboard-container">
      <style>{`
        .dashboard-container input::placeholder,
        .dashboard-container textarea::placeholder {
          color: #9ca3af;
          opacity: 0.7;
        }
        @media (prefers-color-scheme: light) {
          .dashboard-container input::placeholder,
          .dashboard-container textarea::placeholder {
            color: #6b7280;
            opacity: 0.85;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--surface-2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border-strong);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--accent);
        }
      `}</style>

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8 text-[var(--accent)]" />
            Dashboard
          </h2>
          <p className="mt-1.5 text-[var(--text-secondary)] font-medium">
            Your AI-powered opportunity overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastSynced ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--border-color)] text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              <RefreshCw className="h-3.5 w-3.5 text-success" />
              Synced {lastSynced.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--border-color)] text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <RefreshCw className="h-3.5 w-3.5 text-[var(--text-muted)]" /> Ready to sync
            </div>
          )}
          <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-[var(--surface-1)] border-[var(--border-color)] hover:bg-[var(--surface-2)] text-[var(--text-primary)] transition-colors rounded-xl h-10 px-4"
              >
                <MailPlus className="mr-2 h-4 w-4 text-[var(--accent)]" /> Manual Input
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md md:max-w-xl bg-[var(--surface-1)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl text-[var(--text-primary)]">
                  <Sparkles className="h-5 w-5 text-[var(--accent)]" /> Analyze Manually
                </DialogTitle>
                <DialogDescription className="text-[var(--text-secondary)]">
                  Paste an email or a batch of text to extract opportunities instantly.
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="single" className="w-full mt-4">
                <TabsList className="mb-5 grid w-full grid-cols-2 bg-[var(--surface-2)] p-1 rounded-xl">
                  <TabsTrigger value="single" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-[var(--accent-foreground)] rounded-lg">
                    <Send className="mr-2 h-3.5 w-3.5" />Single
                  </TabsTrigger>
                  <TabsTrigger value="batch" className="data-[state=active]:bg-[var(--accent)] data-[state=active]:text-[var(--accent-foreground)] rounded-lg">
                    <FileText className="mr-2 h-3.5 w-3.5" />Batch
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="single" className="animate-in fade-in-50 zoom-in-95 duration-200">
                  <SingleEmailForm onAnalyze={onSingleAnalyze} busy={busy} setOpen={setIsManualModalOpen} />
                </TabsContent>
                <TabsContent value="batch" className="animate-in fade-in-50 zoom-in-95 duration-200">
                  <Textarea 
                    placeholder={
                      "Subject: Summer Internship\nFrom: careers@google.com\n\nDear student...\n\n---\n\nSubject: Another Email..."
                    } 
                    className="mb-5 h-48 font-mono text-xs bg-[var(--surface-2)] border-[var(--border-color)] focus-visible:ring-[var(--accent)] rounded-xl p-4 text-[var(--text-primary)]" 
                    value={emailsText} 
                    onChange={(e) => setEmailsText(e.target.value)} 
                  />
                  <Button 
                    disabled={busy} 
                    onClick={() => { onManualAnalyze(); setIsManualModalOpen(false); }} 
                    className="w-full btn-accent rounded-xl h-11"
                  >
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Process Batch
                  </Button>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {metricConfigs.map((c, i) => {
          let val = 0;
          if (c.isStatus) {
            val = data?.meta?.oauth_connected ? 'Active' : 'Paused'
          } else if (c.isCustom && c.key === 'urgent') {
            val = urgentCount
          } else {
            val = data?.meta?.[c.key] ?? 0
          }
          return <MetricCard key={c.key} config={c} value={val} index={i} />
        })}
      </div>

      {/* Main Content — Opportunity Feed */}
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
             <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Opportunity Feed</h3>
             <Badge variant="outline" className="bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border-color)]">
               {filteredData.length} total
             </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <Input 
                placeholder="Search opportunities..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-[var(--surface-1)] border-[var(--border-color)] focus-visible:ring-[var(--accent)]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="h-4 w-[1px] bg-[var(--border-color)] hidden md:block mx-1"></div>

            {/* Filter Badges */}
            <div className="flex gap-2 items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mr-1 hidden sm:inline">Sort:</span>
              <Badge 
                onClick={() => setFilterMode('all')}
                variant={filterMode === 'all' ? 'secondary' : 'outline'} 
                className={`cursor-pointer rounded-lg px-3 py-1 transition-all ${filterMode === 'all' ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]' : 'bg-[var(--surface-1)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-primary)]'}`}
              >
                All
              </Badge>
              <Badge 
                onClick={() => setFilterMode('high_fit')}
                variant={filterMode === 'high_fit' ? 'secondary' : 'outline'} 
                className={`cursor-pointer rounded-lg px-3 py-1 transition-all ${filterMode === 'high_fit' ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]' : 'bg-[var(--surface-1)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-primary)]'}`}
              >
                High Fit
              </Badge>
              <Badge 
                onClick={() => setFilterMode('urgent')}
                variant={filterMode === 'urgent' ? 'secondary' : 'outline'} 
                className={`cursor-pointer rounded-lg px-3 py-1 transition-all ${filterMode === 'urgent' ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]' : 'bg-[var(--surface-1)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-primary)]'}`}
              >
                Urgent
              </Badge>
            </div>
          </div>
        </div>
        
        {data && filteredData.length > 0 ? (
          <div className="bg-[var(--surface-0)] rounded-2xl border border-[var(--border-color)] p-2 shadow-sm relative">
            <div ref={parentRef} className="h-[650px] overflow-auto px-2 custom-scrollbar">
              <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((vr) => {
                  const item = filteredData[vr.index]
                  return (
                    <div 
                      key={vr.key} 
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: `${vr.size}px`, 
                        transform: `translateY(${vr.start}px)`,
                        paddingBottom: '12px'
                      }}
                    >
                      <OpportunityRow item={item} index={vr.index} onOpen={onOpenOpportunity} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : data ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-1)] p-24 text-center h-[650px]">
            <div className="mb-6 rounded-2xl bg-[var(--surface-2)] p-5 border border-[var(--border-color)]">
              {searchQuery || filterMode !== 'all' ? <Filter className="h-10 w-10 text-[var(--accent)]" /> : <BrainCircuit className="h-10 w-10 text-[var(--accent)]" />}
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              {searchQuery || filterMode !== 'all' ? "No matches found" : "No opportunities found yet"}
            </h3>
            <p className="text-[var(--text-secondary)] max-w-sm mb-6 font-medium">
              {searchQuery || filterMode !== 'all' ? "Try adjusting your search or filter settings to find what you're looking for." : "Connect your Gmail to start background syncing, or manually analyze an email to get started."}
            </p>
            {(searchQuery || filterMode !== 'all') && (
              <Button variant="outline" className="rounded-xl" onClick={() => { setSearchQuery(''); setFilterMode('all'); }}>
                Clear all filters
              </Button>
            )}
            {!data?.meta?.oauth_connected && !searchQuery && filterMode === 'all' && (
              <Button className="btn-accent rounded-xl h-11 shadow-md" onClick={() => window.location.href = '/api/auth/google'}>
                <MailPlus className="mr-2 h-4 w-4" /> Connect Gmail
              </Button>
            )}
          </div>
        ) : (
          <div className="flex h-[650px] items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)]">
            <div className="text-center flex flex-col items-center">
              <Loader2 className="mb-5 h-10 w-10 animate-spin text-[var(--accent)]" />
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] animate-pulse">
                Loading insights...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}