const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchWithAuth(url, options = {}, token) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(API_BASE + url, { ...options, headers })
  if (!res.ok) {
    let detail = ''
    try {
      const j = await res.json()
      detail = j?.detail || j?.error || JSON.stringify(j)
    } catch {
      detail = await res.text()
    }
    throw new Error(detail || `Error ${res.status}`)
  }
  return await res.json()
}

// ─── Auth ──────────────────────────────────────────────────────────

export async function login(email, password) {
  return await fetchWithAuth('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

export async function register(email, password) {
  return await fetchWithAuth('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

export async function resetPassword(email, new_password) {
  return await fetchWithAuth('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, password: new_password })
  })
}

// ─── Onboarding ────────────────────────────────────────────────────

export async function getOnboardingStatus(token) {
  return await fetchWithAuth('/api/protected/onboarding-status', {}, token)
}

// ─── Profile ───────────────────────────────────────────────────────

export async function getProfile(token) {
  return await fetchWithAuth('/api/protected/profile', {}, token)
}

export async function updateProfile(token, profile) {
  return await fetchWithAuth('/api/protected/profile', {
    method: 'POST',
    body: JSON.stringify(profile)
  }, token)
}

// ─── Account & OAuth ───────────────────────────────────────────────

export async function disconnectGoogleOAuth(token) {
  return await fetchWithAuth('/api/protected/oauth/google', {
    method: 'DELETE'
  }, token)
}

export async function getAccountDetails(token) {
  return await fetchWithAuth('/api/protected/account', {}, token)
}

export async function updatePassword(token, new_password) {
  return await fetchWithAuth('/api/protected/account', {
    method: 'PUT',
    body: JSON.stringify({ new_password })
  }, token)
}

export async function updateNotificationSettings(token, phone_number, whatsapp_enabled) {
  return await fetchWithAuth('/api/protected/account', {
    method: 'PUT',
    body: JSON.stringify({ phone_number, whatsapp_enabled })
  }, token)
}

export async function testWhatsApp(token) {
  return await fetchWithAuth('/api/protected/test-whatsapp', {
    method: 'POST'
  }, token)
}


// ─── Dashboard ─────────────────────────────────────────────────────

export async function getDashboard(token) {
  return await fetchWithAuth('/api/protected/dashboard', {}, token)
}

export async function syncEmails(token) {
  return await fetchWithAuth('/api/protected/sync', {
    method: 'POST'
  }, token)
}

// ─── Analysis ──────────────────────────────────────────────────────

export async function manualAnalyze(token, emails) {
  return await fetchWithAuth('/api/protected/analyze-manual', {
    method: 'POST',
    body: JSON.stringify({ emails })
  }, token)
}

export async function analyzeSingle(token, { subject, sender, body }) {
  return await fetchWithAuth('/api/protected/analyze-single', {
    method: 'POST',
    body: JSON.stringify({ subject, sender, body })
  }, token)
}

// ─── Email Management ──────────────────────────────────────────────

export async function deleteEmail(token, emailId) {
  return await fetchWithAuth(`/api/protected/emails/${encodeURIComponent(emailId)}`, {
    method: 'DELETE'
  }, token)
}

export async function deleteAllEmails(token) {
  return await fetchWithAuth('/api/protected/emails', {
    method: 'DELETE'
  }, token)
}

// ─── Parsing Helpers ───────────────────────────────────────────────

export function parseEmailBatch(text) {
  const trimmed = (text || '').trim()
  if (!trimmed) return []

  const chunks = trimmed
    .split(/\n\s*---\s*\n/g)
    .map((c) => c.trim())
    .filter(Boolean)

  return chunks.map((chunk, idx) => {
    const lines = chunk.split('\n')
    let subject = null
    let sender = null

    const first = (lines[0] || '').trim()
    const second = (lines[1] || '').trim()

    if (/^subject:/i.test(first)) subject = first.replace(/^subject:\s*/i, '').trim()
    if (/^from:/i.test(first)) sender = first.replace(/^from:\s*/i, '').trim()

    if (!subject && /^subject:/i.test(second)) subject = second.replace(/^subject:\s*/i, '').trim()
    if (!sender && /^from:/i.test(second)) sender = second.replace(/^from:\s*/i, '').trim()

    return {
      id: String(idx + 1),
      subject,
      sender,
      raw: chunk
    }
  })
}
