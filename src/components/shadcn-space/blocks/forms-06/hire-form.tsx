import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getSupabase } from "@/lib/supabase";
import {
  CITIES,
  CREATIVE_TYPES,
  EASE,
  EMAIL_RE,
  Field,
  PrivacyNote,
  ShareActions,
  TypeTile,
  cardClass,
  checkRowClass,
  checkboxClass,
  clean,
  inputClass,
  microClass,
  primaryButtonClass,
  selectClass,
  textareaClass,
  utmSource,
} from "./form-kit";

const FORM_VERSION = "v1";

const BUSINESS_TYPES = [
  { id: "boutique_retail", label: "Boutique / retail" },
  { id: "restaurant_bar", label: "Restaurant / bar" },
  { id: "salon_beauty", label: "Salon / beauty" },
  { id: "agency_brand", label: "Agency / brand" },
  { id: "events", label: "Events" },
  { id: "other", label: "Other" },
] as const;

type FormData = {
  business_name: string;
  full_name: string;
  email: string;
  phone: string;
  business_type: string;
  website_or_ig: string;
  hires: string[];
  city: string;
  anything_else: string;
  consent_contact: boolean;
  website: string; // honeypot, hidden from people
};

const EMPTY: FormData = {
  business_name: "",
  full_name: "",
  email: "",
  phone: "",
  business_type: "",
  website_or_ig: "",
  hires: [],
  city: "",
  anything_else: "",
  consent_contact: false,
  website: "",
};

const HireForm = () => {
  const [formData, setFormData] = useState<FormData>(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alreadyListed, setAlreadyListed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setError(null);
    setFormData((p) => ({ ...p, [key]: value }));
  };

  const toggleHire = (id: string) =>
    set(
      "hires",
      formData.hires.includes(id) ? formData.hires.filter((h) => h !== id) : [...formData.hires, id],
    );

  const isValid =
    formData.business_name.trim().length > 0 &&
    formData.full_name.trim().length > 0 &&
    EMAIL_RE.test(formData.email.trim()) &&
    formData.business_type !== "" &&
    formData.city !== "" &&
    formData.consent_contact;

  const submit = async () => {
    if (!isValid || isSubmitting) return;
    // Bots fill the hidden field; pretend it worked and store nothing.
    if (formData.website) {
      setIsSubmitted(true);
      return;
    }

    const f = formData;
    const row = {
      form_version: FORM_VERSION,
      business_name: f.business_name.trim(),
      full_name: f.full_name.trim(),
      email: f.email.trim(),
      phone: clean(f.phone),
      business_type: f.business_type,
      website_or_ig: clean(f.website_or_ig),
      hires: f.hires.length ? f.hires : null,
      city: f.city,
      consent_contact: f.consent_contact,
      anything_else: clean(f.anything_else),
      source: utmSource(),
    };

    setIsSubmitting(true);
    setError(null);
    try {
      // No .select() here: the public key can insert but not read rows back.
      const { error: dbError } = await getSupabase().from("business_interest_submissions").insert(row);
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

  return (
    <section className="flex justify-center px-4 pt-6 sm:pt-10">
      <div className="w-full max-w-xl">
        <Card className={cardClass}>
          <CardContent className="flex flex-col gap-6 sm:gap-8 p-6 pt-8 sm:p-10">
            <AnimatePresence mode="popLayout" initial={false}>
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="flex flex-col items-center gap-6 py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className="flex size-12 items-center justify-center rounded-full bg-[var(--color-coral-dark)] text-white"
                  >
                    <Check className="size-6" />
                  </motion.div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-3xl font-bold tracking-tight text-[#1a1a1a]">
                      {alreadyListed ? "We already have you" : `Thanks, ${formData.full_name.split(" ")[0] || "friend"}!`}
                    </p>
                    <p className="mx-auto max-w-sm text-sm text-[#666]">
                      {alreadyListed
                        ? "Your business is already on our list. We'll be in touch."
                        : "We'll reach out to hear what you're planning and start matching you with local creatives."}
                    </p>
                  </div>
                  <ShareActions
                    shareText="Huo connects Columbus businesses with local creatives:"
                    sharePath="/hire?utm_source=referral"
                  />
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submit();
                  }}
                  className="flex flex-col gap-6 sm:gap-8"
                >
                  <div className="flex flex-col gap-3">
                    <p className={microClass}>For businesses</p>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a1a1a]">
                      Who are you hiring for?
                    </h2>
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
                    <Field label="Business name">
                      <Input value={formData.business_name} onChange={(e) => set("business_name", e.target.value)} placeholder="Lafayette Studio" className={inputClass} />
                    </Field>
                    <Field label="What kind of business?">
                      <select value={formData.business_type} onChange={(e) => set("business_type", e.target.value)} className={selectClass}>
                        <option value="" disabled>Choose one</option>
                        {BUSINESS_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Where are you based?">
                      <select value={formData.city} onChange={(e) => set("city", e.target.value)} className={selectClass}>
                        <option value="" disabled>Choose one</option>
                        {CITIES.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Website or Instagram" hint="(optional)">
                      <Input value={formData.website_or_ig} onChange={(e) => set("website_or_ig", e.target.value)} placeholder="@yourbusiness or yoursite.com" className={inputClass} />
                    </Field>
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-[#1a1a1a]">
                      Who do you hire? <span className="font-normal text-[#777]">(optional, pick any)</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {CREATIVE_TYPES.map((t) => (
                        <TypeTile
                          key={t.id}
                          label={t.label}
                          icon={t.icon}
                          selected={formData.hires.includes(t.id)}
                          onToggle={() => toggleHire(t.id)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-black/10 pt-6">
                    <p className={microClass}>Your contact</p>
                    <Field label="Your name">
                      <Input value={formData.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Jordan Lee" className={inputClass} />
                    </Field>
                    <Field label="Email">
                      <Input type="email" value={formData.email} onChange={(e) => set("email", e.target.value)} placeholder="you@yourbusiness.com" className={inputClass} />
                    </Field>
                    <Field label="Phone" hint="(optional)">
                      <Input type="tel" value={formData.phone} onChange={(e) => set("phone", e.target.value)} placeholder="614-555-0100" className={inputClass} />
                    </Field>
                    <Field label="What are you planning?" hint="(optional)">
                      <Textarea value={formData.anything_else} onChange={(e) => set("anything_else", e.target.value)} placeholder="A spring lookbook shoot, event coverage, a new menu..." className={textareaClass} />
                    </Field>
                    <label className={checkRowClass}>
                      <input type="checkbox" checked={formData.consent_contact} onChange={(e) => set("consent_contact", e.target.checked)} className={checkboxClass} />
                      <span>Huo can contact me about finding creatives.</span>
                    </label>
                    <PrivacyNote purpose="match you with creatives and invite you to Huo" />
                  </div>

                  {error && (
                    <p role="alert" className="border-l-2 border-red-700 pl-3 text-sm text-red-700">
                      {error}
                    </p>
                  )}

                  <div className="flex justify-end border-t border-black/10 pt-6">
                    <Button type="submit" disabled={!isValid || isSubmitting} className={cn(primaryButtonClass, "w-full sm:w-auto")}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Saving
                        </>
                      ) : (
                        <>
                          Send
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

export default HireForm;
