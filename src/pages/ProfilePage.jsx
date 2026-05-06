import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Sparkles,
  UserCircle2,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Rocket,
  MapPin,
  DollarSign,
  Target,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { getProfile, updateProfile } from "@/api";

const ProfileSchema = z.object({
  degree_program: z.string().min(2, "Degree/program is required"),
  semester: z.coerce.number().int().min(1, "Min 1").max(20, "Max 20"),
  cgpa: z.coerce.number().min(0, "Min 0").max(4, "Max 4.0"),
  skills_csv: z.string().optional().default(""),
  interests_csv: z.string().optional().default(""),
  preferred_opportunity_types: z.array(z.string()).default([]),
  financial_need: z.enum(["low", "medium", "high"]),
  location_preference: z.enum(["any", "local", "remote"]),
  location_text: z.string().optional().default(""),
  past_experience: z.string().optional().default(""),
});

function csvToList(v) {
  return (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const OPPORTUNITY_TYPES = [
  "scholarship",
  "internship",
  "competition",
  "admissions",
  "fellowship",
  "event",
  "other",
];
const typeIcons = {
  scholarship: "🎓",
  internship: "💼",
  competition: "🏆",
  admissions: "📚",
  fellowship: "🔬",
  event: "📅",
  other: "✨",
};

const PROFILE_FIELDS = [
  "degree_program",
  "semester",
  "cgpa",
  "skills_csv",
  "interests_csv",
  "preferred_opportunity_types",
  "location_text",
  "past_experience",
];

function SetupStepper({ hasProfile, hasOAuth }) {
  const steps = [
    { label: "Create Profile", done: hasProfile },
    { label: "Connect Gmail", done: hasOAuth, optional: true },
    { label: "Ready!", done: hasProfile && hasOAuth },
  ];
  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6 card-surface p-4 sm:p-6 rounded-2xl">
      {steps.map((step, i) => (
        <React.Fragment key={step.label}>
          <div className="flex items-center gap-3 min-w-fit">
            <div
              className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                step.done
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[0_0_20px_var(--accent-glow)] scale-110"
                  : "bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border-strong)]"
              }`}
            >
              {step.done ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span className="text-xs sm:text-sm font-bold">{i + 1}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span
                className={`text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap ${step.done ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
              >
                {step.label}
              </span>
              {step.optional && !step.done && (
                <span className="text-[8px] sm:text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">
                  (optional)
                </span>
              )}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`hidden sm:block flex-1 h-px ${step.done ? "bg-[var(--accent)]/40" : "bg-[var(--border-color)]"} transition-colors duration-500 min-w-[20px]`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function ProfilePage({
  token,
  onProfileSaved,
  onboarding,
  onNavigate,
}) {
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileSummary, setProfileSummary] = useState("");
  const summaryRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      degree_program: "",
      semester: 1,
      cgpa: 0,
      skills_csv: "",
      interests_csv: "",
      preferred_opportunity_types: [],
      financial_need: "medium",
      location_preference: "any",
      location_text: "",
      past_experience: "",
    },
  });

  const preferredTypes = form.watch("preferred_opportunity_types") || [];
  const selFin = form.watch("financial_need") || "medium";
  const selLoc = form.watch("location_preference") || "any";
  const errors = form.formState.errors;

  useEffect(() => {
    if (!token) return;
    getProfile(token)
      .then((p) => {
        form.reset({
          degree_program: p.degree_program || "",
          semester: p.semester || 1,
          cgpa: p.cgpa || 0,
          skills_csv: (p.skills || []).join(", "),
          interests_csv: (p.interests || []).join(", "),
          preferred_opportunity_types: p.preferred_opportunity_types || [],
          financial_need: p.financial_need || "medium",
          location_preference: p.location_preference || "any",
          location_text: p.location_text || "",
          past_experience: p.past_experience || "",
        });
        setProfileSummary(p.profile_summary || "");
      })
      .catch(() => {});
  }, [token, form]);

  const watchAll = form.watch();
  const completeness = (() => {
    let filled = 0;
    if (watchAll.degree_program?.trim()) filled++;
    if (watchAll.semester > 0) filled++;
    if (watchAll.cgpa > 0) filled++;
    if (watchAll.skills_csv?.trim()) filled++;
    if (watchAll.interests_csv?.trim()) filled++;
    if ((watchAll.preferred_opportunity_types || []).length > 0) filled++;
    if (watchAll.location_text?.trim()) filled++;
    if (watchAll.past_experience?.trim()) filled++;
    return Math.round((filled / PROFILE_FIELDS.length) * 100);
  })();

  const buildPayload = (v) => ({
    degree_program: v.degree_program,
    semester: Number(v.semester),
    cgpa: Number(v.cgpa),
    skills: csvToList(v.skills_csv),
    interests: csvToList(v.interests_csv),
    preferred_opportunity_types: v.preferred_opportunity_types || [],
    financial_need: v.financial_need,
    location_preference: v.location_preference,
    location_text: v.location_text?.trim() || null,
    past_experience: v.past_experience?.trim() || null,
  });

  const onSaveProfile = async (v) => {
    setProfileBusy(true);
    try {
      const r = await updateProfile(token, buildPayload(v));
      setProfileSummary(r?.profile_summary || "");
      if (onProfileSaved) onProfileSaved(r?.profile_summary || "");
      setTimeout(
        () =>
          summaryRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          }),
        300,
      );
    } catch (e) {
      form.setError("root", { message: e?.message || String(e) });
    } finally {
      setProfileBusy(false);
    }
  };

  const toggleType = (t) => {
    const c = new Set(preferredTypes);
    c.has(t) ? c.delete(t) : c.add(t);
    form.setValue("preferred_opportunity_types", Array.from(c), {
      shouldValidate: true,
    });
  };
  const hasProfile = onboarding?.has_profile;
  const hasOAuth = onboarding?.has_oauth;

  return (
    <div className="space-y-8 animate-fade-in pb-12 profile-page-layout">
      <style>{`
        .profile-page-layout input::placeholder,
        .profile-page-layout textarea::placeholder {
          color: #9ca3af;
          opacity: 0.7;
        }
        @media (prefers-color-scheme: light) {
          .profile-page-layout input::placeholder,
          .profile-page-layout textarea::placeholder {
            color: #6b7280;
            opacity: 0.85;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <UserCircle2 className="h-8 w-8 text-[var(--accent)]" />
            My Profile
          </h2>
          <p className="mt-1.5 text-[var(--text-secondary)]">
            {hasProfile
              ? "Update your academic and professional information."
              : "Complete your profile to unlock email classification."}
          </p>
        </div>
        {hasProfile && (
          <button
            onClick={() => onNavigate("dashboard")}
            className="group flex items-center gap-3 rounded-xl btn-accent px-5 py-2.5 text-sm font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Go to Dashboard{" "}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* Setup stepper – only shown if profile not fully set? but always visible for status */}
      <SetupStepper hasProfile={hasProfile} hasOAuth={hasOAuth} />

      {/* Main grid: form (2/3) + summary (1/3) */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <form
            id="profile-form"
            onSubmit={form.handleSubmit(onSaveProfile)}
            className="space-y-6"
          >
            {errors.root && (
              <div className="rounded-xl bg-danger-light p-4 text-sm text-danger animate-shake border border-danger/20">
                {errors.root.message}
              </div>
            )}

            {/* Academic Card */}
            <Card className="card-surface border-0 overflow-hidden rounded-2xl">
              <div className="h-1 w-full bg-gradient-to-r from-[var(--accent)] to-transparent" />
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-[var(--text-primary)]">
                  <GraduationCap className="h-5 w-5 text-[var(--accent)]" />{" "}
                  Academic Information
                </CardTitle>
                <CardDescription className="text-[var(--text-secondary)]">
                  Your educational background and current standing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-5 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-[var(--text-primary)] font-medium">
                      Degree / Program
                    </Label>
                    <Input
                      {...form.register("degree_program")}
                      placeholder="e.g. BS Computer Science"
                      className="bg-[var(--surface-2)] border-[var(--border-color)] focus-visible:ring-[var(--accent)] rounded-lg"
                    />
                    {errors.degree_program && (
                      <p className="text-xs text-danger">
                        {errors.degree_program.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--text-primary)] font-medium">
                      Semester
                    </Label>
                    <Input
                      type="number"
                      {...form.register("semester")}
                      placeholder="Current semester"
                      className="bg-[var(--surface-2)] border-[var(--border-color)] focus-visible:ring-[var(--accent)] rounded-lg"
                    />
                    {errors.semester && (
                      <p className="text-xs text-danger">
                        {errors.semester.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--text-primary)] font-medium">
                      CGPA
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...form.register("cgpa")}
                      placeholder="0.00 - 4.00"
                      className="bg-[var(--surface-2)] border-[var(--border-color)] focus-visible:ring-[var(--accent)] rounded-lg"
                    />
                    {errors.cgpa && (
                      <p className="text-xs text-danger">
                        {errors.cgpa.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Experience Card */}
            <Card className="card-surface border-0 overflow-hidden rounded-2xl">
              <div className="h-1 w-full bg-gradient-to-r from-[var(--accent)] to-transparent" />
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-[var(--text-primary)]">
                  <Briefcase className="h-5 w-5 text-[var(--accent)]" /> Skills
                  & Experience
                </CardTitle>
                <CardDescription className="text-[var(--text-secondary)]">
                  Showcase your technical abilities and background
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[var(--text-primary)] font-medium">
                      Skills{" "}
                      <span className="text-[var(--text-muted)] font-normal">
                        (comma separated)
                      </span>
                    </Label>
                    <Input
                      {...form.register("skills_csv")}
                      placeholder="Python, React, Machine Learning"
                      className="bg-[var(--surface-2)] border-[var(--border-color)] focus-visible:ring-[var(--accent)] rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--text-primary)] font-medium">
                      Interests{" "}
                      <span className="text-[var(--text-muted)] font-normal">
                        (comma separated)
                      </span>
                    </Label>
                    <Input
                      {...form.register("interests_csv")}
                      placeholder="AI, data science, open source"
                      className="bg-[var(--surface-2)] border-[var(--border-color)] focus-visible:ring-[var(--accent)] rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--text-primary)] font-medium">
                    Past Experience
                  </Label>
                  <Textarea
                    {...form.register("past_experience")}
                    placeholder="Briefly describe past internships, projects, or achievements..."
                    className="h-28 bg-[var(--surface-2)] border-[var(--border-color)] focus-visible:ring-[var(--accent)] resize-none leading-relaxed rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Target Opportunities Card */}
            <Card className="card-surface border-0 overflow-hidden rounded-2xl">
              <div className="h-1 w-full bg-gradient-to-r from-[var(--accent)] to-transparent" />
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-[var(--text-primary)]">
                  <Target className="h-5 w-5 text-[var(--accent)]" /> Target
                  Opportunities
                </CardTitle>
                <CardDescription className="text-[var(--text-secondary)]">
                  Define what kind of opportunities you're looking for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {OPPORTUNITY_TYPES.map((t) => (
                    <label
                      key={t}
                      onClick={() => toggleType(t)}
                      className={`flex cursor-pointer select-none items-center gap-2.5 rounded-xl border p-3 transition-all duration-300 ${
                        preferredTypes.includes(t)
                          ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--text-primary)] shadow-md scale-[1.02]"
                          : "border-[var(--border-color)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-0)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          preferredTypes.includes(t)
                            ? "bg-[var(--accent)] border-[var(--accent)]"
                            : "border-[var(--border-strong)] bg-transparent"
                        }`}
                      >
                        {preferredTypes.includes(t) && (
                          <CheckCircle2 className="h-3 w-3 text-[var(--accent-foreground)]" />
                        )}
                      </div>
                      <span className="text-sm font-medium truncate">
                        <span className="mr-1.5 opacity-80">
                          {typeIcons[t]}
                        </span>
                        <span className="capitalize">{t}</span>
                      </span>
                    </label>
                  ))}
                </div>

                <div className="grid gap-5 md:grid-cols-3 pt-4 border-t border-[var(--border-color)]">
                  <div className="space-y-2">
                    <Label className="text-[var(--text-primary)] font-medium flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" /> Financial Need
                    </Label>
                    <Select
                      value={selFin}
                      onValueChange={(v) =>
                        form.setValue("financial_need", v, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border-color)] focus:ring-[var(--accent)] rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--surface-1)] border-[var(--border-color)]">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--text-primary)] font-medium flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> Location Preference
                    </Label>
                    <Select
                      value={selLoc}
                      onValueChange={(v) =>
                        form.setValue("location_preference", v, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border-color)] focus:ring-[var(--accent)] rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--surface-1)] border-[var(--border-color)]">
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--text-primary)] font-medium">
                      Specific Location
                    </Label>
                    <Input
                      {...form.register("location_text")}
                      placeholder="e.g. Lahore, Pakistan"
                      className="bg-[var(--surface-2)] border-[var(--border-color)] focus-visible:ring-[var(--accent)] rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Right: AI Summary & Progress */}
        <div className="lg:col-span-1 space-y-6">
          {/* Completeness Card */}
          <div className="card-surface p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-glow)] blur-[60px] rounded-full pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Profile Progress
              </span>
              <span
                className={`text-2xl font-bold tracking-tight ${completeness >= 80 ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}
              >
                {completeness}%
              </span>
            </div>
            <Progress
              value={completeness}
              className="h-2 bg-[var(--surface-2)]"
              indicatorClassName="bg-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]"
            />
            <p className="text-xs text-[var(--text-muted)] mt-3 flex items-center gap-1.5">
              {completeness === 100 ? (
                <>
                  <PartyPopper className="h-3.5 w-3.5 text-[var(--accent)]" />{" "}
                  Complete! Your profile is ready.
                </>
              ) : (
                `${8 - PROFILE_FIELDS.filter((f) => watchAll[f]?.trim?.() || watchAll[f]?.length).length} fields remaining`
              )}
            </p>
          </div>

          {/* AI Summary Card */}
          <div ref={summaryRef}>
            <Card className="card-surface border-0 relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-glow)] blur-[80px] rounded-full pointer-events-none" />
              <CardHeader className="pb-4 border-b border-[var(--border-color)]">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl text-[var(--text-primary)]">
                      <Sparkles className="h-5 w-5 text-[var(--accent)]" /> AI
                      Profile Summary
                    </CardTitle>
                    <CardDescription className="mt-1 text-[var(--text-secondary)] text-sm">
                      Generated summary used for opportunity matching
                    </CardDescription>
                  </div>
                  <Sparkles className="h-8 w-8 text-[var(--accent)] opacity-40" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border-color)] p-5 min-h-[140px]">
                  {profileSummary ? (
                    <p className="text-[14px] leading-relaxed text-[var(--text-primary)]">
                      {profileSummary}
                    </p>
                  ) : (
                    <p className="text-[14px] text-[var(--text-muted)] italic flex items-center h-full justify-center text-center">
                      Save your profile to generate an AI summary
                    </p>
                  )}
                </div>
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    form="profile-form"
                    disabled={profileBusy}
                    className="w-full h-12 px-8 text-base btn-accent rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    {profileBusy ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Rocket className="mr-2 h-5 w-5" />
                    )}
                    {hasProfile ? "Save Changes" : "Create Profile & Unlock"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
