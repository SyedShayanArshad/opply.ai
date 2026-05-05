import React, { useEffect, useState } from 'react'
import {
  Loader2, Settings, Globe, Lock, Bell, CheckCircle2,
  XCircle, RefreshCw, ShieldCheck, FileText, ExternalLink,
  MessageCircle, Smartphone, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAccountDetails, updatePassword, disconnectGoogleOAuth, updateNotificationSettings, testWhatsApp } from '@/api'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/Toast'

export default function SettingsPage({ token, onboarding }) {
  const [accountEmail, setAccountEmail]     = useState('')
  const [passwordForm, setPasswordForm]     = useState({ newPassword: '', confirmPassword: '' })
  const [passwordMsg, setPasswordMsg]       = useState({ type: '', text: '' })
  const [disconnecting, setDisconnecting]   = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)

  const [notifyForm, setNotifyForm]         = useState({ phone_number: '', whatsapp_enabled: false })
  const [updatingNotify, setUpdatingNotify] = useState(false)
  const [testingWhatsApp, setTestingWhatsApp] = useState(false)
  const toast = useToast()

  const hasProfile   = onboarding?.has_profile
  const hasOAuth     = onboarding?.has_oauth
  const connectedEmail = onboarding?.connected_email || ''

  useEffect(() => {
    if (!token) return
    getAccountDetails(token).then(a => {
      setAccountEmail(a.email)
      setNotifyForm({ phone_number: a.phone_number || '', whatsapp_enabled: !!a.whatsapp_enabled })
    }).catch(() => {})
  }, [token])

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await disconnectGoogleOAuth(token)
      window.location.reload()
    } catch (e) {
      toast.error(e.message || 'Failed to disconnect')
      setDisconnecting(false)
      setShowDisconnectConfirm(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match' }); return
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' }); return
    }
    setUpdatingPassword(true)
    try {
      await updatePassword(token, passwordForm.newPassword)
      setPasswordMsg({ type: 'success', text: 'Password updated successfully' })
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    } catch (e) {
      setPasswordMsg({ type: 'error', text: e.message || 'Failed to update password' })
    } finally { setUpdatingPassword(false) }
  }

  const handleUpdateNotify = async (e) => {
    e.preventDefault()
    setUpdatingNotify(true)
    try {
      await updateNotificationSettings(token, notifyForm.phone_number, notifyForm.whatsapp_enabled)
      toast.success('Notification settings saved')
    } catch (e) {
      toast.error(e.message || 'Failed to update settings')
    } finally { setUpdatingNotify(false) }
  }

  const handleTestWhatsApp = async () => {
    setTestingWhatsApp(true)
    try {
      const r = await testWhatsApp(token)
      toast.success(r.message || 'Test message sent! Check your WhatsApp.')
    } catch (e) {
      toast.error(e.message || 'Test failed. Make sure you joined the Twilio Sandbox.')
    } finally { setTestingWhatsApp(false) }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 settings-page-layout">
      <style>{`
        .settings-page-layout input::placeholder {
          color: #9ca3af;
          opacity: 0.7;
        }
        @media (prefers-color-scheme: light) {
          .settings-page-layout input::placeholder {
            color: #6b7280;
            opacity: 0.85;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-[var(--accent)]" />
            Settings
          </h2>
          <p className="mt-1.5 text-[var(--text-secondary)]">Manage email sync, security, and WhatsApp alerts.</p>
        </div>
      </div>

      {/* Professional stacked layout – each card full width */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 1. Email Sync Card */}
        <Card className="card-surface border-0 overflow-hidden rounded-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-[var(--accent)] to-transparent" />
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-[var(--text-primary)]">
              <RefreshCw className="h-5 w-5 text-[var(--accent)]" /> Email Sync
            </CardTitle>
            <CardDescription className="text-[var(--text-secondary)]">
              Connect your Gmail account to enable automatic email classification and opportunity detection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {!hasProfile && (
              <div className="rounded-xl bg-warning-light p-4 text-sm text-warning flex items-start gap-2 border border-warning/20">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div><strong className="font-bold">Action Required:</strong> Complete your profile first to enable sync.</div>
              </div>
            )}

            <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${hasOAuth ? 'bg-success-light' : 'bg-[var(--surface-1)]'} border border-[var(--border-color)]`}>
                  {hasOAuth ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-danger" />}
                </div>
                <div>
                  <div className="text-[13px] text-[var(--text-secondary)]">
                    {hasOAuth ? (
                      <>Active with <span className="text-[var(--text-primary)] font-medium">{connectedEmail || 'Google Account'}</span></>
                    ) : (
                      <>Not connected. Email classification is paused.</>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                disabled={!hasProfile}
                onClick={() => {
                  const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://opply-ai-backend.onrender.com" : "http://localhost:8000");
                  window.location.href = `${apiUrl}/api/auth/google/login?token=${localStorage.getItem('token')}`;
                }}
                className={`flex-1 h-11 rounded-xl font-medium ${hasOAuth ? 'bg-[var(--surface-2)] hover:bg-[var(--border-color)] text-[var(--text-primary)] border border-[var(--border-color)]' : 'btn-accent shadow-[0_0_15px_var(--accent-glow)]'}`}
              >
                <Globe className="mr-2 h-4 w-4" />{hasOAuth ? 'Reconnect Google' : 'Connect Google'}
              </Button>
              {hasOAuth && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDisconnectConfirm(true)}
                  className="flex-1 h-11 rounded-xl text-danger border-[var(--border-color)] bg-transparent hover:bg-danger-light hover:text-danger transition-all"
                >
                  Disconnect Account
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. Security Card */}
        <Card className="card-surface border-0 overflow-hidden rounded-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-[var(--accent)] to-transparent" />
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-[var(--text-primary)]">
              <Lock className="h-5 w-5 text-[var(--accent)]" /> Security
            </CardTitle>
            <CardDescription className="text-[var(--text-secondary)]">
              Update your password or manage account email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Account Email</Label>
              <Input value={accountEmail} disabled className="h-10 bg-[var(--surface-2)] border-transparent text-[var(--text-primary)] cursor-not-allowed text-sm rounded-lg font-medium" />
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2 border-t border-[var(--border-color)]">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="h-10 bg-[var(--surface-2)] border-[var(--border-color)] focus-visible:ring-[var(--accent)] text-sm rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Confirm Password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="h-10 bg-[var(--surface-2)] border-[var(--border-color)] focus-visible:ring-[var(--accent)] text-sm rounded-lg"
                />
              </div>
              {passwordMsg.text && (
                <div className={`rounded-xl p-3 text-[13px] font-medium flex items-start gap-2 ${
                  passwordMsg.type === 'error' ? 'bg-danger-light text-danger border border-danger/20' : 'bg-success-light text-success border border-success/20'
                }`}>
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{passwordMsg.text}</span>
                </div>
              )}
              <Button
                type="submit"
                disabled={updatingPassword}
                className="w-full h-10 text-xs font-bold bg-[var(--surface-2)] hover:bg-[var(--border-color)] text-[var(--text-primary)] border border-[var(--border-color)] transition-all rounded-lg"
              >
                {updatingPassword ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Settings className="mr-2 h-3.5 w-3.5" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 3. WhatsApp Alerts Card */}
        <Card className="card-surface border-0 overflow-hidden rounded-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-[var(--accent)] to-transparent" />
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-[var(--text-primary)]">
              <MessageCircle className="h-5 w-5 text-[var(--accent)]" /> WhatsApp Alerts
            </CardTitle>
            <CardDescription className="text-[var(--text-secondary)]">
              Receive instant notifications on your phone when important emails arrive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Setup instructions with proper icons */}
            <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-glow)] p-4 text-sm">
              <div className="flex items-start gap-2 mb-3">
                <Smartphone className="h-4 w-4 text-[var(--accent)] mt-0.5" />
                <span className="font-bold text-[var(--text-primary)]">One‑time Sandbox Setup</span>
              </div>
              <div className="space-y-2 text-[var(--text-secondary)]">
                <p className="flex items-start gap-2">
                  <span className="text-[var(--accent)]">1.</span>
                  Open WhatsApp and send a message to
                  <span className="font-mono font-bold text-[var(--text-primary)]"> +1 (415) 523-8886</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[var(--accent)]">2.</span>
                  Message text:
                  <span className="font-mono font-bold text-[var(--text-primary)]"> join &lt;your-sandbox-keyword&gt;</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[var(--accent)]">3.</span>
                  You'll receive a confirmation reply
                  <CheckCircle2 className="inline h-3.5 w-3.5 text-success ml-1" />
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[var(--border-color)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <ExternalLink className="h-3 w-3" />
                <span>Find your keyword at: console.twilio.com → Messaging → Try it out → WhatsApp</span>
              </div>
            </div>

            <form onSubmit={handleUpdateNotify} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">WhatsApp Number</Label>
                <Input
                  value={notifyForm.phone_number}
                  onChange={e => setNotifyForm(f => ({ ...f, phone_number: e.target.value }))}
                  placeholder="+923001234567"
                  className="h-10 bg-[var(--surface-2)] border-[var(--border-color)] focus-visible:ring-[var(--accent)] text-sm rounded-lg"
                />
                <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Include country code, e.g. +92 for Pakistan
                </p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-[var(--text-primary)]">Enable Alerts</Label>
                  <p className="text-xs text-[var(--text-muted)]">Get notified when a new opportunity is found</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyForm(f => ({ ...f, whatsapp_enabled: !f.whatsapp_enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface-0)] ${notifyForm.whatsapp_enabled ? 'bg-[var(--accent)]' : 'bg-[var(--surface-3)]'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifyForm.whatsapp_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={updatingNotify}
                  className="flex-1 h-10 text-xs font-bold btn-accent rounded-lg shadow-lg"
                >
                  {updatingNotify ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Settings className="mr-2 h-3.5 w-3.5" />}
                  Save Settings
                </Button>
                <Button
                  type="button"
                  disabled={testingWhatsApp || !notifyForm.phone_number}
                  onClick={handleTestWhatsApp}
                  className="flex-1 h-10 text-xs font-bold bg-[var(--surface-2)] hover:bg-[var(--border-color)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg transition-all"
                >
                  {testingWhatsApp ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Bell className="mr-2 h-3.5 w-3.5" />}
                  Send Test Message
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={showDisconnectConfirm} onOpenChange={setShowDisconnectConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">Disconnect Google Account</DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              Are you sure you want to disconnect your Google account? Automatic email classification will stop and you will no longer receive new opportunities.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-3 sm:space-x-0">
            <Button 
              variant="outline" 
              onClick={() => setShowDisconnectConfirm(false)} 
              className="flex-1 sm:flex-none bg-[var(--surface-2)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--surface-3)] h-11"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDisconnect} 
              disabled={disconnecting} 
              className="flex-1 sm:flex-none bg-red-600 text-white hover:bg-red-700 border-0 h-11 shadow-md font-bold"
            >
              {disconnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}