import React, { useEffect, useState, useCallback } from "react";
import {
  BrainCircuit,
  Grid3X3,
  Inbox,
  Loader2,
  LogOut,
  Menu,
  UserCircle2,
  X,
  CheckCircle2,
  Circle,
  Sun,
  Moon,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import AuthScreen from "./AuthScreen";
import {
  getOnboardingStatus,
  getDashboard,
  manualAnalyze,
  analyzeSingle,
  parseEmailBatch,
  deleteEmail,
  deleteAllEmails,
  syncEmails,
} from "./api.js";
import { Badge } from "@/components/ui/badge";
import { ToastProvider, useToast } from "@/components/Toast";
import OpportunityDrawer from "@/components/OpportunityDrawer";
import DashboardPage from "@/pages/DashboardPage";
import EmailRecordPage from "@/pages/EmailRecordPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import OpplyLogo from "./components/OpplyLogo";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Grid3X3 },
  { id: "email-record", label: "Email Archive", icon: Inbox },
  { id: "profile", label: "Profile", icon: UserCircle2 },
  { id: "settings", label: "Settings", icon: ShieldCheck },
];

function AppContent() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [activeView, setActiveView] = useState("dashboard");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [emailsText, setEmailsText] = useState("");
  const [workerStatus, setWorkerStatus] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [isValidatingToken, setIsValidatingToken] = useState(!!localStorage.getItem("token"));
  const toast = useToast();
  const [onboarding, setOnboarding] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });
  const [syncCooldown, setSyncCooldown] = useState(0);

  useEffect(() => {
    if (syncCooldown > 0) {
      const timer = setTimeout(() => setSyncCooldown(syncCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [syncCooldown]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const refreshOnboarding = useCallback(async () => {
    if (!token) return;
    try {
      const status = await getOnboardingStatus(token);
      setOnboarding(status);
      if (!status.has_profile) setActiveView("profile");
    } catch (err) {
      if (String(err?.message || "").includes("401")) {
        setToken(null);
        localStorage.removeItem("token");
      }
    } finally {
      setIsValidatingToken(false);
    }
  }, [token]);

  const refreshDashboard = useCallback(async () => {
    if (!token) return;
    try {
      setData(await getDashboard(token));
    } catch (err) {
      if (String(err?.message || "").includes("401")) {
        setToken(null);
        localStorage.removeItem("token");
      }
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    refreshOnboarding();
    refreshDashboard();
  }, [token, refreshOnboarding, refreshDashboard]);

  useEffect(() => {
    if (!token) {
      setIsValidatingToken(false);
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://opply-ai-backend.onrender.com" : "");
    const wsBase = apiUrl.replace(/^http/, "ws");
    const wsUrl = wsBase ? `${wsBase}/ws?token=${token}` : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws?token=${token}`;
    let ws = new WebSocket(wsUrl);
    let rto = null;
    const connect = () => {
      if (ws.readyState === WebSocket.CLOSED) {
        ws = new WebSocket(wsUrl);
        setup();
      }
    };
    const setup = () => {
      ws.onmessage = (e) => {
        try {
          const m = JSON.parse(e.data);
          if (m.type === "progress") setWorkerStatus(m.message);
          else if (m.type === "new_record") {
            refreshDashboard();
            setWorkerStatus("New opportunity found!");
            setTimeout(() => setWorkerStatus(null), 4000);
          } else if (m.type === "sync_complete") {
            setLastSynced(new Date());
            setWorkerStatus(null);
          } else if (m.type === "whatsapp_status") {
            const shortSubject = (m.subject || "Email").slice(0, 40);
            if (m.success) {
              toast.success(`WhatsApp alert sent for: "${shortSubject}"`);
            } else if (m.error_reason === "daily_limit") {
              toast.error(`WhatsApp daily limit reached (5/day). Alert not sent for: "${shortSubject}"`);
            } else if (m.error_reason === "not_joined") {
              toast.error(`WhatsApp not joined sandbox. Send 'join up-lonyer' to +14155238886 first.`);
            } else if (m.error_reason === "credentials_missing") {
              toast.error(`WhatsApp not configured. Check Twilio credentials in settings.`);
            } else {
              toast.error(`WhatsApp alert failed for: "${shortSubject}". Check logs.`);
            }
          } else if (m.type === "setup_required" && activeView !== "profile")
            setWorkerStatus(m.message);
          else if (m.type === "error") {
            toast.error(m.message);
            setWorkerStatus("Sync failed");
          }
        } catch {}
      };
      ws.onclose = () => {
        rto = setTimeout(connect, 3000);
      };
    };
    setup();
    return () => {
      clearTimeout(rto);
      if (ws) ws.close();
    };
  }, [token, refreshDashboard]);

  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    if (u.get("oauth_success")) {
      toast.success("Google Account connected!");
      window.history.replaceState({}, document.title, window.location.pathname);
      refreshOnboarding();
    }
    if (u.get("error")) {
      toast.error("OAuth Error: " + u.get("error"));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const onProfileSaved = useCallback(() => {
    refreshOnboarding();
    refreshDashboard();
    toast.success("Profile saved! Dashboard unlocked.");
  }, [refreshOnboarding, refreshDashboard, toast]);

  const onManualAnalyze = async () => {
    setBusy(true);
    setError("");
    try {
      const p = parseEmailBatch(emailsText);
      if (!p.length) throw new Error("No emails found.");
      await manualAnalyze(token, p);
      setEmailsText("");
      await refreshDashboard();
      setActiveView("dashboard");
      toast.success("Analysis complete!");
    } catch (e) {
      toast.error(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const onSingleAnalyze = async ({ subject, sender, body }) => {
    setBusy(true);
    setError("");
    try {
      await analyzeSingle(token, { subject, sender, body });
      await refreshDashboard();
      toast.success("Email analyzed!");
    } catch (e) {
      toast.error(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const onDeleteEmail = async (emailId) => {
    try {
      await deleteEmail(token, emailId);
      await refreshDashboard();
      toast.success("Deleted.");
    } catch (e) {
      toast.error(e?.message || String(e));
    }
  };

  const onDeleteAllEmails = async () => {
    try {
      await deleteAllEmails(token);
      await refreshDashboard();
      toast.success("All cleared.");
    } catch (e) {
      toast.error(e?.message || String(e));
    }
  };

  const onLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setOnboarding(null);
    setData(null);
  };

  const onSync = async () => {
    if (syncCooldown > 0 || busy || workerStatus) return;
    if (!onboarding?.has_oauth || !onboarding?.has_profile) {
      toast.error("Complete your profile and connect Gmail first.");
      return;
    }

    setBusy(true);
    setWorkerStatus("Initiating sync...");
    try {
      await syncEmails(token);
      setSyncCooldown(30); // 30 second cooldown
      toast.success("Sync started! We're checking your Gmail.");
    } catch (e) {
      toast.error(e?.message || String(e));
      setWorkerStatus(null);
    } finally {
      setBusy(false);
    }
  };

  const handleNavClick = (id) => {
    if (
      !onboarding?.has_profile &&
      (id === "dashboard" || id === "email-record")
    ) {
      toast.error("Complete your profile first.");
      setActiveView("profile");
      setSidebarOpen(false);
      return;
    }
    setActiveView(id);
    setSidebarOpen(false);
  };

  if (isValidatingToken)
    return (
      <div className="min-h-screen bg-[var(--surface-0)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--accent)]" />
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] animate-pulse">
            Authenticating...
          </p>
        </div>
      </div>
    );

  if (!token)
    return (
      <AuthScreen
        onLogin={(t) => {
          setToken(t);
          localStorage.setItem("token", t);
          setIsValidatingToken(false);
        }}
        isDark={isDark}
        setIsDark={setIsDark}
      />
    );

  const hasProfile = onboarding?.has_profile ?? false;

  return (
    <div className="min-h-screen bg-[var(--surface-0)] text-[var(--text-primary)] font-sans transition-colors duration-200">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        </div>
      )}

      {/* ═══ Sidebar (simplified, no status footer) ═══ */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[280px] bg-[var(--surface-1)] lg:bg-[var(--surface-1)]/95 lg:backdrop-blur-xl border-r border-[var(--border-color)] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto custom-scrollbar`}
      >
        {/* Brand */}
        <div className="flex items-center justify-center px-4 py-2 border-b border-[var(--border-color)] shrink-0">
          <OpplyLogo width={220} height={66} />
          <button
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto min-h-0">
          <div className="px-3 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] shrink-0">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeView;
            const locked =
              !hasProfile &&
              (item.id === "dashboard" || item.id === "email-record");
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                } ${locked ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="flex-1 text-left">{item.label}</span>
                {locked && (
                  <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded-md font-bold">
                    Locked
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Setup progress */}
        {onboarding && (
          <div className="px-4 py-4 border-t border-[var(--border-color)] shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
              Setup Status
            </div>
            <div className="space-y-2.5">
              {[
                { done: hasProfile, label: "Profile Setup" },
                { done: onboarding.has_oauth, label: "Gmail Connection" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-xs">
                  {s.done ? (
                    <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
                  ) : (
                    <Circle className="h-4 w-4 text-[var(--text-muted)]" />
                  )}
                  <span
                    className={
                      s.done
                        ? "font-medium text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)]"
                    }
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Only logout remains at bottom (no status block) */}
        <div className="px-4 py-5 border-t border-[var(--border-color)] shrink-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-danger-light hover:text-danger transition-all duration-200"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ═══ Main Content ═══ */}
      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--surface-0)]/80 backdrop-blur-xl px-6 py-4 gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Worker status and sync details now live here */}
            <div className="flex items-center gap-2 sm:gap-3 text-sm flex-wrap">
              {workerStatus ? (
                <div className="flex items-center gap-2 rounded-full bg-[var(--surface-2)] border border-[var(--border-color)] px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium text-[var(--text-primary)] max-w-[120px] sm:max-w-none">
                  <Loader2 className="h-3 w-3 animate-spin text-[var(--accent)] shrink-0" />
                  <span className="truncate">{workerStatus}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-full bg-[var(--surface-2)] border border-[var(--border-color)] px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium text-[var(--text-secondary)]">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
                  </span>
                  <span className="hidden xs:inline">Worker Idle</span>
                </div>
              )}
              {lastSynced && (
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[var(--text-muted)]">
                  <RefreshCw className="h-3 w-3 shrink-0" />
                  <span className="hidden md:inline">
                    Last sync: {lastSynced.toLocaleTimeString()}
                  </span>
                  <span className="md:hidden">
                    {lastSynced.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={onSync}
              disabled={
                busy ||
                !!workerStatus ||
                syncCooldown > 0 ||
                !onboarding?.has_oauth ||
                !onboarding?.has_profile
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                busy || workerStatus
                  ? "bg-[var(--surface-2)] text-[var(--text-muted)] cursor-not-allowed"
                  : syncCooldown > 0
                  ? "bg-[var(--surface-2)] text-[var(--text-muted)] cursor-wait"
                  : "bg-[var(--accent)] text-[var(--accent-foreground)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={
                syncCooldown > 0
                  ? `Wait ${syncCooldown}s`
                  : "Sync Gmail Now"
              }
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  busy || workerStatus ? "animate-spin" : ""
                }`}
              />
              <span className="hidden md:inline">
                {busy || workerStatus
                  ? "Syncing..."
                  : syncCooldown > 0
                  ? `Ready in ${syncCooldown}s`
                  : "Sync Now"}
              </span>
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg hover:bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200"
              title="Toggle Theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </header>

        <main className="p-6 lg:p-8 max-w-7xl mx-auto relative z-10">
          {error && (
            <div className="mb-6 rounded-xl border border-danger/20 bg-danger-light p-4 text-sm text-danger animate-shake">
              <div className="mb-1 font-bold uppercase tracking-wider text-xs">
                Error
              </div>
              {error}
              <button
                onClick={() => setError("")}
                className="ml-3 text-danger hover:text-danger/80"
              >
                <X className="h-3 w-3 inline" />
              </button>
            </div>
          )}

          {activeView === "dashboard" && (
            <DashboardPage
              data={data}
              busy={busy}
              emailsText={emailsText}
              setEmailsText={setEmailsText}
              onManualAnalyze={onManualAnalyze}
              onSingleAnalyze={onSingleAnalyze}
              onOpenOpportunity={setSelectedOpp}
              hasProfile={hasProfile}
              lastSynced={lastSynced}
            />
          )}
          {activeView === "email-record" && (
            <EmailRecordPage
              data={data}
              onDeleteEmail={onDeleteEmail}
              onDeleteAllEmails={onDeleteAllEmails}
            />
          )}
          {activeView === "profile" && (
            <ProfilePage
              token={token}
              onProfileSaved={onProfileSaved}
              onboarding={onboarding}
              onNavigate={handleNavClick}
            />
          )}
          {activeView === "settings" && (
            <SettingsPage token={token} onboarding={onboarding} />
          )}
        </main>
      </div>
      {selectedOpp && (
        <OpportunityDrawer
          item={selectedOpp}
          onClose={() => setSelectedOpp(null)}
        />
      )}
    </div>
  );
}

export default function AppShell() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
