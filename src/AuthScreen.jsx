import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  ArrowLeft,
  Sun,
  Moon,
} from "lucide-react";
import { login, register, resetPassword } from "./api";
import OpplyLogo from "./components/OpplyLogo";

export default function AuthScreen({ onLogin, isDark, setIsDark }) {
  const [mode, setMode] = useState("login"); // 'login', 'register', 'reset'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const toggleTheme = () => setIsDark(!isDark);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (mode === "login") {
        const res = await login(email, password);
        localStorage.setItem("token", res.access_token);
        onLogin(res.access_token);
      } else if (mode === "register") {
        const res = await register(email, password);
        localStorage.setItem("token", res.access_token);
        onLogin(res.access_token);
      } else if (mode === "reset") {
        await resetPassword(email, password);
        setSuccess("Password reset successfully! Please sign in with your new password.");
        setMode("login");
        setPassword("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Detection",
      desc: "Automatically identifies scholarships, internships, and more.",
    },
    {
      icon: Zap,
      title: "Real-time Extraction",
      desc: "Pulls deadlines, eligibility, and links directly from emails.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      desc: "Your data is encrypted and used only to find your opportunities.",
    },
  ];

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-[var(--surface-0)] overflow-hidden font-sans transition-colors duration-300">
      <style>{`
        .auth-container input::placeholder {
          color: #9ca3af;
          opacity: 0.7;
        }
        @media (prefers-color-scheme: light) {
          .auth-container input::placeholder {
            color: #6b7280;
            opacity: 0.85;
          }
        }
        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
          100% { transform: translateY(0px) scale(1); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-scale-in {
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.98) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .dot-pattern {
          background-image: radial-gradient(var(--border-color) 1px, transparent 1px);
          background-size: 24px 24px;
          opacity: 0.4;
        }
      `}</style>

      {/* ── Left Side: Branding & Marketing (desktop only) ── */}
      <div className="relative hidden lg:flex lg:w-[55%] xl:w-[60%] bg-[var(--surface-1)] border-r border-[var(--border-color)] overflow-hidden p-8 xl:p-16 flex-col justify-between transition-colors duration-300">
        <div className="absolute inset-0 dot-pattern" />
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[var(--accent)]/10 blur-[120px] animate-float" />
        <div
          className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[var(--accent-hover)]/10 blur-[100px] animate-float"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative z-10">
          <OpplyLogo width={240} height={70} className="mb-10" />

          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.1]">
              Turn your inbox into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)]">
                endless opportunities.
              </span>
            </h1>
            <p className="text-base xl:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
              Opply AI scans, extracts, and ranks every scholarship, fellowship,
              and internship hidden in your emails.
            </p>
          </div>

          <div className="mt-10 grid gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-3 animate-scale-in"
                style={{ animationDelay: `${0.1 * (i + 1)}s` }}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--accent)] transition-colors duration-300">
                  <f.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                    {f.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Side: Auth Form (scrolls only if needed, but fits on most screens) ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 relative bg-[var(--surface-0)] auth-container overflow-y-auto transition-colors duration-300">
        <div className="lg:hidden absolute inset-0 dot-pattern" />
        <div className="lg:hidden absolute top-[10%] left-[-20%] h-[300px] w-[300px] rounded-full bg-[var(--accent)]/10 blur-[80px]" />

        {/* Theme Toggle Button */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-10 h-10 bg-[var(--surface-2)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-all duration-300 shadow-sm"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-lime-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </Button>
        </div>

        <div className="lg:hidden mb-6 relative z-10">
          <OpplyLogo width={160} height={50} />
        </div>

        <div className="w-full max-w-[400px] relative z-10 animate-scale-in">
          <Card className="card-surface overflow-hidden rounded-2xl border border-[var(--border-color)] shadow-xl bg-[var(--surface-1)]/50 backdrop-blur-sm transition-all duration-300">
            <div className="h-1 w-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent-hover)] to-[var(--accent)]" />

            <CardHeader className="space-y-1 pb-4 pt-6 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                {mode === "login" ? "Welcome back" : mode === "register" ? "Get started" : "Reset Password"}
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)] text-sm">
                {mode === "login"
                  ? "Enter your details to access your dashboard"
                  : mode === "register"
                  ? "Create an account to start tracking opportunities"
                  : "Enter your email to set a new password"}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="animate-shake rounded-lg border border-danger/20 bg-danger-light p-2 text-center text-sm text-danger">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-lg border border-success/20 bg-success-light p-2 text-center text-sm text-success">
                    {success}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label
                    htmlFor="auth-email"
                    className="text-[var(--text-primary)] font-medium text-sm"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 rounded-lg border-[var(--border-color)] bg-[var(--surface-2)] focus-visible:ring-[var(--accent)] text-sm transition-colors duration-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="auth-password"
                      className="text-[var(--text-primary)] font-medium text-sm"
                    >
                      {mode === "reset" ? "New Password" : "Password"}
                    </Label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => { setMode("reset"); setError(""); setSuccess(""); }}
                        className="text-xs text-[var(--accent)] hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 rounded-lg border-[var(--border-color)] bg-[var(--surface-2)] pr-10 focus-visible:ring-[var(--accent)] text-sm transition-colors duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="btn-accent h-10 w-full rounded-lg shadow-md shadow-[var(--accent)]/20 text-sm font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  {mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Reset Password"}
                </Button>

                {mode !== "reset" ? (
                  <>
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[var(--border-color)]" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-[var(--surface-1)] px-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                          OR
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setMode(mode === "login" ? "register" : "login");
                          setError("");
                          setSuccess("");
                        }}
                        className="text-sm font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]"
                      >
                        {mode === "login"
                          ? "Don't have an account? Sign up"
                          : "Already have an account? Sign in"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                      className="text-sm font-medium text-[var(--text-primary)] flex items-center justify-center gap-1.5 mx-auto hover:text-[var(--accent)] transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Sign In
                    </button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-[11px] text-[var(--text-muted)]">
            By continuing, you agree to our{" "}
            <span className="underline cursor-pointer">Terms</span> and{" "}
            <span className="underline cursor-pointer">Privacy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
