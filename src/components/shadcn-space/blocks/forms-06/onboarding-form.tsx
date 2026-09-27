"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Film,
  Loader2,
  PenTool,
  RotateCcw,
  Scissors,
  Shirt,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getSupabase } from "@/lib/supabase";

const EASE = [0.65, 0, 0.35, 1] as const;
const FORM_VERSION = "v1";

const CREATIVE_TYPES = [
  { id: "model", label: "Model", icon: User },
  { id: "photographer", label: "Photographer", icon: Camera },
  { id: "videographer", label: "Videographer", icon: Film },
  { id: "designer", label: "Designer", icon: PenTool },
  { id: "stylist", label: "Stylist", icon: Shirt },
  { id: "hair_makeup", label: "Hair / Makeup", icon: Scissors },
  { id: "other", label: "Other", icon: Sparkles },
] as const;

const CITIES = [
  { id: "columbus", label: "Columbus" },
  { id: "other_ohio", label: "Elsewhere in Ohio" },
  { id: "other", label: "Outside Ohio" },
] as const;

type FormData = {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  city_other: string;
  creative_types: string[];
  creative_type_other: string;
  height_ft: string;
  height_in: string;
  bust: string;
  waist: string;
  hips: string;
  shoe: string;
  eyes: string;
  hair: string;
  headshot_url: string;
  instagram_handle: string;
  portfolio_url: string;
  linkedin_url: string;
  specialty: string;
  referred_by: string;
  refer_creative_handle: string;
  businesses_want: string;
  businesses_worked: string;
  anything_else: string;
  is_18_plus: boolean;
  consent_contact: boolean;
  website: string; // honeypot, hidden from people
};

const EMPTY: FormData = {
  full_name: "",
  email: "",
  phone: "",
  city: "",
  city_other: "",
  creative_types: [],
  creative_type_other: "",
  height_ft: "",
  height_in: "",
  bust: "",
  waist: "",
  hips: "",
  shoe: "",
  eyes: "",
  hair: "",
  headshot_url: "",
  instagram_handle: "",
  portfolio_url: "",
  linkedin_url: "",
  specialty: "",
  referred_by: "",
  refer_creative_handle: "",
  businesses_want: "",
  businesses_worked: "",
  anything_else: "",
  is_18_plus: false,
  consent_contact: false,
  website: "",
};

type StepId = "name" | "contact" | "practice" | "model" | "links" | "more" | "confirm";

const STEP_COPY: Record<StepId, { eyebrow: string; title: string }> = {
  name: { eyebrow: "Talent Call", title: "What's your name?" },
  contact: { eyebrow: "Contact", title: "Where can we reach you?" },
  practice: { eyebrow: "Practice", title: "What do you do?" },
  model: { eyebrow: "Model details", title: "Your stats" },
  links: { eyebrow: "Your work", title: "Where can we see it?" },
  more: { eyebrow: "Optional", title: "Help us grow the network" },
  confirm: { eyebrow: "Last step", title: "Almost done" },
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const IG_RE = /^@?[A-Za-z0-9._]{1,30}$/;
const URL_RE = /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i;

const inputClass =
  "h-10 rounded-lg border-border bg-transparent shadow-none focus-visible:ring-1";
const selectClass =
  "h-10 w-full rounded-lg border border-border bg-transparent px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1";

const clean = (v: string) => {
  const t = v.trim();
  return t.length ? t : null;
};

const withScheme = (v: string) => {
  const t = v.trim();
  if (!t) return null;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

const stepVariants = {
  initial: (dir: number) => ({ x: dir > 0 ? 24 : -24, opacity: 0 }),
  animate: {
    x: 0,
    opacity: 1,
    pointerEvents: "auto" as const,
    transition: { duration: 0.35, ease: EASE },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -24 : 24,
    opacity: 0,
    pointerEvents: "none" as const,
    transition: { duration: 0.25, ease: EASE },
  }),
};

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <label className="flex flex-col gap-1.5 text-sm">
    <span className="font-medium text-foreground">
      {label}
      {hint && <span className="ml-1 font-normal text-muted-foreground">{hint}</span>}
    </span>
    {children}
  </label>
);

const OnboardingForm = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alreadyListed, setAlreadyListed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setError(null);
    setFormData((p) => ({ ...p, [key]: value }));
  };

  const isModel = formData.creative_types.includes("model");

  const steps = useMemo<StepId[]>(
    () =>
      isModel
        ? ["name", "contact", "practice", "model", "links", "more", "confirm"]
        : ["name", "contact", "practice", "links", "more", "confirm"],
    [isModel],
  );

  const stepId = steps[Math.min(stepIndex, steps.length - 1)];
  const current = STEP_COPY[stepId];
  const totalSteps = steps.length;
  const isLast = stepIndex === totalSteps - 1;

  const isStepValid = (() => {
    const f = formData;
    switch (stepId) {
      case "name":
        return f.full_name.trim().length > 0;
      case "contact":
        return (
          EMAIL_RE.test(f.email.trim()) &&
          f.city !== "" &&
          (f.city === "columbus" || f.city_other.trim().length > 0)
        );
      case "practice":
        return (
          f.creative_types.length > 0 &&
          (!f.creative_types.includes("other") || f.creative_type_other.trim().length > 0)
        );
      case "model":
        return f.height_ft !== "" && f.height_in !== "";
      case "links":
        return (
          IG_RE.test(f.instagram_handle.trim()) &&
          (!f.portfolio_url.trim() || URL_RE.test(f.portfolio_url.trim())) &&
          (!f.linkedin_url.trim() || URL_RE.test(f.linkedin_url.trim()))
        );
      case "more":
        return true;
      case "confirm":
        return f.is_18_plus && f.consent_contact;
    }
  })();

  const toggleType = (id: string) => {
    set(
      "creative_types",
      formData.creative_types.includes(id)
        ? formData.creative_types.filter((t) => t !== id)
        : [...formData.creative_types, id],
    );
  };

  const submit = async () => {
    // Bots fill the hidden field; pretend it worked and store nothing.
    if (formData.website) {
      setIsSubmitted(true);
      return;
    }

    const f = formData;
    const source = new URLSearchParams(window.location.search).get("utm_source");

    const row = {
      form_version: FORM_VERSION,
      full_name: f.full_name.trim(),
      email: f.email.trim(),
      phone: clean(f.phone),
      city: f.city,
      city_other: f.city === "columbus" ? null : clean(f.city_other),
      is_18_plus: f.is_18_plus,
      consent_contact: f.consent_contact,
      creative_types: f.creative_types,
      creative_type_other: f.creative_types.includes("other") ? clean(f.creative_type_other) : null,
      specialty: clean(f.specialty),
      instagram_handle: f.instagram_handle.trim(),
      portfolio_url: withScheme(f.portfolio_url),
      linkedin_url: withScheme(f.linkedin_url),
      height_inches: isModel ? Number(f.height_ft) * 12 + Number(f.height_in) : null,
      bust: isModel ? clean(f.bust) : null,
      waist: isModel ? clean(f.waist) : null,
      hips: isModel ? clean(f.hips) : null,
      shoe: isModel ? clean(f.shoe) : null,
      eyes: isModel ? clean(f.eyes) : null,
      hair: isModel ? clean(f.hair) : null,
      headshot_url: isModel ? clean(f.headshot_url) : null,
      referred_by: clean(f.referred_by),
      refer_creative_handle: clean(f.refer_creative_handle),
      businesses_want: clean(f.businesses_want),
      businesses_worked: clean(f.businesses_worked),
      anything_else: clean(f.anything_else),
      source: source ? source.slice(0, 100) : null,
    };

    setIsSubmitting(true);
    setError(null);
    try {
      // No .select() here: the public key can insert but not read rows back.
      const { error: dbError } = await getSupabase()
        .from("talent_call_submissions")
        .insert(row);

      if (dbError) {
        if (dbError.code === "23505") {
          setAlreadyListed(true);
          setIsSubmitted(true);
          return;
        }
        console.error(dbError);
        setError("Something went wrong saving your info. Try again in a minute.");
        return;
      }
      setIsSubmitted(true);
    } catch (e) {
      console.error(e);
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = () => {
    if (!isStepValid || isSubmitting) return;
    if (!isLast) {
      setDirection(1);
      setStepIndex((i) => i + 1);
    } else {
      void submit();
    }
  };

  const goBack = () => {
    if (stepIndex === 0) return;
    setError(null);
    setDirection(-1);
    setStepIndex((i) => i - 1);
  };

  const handleReset = () => {
    setDirection(-1);
    setStepIndex(0);
    setIsSubmitted(false);
    setAlreadyListed(false);
    setError(null);
    setFormData(EMPTY);
  };

  const typeLabels = CREATIVE_TYPES.filter((t) => formData.creative_types.includes(t.id))
    .map((t) => t.label)
    .join(", ");

  return (
    <section className="flex items-center justify-center bg-muted/30 dark:bg-background py-10 lg:py-20 px-4">
      <div className="w-full max-w-xl">
        <Card className="relative gap-0 rounded-2xl border border-border bg-background p-0 ring-0">
          {!isSubmitted && (
            <div className="absolute right-6 top-6 z-10 flex size-12 shrink-0 items-center justify-center sm:right-8 sm:top-8">
              <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted" />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="text-foreground"
                  style={{ pathLength: 0 }}
                  animate={{ pathLength: (stepIndex + 1) / totalSteps }}
                  transition={{ duration: 0.4, ease: EASE }}
                />
              </svg>
              <span className="font-mono text-xs font-medium text-foreground tabular-nums">
                {String(stepIndex + 1).padStart(2, "0")}
              </span>
            </div>
          )}
          <CardContent className="flex flex-col gap-6 sm:gap-8 p-6 sm:p-8">
            <AnimatePresence mode="popLayout" initial={false}>
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, pointerEvents: "auto" }}
                  exit={{ opacity: 0, y: -12, pointerEvents: "none" }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="relative flex flex-col items-center gap-6 overflow-hidden py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className="relative z-10 flex size-12 items-center justify-center"
                  >
                    <div className="flex size-12 items-center justify-center rounded-full bg-foreground text-background">
                      <Check className="size-6" />
                    </div>
                  </motion.div>

                  <div className="relative z-10 flex w-full flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-3xl font-semibold tracking-tight text-foreground">
                        {alreadyListed ? "You're already on the list" : `Thanks, ${formData.full_name.split(" ")[0] || "friend"}!`}
                      </p>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        {alreadyListed
                          ? "We already have your info from an earlier signup. We'll be in touch."
                          : "You're on the Huo talent call list. We'll be in touch from Columbus."}
                      </p>
                    </div>

                    {!alreadyListed && (
                      <div className="w-full max-w-sm mx-auto divide-y divide-border rounded-xl border border-border bg-muted/30 text-left">
                        {[
                          { label: "Name", value: formData.full_name },
                          { label: "Email", value: formData.email },
                          { label: "Practice", value: typeLabels },
                          { label: "Instagram", value: formData.instagram_handle && `@${formData.instagram_handle.replace(/^@+/, "")}` },
                        ]
                          .filter((row) => row.value)
                          .map((row) => (
                            <div key={row.label} className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-3 px-4 py-3 text-sm">
                              <span className="text-muted-foreground shrink-0">{row.label}</span>
                              <span className="font-medium text-foreground sm:text-right wrap-break-word">{row.value}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <Button variant="outline" onClick={handleReset} className="dark:bg-background rounded-full px-6 cursor-pointer">
                    <RotateCcw className="size-3.5" />
                    Start over
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key={stepId}
                  custom={direction}
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onSubmit={(e) => {
                    e.preventDefault();
                    goNext();
                  }}
                  className="flex flex-col gap-6 sm:gap-8"
                >
                  <div className="flex flex-col gap-3 max-w-md pt-6 sm:pt-0">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{current.eyebrow}</p>
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{current.title}</h2>
                  </div>

                  {/* honeypot: hidden from people, bots fill it */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={formData.website}
                    onChange={(e) => set("website", e.target.value)}
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  />

                  <div className="flex flex-col gap-4">
                    {stepId === "name" && (
                      <Field label="Full name">
                        <Input autoFocus value={formData.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Jordan Lee" className={inputClass} />
                      </Field>
                    )}

                    {stepId === "contact" && (
                      <>
                        <Field label="Email">
                          <Input autoFocus type="email" value={formData.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className={inputClass} />
                        </Field>
                        <Field label="Phone" hint="(optional)">
                          <Input type="tel" value={formData.phone} onChange={(e) => set("phone", e.target.value)} placeholder="614-555-0100" className={inputClass} />
                        </Field>
                        <Field label="Where are you based?">
                          <select value={formData.city} onChange={(e) => set("city", e.target.value)} className={selectClass}>
                            <option value="" disabled>Choose one</option>
                            {CITIES.map((c) => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </Field>
                        {formData.city && formData.city !== "columbus" && (
                          <Field label="City">
                            <Input value={formData.city_other} onChange={(e) => set("city_other", e.target.value)} placeholder="Cincinnati" className={inputClass} />
                          </Field>
                        )}
                      </>
                    )}

                    {stepId === "practice" && (
                      <>
                        <p className="text-sm text-muted-foreground">Pick all that apply.</p>
                        <div className="grid grid-cols-2 gap-3">
                          {CREATIVE_TYPES.map((t) => {
                            const isSelected = formData.creative_types.includes(t.id);
                            return (
                              <button
                                key={t.id}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => toggleType(t.id)}
                                className={cn(
                                  "relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border p-4 text-sm font-medium transition-colors cursor-pointer",
                                  isSelected
                                    ? "border-dashed border-foreground bg-foreground/5 text-foreground"
                                    : "border-border text-muted-foreground hover:border-foreground/40",
                                )}
                              >
                                <t.icon className="size-5" />
                                <span>{t.label}</span>
                              </button>
                            );
                          })}
                        </div>
                        {formData.creative_types.includes("other") && (
                          <Field label="What else do you do?">
                            <Input value={formData.creative_type_other} onChange={(e) => set("creative_type_other", e.target.value)} placeholder="Set design" className={inputClass} />
                          </Field>
                        )}
                      </>
                    )}

                    {stepId === "model" && (
                      <>
                        <div className="flex flex-col gap-4">
                          <p className="text-xs font-medium uppercase tracking-widest text-foreground">
                            Required
                          </p>
                          <Field label="Height">
                            <div className="grid grid-cols-2 gap-3">
                              <select value={formData.height_ft} onChange={(e) => set("height_ft", e.target.value)} className={selectClass}>
                                <option value="" disabled>Feet</option>
                                {[4, 5, 6, 7].map((n) => (
                                  <option key={n} value={n}>{n} ft</option>
                                ))}
                              </select>
                              <select value={formData.height_in} onChange={(e) => set("height_in", e.target.value)} className={selectClass}>
                                <option value="" disabled>Inches</option>
                                {Array.from({ length: 12 }, (_, n) => (
                                  <option key={n} value={n}>{n} in</option>
                                ))}
                              </select>
                            </div>
                          </Field>
                        </div>

                        <div className="mt-2 flex flex-col gap-4 rounded-xl border border-dashed border-border p-4">
                          <div className="flex flex-col gap-0.5">
                            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                              Optional
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Skip any of these. If you don't have a headshot link, we'll use your Instagram.
                            </p>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <Field label="Headshot or polaroid" hint="Link if you have one">
                              <Input value={formData.headshot_url} onChange={(e) => set("headshot_url", e.target.value)}
                                placeholder="Drive or Dropbox link, or skip it" className={inputClass} />
                            </Field>
                            <Field label="Bust / chest">
                              <Input value={formData.bust} onChange={(e) => set("bust", e.target.value)} placeholder='34"' className={inputClass} />
                            </Field>
                            <Field label="Waist">
                              <Input value={formData.waist} onChange={(e) => set("waist", e.target.value)} placeholder='26"' className={inputClass} />
                            </Field>
                            <Field label="Hips">
                              <Input value={formData.hips} onChange={(e) => set("hips", e.target.value)} placeholder='36"' className={inputClass} />
                            </Field>
                            <Field label="Shoe">
                              <Input value={formData.shoe} onChange={(e) => set("shoe", e.target.value)} placeholder="8" className={inputClass} />
                            </Field>
                            <Field label="Eyes">
                              <Input value={formData.eyes} onChange={(e) => set("eyes", e.target.value)} placeholder="Brown" className={inputClass} />
                            </Field>
                            <Field label="Hair">
                              <Input value={formData.hair} onChange={(e) => set("hair", e.target.value)} placeholder="Black" className={inputClass} />
                            </Field>
                          </div>
                        </div>
                      </>
                    )}

                    {stepId === "links" && (
                      <>
                        <Field label="Instagram handle">
                          <Input autoFocus value={formData.instagram_handle} onChange={(e) => set("instagram_handle", e.target.value)} placeholder="@yourhandle" className={inputClass} />
                        </Field>
                        <Field label="Portfolio or website" hint="(optional)">
                          <Input inputMode="url" value={formData.portfolio_url} onChange={(e) => set("portfolio_url", e.target.value)} placeholder="yoursite.com" className={inputClass} />
                        </Field>
                        <Field label="LinkedIn" hint="(optional)">
                          <Input inputMode="url" value={formData.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} placeholder="linkedin.com/in/you" className={inputClass} />
                        </Field>
                        <Field label="Specialty" hint="(optional)">
                          <Input value={formData.specialty} onChange={(e) => set("specialty", e.target.value)} placeholder="Editorial, product, events" className={inputClass} />
                        </Field>
                      </>
                    )}

                    {stepId === "more" && (
                      <>
                        <p className="text-sm text-muted-foreground">All optional. Skip ahead if you like.</p>
                        <Field label="Who referred you?">
                          <Input value={formData.referred_by} onChange={(e) => set("referred_by", e.target.value)} placeholder="Name or @handle" className={inputClass} />
                        </Field>
                        <Field label="Know a creative we should reach out to?">
                          <Input value={formData.refer_creative_handle} onChange={(e) => set("refer_creative_handle", e.target.value)} placeholder="@theirhandle" className={inputClass} />
                        </Field>
                        <Field label="Local businesses you'd love to work with">
                          <Input value={formData.businesses_want} onChange={(e) => set("businesses_want", e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Local businesses you've worked with">
                          <Input value={formData.businesses_worked} onChange={(e) => set("businesses_worked", e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Anything else?">
                          <Textarea value={formData.anything_else} onChange={(e) => set("anything_else", e.target.value)} className="min-h-24 rounded-lg border-border bg-transparent shadow-none focus-visible:ring-1 resize-none" />
                        </Field>
                      </>
                    )}

                    {stepId === "confirm" && (
                      <>
                        <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer">
                          <input type="checkbox" checked={formData.is_18_plus} onChange={(e) => set("is_18_plus", e.target.checked)} className="mt-0.5 size-4 accent-foreground" />
                          <span>I'm 18 or older.</span>
                        </label>
                        <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer">
                          <input type="checkbox" checked={formData.consent_contact} onChange={(e) => set("consent_contact", e.target.checked)} className="mt-0.5 size-4 accent-foreground" />
                          <span>Huo can contact me about gigs and invite me to the app.</span>
                        </label>
                      </>
                    )}
                  </div>

                  {error && (
                    <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goBack}
                      disabled={stepIndex === 0 || isSubmitting}
                      className="h-10 dark:bg-background rounded-full px-6 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="size-3.5" />
                      Back
                    </Button>

                    <Button
                      type="submit"
                      disabled={!isStepValid || isSubmitting}
                      className="rounded-full px-6 h-10 bg-foreground text-background hover:bg-foreground/80 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Saving
                        </>
                      ) : (
                        <>
                          {isLast ? "Submit" : stepId === "more" ? "Skip or continue" : "Continue"}
                          <ArrowRight className="size-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default OnboardingForm;
